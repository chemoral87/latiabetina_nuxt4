import { describe, it, expect } from 'vitest'
import { parsePastedLyrics } from '~/utils/songParser'

describe('parsePastedLyrics', () => {
  it('parses structured section headers and lyrics with chords', () => {
    const rawText = `[Verso 1]
G        C
Grande es tu amor`

    const parsed = parsePastedLyrics(rawText)
    expect(parsed.sections).toHaveLength(1)
    expect(parsed.sections[0].name).toBe('Verso 1')
    expect(parsed.sections[0].lines).toHaveLength(1)

    const syllables = parsed.sections[0].lines[0].syllables
    const chordsInLine = syllables.flatMap(s => s.chords)
    expect(chordsInLine).toContain('G')
    expect(chordsInLine).toContain('C')
  })

  it('parses guitar tablature lines into tabs', () => {
    const rawTab = `e|---0---1---|
B|---1---3---|
G|---0---2---|
D|---2---0---|
A|---3-------|
E|-----------|`

    const parsed = parsePastedLyrics(rawTab)
    expect(parsed.tabs).toHaveLength(1)
    expect(parsed.tabs[0].tablature).toContain('e|---0---1---|')
  })

  it('defaults to Verso 1 if no section header is provided', () => {
    const text = 'Solo tu gracia me basta'
    const parsed = parsePastedLyrics(text)
    expect(parsed.sections).toHaveLength(1)
    expect(parsed.sections[0].name).toBe('Verso 1')
  })
})
