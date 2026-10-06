import { describe, it, expect } from 'vitest'
import { buildSineSegments, parseSinePitchClasses, sinePhase, sineSegmentMidi, sineSequenceMidi } from '~/utils/pitcherSine'

describe('pitcherSine', () => {
  describe('parseSinePitchClasses', () => {
    it('parses short and latin names', () => {
      expect(parseSinePitchClasses('A,C')).toEqual([9, 0])
      expect(parseSinePitchClasses('La,Do')).toEqual([9, 0])
      expect(parseSinePitchClasses(' a , c ')).toEqual([9, 0])
    })

    it('ignores octave digits and accepts # as sharp', () => {
      expect(parseSinePitchClasses('a4, c5')).toEqual([9, 0])
      expect(parseSinePitchClasses('A#,C')).toEqual([10, 0])
      expect(parseSinePitchClasses('Sol#,Re')).toEqual([8, 2])
    })

    it('returns [] for fewer than 2 notes or unknown names', () => {
      expect(parseSinePitchClasses('A')).toEqual([])
      expect(parseSinePitchClasses('A,')).toEqual([])
      expect(parseSinePitchClasses('A,X')).toEqual([])
      expect(parseSinePitchClasses('')).toEqual([])
      expect(parseSinePitchClasses(',,')).toEqual([])
    })
  })

  describe('buildSineSegments (range 47..61)', () => {
    const MIN = 47
    const MAX = 61

    it('A,C → A3→C4 and C3→A3', () => {
      expect(buildSineSegments([9, 0], MIN, MAX)).toEqual([
        { lo: 57, hi: 60 },
        { lo: 48, hi: 57 },
      ])
    })

    it('C,A → C3→A3 and A3→C4', () => {
      expect(buildSineSegments([0, 9], MIN, MAX)).toEqual([
        { lo: 48, hi: 57 },
        { lo: 57, hi: 60 },
      ])
    })

    it('C,E,G → C3→E3, E3→G3, G3→C4', () => {
      expect(buildSineSegments([0, 4, 7], MIN, MAX)).toEqual([
        { lo: 48, hi: 52 },
        { lo: 52, hi: 55 },
        { lo: 55, hi: 60 },
      ])
    })

    it('A,C,E → A3→C4, C3→E3, E3→A3', () => {
      expect(buildSineSegments([9, 0, 4], MIN, MAX)).toEqual([
        { lo: 57, hi: 60 },
        { lo: 48, hi: 52 },
        { lo: 52, hi: 57 },
      ])
    })

    it('same note twice → one octave up', () => {
      expect(buildSineSegments([0, 0], MIN, MAX)).toEqual([
        { lo: 48, hi: 60 },
        { lo: 48, hi: 60 },
      ])
    })

    it('keeps overflowing lines (drawn with a continuation copy from below)', () => {
      // max 58: A3→C4 (57→60) desborda y se conserva; C3→A3 cabe
      expect(buildSineSegments([9, 0], MIN, 58)).toEqual([
        { lo: 57, hi: 60 },
        { lo: 48, hi: 57 },
      ])
    })

    it('returns [] for fewer than 2 pitch classes', () => {
      expect(buildSineSegments([], MIN, MAX)).toEqual([])
      expect(buildSineSegments([9], MIN, MAX)).toEqual([])
    })
  })

  describe('sinePhase', () => {
    it('is 0 at tick 0, column 0', () => {
      expect(sinePhase(0, 0, 2)).toBe(0)
    })

    it('is 0 when column equals tick (the moment the mic started)', () => {
      expect(sinePhase(30, 30, 2)).toBe(0)
    })

    it('advances half a turn after half a cycle (60 ticks = 1 s of a 2 s cycle)', () => {
      expect(sinePhase(60, 0, 2)).toBeCloseTo(Math.PI, 10)
    })

    it('grows with tick', () => {
      expect(sinePhase(10, 0, 2)).toBeLessThan(sinePhase(20, 0, 2))
    })
  })

  describe('wave shapes', () => {
    const points = [48, 60] // C3 → C4

    it('sine: cosine ramp, flat at the notes', () => {
      expect(sineSequenceMidi(points, 0)).toBe(48)
      expect(sineSequenceMidi(points, Math.PI / 2)).toBe(54)
      expect(sineSequenceMidi(points, Math.PI)).toBe(60)
    })

    it('triangle: linear ramp', () => {
      expect(sineSequenceMidi(points, 0, 'triangle')).toBe(48)
      expect(sineSequenceMidi(points, Math.PI / 2, 'triangle')).toBe(54)
      expect(sineSequenceMidi(points, Math.PI, 'triangle')).toBe(60)
    })

    it('square: jumps to the target note and holds', () => {
      expect(sineSequenceMidi(points, 0.01, 'square')).toBe(60)
      expect(sineSequenceMidi(points, Math.PI - 0.01, 'square')).toBe(60)
      expect(sineSequenceMidi(points, Math.PI + 0.01, 'square')).toBe(48)
    })

    it('segment lines: square holds each extreme half a cycle', () => {
      expect(sineSegmentMidi(48, 60, 0, 'square')).toBe(60)
      expect(sineSegmentMidi(48, 60, Math.PI, 'square')).toBe(48)
      expect(sineSegmentMidi(48, 60, Math.PI / 2, 'triangle')).toBe(54)
      expect(sineSegmentMidi(48, 60, Math.PI, 'triangle')).toBe(60)
      expect(sineSegmentMidi(48, 60, Math.PI, 'sine')).toBe(60)
    })
  })
})
