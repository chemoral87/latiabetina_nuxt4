export interface Seat {
  id: string
  row: number
  col: number
  category?: string | null
}

export interface Subsection {
  id: string
  name: string
  isLabel: boolean
  width?: number
  tempRows?: number
  tempCols?: number
  seats?: (Seat | null)[][]
}

export interface Section {
  id: string
  name: string
  isLabel: boolean
  subsections: Subsection[]
}
