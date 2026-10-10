import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { midiBytesToScore } from '~/utils/midiScoreImport'

describe('midi score import', () => {
  it('loads harrypotter.mid into snapped score notes', () => {
    const buf = readFileSync(new URL('../../features/harrypotter.mid', import.meta.url))
    const score = midiBytesToScore(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    expect(score.tracks.some(t => t.notes.length)).toBe(true)
    const note = score.tracks.flatMap(t => t.notes)[0]!
    expect([0.25, 0.5, 1, 2]).toContain(note.duration)
    expect(note.pitch).toMatch(/^[A-G]#?$/)
    expect(note.start).toBeGreaterThanOrEqual(0)
  })
})
