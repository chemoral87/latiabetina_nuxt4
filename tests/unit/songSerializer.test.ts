import { describe, it, expect } from 'vitest'
import { normalizeContent, lineToText, contentToText, exportSongToJson, importSongFromJson } from '~/utils/songSerializer'
import type { Song } from '~/types/song'

describe('songSerializer', () => {
  it('normalizes empty or null content safely', () => {
    expect(normalizeContent(null)).toEqual({ sections: [], tabs: [] })
    expect(normalizeContent({})).toEqual({ sections: [], tabs: [] })
  })

  it('converts line syllables to plain text', () => {
    const line = {
      id: 'l1',
      times: 1,
      syllables: [
        { id: 's1', text: 'Gra', chords: ['G'], notes: [] },
        { id: 's2', text: 'cia', chords: [], notes: [] },
      ],
    }
    expect(lineToText(line)).toBe('Gracia')
  })

  it('exports and imports song JSON roundtrip', () => {
    const song: Song = {
      id: 1,
      title: 'Sublime Gracia',
      artist: 'John Newton',
      content: {
        sections: [
          {
            id: 'sec-1',
            name: 'Coro',
            times: 1,
            lines: [
              {
                id: 'ln-1',
                times: 1,
                syllables: [
                  { id: 'sy-1', text: 'Sublime', chords: ['G'], notes: [] },
                  { id: 'sy-2', text: ' gracia', chords: ['C'], notes: [] },
                ],
              },
            ],
          },
        ],
        tabs: [],
      },
    }

    const exported = exportSongToJson(song)
    expect(exported.title).toBe('Sublime Gracia')

    const imported = importSongFromJson(exported)
    expect(imported.title).toBe('Sublime Gracia')
    expect(imported.content?.sections).toHaveLength(1)
    expect(imported.content?.sections[0].name).toBe('Coro')
    expect(imported.content?.sections[0].lines[0].syllables[0].text).toBe('Sublime')
  })

  it('renders content to plain text with chords', () => {
    const content = {
      sections: [
        {
          id: 'sec-1',
          name: 'Verso',
          times: 1,
          lines: [
            {
              id: 'ln-1',
              times: 1,
              syllables: [{ id: 'sy-1', text: 'Hola', chords: ['G'], notes: [] }],
            },
          ],
        },
      ],
      tabs: [],
    }
    const text = contentToText(content)
    expect(text).toContain('[Verso]')
    expect(text).toContain('G')
    expect(text).toContain('Hola')
  })
})
