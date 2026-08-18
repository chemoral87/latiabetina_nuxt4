import {
  newLine,
  newSection,
  newSyllable,
  newTab,
  type SongContent,
  type SongLine,
  type SongSection,
  type SongSyllable,
  type SongTab,
} from "~/types/song"
import { isChordLine, splitLine } from "~/utils/syllables"

const TAB_LINE_RE = /^[A-Ga-g]\|/
const SECTION_RE = /^\[(.*)\]$/
const NUMBER_RE = /^\d{1,3}$/

interface PendingChord {
  name: string
  col: number
}

interface PositionedSyllable {
  text: string
  start: number
  end: number
}

function chordPositions(line: string): PendingChord[] {
  const tokens: PendingChord[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    tokens.push({ name: m[0], col: m.index })
  }
  return tokens
}

function positionedSyllables(lineText: string): PositionedSyllable[] {
  const words = lineText.split(/\s+/).filter(Boolean)
  const positioned: PositionedSyllable[] = []
  let cursor = 0
  for (const word of words) {
    const wordStart = lineText.indexOf(word, cursor)
    const parts = splitLine(word)
    let offset = 0
    for (const part of parts) {
      positioned.push({
        text: part,
        start: wordStart + offset,
        end: wordStart + offset + part.length - 1,
      })
      offset += part.length
    }
    cursor = wordStart + word.length
  }
  return positioned
}

/**
 * Parses a pasted chord chart / lead sheet into song content.
 *
 * - `[Nombre]` lines start a new section.
 * - A line made only of chord symbols attaches each chord to the syllable it
 *   sits above (column-based), e.g. `G` above `Fe` or `C  D` above a lyric.
 * - Tablature lines (e|---) are grouped into a tab.
 * - Standalone numbers (bar numbers) are ignored.
 */
export function parsePastedLyrics(text: string): SongContent {
  const lines = text.split(/\r?\n/)
  const content: SongContent = { sections: [], tabs: [] }
  let currentSection: SongSection | null = null
  let pendingChords: PendingChord[] = []
  let currentTab: SongTab | null = null

  const ensureSection = () => {
    if (!currentSection) {
      currentSection = newSection("Verso 1")
      content.sections.push(currentSection)
    }
  }

  for (const rawLine of lines) {
    const trimmed = rawLine.trim()

    if (TAB_LINE_RE.test(trimmed)) {
      if (!currentTab) {
        currentTab = newTab("Tab")
        content.tabs.push(currentTab)
      }
      currentTab.tablature += currentTab.tablature ? "\n" + trimmed : trimmed
      continue
    }

    if (currentTab && trimmed) currentTab = null

    if (!trimmed) continue
    if (NUMBER_RE.test(trimmed)) continue

    if (SECTION_RE.test(trimmed)) {
      currentSection = newSection(trimmed.slice(1, -1).trim() || "Sección")
      content.sections.push(currentSection)
      pendingChords = []
      continue
    }

    if (isChordLine(trimmed)) {
      pendingChords.push(...chordPositions(trimmed))
      continue
    }

    ensureSection()
    const positioned = positionedSyllables(trimmed)
    const line: SongLine = newLine(
      positioned.map((p) => newSyllable(p.text) as SongSyllable),
    )

    if (pendingChords.length > 0) {
      for (const chord of pendingChords) {
        let targetIndex = positioned.length ? 0 : -1
        for (let i = 0; i < positioned.length; i++) {
          if (chord.col <= positioned[i].end) {
            targetIndex = i
            break
          }
          targetIndex = i
        }
        if (targetIndex >= 0) {
          const target = line.syllables[targetIndex]
          target.chords.push(chord.name)
        }
      }
      pendingChords = []
    }

    currentSection.lines.push(line)
  }

  return content
}