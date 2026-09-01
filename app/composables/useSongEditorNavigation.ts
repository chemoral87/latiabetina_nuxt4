import type { SongContent, SongLine, SongSyllable } from "~/types/song"

export function useSongEditorNavigation(
  content: ComputedRef<SongContent>,
) {
  const activeSyllableId = ref<string | null>(null)

  function setActiveSyllable(id: string) {
    activeSyllableId.value = id
  }
  function clearActiveSyllable() {
    activeSyllableId.value = null
  }
  function getActiveSyllableInLine(line: SongLine): SongSyllable | null {
    if (!activeSyllableId.value) return null
    return line.syllables.find((s) => s.id === activeSyllableId.value) ?? null
  }

  function focusSyllableInput(rowType: "chord" | "text" | "note" = "text") {
    nextTick(() => {
      let selector = "td.cell-lyric.is-active input.text-input"
      if (rowType === "chord") selector = "td.cell-chord.is-active input.chord-input"
      else if (rowType === "note") selector = "td.cell-note.is-active input.note-input"
      let el = document.querySelector(selector) as HTMLInputElement | null
      if (!el && rowType === "note") {
        el = document.querySelector("td.cell-lyric.is-active input.text-input") as HTMLInputElement | null
      }
      el?.focus()
      el?.select?.()
    })
  }

  function findActiveContext() {
    const id = activeSyllableId.value
    if (!id) return null
    let flatIndex = 0
    for (let si = 0; si < content.value.sections.length; si++) {
      const sec = content.value.sections[si]!
      for (let li = 0; li < sec.lines.length; li++) {
        const ln = sec.lines[li]!
        const sIdx = ln.syllables.findIndex((s) => s.id === id)
        if (sIdx !== -1) {
          return {
            section: sec,
            sectionIdx: si,
            line: ln,
            lineIdx: li,
            syllable: ln.syllables[sIdx]!,
            syllableIdx: sIdx,
            globalLineIdx: flatIndex,
          }
        }
        flatIndex++
      }
    }
    return null
  }

  function handleVertical(
    delta: number,
    currentLine: SongLine,
    currentSyllable: SongSyllable,
    rowType: "chord" | "text" | "note",
  ) {
    const ctx = findActiveContext()
    const colIdx = ctx ? ctx.syllableIdx : currentLine.syllables.findIndex((s) => s.id === currentSyllable.id)
    const flatLines: SongLine[] = []
    for (const sec of content.value.sections) flatLines.push(...sec.lines)
    const curGlobal = ctx ? ctx.globalLineIdx : flatLines.findIndex((ln) => ln.id === currentLine.id)
    if (curGlobal === -1) return
    const targetGlobal = curGlobal + delta
    if (targetGlobal < 0 || targetGlobal >= flatLines.length) return
    const targetLine = flatLines[targetGlobal]!
    if (targetLine.syllables.length === 0) return
    const targetIdx = Math.min(Math.max(0, colIdx), targetLine.syllables.length - 1)
    const targetSy = targetLine.syllables[targetIdx]!
    activeSyllableId.value = targetSy.id
    focusSyllableInput(rowType)
  }

  function onSyllableKeydown(
    e: KeyboardEvent,
    line: SongLine,
    syllable: SongSyllable,
  ) {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return
    const target = e.target as HTMLElement
    let rowType: "chord" | "text" | "note" = "text"
    if (target.classList.contains("chord-input")) rowType = "chord"
    else if (target.classList.contains("note-input")) rowType = "note"
    if (activeSyllableId.value !== syllable.id) activeSyllableId.value = syllable.id
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      const idx = line.syllables.findIndex((s) => s.id === syllable.id)
      const delta = e.key === "ArrowRight" ? 1 : -1
      const newIdx = idx + delta
      if (newIdx < 0 || newIdx >= line.syllables.length) return
      const next = line.syllables[newIdx]!
      activeSyllableId.value = next.id
      focusSyllableInput(rowType)
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()
      const delta = e.key === "ArrowDown" ? 1 : -1
      handleVertical(delta, line, syllable, rowType)
    }
  }

  function onGlobalKeydown(e: KeyboardEvent) {
    if (e.defaultPrevented) return
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (!activeSyllableId.value) return
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return
    const ae = document.activeElement as HTMLElement | null
    const insideTable = !!ae?.closest?.(".line-table-wrap") || !!ae?.classList?.contains("cell-input")
    const isBody = ae === document.body
    const isCellTd = !!ae?.closest?.(".cell-lyric, .cell-chord, .cell-note")
    if (!insideTable && !isBody && !isCellTd) return
    const ctx = findActiveContext()
    if (!ctx) return
    let rowType: "chord" | "text" | "note" = "text"
    if (ae?.classList.contains("chord-input")) rowType = "chord"
    else if (ae?.classList.contains("note-input")) rowType = "note"
    e.preventDefault()
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const delta = e.key === "ArrowRight" ? 1 : -1
      const newIdx = ctx.syllableIdx + delta
      if (newIdx < 0 || newIdx >= ctx.line.syllables.length) return
      const next = ctx.line.syllables[newIdx]!
      activeSyllableId.value = next.id
      focusSyllableInput(rowType)
    } else {
      const delta = e.key === "ArrowDown" ? 1 : -1
      handleVertical(delta, ctx.line, ctx.syllable, rowType)
    }
  }

  function onDocClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest(".cell-lyric, .cell-chord, .cell-note")) {
      clearActiveSyllable()
    }
  }

  return {
    activeSyllableId,
    setActiveSyllable,
    clearActiveSyllable,
    getActiveSyllableInLine,
    focusSyllableInput,
    findActiveContext,
    handleVertical,
    onSyllableKeydown,
    onGlobalKeydown,
    onDocClick,
  }
}
