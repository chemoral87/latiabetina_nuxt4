import { DEFAULT_SETTINGS } from '~/constants/auditorium'
import type { FloatingLayoutConfig, FloatingSection, FloatingSeat, FloatingTag } from '~/types/auditorium'

/**
 * Editor v2 (floating layout) config helpers.
 *
 * Sections in v2 are flat — no subsection level (confirmed, see
 * features/done/2026-09-20.auditorium-editor2-02-data-model.md). Each section
 * owns its own `rows x cols` seat grid directly. Position (x, y) is always
 * explicit and user-dragged; width/height are always derived from rows/cols,
 * never persisted.
 */

const seatSpacing = () => DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE

const MIN_ROWS = 1
const MAX_ROWS = 20
const MIN_COLS = 1
const MAX_COLS = 30

let idCounter = 0
function nextLocalId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

// ── v3 compact format helpers ─────────────────────────────────────────────────

/**
 * Convert a 0-based section index to a base-26 letter key: 0→A, 25→Z, 26→AA…
 * ponytail: simple loop, upgrade to Math-based if > ~700 sections ever needed.
 */
function indexToLetter(n: number): string {
  let s = ''
  let i = n
  do {
    s = String.fromCharCode(65 + (i % 26)) + s
    i = Math.floor(i / 26) - 1
  } while (i >= 0)
  return s
}

/** Seat id used at runtime: {sectionLetter}-{1-based-row}-{1-based-col} */
function makeSeatId(letter: string, r: number, c: number): string {
  return `${letter}-${r + 1}-${c + 1}`
}

function buildSeatsGrid(letter: string, rows: number, cols: number, prevSeats?: (FloatingSeat | null)[][]): (FloatingSeat | null)[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const prev = prevSeats?.[r]?.[c]
      return { id: makeSeatId(letter, r, c), row: r, col: c, ...(prev?.category ? { category: prev.category } : {}) }
    })
  )
}

function serializeV3(config: FloatingLayoutConfig): string {
  const sc = config.sections.map((s, idx) => {
    const letter = indexToLetter(idx)
    // Collect only seats that have a category — store as [{r, c, ca}]
    const cats: { r: number; c: number; ca: string }[] = []
    for (const row of s.seats) {
      for (const seat of row) {
        if (seat?.category) cats.push({ r: seat.row, c: seat.col, ca: seat.category })
      }
    }
    const o: Record<string, unknown> = { i: letter, nm: s.name, x: s.x, y: s.y, ro: s.rows, co: s.cols }
    if (cats.length) o.ca = cats
    if (s.group !== undefined) o.gr = s.group
    if (s.hideRowNumbers) o.hr = true
    if (s.rowStart !== undefined && s.rowStart !== 1) o.rs = s.rowStart
    return o
  })
  const tg = config.tags.map((t, idx) => ({ i: `_tag${idx + 1}`, tx: t.text, x: t.x, y: t.y, ...(t.fontSize ? { fsz: t.fontSize } : {}), ...(t.color ? { col: t.color } : {}) }))
  return JSON.stringify({ v: 3, sc, tg })
}

