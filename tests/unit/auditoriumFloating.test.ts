import { describe, it, expect } from 'vitest'
import {
  parseFloatingConfig,
  serializeFloatingConfig,
  createFloatingSection,
  resizeFloatingSectionGrid,
  createFloatingTag,
  duplicateFloatingSection,
  getFloatingSectionWidth,
  getFloatingSectionHeight,
} from '~/utils/auditoriumFloating'

describe('parseFloatingConfig', () => {
  it('returns an empty valid config for null/undefined/empty-string config', () => {
    expect(parseFloatingConfig(null)).toEqual({ v: 2, sections: [], tags: [] })
    expect(parseFloatingConfig(undefined)).toEqual({ v: 2, sections: [], tags: [] })
    expect(parseFloatingConfig('')).toEqual({ v: 2, sections: [], tags: [] })
  })

  it('returns an empty valid config for invalid JSON instead of throwing', () => {
    expect(parseFloatingConfig('not json')).toEqual({ v: 2, sections: [], tags: [] })
  })

  it('parses a JSON string config', () => {
    const raw = JSON.stringify({
      v: 2,
      sections: [{ id: '1', name: 'Uno', x: 10, y: 20, rows: 2, cols: 2, seats: [] }],
      tags: [{ id: 't1', text: 'Cam', x: 5, y: 5 }],
    })
    const parsed = parseFloatingConfig(raw)
    expect(parsed.v).toBe(2)
    expect(parsed.sections).toHaveLength(1)
    expect(parsed.tags).toHaveLength(1)
  })

  it('accepts an already-parsed object', () => {
    const parsed = parseFloatingConfig({ v: 2, sections: [], tags: [] })
    expect(parsed).toEqual({ v: 2, sections: [], tags: [] })
  })

  it('defaults missing sections/tags to empty arrays', () => {
    expect(parseFloatingConfig({ v: 2 })).toEqual({ v: 2, sections: [], tags: [] })
  })
})

describe('serializeFloatingConfig', () => {
  it('outputs v3 compact format', () => {
    const config = {
      v: 2 as const,
      sections: [createFloatingSection('Uno', 10, 20, 3, 3)],
      tags: [createFloatingTag('Cam', 100, 200)],
    }
    const serialized = serializeFloatingConfig(config)
    const obj = JSON.parse(serialized)
    expect(obj.v).toBe(3)
    expect(obj.sc).toHaveLength(1)
    expect(obj.sc[0].nm).toBe('Uno')
    expect(obj.sc[0].i).toBe('A')
    expect(obj.tg).toHaveLength(1)
    expect(obj.tg[0].tx).toBe('Cam')
  })

  it('round-trips name, position, rows, cols through v3', () => {
    const config = {
      v: 2 as const,
      sections: [createFloatingSection('Uno', 10, 20, 3, 3)],
      tags: [createFloatingTag('Cam', 100, 200)],
    }
    const reparsed = parseFloatingConfig(serializeFloatingConfig(config))
    expect(reparsed.sections[0].name).toBe('Uno')
    expect(reparsed.sections[0].x).toBe(10)
    expect(reparsed.sections[0].y).toBe(20)
    expect(reparsed.sections[0].rows).toBe(3)
    expect(reparsed.sections[0].cols).toBe(3)
    expect(reparsed.sections[0].id).toBe('A')
    expect(reparsed.tags[0].text).toBe('Cam')
  })

  it('round-trips seat categories (modulo key order)', () => {
    const section = createFloatingSection('Uno', 10, 20, 2, 2)
    section.seats[0][1]!.category = 'Lideres'
    section.seats[1][0]!.category = 'Nuevos'
    const config = {
      v: 2 as const,
      sections: [section],
      tags: [createFloatingTag('Cam', 5, 5)],
    }
    const again = parseFloatingConfig(serializeFloatingConfig(config))
    expect(again.sections[0].seats[0][1]!.category).toBe('Lideres')
    expect(again.sections[0].seats[1][0]!.category).toBe('Nuevos')
    expect(again.tags[0].text).toBe('Cam')
  })

  it('uses letter-based seat ids after round-trip', () => {
    const config = { v: 2 as const, sections: [createFloatingSection('Uno', 0, 0, 2, 2)], tags: [] }
    const reparsed = parseFloatingConfig(serializeFloatingConfig(config))
    expect(reparsed.sections[0].seats[0][0]!.id).toBe('A-1-1')
    expect(reparsed.sections[0].seats[1][1]!.id).toBe('A-2-2')
  })

  it('assigns sequential letters to multiple sections', () => {
    const config = {
      v: 2 as const,
      sections: [createFloatingSection('A', 0, 0, 1, 1), createFloatingSection('B', 0, 0, 1, 1)],
      tags: [],
    }
    const reparsed = parseFloatingConfig(serializeFloatingConfig(config))
    expect(reparsed.sections[0].id).toBe('A')
    expect(reparsed.sections[1].id).toBe('B')
  })

  it('round-trips group, hideRowNumbers, rowStart', () => {
    const section = createFloatingSection('Uno', 0, 0, 2, 2)
    section.group = 3
    section.hideRowNumbers = true
    section.rowStart = 5
    const reparsed = parseFloatingConfig(serializeFloatingConfig({ v: 2, sections: [section], tags: [] }))
    expect(reparsed.sections[0].group).toBe(3)
    expect(reparsed.sections[0].hideRowNumbers).toBe(true)
    expect(reparsed.sections[0].rowStart).toBe(5)
  })
})

