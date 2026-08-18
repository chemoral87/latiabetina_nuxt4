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
}

export interface SongSection {
  id: string
  name: string
  lines: SongLine[]
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

export function newLine(syllables: SongSyllable[] = []): SongLine {
  return { id: uid("ln"), syllables }
}

export function newSection(name = "Verso", lines: SongLine[] = []): SongSection {
  return { id: uid("sec"), name, lines }
}

export function newTab(title = "Tab", tablature = ""): SongTab {
  return { id: uid("tab"), title, tablature }
}

export function emptyContent(): SongContent {
  return { sections: [], tabs: [] }
}

/** Coerces any value (null, [], missing fields) into a valid SongContent. */
export function normalizeContent(value: unknown): SongContent {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Partial<SongContent>
    return {
      sections: Array.isArray(v.sections) ? v.sections : [],
      tabs: Array.isArray(v.tabs) ? v.tabs : [],
    }
  }
  return emptyContent()
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

/** Joins the text of all syllables of a line into a single string. */
export function lineToText(line: SongLine): string {
  return line.syllables.map((s) => s.text).join("")
}

/** Plain-text rendering of the whole song content (useful for paste/export). */
export function contentToText(content: SongContent): string {
  const out: string[] = []
  for (const section of content.sections) {
    out.push(`[${section.name}]`)
    for (const line of section.lines) {
      const chords = line.syllables
        .filter((s) => s.chords.length > 0)
        .map((s) => s.chords.join(" "))
      if (chords.length > 0) out.push(chords.join(" "))
      out.push(lineToText(line))
    }
    out.push("")
  }
  for (const tab of content.tabs) {
    if (tab.title) out.push(`[${tab.title}]`)
    out.push(tab.tablature)
    out.push("")
  }
  return out.join("\n").trimEnd()
}