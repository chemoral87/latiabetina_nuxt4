import { uid } from "~/utils/syllables"

export interface SongSyllable {
  id: string
  text: string
  chords: string[]
  notes: string[]
}

export interface SongLine {
  id: string
  syllables: SongSyllable[]
  times: number
}

export interface SongSection {
  id: string
  name: string
  lines: SongLine[]
  times: number
}

export interface SongTab {
  id: string
  title: string
  tablature: string
}

export interface SongContent {
  sections: SongSection[]
  tabs: SongTab[]
}

export interface Song {
  id?: number | null
  title: string
  artist: string
  key: string
  tempo: string
  org_id?: number | string | null
  content: SongContent
  created_by?: number | null
  created_at?: string
  updated_at?: string
}

export function newSyllable(text = ""): SongSyllable {
  return { id: uid("sy"), text, chords: [], notes: [] }
}

export function newLine(syllables: SongSyllable[] = [], times = 1): SongLine {
  return { id: uid("ln"), syllables, times: Math.max(1, Number(times) || 1) }
}

export function newSection(name = "Verso", lines: SongLine[] = [], times = 1): SongSection {
  return { id: uid("sec"), name, lines, times: Math.max(1, Number(times) || 1) }
}

export function newTab(title = "Tab", tablature = ""): SongTab {
  return { id: uid("tab"), title, tablature }
}

export function emptyContent(): SongContent {
  return { sections: [], tabs: [] }
}

export function defaultSong(): Song {
  return {
    id: null,
    title: "",
    artist: "",
    key: "",
    tempo: "",
    org_id: null,
    content: emptyContent(),
    created_by: null,
  }
}
