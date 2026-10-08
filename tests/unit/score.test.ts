import { describe, expect, it } from 'vitest'
import { deserializeScore, scoreTimeline, transposeScore } from '~/utils/score'

describe('score utilities', () => {
  it('normalizes backend score content and orders timeline', () => {
    const score = deserializeScore({
      tempo: 90,
      tracks: [
        {
          id: 'piano',
          notes: [
            { id: 'b', pitch: 'E', octave: 4, start: 2, duration: 1 },
            { id: 'a', pitch: 'C', octave: 4, start: 0, duration: 0.5 },
          ],
        },
      ],
    })
    expect(score.tempo).toBe(90)
    expect(scoreTimeline(score).map(note => note.id)).toEqual(['a', 'b'])
  })

  it('transposes score notes up and down semitones and octaves', () => {
    const score = deserializeScore({ tempo: 100, tracks: [{ id: 'piano', notes: [{ id: '1', pitch: 'C', octave: 4, start: 0, duration: 1 }] }] })
    const upOne = transposeScore(score, 1)
    expect(upOne.tracks[0]?.notes[0]?.pitch).toBe('C#')
    expect(upOne.tracks[0]?.notes[0]?.octave).toBe(4)

    const downOne = transposeScore(score, -1)
    expect(downOne.tracks[0]?.notes[0]?.pitch).toBe('B')
    expect(downOne.tracks[0]?.notes[0]?.octave).toBe(3)

    const upOct = transposeScore(score, 12)
    expect(upOct.tracks[0]?.notes[0]?.pitch).toBe('C')
    expect(upOct.tracks[0]?.notes[0]?.octave).toBe(5)
  })
})
