import { describe, expect, it } from 'vitest'
import { detectChordFrequencies } from '../../app/utils/micChordDetect'

const SAMPLE_RATE = 48000
const BINS = 4096
const BIN_HZ = SAMPLE_RATE / 2 / BINS // ~5.86 Hz

function mockAnalyser(peaks: { freq: number; db: number }[]): AnalyserNode {
  const data = new Float32Array(BINS).fill(-100)
  for (const { freq, db } of peaks) {
    const bin = Math.round(freq / BIN_HZ)
    data[bin] = db
    data[bin - 1] = db - 10
    data[bin + 1] = db - 10
    data[bin - 2] = db - 20
    data[bin + 2] = db - 20
  }
  return {
    frequencyBinCount: BINS,
    context: { sampleRate: SAMPLE_RATE },
    getFloatFrequencyData(arr: Float32Array) {
      arr.set(data)
    },
  } as unknown as AnalyserNode
}

describe('detectChordFrequencies', () => {
  it('detects the three notes of a C-E-G chord', () => {
    const freqs = detectChordFrequencies(
      mockAnalyser([
        { freq: 262, db: 0 },
        { freq: 330, db: -2 },
        { freq: 392, db: -3 },
      ])
    )
    expect(freqs).toHaveLength(3)
    expect(freqs[0]).toBeCloseTo(262, -1)
    expect(freqs[1]).toBeCloseTo(330, -1)
    expect(freqs[2]).toBeCloseTo(392, -1)
  })

  it('suppresses harmonics of an accepted fundamental', () => {
    const freqs = detectChordFrequencies(
      mockAnalyser([
        { freq: 262, db: 0 },
        { freq: 330, db: -2 },
        { freq: 392, db: -3 },
        { freq: 524, db: -15 }, // 2×C4 — armónico, debe descartarse
      ])
    )
    expect(freqs).toHaveLength(3)
    expect(freqs.some(f => Math.abs(f - 524) < 15)).toBe(false)
  })

  it('returns empty on silence', () => {
    const freqs = detectChordFrequencies(mockAnalyser([]))
    expect(freqs).toEqual([])
  })

  it('collapses a single note with harmonics to one frequency', () => {
    const freqs = detectChordFrequencies(
      mockAnalyser([
        { freq: 262, db: 0 },
        { freq: 524, db: -8 }, // 2×
        { freq: 786, db: -12 }, // 3×
        { freq: 1048, db: -16 }, // 4×
      ])
    )
    expect(freqs).toHaveLength(1)
    expect(freqs[0]).toBeCloseTo(262, -1)
  })

  it('merges near-duplicate peaks (ripple) into one note', () => {
    const freqs = detectChordFrequencies(
      mockAnalyser([
        { freq: 262, db: 0 },
        { freq: 270, db: -1 }, // 3% apart, beatido
      ])
    )
    expect(freqs).toHaveLength(1)
  })
})
