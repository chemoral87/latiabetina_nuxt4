/** Scientific pitch names with sharps (C# not Db). MIDI 60 → C4. */

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

const NOTE_NAME_TO_PC: Record<string, number> = {
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

export function midiToNoteName(midi: number): string {
  const n = Math.max(0, Math.min(127, Math.round(midi)))
  const pc = n % 12
  const octave = Math.floor(n / 12) - 1
  return `${NOTE_NAMES_SHARP[pc]}${octave}`
}

export function noteNameToMidi(name: string): number | null {
  const trimmed = name.trim().replace(/♯/g, '#').replace(/♭/g, 'b')
  const match = trimmed.match(/^([A-Ga-g][#b]?)(-?\d+)$/)
  if (!match) return null
  const letter = match[1]![0]!.toUpperCase() + match[1]!.slice(1)
  const pc = NOTE_NAME_TO_PC[letter]
  if (pc === undefined) return null
  const octave = Number(match[2])
  const midi = (octave + 1) * 12 + pc
  if (midi < 0 || midi > 127) return null
  return midi
}
