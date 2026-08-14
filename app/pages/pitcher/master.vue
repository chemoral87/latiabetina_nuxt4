<template>
  <VContainer class="pa-4" style="max-width: 1000px">
    <h4 id="pit-header" class="text-left mb-1">
      Master de Acordes
      <span>
        Frec:
        <strong id="pit-freq-display" class="text-right" style="display: inline-block; width: 50px">{{ lowestFreqDisplay }}</strong>
        Hz
      </span>
      |
      <span id="pit-db-display">({{ dBDisplay }} dB · sens {{ sensitivity.toFixed(4) }} · picos {{ peaksCount }})</span>
    </h4>

    <VRow id="pit-actions-row" class="mb-1" density="comfortable">
      <VCol cols="6">
        <VBtn id="pit-reset-btn" block size="small" color="primary" @click="resetHistory">
          <VIcon start>mdi-restart</VIcon>
          <span>Reiniciar</span>
        </VBtn>
      </VCol>
      <VCol cols="6">
        <VBtn id="pit-calibrate-btn" block size="small" color="warning" :loading="noiseCalibrating" :disabled="!isMicActive || noiseCalibrating" @click="calibrateNoise">
          <VIcon start>mdi-tune</VIcon>
          <span>Calibrar Ruido</span>
        </VBtn>
      </VCol>
      <VCol cols="6">
        <VBtn id="pit-mic-btn" block size="small" :color="isMicActive ? 'error' : 'success'" @click="toggleMic">
          <VIcon start>{{ isMicActive ? "mdi-microphone-off" : "mdi-microphone" }}</VIcon>
          <span>{{ isMicActive ? "Silenciar" : "Activar mic" }}</span>
        </VBtn>
      </VCol>
      <VCol cols="6">
        <VBtn block size="small" variant="tonal" @click="latinNotation = !latinNotation">
          <VIcon start>mdi-music-note</VIcon>
          <span>{{ latinNotation ? "Do Re Mi" : "C D E" }}</span>
        </VBtn>
      </VCol>
    </VRow>

    <VRow id="pit-chord-row" class="mb-2" justify="center">
      <VCol cols="12" class="text-center">
        <div id="pit-chord-name" class="chord-name" :style="{ color: chordColor }">{{ chordDisplay || "—" }}</div>
        <div id="pit-chord-notes" class="chord-notes">
          <VChip v-for="(n, i) in detectedNotes" :key="i" size="large" class="mx-1 note-chip" :style="{ background: noteColor(n.midi), color: noteTextColor(n.midi) }">
            {{ n.label }}
          </VChip>
        </div>
        <div v-if="chordInfo && chordInfo.pcs.length > 1 && !chordDisplay" class="text-medium-emphasis">Acorde no identificado</div>
      </VCol>
    </VRow>

    <VRow class="mb-2">
      <VCol cols="12">
        <canvas id="pit-spectrum-canvas" ref="spectrumCanvas" width="900" height="150" class="spectrum-canvas" />
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12">
        <VCard variant="tonal">
          <VCardTitle class="text-h6">Historial de acordes</VCardTitle>
          <VCardText>
            <VList v-if="history.length" density="compact">
              <VListItem v-for="(h, i) in history" :key="i">
                <template #prepend>
                  <VAvatar class="mr-2" size="x-small" :color="noteColor(h.rootMidi)" />
                </template>
                <VListItemTitle class="font-weight-medium">{{ h.label }}</VListItemTitle>
                <VListItemSubtitle>{{ h.notes }} · {{ h.time }}</VListItemSubtitle>
              </VListItem>
            </VList>
            <div v-else class="text-medium-emphasis">Sin acordes detectados todavía.</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { A4_FREQ, A4_MIDI, COLORS, COLOR_NEEDS_WHITE_TEXT } from "~/constants/pitcher"

definePageMeta({
  title: "Master de Acordes",
  icon: "mdi-guitar-electric",
  middleware: "authenticated",
})

// ── Note names ───────────────────────────────────────────────────────────────
const SHORT_NOTES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
const LATIN_NOTES = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"]

