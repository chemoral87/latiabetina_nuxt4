import { noteToMidi } from '~/utils/score'

export interface PianoNoteParams {
  freq?: number
  pitch?: string
  octave?: number
  start: number
  duration: number
  velocity?: number
}

export const PIANO_HARMONICS = [
  0,
  1.0, // fundamental
  0.75, // 2nd
  0.5, // 3rd
  0.35, // 4th
  0.22, // 5th
  0.15, // 6th
  0.1, // 7th
  0.07, // 8th
  0.045, // 9th
  0.03, // 10th
  0.018, // 11th
  0.01, // 12th
  0.006, // 13th
  0.003, // 14th
]

export function pitchToFrequency(pitch: string, octave: number): number {
  const midi = noteToMidi(pitch, octave)
  return 440 * 2 ** ((midi - 69) / 12)
}

const pianoWaves = new WeakMap<BaseAudioContext, PeriodicWave>()

export function getPianoWave(ctx: BaseAudioContext): PeriodicWave {
  const cached = pianoWaves.get(ctx)
  if (cached) return cached

  const real = new Float32Array(PIANO_HARMONICS.length)
  const imag = new Float32Array(PIANO_HARMONICS.length)
  for (let i = 1; i < PIANO_HARMONICS.length; i++) {
    imag[i] = PIANO_HARMONICS[i]!
  }

  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: false })
  pianoWaves.set(ctx, wave)
  return wave
}

export function schedulePianoNote(ctx: BaseAudioContext, destination: AudioNode, params: PianoNoteParams): void {
  const freq = params.freq ?? (params.pitch && params.octave !== undefined ? pitchToFrequency(params.pitch, params.octave) : 440)
  const { start, duration, velocity = 0.8 } = params
  if (freq <= 0 || !Number.isFinite(freq) || duration <= 0) return

  const wave = getPianoWave(ctx)
  const vel = Math.max(0.1, Math.min(1.0, velocity))
  const peakGain = vel * 0.25

  // Acoustic dual-string detuned pair (produces natural chorus & bloom)
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  osc1.setPeriodicWave(wave)
  osc2.setPeriodicWave(wave)
  osc1.frequency.value = freq
  osc2.frequency.value = freq
  osc1.detune.value = 1.6 // +1.6 cents
  osc2.detune.value = -1.6 // -1.6 cents

  // Dynamic low-pass filter (hammer impact brightness decay)
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.Q.value = 1.2
  const initialCutoff = Math.min(14000, freq * 7.5)
  const endCutoff = Math.min(5000, freq * 2.0)
  filter.frequency.setValueAtTime(initialCutoff, start)
  filter.frequency.exponentialRampToValueAtTime(endCutoff, start + Math.min(0.25, duration * 0.45))

  // Amplitude ADSR envelope tailored for acoustic piano
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)

  // 3ms quick percussive hammer strike attack
  const attackTime = 0.003
  gain.gain.exponentialRampToValueAtTime(peakGain, start + attackTime)

  // Initial body string decay (drop to ~75%)
  const decayTime = Math.min(0.12, duration * 0.3)
  const initialDecayLevel = peakGain * 0.72
  gain.gain.exponentialRampToValueAtTime(initialDecayLevel, start + attackTime + decayTime)

  // Long exponential sustain & damper release
  const releaseTime = 0.04
  const sustainEnd = start + Math.max(attackTime + decayTime, duration - releaseTime)
  const naturalDecay = Math.max(0.001, initialDecayLevel * Math.exp(-duration * 0.55))
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, naturalDecay), sustainEnd)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  // Subtle low-frequency hammer impact impulse
  const hammer = ctx.createOscillator()
  const hammerGain = ctx.createGain()
  hammer.type = 'sine'
  hammer.frequency.setValueAtTime(freq * 0.5, start)
  hammerGain.gain.setValueAtTime(peakGain * 0.18, start)
  hammerGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.015)
  hammer.connect(hammerGain).connect(filter)
  hammer.start(start)
  hammer.stop(start + 0.02)

  // Connect main audio graph
  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(filter)
  filter.connect(destination)

  const stopTime = start + duration + 0.02
  osc1.start(start)
  osc2.start(start)
  osc1.stop(stopTime)
  osc2.stop(stopTime)
}

export function encodeWav(buffer: AudioBuffer): Blob {
  const data = buffer.getChannelData(0)
  const ab = new ArrayBuffer(44 + data.length * 2)
  const v = new DataView(ab)
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i))
  }
  writeStr(0, 'RIFF')
  v.setUint32(4, 36 + data.length * 2, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, buffer.sampleRate, true)
  v.setUint32(28, buffer.sampleRate * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  writeStr(36, 'data')
  v.setUint32(40, data.length * 2, true)
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]!))
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return new Blob([ab], { type: 'audio/wav' })
}
