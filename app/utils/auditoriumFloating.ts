import { DEFAULT_SETTINGS } from '~/constants/auditorium'
import type {
  FloatingLayoutConfig,
  FloatingSection,
  FloatingSeat,
  FloatingTag,
} from '~/types/auditorium'

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

/**
 * Parse the raw `auditoriums.config` value for a layout_version=2 auditorium
 * into a FloatingLayoutConfig. Accepts a JSON string or an already-parsed
 * object. Returns an empty (but valid) config for a brand-new auditorium
 * (`config` is null/empty) instead of throwing.
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

  const cfg = (parsed && typeof parsed === 'object' ? parsed : {}) as Partial<FloatingLayoutConfig>

  return {
    v: 2,
    sections: Array.isArray(cfg.sections) ? cfg.sections : [],
    tags: Array.isArray(cfg.tags) ? cfg.tags : [],
  }
}

/**
 * Serialize a FloatingLayoutConfig back into the string stored in
 * `auditoriums.config`.
 */
export function serializeFloatingConfig(config: FloatingLayoutConfig): string {
  return JSON.stringify(config)
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
export function createFloatingSection(
  name: string,
  x: number,
  y: number,
  rows = 4,
  cols = 4
): FloatingSection {
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
export function resizeFloatingSectionGrid(
  section: FloatingSection,
  rows: number,
  cols: number
): void {
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
export function duplicateFloatingSection(
  section: FloatingSection,
  x: number,
  y: number
): FloatingSection {
  const copy = createFloatingSection(`${section.name} (copia)`, x, y, section.rows, section.cols)
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
    id: nextLocalId('tag'),
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