function parseV3(cfg: Record<string, unknown>): FloatingLayoutConfig {
  const sc = Array.isArray(cfg.sc) ? cfg.sc : []
  const sections: FloatingSection[] = sc.map((s: any) => {
    const letter = s.i as string
    const rows = Number(s.ro) || 1
    const cols = Number(s.co) || 1
    // Rebuild full grid, then apply category overrides
    const seats = buildSeatsGrid(letter, rows, cols)
    if (Array.isArray(s.ca)) {
      for (const { r, c, ca } of s.ca) {
        if (seats[r]?.[c]) seats[r][c]!.category = ca
      }
    }
    // Legacy: se array (old v3 format before this optimization)
    if (!s.ca && Array.isArray(s.se)) {
      s.se.forEach((row: any[], r: number) => {
        if (!Array.isArray(row)) return
        row.forEach((cell: any, c: number) => {
          if (!cell) return
          const category = typeof cell === 'object' && cell.ca ? cell.ca : undefined
          if (category && seats[r]?.[c]) seats[r][c]!.category = category
        })
      })
    }
    return {
      id: letter,
      name: String(s.nm ?? ''),
      x: Number(s.x) || 0,
      y: Number(s.y) || 0,
      rows,
      cols,
      seats,
      ...(s.gr !== undefined ? { group: Number(s.gr) } : {}),
      ...(s.hr ? { hideRowNumbers: true } : {}),
      ...(s.rs !== undefined ? { rowStart: Number(s.rs) } : {}),
    }
  })
  const tg = Array.isArray(cfg.tg) ? cfg.tg : []
  const tags: FloatingTag[] = tg.map((t: any) => ({
    id: String(t.i),
    text: String(t.tx ?? ''),
    x: Number(t.x) || 0,
    y: Number(t.y) || 0,
    ...(t.fsz ? { fontSize: Number(t.fsz) } : {}),
    ...(t.col ? { color: String(t.col) } : {}),
  }))
  return { v: 2, sections, tags }
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Parse the raw `auditoriums.config` value for a layout_version=2 auditorium
 * into a FloatingLayoutConfig. Accepts a JSON string or an already-parsed
 * object. Returns an empty (but valid) config for a brand-new auditorium
 * (`config` is null/empty) instead of throwing.
 * Handles both legacy v2 (uncompressed) and v3 (compact) formats.
 */
export function parseFloatingConfig(raw: unknown): FloatingLayoutConfig {
  if (raw === null || raw === undefined || raw === '') {
    return { v: 2, sections: [], tags: [] }
  }

  let parsed: unknown = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      return { v: 2, sections: [], tags: [] }
    }
  }

  const cfg = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>

  if (cfg.v === 3) return parseV3(cfg)

  return {
    v: 2,
    sections: Array.isArray(cfg.sections) ? (cfg.sections as FloatingSection[]) : [],
    tags: Array.isArray(cfg.tags) ? (cfg.tags as FloatingTag[]) : [],
  }
}

/**
 * Serialize a FloatingLayoutConfig into the compact v3 string stored in
 * `auditoriums.config`. v3 uses short keys and letter-based section/seat IDs.
 */
export function serializeFloatingConfig(config: FloatingLayoutConfig): string {
  return serializeV3(config)
}

/**
 * Build a rows x cols grid of seats for a section, mirroring
 * createSeatsGrid/createSeat in editor.vue but flat (no subsection index —
 * seat id is `{sectionId}-{row+1}-{col+1}`).
 */
function createSeatsGrid(sectionId: string, rows: number, cols: number): (FloatingSeat | null)[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      id: `${sectionId}-${r + 1}-${c + 1}`,
      row: r,
      col: c,
    }))
  )
}

/**
 * Create a new floating section at an explicit canvas position.
 */
export function createFloatingSection(name: string, x: number, y: number, rows = 4, cols = 4): FloatingSection {
  const id = nextLocalId('section')
  const clampedRows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, rows))
  const clampedCols = Math.max(MIN_COLS, Math.min(MAX_COLS, cols))
  return {
    id,
    name,
    x,
    y,
    rows: clampedRows,
    cols: clampedCols,
    seats: createSeatsGrid(id, clampedRows, clampedCols),
  }
}

/**
 * Resize a section's seat grid in place to the given rows/cols, clamped to
 * the same bounds as v1's editor.vue (1-20 rows, 1-30 cols). Unlike v1's
 * full rebuild, categories on seats that still exist at the same (row, col)
 * after the resize are preserved — only seats beyond the new edges are
 * dropped, and new edge seats start without a category.
 */
