import type { Score, ScoreNote } from '~/types/score'
import { emptyScore } from '~/types/score'

export interface TimelineEvent extends ScoreNote {
  trackId: string
  time: number
}

const PITCH_MAP: Record<string, number> = {
  C: 0,
  'C#': 1,
  'C♯': 1,
  Db: 1,
  'D♭': 1,
  D: 2,
  'D#': 3,
  'D♯': 3,
  Eb: 3,
  'E♭': 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  'F♯': 6,
  Gb: 6,
  'G♭': 6,
  G: 7,
  'G#': 8,
  'G♯': 8,
  Ab: 8,
  'A♭': 8,
  A: 9,
  'A#': 10,
  'A♯': 10,
  Bb: 10,
  'B♭': 10,
  B: 11,
  Cb: 11,
  'B#': 0,
}

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function noteToMidi(pitch: string, octave: number): number {
  const index = PITCH_MAP[pitch] ?? 0
  return octave * 12 + index + 12
}

export function midiToNote(midi: number): { pitch: string; octave: number } {
  const clamped = Math.max(12, Math.min(127, midi))
  const noteIndex = clamped % 12
  const octave = Math.floor((clamped - 12) / 12)
  return { pitch: CHROMATIC_SCALE[noteIndex] ?? 'C', octave }
}

export function transposeNote(note: ScoreNote, semitones: number): ScoreNote {
  const currentMidi = noteToMidi(note.pitch, note.octave)
  const { pitch, octave } = midiToNote(currentMidi + semitones)
  return { ...note, pitch, octave }
}

export function transposeScore(score: Score, semitones: number): Score {
  const normalized = normalizeScore(score)
  return {
    ...normalized,
    tracks: normalized.tracks.map(track => ({
      ...track,
      notes: track.notes.map(note => transposeNote(note, semitones)),
    })),
  }
}

export function normalizeScore(value: unknown): Score {
  if (!value || typeof value !== 'object') return emptyScore()
  const raw = value as Partial<Score>
  const tracks = Array.isArray(raw.tracks) ? raw.tracks : []
  return {
    version: 1,
    tempo: clamp(Number(raw.tempo) || 100, 30, 240),
    beatsPerBar: clamp(Math.floor(Number(raw.beatsPerBar) || 4), 1, 12),
    beatUnit: [2, 4, 8].includes(Number(raw.beatUnit)) ? Number(raw.beatUnit) : 4,
    tracks: tracks.map((track, index) => ({
      id: String(track?.id || `track-${index + 1}`),
      name: String(track?.name || `Pista ${index + 1}`),
      notes: Array.isArray(track?.notes) ? (track.notes.map(normalizeNote).filter(Boolean) as ScoreNote[]) : [],
    })),
  }
}

export function scoreTimeline(score: Score): TimelineEvent[] {
  return score.tracks.flatMap(track => track.notes.map(note => ({ ...note, trackId: track.id, time: note.start }))).sort((a, b) => a.time - b.time)
}

export function serializeScore(score: Score): string {
  return JSON.stringify(normalizeScore(score))
}

export function deserializeScore(value: unknown): Score {
  try {
    return normalizeScore(typeof value === 'string' ? JSON.parse(value) : value)
  } catch {
    return emptyScore()
  }
}

function normalizeNote(value: unknown): ScoreNote | null {
  if (!value || typeof value !== 'object') return null
  const note = value as Partial<ScoreNote>
  const duration = Number(note.duration)
  if (![0.25, 0.5, 1, 2].includes(duration)) return null
  return {
    id: String(note.id || crypto.randomUUID()),
    pitch: String(note.pitch || 'C'),
    octave: Math.floor(Number(note.octave) || 4),
    start: Math.max(0, Number(note.start) || 0),
    duration: duration as ScoreNote['duration'],
    velocity: Number(note.velocity) || 0.8,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