describe('createFloatingSection', () => {
  it('builds a section with the given position and a full seat grid', () => {
    const section = createFloatingSection('Uno', 10, 20, 3, 4)
    expect(section.name).toBe('Uno')
    expect(section.x).toBe(10)
    expect(section.y).toBe(20)
    expect(section.rows).toBe(3)
    expect(section.cols).toBe(4)
    expect(section.seats).toHaveLength(3)
    expect(section.seats[0]).toHaveLength(4)
    expect(section.seats[0][0]).toMatchObject({ row: 0, col: 0 })
    expect(section.seats[0][0]!.id).toContain('-1-1')
  })

  it('defaults to a 4x4 grid when rows/cols are omitted', () => {
    const section = createFloatingSection('Uno', 0, 0)
    expect(section.rows).toBe(4)
    expect(section.cols).toBe(4)
  })

  it('clamps rows/cols to the 1-20 / 1-30 bounds', () => {
    const section = createFloatingSection('Uno', 0, 0, 0, 999)
    expect(section.rows).toBe(1)
    expect(section.cols).toBe(30)
  })

  it('assigns distinct ids across multiple sections', () => {
    const a = createFloatingSection('A', 0, 0)
    const b = createFloatingSection('B', 0, 0)
    expect(a.id).not.toBe(b.id)
  })
})

describe('resizeFloatingSectionGrid', () => {
  it('rebuilds the seat grid to the new rows/cols', () => {
    const section = createFloatingSection('Uno', 0, 0, 2, 2)
    resizeFloatingSectionGrid(section, 3, 5)
    expect(section.rows).toBe(3)
    expect(section.cols).toBe(5)
    expect(section.seats).toHaveLength(3)
    expect(section.seats[0]).toHaveLength(5)
  })

  it('does not move the section (x/y untouched)', () => {
    const section = createFloatingSection('Uno', 40, 60, 2, 2)
    resizeFloatingSectionGrid(section, 6, 6)
    expect(section.x).toBe(40)
    expect(section.y).toBe(60)
  })

  it('clamps to the 1-20 / 1-30 bounds', () => {
    const section = createFloatingSection('Uno', 0, 0, 2, 2)
    resizeFloatingSectionGrid(section, 999, -5)
    expect(section.rows).toBe(20)
    expect(section.cols).toBe(1)
  })

  it('preserves categories on seats that still exist after resize', () => {
    const section = createFloatingSection('Uno', 0, 0, 2, 2)
    section.seats[0][0]!.category = 'Nuevos'
    section.seats[1][1]!.category = 'Lideres'
    resizeFloatingSectionGrid(section, 3, 3)
    expect(section.seats[0][0]!.category).toBe('Nuevos')
    expect(section.seats[1][1]!.category).toBe('Lideres')
    expect(section.seats[2][2]!.category).toBeUndefined()
  })

  it('drops categories on seats that fall outside the new grid', () => {
    const section = createFloatingSection('Uno', 0, 0, 3, 3)
    section.seats[2][2]!.category = 'Nuevos'
    resizeFloatingSectionGrid(section, 2, 2)
    expect(section.seats).toHaveLength(2)
    expect(section.seats[0]).toHaveLength(2)
    // corner seat is gone; remaining seats keep whatever they had (nothing)
    expect(section.seats[0][0]!.category).toBeUndefined()
  })
})

describe('duplicateFloatingSection', () => {
  it('copies name, size, categories and places at the given x/y with a new id', () => {
    const section = createFloatingSection('Uno', 10, 20, 2, 2)
    section.seats[0][1]!.category = 'Nuevos'
    section.hideRowNumbers = true
    const copy = duplicateFloatingSection(section, 100, 200)
    expect(copy.id).not.toBe(section.id)
    expect(copy.name).toBe('Uno (copia)')
    expect(copy.x).toBe(100)
    expect(copy.y).toBe(200)
    expect(copy.rows).toBe(2)
    expect(copy.cols).toBe(2)
    expect(copy.seats[0][1]!.category).toBe('Nuevos')
    expect(copy.seats[0][1]!.id).toContain(copy.id)
    expect(copy.hideRowNumbers).toBe(true)
  })
})

describe('createFloatingTag', () => {
  it('builds a tag with the given text and position', () => {
    const tag = createFloatingTag('Cam', 100, 200)
    expect(tag.text).toBe('Cam')
    expect(tag.x).toBe(100)
    expect(tag.y).toBe(200)
    expect(tag.id).toBeTruthy()
  })
})

describe('getFloatingSectionWidth / getFloatingSectionHeight', () => {
  it('derives pixel size from rows/cols using the shared seat-spacing formula', () => {
    const section = createFloatingSection('Uno', 0, 0, 3, 5)
    // seatSpacing = SEAT_SIZE + SEATS_DISTANCE; size = count * seatSpacing - SEATS_DISTANCE
    expect(getFloatingSectionWidth(section)).toBeGreaterThan(0)
    expect(getFloatingSectionHeight(section)).toBeGreaterThan(0)
    // width should scale with cols, height with rows
    const wider = createFloatingSection('Dos', 0, 0, 3, 10)
    expect(getFloatingSectionWidth(wider)).toBeGreaterThan(getFloatingSectionWidth(section))
  })
})
