import { describe, it, expect } from 'vitest'
import { normalizeSections, findSeatById } from '~/utils/auditoriumConfig'
import { createFloatingSection, createFloatingTag, serializeFloatingConfig } from '~/utils/auditoriumFloating'

describe('normalizeSections — floating v2', () => {
  it('wraps each floating section as a single subsection preserving seat ids/categories', () => {
    const section = createFloatingSection('Uno', 10, 20, 2, 2)
    section.seats[0][0]!.category = 'Nuevos'
    const tag = createFloatingTag('Cam', 100, 200)
    const raw = serializeFloatingConfig({
      v: 2,
      sections: [section],
      tags: [tag],
    })

    const parsed = normalizeSections(raw)
    expect(parsed).toHaveLength(2)

    const markSection = parsed[0]
    expect(markSection.name).toBe('Uno')
    expect(markSection.isLabel).toBeFalsy()
    expect(markSection.subsections).toHaveLength(1)
    expect(markSection.subsections![0].seats).toHaveLength(2)
    expect(markSection.subsections![0].seats![0][0]!.id).toBe(section.seats[0][0]!.id)
    expect(markSection.subsections![0].seats![0][0]!.category).toBe('Nuevos')

    const markTag = parsed[1]
    expect(markTag.isLabel).toBe(true)
    expect(markTag.name).toBe('Cam')
  })

  it('findSeatById still resolves floating seat ids after conversion', () => {
    const section = createFloatingSection('Uno', 0, 0, 2, 2)
    const seatId = section.seats[1][1]!.id
    const parsed = normalizeSections({
      v: 2,
      sections: [section],
      tags: [],
    })
    const found = findSeatById(parsed, seatId)
    expect(found).toBeTruthy()
    expect(found!.id).toBe(seatId)
  })

  it('still parses legacy compact JSON ({ s, ss, s seats }) unchanged', () => {
    const raw = {
      s: [
        {
          i: '1',
          n: 'A',
          l: 0,
          ss: [
            {
              i: '1-1',
              n: 'Sub',
              s: [[{ i: '1-1-1-1', r: 0, c: 0, k: 'Lideres' }]],
            },
          ],
        },
      ],
    }
    const parsed = normalizeSections(raw)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].subsections![0].seats![0][0]!.category).toBe('Lideres')
    expect(parsed[0].subsections![0].seats![0][0]!.id).toBe('1-1-1-1')
  })
})
