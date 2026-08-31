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

/** Coerces any value (null, [], missing fields) into a valid SongContent. */
export function normalizeContent(value: unknown): SongContent {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const v = value as Partial<SongContent>
    const sections = Array.isArray(v.sections) ? (v.sections as SongSection[]) : []
    for (const sec of sections) {
      const s = sec as SongSection & Record<string, unknown>
      const raw = s.times ?? (s as Record<string, unknown>)["repeat"] ?? (s as Record<string, unknown>)["repeats"]
      let t = Number(raw)
      if (!Number.isFinite(t) || t < 1) t = 1
      s.times = Math.floor(t)
      for (const line of s.lines ?? []) {
        const l = line as SongLine & Record<string, unknown>
        const rawLine = l.times ?? (l as Record<string, unknown>)["repeat"] ?? (l as Record<string, unknown>)["repeats"]
        let lt = Number(rawLine)
        if (!Number.isFinite(lt) || lt < 1) lt = 1
        l.times = Math.floor(lt)
      }
    }
    return {
      sections,
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

/** JSON export: matches attached format { title, sections: [{ name, times, lines: [{ times, syllables: [{ syllable, chords }] }] }] } */
export function exportSongToJson(song: Song): Record<string, unknown> {
  return {
    title: song.title,
    ...(song.artist ? { artist: song.artist } : {}),
    ...(song.key ? { key: song.key } : {}),
    ...(song.tempo ? { tempo: song.tempo } : {}),
    sections: song.content.sections.map((sec) => ({
      name: sec.name,
      times: sec.times ?? 1,
      lines: sec.lines.map((line) => ({
        times: (line as SongLine).times ?? 1,
        syllables: line.syllables.map((syl) => {
          const obj: Record<string, unknown> = { syllable: syl.text }
          if (syl.chords.length) obj.chords = [...syl.chords]
          if (syl.notes.length) obj.notes = [...syl.notes]
          return obj
        }),
      })),
    })),
    ...(song.content.tabs.length
      ? {
          tabs: song.content.tabs.map((tab) => ({
            title: tab.title,
            tablature: tab.tablature,
          })),
        }
      : {}),
  }
}

/** JSON import: accepts attached format, full song, or { content: { sections } } */
export function importSongFromJson(raw: unknown): Partial<Song> {
  if (!raw || typeof raw !== "object") return { content: emptyContent() }

  const r = raw as Record<string, unknown>
  let sectionsRaw: unknown[] = []
  let tabsRaw: unknown[] = []
  let title = ""
  let artist = ""
  let key = ""
  let tempo = ""
  let orgId: unknown = null

  // Prefer content wrapper if present (internal format)
  const contentObj = r.content as Record<string, unknown> | undefined
  if (contentObj && typeof contentObj === "object" && (Array.isArray(contentObj.sections) || Array.isArray(contentObj.tabs))) {
    sectionsRaw = (contentObj.sections as unknown[]) ?? (r.sections as unknown[]) ?? []
    tabsRaw = (contentObj.tabs as unknown[]) ?? (r.tabs as unknown[]) ?? []
    title = (r.title as string) ?? ""
    artist = (r.artist as string) ?? ""
    key = (r.key as string) ?? ""
    tempo = (r.tempo as string) ?? ""
    orgId = r.org_id ?? null
  } else if (Array.isArray(r.sections)) {
    sectionsRaw = r.sections as unknown[]
    tabsRaw = (r.tabs as unknown[]) ?? []
    title = (r.title as string) ?? ""
    artist = (r.artist as string) ?? ""
    key = (r.key as string) ?? ""
    tempo = (r.tempo as string) ?? ""
    orgId = r.org_id ?? null
  } else if (Array.isArray(r)) {
    sectionsRaw = r as unknown[]
  }

  const sections: SongSection[] = (sectionsRaw as Record<string, unknown>[]).map((sec) => {
    const timesRaw = (sec.times as unknown) ?? (sec as Record<string, unknown>)["repeat"] ?? (sec as Record<string, unknown>)["repeats"]
    let times = Number(timesRaw)
    if (!Number.isFinite(times) || times < 1) times = 1
    times = Math.floor(times)
    return {
      id: (sec.id as string) ?? uid("sec"),
      name: (sec.name as string) ?? "Sección",
      times,
      lines: Array.isArray(sec.lines)
        ? (sec.lines as Record<string, unknown>[]).map((line) => {
            const timesRawLine = (line.times as unknown) ?? (line as Record<string, unknown>)["repeat"] ?? (line as Record<string, unknown>)["repeats"]
            let lineTimes = Number(timesRawLine)
            if (!Number.isFinite(lineTimes) || lineTimes < 1) lineTimes = 1
            lineTimes = Math.floor(lineTimes)
            return {
              id: (line.id as string) ?? uid("ln"),
              times: lineTimes,
              syllables: Array.isArray(line.syllables)
                ? (line.syllables as Record<string, unknown>[]).map((syl) => ({
                    id: (syl.id as string) ?? uid("sy"),
                    text: ((syl.text as string) ?? (syl.syllable as string) ?? "") as string,
                    chords: Array.isArray(syl.chords) ? (syl.chords as string[]) : [],
                    notes: Array.isArray(syl.notes) ? (syl.notes as string[]) : [],
                  }))
                : [],
            }
          })
        : [],
    }
  })

  const tabs: SongTab[] = (tabsRaw as Record<string, unknown>[]).map((tab) => ({
    id: (tab.id as string) ?? uid("tab"),
    title: (tab.title as string) ?? "Tab",
    tablature: (tab.tablature as string) ?? (tab.content as string) ?? "",
  }))

  const result: Partial<Song> = {
    title,
    artist,
    key,
    tempo,
    content: { sections, tabs },
  }
  if (orgId !== null && orgId !== undefined) result.org_id = orgId as string | number
  return result
}