export function resizeFloatingSectionGrid(section: FloatingSection, rows: number, cols: number): void {
  const clampedRows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, Math.floor(rows) || MIN_ROWS))
  const clampedCols = Math.max(MIN_COLS, Math.min(MAX_COLS, Math.floor(cols) || MIN_COLS))
  const oldSeats = section.seats
  const next = createSeatsGrid(section.id, clampedRows, clampedCols)
  for (let r = 0; r < clampedRows; r++) {
    for (let c = 0; c < clampedCols; c++) {
      const prev = oldSeats?.[r]?.[c]
      if (prev?.category && next[r]?.[c]) {
        next[r][c]!.category = prev.category
      }
    }
  }
  section.rows = clampedRows
  section.cols = clampedCols
  section.seats = next
}

/**
 * Deep-copy a floating section onto a new canvas position with a fresh id
 * (and seat ids). Preserves seat categories. Name gets a " (copia)" suffix.
 */
export function duplicateFloatingSection(section: FloatingSection, x: number, y: number): FloatingSection {
  const copy = createFloatingSection(`${section.name} (copia)`, x, y, section.rows, section.cols)
  copy.hideRowNumbers = section.hideRowNumbers
  copy.rowStart = section.rowStart
  for (let r = 0; r < section.rows; r++) {
    for (let c = 0; c < section.cols; c++) {
      const prev = section.seats?.[r]?.[c]
      if (prev?.category && copy.seats[r]?.[c]) {
        copy.seats[r][c]!.category = prev.category
      }
    }
  }
  return copy
}

/**
 * Create a new floating tag at an explicit canvas position.
 */
export function createFloatingTag(text: string, x: number, y: number): FloatingTag {
  return {
    id: `_tag${Date.now() % 100000}`,
    text,
    x,
    y,
  }
}

/**
 * Pixel width of a section, derived from cols (same formula as
 * Seats.vue/SeatsStageCanvas.vue: cols * seatSpacing - SEATS_DISTANCE).
 */
export function getFloatingSectionWidth(section: FloatingSection): number {
  return section.cols * seatSpacing() - DEFAULT_SETTINGS.SEATS_DISTANCE
}

/**
 * Pixel height of a section, derived from rows (same formula as
 * Seats.vue/SeatsStageCanvas.vue: rows * seatSpacing - SEATS_DISTANCE).
 */
export function getFloatingSectionHeight(section: FloatingSection): number {
  return section.rows * seatSpacing() - DEFAULT_SETTINGS.SEATS_DISTANCE
}

/**
 * Find a floating seat by its id across all sections. Returns the seat object
 * (with a reference to its parent section) or null.
 */
export function findFloatingSeatById(sections: FloatingSection[], seatId: number | string): FloatingSeat | null {
  for (const section of sections) {
    for (const row of section.seats) {
      for (const seat of row) {
        if (seat && seat.id === seatId) return seat
      }
    }
  }
  return null
}

/**
 * Apply seat statuses from event data onto floating sections, in place.
 * seatsData shapes:
 *   { status: { letter: ["r-c", ...], ... }, ... }  (grouped by section)
 *   { status: ["A-1-1", ...], ... }                (legacy flat arrays)
 */
export function applyFloatingSeatStatuses(sections: FloatingSection[], seatsData: unknown): void {
  if (!seatsData || Array.isArray(seatsData)) return
  const byId = new Map<string, FloatingSeat>()
  for (const section of sections) {
    for (const row of section.seats) {
      for (const seat of row) {
        if (seat) byId.set(seat.id, seat)
      }
    }
  }
  Object.entries(seatsData as Record<string, unknown>).forEach(([status, value]) => {
    if (Array.isArray(value)) {
      // legacy flat: ["A-1-1", ...]
      value.forEach(seatId => {
        const seat = byId.get(String(seatId))
        if (seat) seat.status = status
      })
      return
    }
    if (value && typeof value === 'object') {
      // grouped: { A: ["1-6", ...], ... }
      Object.entries(value as Record<string, string[]>).forEach(([letter, rest]) => {
        if (!Array.isArray(rest)) return
        rest.forEach(rc => {
          const seat = byId.get(`${letter}-${rc}`)
          if (seat) seat.status = status
        })
      })
    }
  })
}
