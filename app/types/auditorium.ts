export interface Seat {
  id?: number | string
  i?: number | string
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