// ── Chord templates (intervals relative to root, folded to 12 semitones) ─────
const CHORD_TEMPLATES: { name: string; intervals: number[] }[] = [
  { name: "5", intervals: [0, 7] },
  { name: "sus2", intervals: [0, 2, 7] },
  { name: "sus4", intervals: [0, 5, 7] },
  { name: "maj", intervals: [0, 4, 7] },
  { name: "min", intervals: [0, 3, 7] },
  { name: "dim", intervals: [0, 3, 6] },
  { name: "aug", intervals: [0, 4, 8] },
  { name: "6", intervals: [0, 4, 7, 9] },
  { name: "m6", intervals: [0, 3, 7, 9] },
  { name: "7", intervals: [0, 4, 7, 10] },
  { name: "maj7", intervals: [0, 4, 7, 11] },
  { name: "m7", intervals: [0, 3, 7, 10] },
  { name: "m7b5", intervals: [0, 3, 6, 10] },
  { name: "dim7", intervals: [0, 3, 6, 9] },
  { name: "7b5", intervals: [0, 4, 6, 10] },
  { name: "7sus4", intervals: [0, 5, 7, 10] },
  { name: "7sus2", intervals: [0, 2, 7, 10] },
  { name: "add9", intervals: [0, 2, 4, 7] },
  { name: "maj9", intervals: [0, 2, 4, 7, 11] },
  { name: "9", intervals: [0, 2, 4, 7, 10] },
  { name: "m9", intervals: [0, 2, 3, 7, 10] },
]

// ── Analysis parameters ──────────────────────────────────────────────────────
const MIN_FREQ = 60
const MAX_FREQ = 2500
const PEAK_FLOOR_RELATIVE_DB = 24 // candidate peaks must be within this of the strongest peak
const ABS_NOISE_FLOOR_DB = -55
const HARMONIC_TOLERANCE = 0.06 // a peak this close to an integer multiple of a note is its harmonic
const NOTE_MATCH_CENTS = 0.6 // semitones; merge peaks that close together
const ACTIVATE_THRESHOLD = 2 // consecutive frames a note must be seen
const MAX_VOTES = 8
const FFT_SIZE = 8192

// ── State ─────────────────────────────────────────────────────────────────────
const latinNotation = ref(false)
const isMicActive = ref(false)
const noiseCalibrating = ref(false)
const sensitivity = ref(0.003)
const dBDisplay = ref("--")
const lowestFreqDisplay = ref("--")
const peaksCount = ref(0)

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let mediaStream: MediaStream | null = null
let sampleRate = 44100
let fftSize = FFT_SIZE
let freqData: Float32Array | null = null
let timeData: Float32Array | null = null
let rafId = 0

// Map midi -> consecutive frames detected (voting for stability)
let noteVotes = new Map<number, number>()
let lastPushedSig = ""

const activeMidis = ref<number[]>([])
const spectrumCanvas = ref<HTMLCanvasElement | null>(null)
const history = ref<{ label: string; notes: string; time: string; rootMidi: number }[]>([])

interface ChordInfo {
  rootPc: number | null
  name: string
  notes: number[]
  pcs: number[]
  bassPc: number | null
  bassMidi: number | null
  isInversion: boolean
}

// ── Computed ──────────────────────────────────────────────────────────────────
const detectedNotes = computed(() => {
  const list: { midi: number; label: string }[] = []
  const pcs = new Set<number>()
  for (const midi of [...activeMidis.value].sort((a, b) => a - b)) {
    const pc = pcOf(midi)
    if (pcs.has(pc)) continue
    pcs.add(pc)
    list.push({ midi, label: noteNameWithOctave(midi) })
  }
  return list
})

const chordInfo = computed<ChordInfo | null>(() => {
  const midis = [...activeMidis.value].sort((a, b) => a - b)
  if (!midis.length) return null
  return identifyChord(midis)
})

const chordDisplay = computed(() => {
  const info = chordInfo.value
  if (!info) return null
  if (info.pcs.length === 1) return noteName(info.rootPc!)
  if (!info.name) return null
  let text = chordLabel(info.rootPc!, info.name)
  if (info.isInversion) text += "/" + noteName(info.bassPc!)
  return text
})

const chordColor = computed(() => {
  const info = chordInfo.value
  if (!info || info.rootPc === null) return "#000"
  return noteColor(midiOfPc(info.rootPc, 4))
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  cleanup()
})

