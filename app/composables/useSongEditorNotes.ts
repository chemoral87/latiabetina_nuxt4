import type { SongLine } from "~/types/song"

export function useSongEditorNotes() {
  const expandedNotesLines = reactive(new Set<string>())
  const forcedHiddenNotesLines = reactive(new Set<string>())

  function lineHasNotes(line: SongLine): boolean {
    return line.syllables.some((s) => s.notes && s.notes.length > 0)
  }

  function isNotesRowVisible(line: SongLine): boolean {
    if (forcedHiddenNotesLines.has(line.id)) return false
    return expandedNotesLines.has(line.id) || lineHasNotes(line)
  }

  function toggleNotes(line: SongLine) {
    if (isNotesRowVisible(line)) {
      expandedNotesLines.delete(line.id)
      forcedHiddenNotesLines.add(line.id)
    } else {
      forcedHiddenNotesLines.delete(line.id)
      expandedNotesLines.add(line.id)
    }
  }

  return {
    expandedNotesLines,
    forcedHiddenNotesLines,
    lineHasNotes,
    isNotesRowVisible,
    toggleNotes,
  }
}
