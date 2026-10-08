export type ScoreDuration = 0.25 | 0.5 | 1 | 2

export interface ScoreNote {
  id: string
  pitch: string
  octave: number
  start: number
  duration: ScoreDuration
  velocity?: number
}

export interface ScoreTrack {
  id: string
  name: string
  notes: ScoreNote[]
}

export interface Score {
  version: 1
  tempo: number
  beatsPerBar: number
  beatUnit: number
  tracks: ScoreTrack[]
}

export function emptyScore(): Score {
  return { version: 1, tempo: 100, beatsPerBar: 4, beatUnit: 4, tracks: [{ id: 'track-1', name: 'Piano', notes: [] }] }
}