// ── Mic control ───────────────────────────────────────────────────────────────
async function toggleMic() {
  if (!isMicActive.value) {
    try {
      await initMicrophone()
      isMicActive.value = true
      calibrateNoise()
      update()
    } catch (e) {
      alert("Error accediendo al micrófono: " + (e as Error).message)
      isMicActive.value = false
    }
  } else {
    await cleanup()
  }
}

async function initMicrophone(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Web Audio API no soportada por el navegador")
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  })

  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  audioContext = new Ctor()
  await audioContext.resume()
  sampleRate = audioContext.sampleRate

  analyser = audioContext.createAnalyser()
  analyser.fftSize = FFT_SIZE
  analyser.smoothingTimeConstant = 0.3
  fftSize = analyser.fftSize
  freqData = new Float32Array(analyser.frequencyBinCount)
  timeData = new Float32Array(fftSize)

  const source = audioContext.createMediaStreamSource(mediaStream)
  const gainNode = audioContext.createGain()
  gainNode.gain.value = 4
  const filter = audioContext.createBiquadFilter()
  filter.type = "highpass"
  filter.frequency.value = 40
  filter.Q.value = 0.7

  source.connect(gainNode)
  gainNode.connect(filter)
  filter.connect(analyser)
}

async function cleanup(): Promise<void> {
  cancelAnimationFrame(rafId)
  if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop())
  if (audioContext && audioContext.state !== "closed") await audioContext.close()
  mediaStream = null
  audioContext = null
  analyser = null
  freqData = null
  timeData = null
  isMicActive.value = false
  noteVotes = new Map()
  activeMidis.value = []
  dBDisplay.value = "--"
  lowestFreqDisplay.value = "--"
}

function resetHistory() {
  noteVotes = new Map()
  activeMidis.value = []
  lastPushedSig = ""
  history.value = []
  dBDisplay.value = "--"
  lowestFreqDisplay.value = "--"
}

// ── Noise calibration ─────────────────────────────────────────────────────────
function calibrateNoise() {
  if (!analyser || !isMicActive.value) return
  noiseCalibrating.value = true
  const samples: number[] = []

  const capture = () => {
    if (!analyser || !timeData || !isMicActive.value) {
      noiseCalibrating.value = false
      return
    }
    if (samples.length < 30) {
      analyser.getFloatTimeDomainData(timeData)
      samples.push(getRMS(timeData))
      setTimeout(capture, 20)
    } else {
      const sorted = [...samples].sort((a, b) => a - b)
      const trimCount = Math.floor(sorted.length * 0.1)
      const trimmed = sorted.slice(trimCount, -trimCount)
      const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
      sensitivity.value = Math.max(0.002, avg * 1.8)
      noiseCalibrating.value = false
    }
  }

  capture()
}

// ── Main analysis loop ────────────────────────────────────────────────────────
function update() {
  if (!isMicActive.value || !analyser || !freqData || !timeData) return

  analyser.getFloatFrequencyData(freqData)
  analyser.getFloatTimeDomainData(timeData)

  const rms = getRMS(timeData)
  dBDisplay.value = Math.max(0, 20 * Math.log10(rms / 0.00002)).toFixed(1)

  // Only analyse when there is real signal (same gate as the tuner page)
  if (rms >= sensitivity.value) {
    updateVotes(analyzeSpectrum(freqData))
  } else {
    // Silence: decay all votes
    for (const [midi, count] of noteVotes) {
      const next = count - 2
      if (next <= 0) noteVotes.delete(midi)
      else noteVotes.set(midi, next)
    }
  }

  const active = [...noteVotes.entries()].filter(([, c]) => c >= ACTIVATE_THRESHOLD).map(([m]) => m)
  activeMidis.value = active

  updateDisplays(active)
  pushHistoryIfNew()

  drawSpectrum(freqData)
  rafId = requestAnimationFrame(update)
}

function updateDisplays(active: number[]) {
  if (!active.length) {
    lowestFreqDisplay.value = "--"
    return
  }
  const lowest = Math.min(...active)
  lowestFreqDisplay.value = midiToFreq(lowest).toFixed(2)
}

