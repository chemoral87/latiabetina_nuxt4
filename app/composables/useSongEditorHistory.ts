import type { Song } from "~/types/song"

export function useSongEditorHistory(item: Ref<Song>) {
  const undoStack = ref<Song[]>([])
  const redoStack = ref<Song[]>([])
  const isHistoryRestoring = ref(false)
  const lastSnapshotJson = ref("")

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  function cloneSong(s: Song): Song {
    return JSON.parse(JSON.stringify(s)) as Song
  }

  function resetHistory() {
    lastSnapshotJson.value = JSON.stringify(item.value)
    undoStack.value = []
    redoStack.value = []
  }

  function pushHistoryIfNeeded(newJson: string) {
    if (isHistoryRestoring.value) return
    if (!lastSnapshotJson.value) {
      lastSnapshotJson.value = newJson
      return
    }
    if (newJson === lastSnapshotJson.value) return
    try {
      const prev = JSON.parse(lastSnapshotJson.value) as Song
      undoStack.value.push(prev)
      if (undoStack.value.length > 10) undoStack.value.shift()
      redoStack.value = []
    } catch {
      // ignore
    }
    lastSnapshotJson.value = newJson
  }

  watch(
    () => JSON.stringify(item.value),
    (newJson) => {
      pushHistoryIfNeeded(newJson)
    },
  )

  function undo() {
    if (undoStack.value.length === 0) return
    const snapshot = undoStack.value.pop()!
    try {
      const current = cloneSong(item.value)
      redoStack.value.push(current)
      if (redoStack.value.length > 10) redoStack.value.shift()
    } catch {
      // ignore
    }
    isHistoryRestoring.value = true
    item.value = cloneSong(snapshot)
    lastSnapshotJson.value = JSON.stringify(item.value)
    nextTick(() => {
      isHistoryRestoring.value = false
    })
  }

  function redo() {
    if (redoStack.value.length === 0) return
    const snapshot = redoStack.value.pop()!
    try {
      const current = cloneSong(item.value)
      undoStack.value.push(current)
      if (undoStack.value.length > 10) undoStack.value.shift()
    } catch {
      // ignore
    }
    isHistoryRestoring.value = true
    item.value = cloneSong(snapshot)
    lastSnapshotJson.value = JSON.stringify(item.value)
    nextTick(() => {
      isHistoryRestoring.value = false
    })
  }

  function onHistoryKeydown(e: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().includes("MAC")
    const mod = isMac ? e.metaKey : e.ctrlKey
    if (!mod) return
    const key = e.key.toLowerCase()
    if (key === "z" && !e.shiftKey) {
      if (!canUndo.value) return
      e.preventDefault()
      undo()
    } else if (key === "y" || (key === "z" && e.shiftKey)) {
      if (!canRedo.value) return
      e.preventDefault()
      redo()
    }
  }

  function initHistoryWithCurrent() {
    // call after initial item is ready (onMounted or props load)
    lastSnapshotJson.value = JSON.stringify(item.value)
    undoStack.value = []
    redoStack.value = []
    nextTick(() => {
      isHistoryRestoring.value = false
    })
  }

  function setHistoryRestoring(val: boolean) {
    isHistoryRestoring.value = val
  }

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    isHistoryRestoring,
    lastSnapshotJson,
    cloneSong,
    resetHistory,
    initHistoryWithCurrent,
    setHistoryRestoring,
    undo,
    redo,
    onHistoryKeydown,
  }
}
