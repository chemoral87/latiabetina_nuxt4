export interface Seat {
  id?: number | string
  i?: number | string
  row?: number | string
  col?: number | string
  category?: string | null
  status?: string | null
  [key: string]: unknown
}

export interface Subsection {
  id?: number | string
  i?: number | string
  name?: string
  n?: string
  isLabel?: boolean
  l?: boolean
  w?: number
  width?: number
  s?: (Seat | null)[][]
  seats?: (Seat | null)[][]
  [key: string]: unknown
}

export interface Section {
  id?: number | string
  i?: number | string
  name?: string
  n?: string
  isLabel?: boolean
  l?: boolean
  ss?: Subsection[]
  subsections?: Subsection[]
  [key: string]: unknown
}

// ─── Editor v2 (floating layout, layout_version = 2) ────────────────────────
// Flat sections (no subsection level) with explicit, user-dragged x/y and a
// single rows x cols seat grid, plus free-floating text tags. See
// app/utils/auditoriumFloating.ts for parse/serialize/factory helpers and
// Z:\source\latiabetina.com\latiabetina_api\features\done\2026-09-20.auditorium-editor2-02-data-model.md
// for the full schema rationale.

export interface FloatingSeat {
  id: string
  row: number
  col: number
  category?: string | null
  status?: string | null
}

export interface FloatingSection {
  id: string
  name: string
  x: number
  y: number
  rows: number
  cols: number
  seats: (FloatingSeat | null)[][]
  group?: number
  hideRowNumbers?: boolean
  rowStart?: number
}

export interface FloatingTag {
  id: string
  text: string
  x: number
  y: number
}

export interface FloatingLayoutConfig {
  v: 2
  sections: FloatingSection[]
  tags: FloatingTag[]
}