// ── Polyphonic detection: spectral peak picking + harmonic filtering ─────────
function analyzeSpectrum(freqDataDb: Float32Array): number[] {
  const binWidth = sampleRate / fftSize
  const minBin = Math.max(2, Math.floor(MIN_FREQ / binWidth))
  const maxBin = Math.min(freqDataDb.length - 1, Math.floor(MAX_FREQ / binWidth))

  let strongest = -Infinity
  for (let i = minBin; i <= maxBin; i++) {
    const db = freqDataDb[i]!
    if (db > strongest) strongest = db
  }
  peaksCount.value = 0
  if (strongest < ABS_NOISE_FLOOR_DB) return []

  // Local maxima within a window below the strongest peak (a chord tone may be quieter)
  const peaks: number[] = []
  for (let i = minBin + 1; i < maxBin; i++) {
    const db = freqDataDb[i]!
    if (db > freqDataDb[i - 1]! && db >= freqDataDb[i + 1]! && db > strongest - PEAK_FLOOR_RELATIVE_DB) {
      peaks.push(i)
    }
  }
  if (!peaks.length) peaks.push(minBin)
  peaksCount.value = peaks.length

  // Greedy acceptance, strongest first. A peak that is an integer multiple of an
  // already accepted note is its harmonic (discard); a near-duplicate is the same note.
  peaks.sort((a, b) => freqDataDb[b]! - freqDataDb[a]!)
  const accepted: number[] = []
  const notes: number[] = []
  for (const bin of peaks) {
    const freq = bin * binWidth
    const midi = freqToMidi(freq)
    if (midi < 0 || midi > 127) continue
    if (accepted.some((m) => Math.abs(midi - m) < NOTE_MATCH_CENTS)) continue
    const isHarmonic = accepted.some((m) => {
      const baseFreq = midiToFreq(m)
      const ratio = freq / baseFreq
      const k = Math.round(ratio)
      return k >= 2 && Math.abs(ratio - k) < HARMONIC_TOLERANCE
    })
    if (isHarmonic) continue
    accepted.push(midi)
    notes.push(Math.round(midi))
  }
  return notes
}

// ── Vote tracking ─────────────────────────────────────────────────────────────
function updateVotes(detected: number[]) {
  const next = new Map<number, number>()
  for (const midi of detected) {
    next.set(midi, Math.min((noteVotes.get(midi) ?? 0) + 1, MAX_VOTES))
  }
  for (const [midi, count] of noteVotes) {
    if (next.has(midi)) continue
    const c = count - 1
    if (c > 0) next.set(midi, c)
  }
  noteVotes = next
}

// ── Chord identification ──────────────────────────────────────────────────────
function identifyChord(midis: number[]): ChordInfo {
  const pcs = [...new Set(midis.map((m) => pcOf(m)))].sort((a, b) => a - b)
  const bassMidi = Math.min(...midis)
  const bassPc = pcOf(bassMidi)

  if (pcs.length === 1) {
    return { rootPc: pcs[0]!, name: "", notes: midis, pcs, bassPc, bassMidi, isInversion: false }
  }

  // Try each pitch class as root, starting from the lowest (root position wins).
  for (const rootPc of pcs) {
    const rel = pcs.filter((p) => p !== rootPc).map((p) => ((p - rootPc + 12) % 12)).sort((a, b) => a - b)
    const tpl = CHORD_TEMPLATES.find((t) => t.intervals.length === rel.length + 1 && t.intervals.slice(1).every((iv, i) => iv === rel[i]!))
    if (tpl) {
      return {
        rootPc,
        name: tpl.name,
        notes: midis,
        pcs,
        bassPc,
        bassMidi,
        isInversion: rootPc !== bassPc,
      }
    }
  }

  return { rootPc: null, name: "", notes: midis, pcs, bassPc, bassMidi, isInversion: false }
}

