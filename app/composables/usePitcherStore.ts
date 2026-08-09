import { acceptHMRUpdate, defineStore } from "pinia"

/**
 * Pinia port of the AUI `pitcher_store` Vuex module (store/pitcher_store.js),
 * including the localStorage persistence that aui's plugins/localstorage.js
 * provided (key `adminaui_v1` → `pitcher_v1`). Tuner settings survive reloads.
 */
const STORAGE_KEY = "pitcher_v1"

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export const usePitcherStore = defineStore("pitcher", () => {
  // ---- state (same defaults as aui) ----
  const sensitivity = ref(0.003)
  const selectedRootNote = ref("C")
  const latinNotation = ref(false)
  const showMicrotones = ref(true)
  // Mostrar nota fantasma en la UI (persistido)
  const ghostQuarterNote = ref(false)
  const maxHistory = ref(400)
  const totalNotes = ref(14)
  const histogramHeight = ref(350)

  // ---- mutations → setters (same clamping as aui) ----
  function setRootNote(note: string) {
    selectedRootNote.value = note
  }

  function setSensitivity(value: number) {
    sensitivity.value = value
  }

  function setLatinNotation(value: boolean) {
    latinNotation.value = value
  }

  function setShowMicrotones(value: boolean) {
    showMicrotones.value = value
  }

  function setGhostQuarterNote(value: boolean) {
    ghostQuarterNote.value = !!value
  }

  function setMaxHistory(value: number) {
    maxHistory.value = clamp(value, 300, 800)
  }

  function setTotalNotes(value: number) {
    totalNotes.value = clamp(value, 13, 25)
  }

  function setHistogramHeight(value: number) {
    histogramHeight.value = clamp(value, 300, 600)
  }

  // ---- localStorage persistence (client-only, debounced 300ms like aui) ----
  function loadFromStorage() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const data = JSON.parse(saved) as Record<string, unknown>
      if (typeof data.sensitivity === "number") sensitivity.value = data.sensitivity
      if (typeof data.selectedRootNote === "string") selectedRootNote.value = data.selectedRootNote
      if (typeof data.latinNotation === "boolean") latinNotation.value = data.latinNotation
      if (typeof data.showMicrotones === "boolean") showMicrotones.value = data.showMicrotones
      if (typeof data.ghostQuarterNote === "boolean") ghostQuarterNote.value = data.ghostQuarterNote
      if (typeof data.maxHistory === "number") maxHistory.value = data.maxHistory
      if (typeof data.totalNotes === "number") totalNotes.value = data.totalNotes
      if (typeof data.histogramHeight === "number") histogramHeight.value = data.histogramHeight
    } catch {
      // Ignore malformed storage
    }
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [sensitivity, selectedRootNote, latinNotation, showMicrotones, ghostQuarterNote, maxHistory, totalNotes, histogramHeight],
    () => {
      if (!import.meta.client) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              sensitivity: sensitivity.value,
              selectedRootNote: selectedRootNote.value,
              latinNotation: latinNotation.value,
              showMicrotones: showMicrotones.value,
              ghostQuarterNote: ghostQuarterNote.value,
              maxHistory: maxHistory.value,
              totalNotes: totalNotes.value,
              histogramHeight: histogramHeight.value,
            }),
          )
        } catch {
          // Ignore storage errors (private mode, quota, ...)
        }
      }, 300)
    },
  )

  loadFromStorage()

  return {
    sensitivity,
    selectedRootNote,
    latinNotation,
    showMicrotones,
    ghostQuarterNote,
    maxHistory,
    totalNotes,
    histogramHeight,
    setRootNote,
    setSensitivity,
    setLatinNotation,
    setShowMicrotones,
    setGhostQuarterNote,
    setMaxHistory,
    setTotalNotes,
    setHistogramHeight,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePitcherStore, import.meta.hot))
}
