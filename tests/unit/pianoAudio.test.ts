import { describe, expect, it } from 'vitest'
import { pitchToFrequency, PIANO_HARMONICS } from '~/utils/pianoAudio'

describe('pianoAudio utilities', () => {
  it('converts pitch and octave to standard equal temperament frequency', () => {
    expect(pitchToFrequency('A', 4)).toBeCloseTo(440, 1)
    expect(pitchToFrequency('C', 4)).toBeCloseTo(261.63, 1)
    expect(pitchToFrequency('A', 3)).toBeCloseTo(220, 1)
    expect(pitchToFrequency('A', 5)).toBeCloseTo(880, 1)
  })

  it('defines harmonic series for acoustic piano timbre', () => {
    expect(PIANO_HARMONICS.length).toBeGreaterThan(8)
    expect(PIANO_HARMONICS[1]).toBe(1.0)
    expect(PIANO_HARMONICS[2]).toBeLessThan(1.0)
  })
})