function chordLabel(rootPc: number, templateName: string): string {
  const root = (latinNotation.value ? LATIN_NOTES : SHORT_NOTES)[rootPc]!
  const map: Record<string, string> = {
    "": latinNotation.value ? "Mayor" : "maj",
    maj: latinNotation.value ? "Mayor" : "maj",
    min: latinNotation.value ? "Menor" : "m",
    dim: latinNotation.value ? "Disminuido" : "dim",
    aug: latinNotation.value ? "Aumentado" : "aug",
    "5": "5",
    sus2: "sus2",
    sus4: "sus4",
    "6": latinNotation.value ? "6ª" : "6",
    m6: latinNotation.value ? "menor 6ª" : "m6",
    "7": latinNotation.value ? "7ª" : "7",
    maj7: latinNotation.value ? "Mayor 7ª" : "maj7",
    m7: latinNotation.value ? "Menor 7ª" : "m7",
    m7b5: latinNotation.value ? "Semidisminuido" : "m7b5",
    dim7: latinNotation.value ? "Disminuido 7ª" : "dim7",
    "7b5": "7b5",
    "7sus4": "7sus4",
    "7sus2": "7sus2",
    add9: "add9",
    maj9: latinNotation.value ? "Mayor 9ª" : "maj9",
    "9": "9",
    m9: latinNotation.value ? "Menor 9ª" : "m9",
  }
  return root + (map[templateName] ?? templateName)
}

function pushHistoryIfNew() {
  const info = chordInfo.value
  if (!info || info.pcs.length < 2 || !info.name) return
  const sig = info.pcs.join("-") + "|" + info.name + "|" + (info.rootPc ?? -1) + "|" + info.isInversion
  if (sig === lastPushedSig) return
  lastPushedSig = sig

  history.value.unshift({
    label: chordDisplay.value!,
    notes: detectedNotes.value.map((n) => n.label).join(" "),
    time: new Date().toLocaleTimeString(),
    rootMidi: midiOfPc(info.rootPc ?? 0, 4),
  })
  if (history.value.length > 40) history.value.pop()
}

// ── Spectrum visualization ────────────────────────────────────────────────────
function drawSpectrum(freqData: Float32Array) {
  const canvas = spectrumCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const W = canvas.width
  const H = canvas.height
  const binWidth = sampleRate / fftSize
  const maxBin = Math.min(freqData.length, Math.floor(MAX_FREQ / binWidth))

  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = "#fafafa"
  ctx.fillRect(0, 0, W, H)

  const minDb = -110
  const maxDb = -20
  ctx.beginPath()
  ctx.strokeStyle = "#1565c0"
  ctx.lineWidth = 1.5
  for (let x = 0; x < W; x++) {
    const bin = Math.min(maxBin - 1, Math.floor((x / W) * maxBin))
    const db = freqData[bin] ?? -120
    const y = H - ((db - minDb) / (maxDb - minDb)) * H
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Markers for detected notes
  ctx.fillStyle = "#333"
  ctx.font = "11px sans-serif"
  for (const n of detectedNotes.value) {
    const f = midiToFreq(n.midi)
    if (f > MAX_FREQ) continue
    const x = (f / MAX_FREQ) * W
    ctx.fillStyle = noteColor(n.midi)
    ctx.beginPath()
    ctx.arc(x, 8, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRMS(buf: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i]! * buf[i]!
  return Math.sqrt(sum / buf.length)
}

function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
}

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0
  return 69 + 12 * Math.log2(freq / A4_FREQ)
}

function pcOf(midi: number): number {
  return ((midi % 12) + 12) % 12
}

function midiOfPc(pc: number, octave: number): number {
  return pc + (octave + 1) * 12
}

function noteName(pc: number): string {
  return (latinNotation.value ? LATIN_NOTES : SHORT_NOTES)[pc]!
}

function noteNameWithOctave(midi: number): string {
  return noteName(pcOf(midi)) + (Math.floor(midi / 12) - 1)
}

function noteColor(midi: number): string {
  return COLORS[pcOf(midi) * 2]!
}

function noteTextColor(midi: number): string {
  return COLOR_NEEDS_WHITE_TEXT[pcOf(midi) * 2]! ? "#fff" : "#666"
}
</script>

<style scoped>
h4 {
  font-weight: 600;
}

.chord-name {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  min-height: 3.3rem;
}

.chord-notes {
  min-height: 2.5rem;
}

.note-chip {
  font-weight: 700;
  font-size: 1.1rem;
}

.spectrum-canvas {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
</style>