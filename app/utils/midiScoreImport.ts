import type { Score, ScoreDuration, ScoreNote } from '~/types/score'
import { firstTempoBpm, MIDI_MAX_BYTES, MidiParseError, parseMidi, type MidiFile } from '~/utils/midiParser'
import { midiToNote } from '~/utils/score'

const SNAP: ScoreDuration[] = [0.25, 0.5, 1, 2]

export function midiFileToScore(file: MidiFile): Score {
  const ppq = file.ticksPerQuarter || 1
  const tracks = file.tracks
    .map((track, index) => ({
      id: `track-${index + 1}`,
      name: track.name || `Pista ${index + 1}`,
      notes: track.notes
        .filter(n => n.channel !== 9)
        .map((n, i): ScoreNote => {
          const { pitch, octave } = midiToNote(n.midi)
          return {
            id: `midi-${track.index}-${i}`,
            pitch,
            octave,
            start: Math.max(0, Math.round((n.tick / ppq) * 4) / 4),
            duration: snapDuration(n.durationTicks / ppq),
            velocity: Math.min(1, n.velocity / 127),
          }
        }),
    }))
    .filter(t => t.notes.length)
  if (!tracks.length) throw new MidiParseError('El archivo no tiene notas')
  const sig = file.timeSignature
  return {
    version: 1,
    tempo: Math.min(240, Math.max(30, firstTempoBpm(file) ?? 100)),
    beatsPerBar: sig?.numerator && sig.numerator >= 1 && sig.numerator <= 12 ? sig.numerator : 4,
    beatUnit: sig?.denominator && [2, 4, 8].includes(sig.denominator) ? sig.denominator : 4,
    tracks,
  }
}

export function midiBytesToScore(data: ArrayBuffer): Score {
  if (data.byteLength > MIDI_MAX_BYTES) throw new MidiParseError('El archivo MIDI supera 2 MB')
  return midiFileToScore(parseMidi(data))
}

function snapDuration(beats: number): ScoreDuration {
  const q = Math.max(0.25, beats)
  return SNAP.reduce((best, d) => (Math.abs(d - q) < Math.abs(best - q) ? d : best))
}
