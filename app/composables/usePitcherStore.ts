import { acceptHMRUpdate, defineStore } from "pinia"

/**
 * Pinia port of the AUI `pitcher_store` Vuex module (store/pitcher_store.js),
 * including the localStorage persistence that aui's plugins/localstorage.js
 * provided (key `adminaui_v1` → `pitcher_v1`). Tuner settings survive reloads.
 */
const STORAGE_KEY = "pitcher_v1"

// Opciones de columnas (cols) para las notaciones de instrumento del tuner
export const NOTATION_COLS_OPTIONS: (string | number)[] = [
  "auto", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
]

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
  // Ancho mínimo (px) del histograma y de su columna contenedora
  const histogramMinWidth = ref(350)
  // Altura efectiva (px) aplicada a pit-hist-canvas, pit-db-meter y pit-staff-canvas
  const histogramEffectiveHeight = computed(() => histogramHeight.value)
  // Desplazamiento de calibración del medidor de dB (alinear con Decibel X).
  // Default −20 dB: valor verificado en el dispositivo del usuario.
  const dbCalibrationOffset = ref(-20)
  // Círculo rojo en las notas del diapasón que pertenecen a la escala seleccionada
  const showScaleOnFretboard = ref(true)
  // Opacidad del anillo de escala en el diapasón (0-1)
  const scaleRingOpacity = ref(0.5)
  // Opacidad de las notas fantasma (octavas adyacentes) en el diapasón (0-1)
  const ghostNoteOpacity = ref(0.5)
  // Mostrar las notaciones (pentagrama de instrumento)
  const showGuitarNotation = ref(true)
  const showUkeleleNotation = ref(true)
  const showTrumpetNotation = ref(true)
  // Columnas (cols) de cada notación de instrumento en el tuner (persistido)
  const ukeleleCols = ref<string | number>(6)
  const guitarCols = ref<string | number>(6)
  const trumpetCols = ref<string | number>(6)

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

  function setHistogramMinWidth(value: number) {
    histogramMinWidth.value = clamp(value, 200, 800)
  }

  function setDbCalibrationOffset(value: number) {
    dbCalibrationOffset.value = clamp(value, -60, 60)
  }

  function setShowScaleOnFretboard(value: boolean) {
    showScaleOnFretboard.value = !!value
  }

  function setScaleRingOpacity(value: number) {
    scaleRingOpacity.value = clamp(value, 0, 1)
  }

  function setGhostNoteOpacity(value: number) {
    ghostNoteOpacity.value = clamp(value, 0, 1)
  }

  function setShowGuitarNotation(value: boolean) {
    showGuitarNotation.value = !!value
  }

  function setShowUkeleleNotation(value: boolean) {
    showUkeleleNotation.value = !!value
  }

  function setShowTrumpetNotation(value: boolean) {
    showTrumpetNotation.value = !!value
  }

  function setUkeleleCols(value: string | number) {
    if (NOTATION_COLS_OPTIONS.includes(value)) ukeleleCols.value = value
  }

  function setGuitarCols(value: string | number) {
    if (NOTATION_COLS_OPTIONS.includes(value)) guitarCols.value = value
  }

  function setTrumpetCols(value: string | number) {
    if (NOTATION_COLS_OPTIONS.includes(value)) trumpetCols.value = value
  }

  // ---- localStorage persistence (client-only, debounced 300ms like aui) ----
  function persist() {
    if (!import.meta.client) return
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
          histogramMinWidth: histogramMinWidth.value,
          dbCalibrationOffset: dbCalibrationOffset.value,
          showScaleOnFretboard: showScaleOnFretboard.value,
          scaleRingOpacity: scaleRingOpacity.value,
          ghostNoteOpacity: ghostNoteOpacity.value,
          showGuitarNotation: showGuitarNotation.value,
          showUkeleleNotation: showUkeleleNotation.value,
          showTrumpetNotation: showTrumpetNotation.value,
          ukeleleCols: ukeleleCols.value,
          guitarCols: guitarCols.value,
          trumpetCols: trumpetCols.value,
        }),
      )
    } catch {
      // Ignore storage errors (private mode, quota, ...)
    }
  }

  let saveTimer: ReturnType<typeof setTimeout> | null = null
  watch(
    [sensitivity, selectedRootNote, latinNotation, showMicrotones, ghostQuarterNote, maxHistory, totalNotes, histogramHeight, histogramMinWidth, dbCalibrationOffset, showScaleOnFretboard, scaleRingOpacity, ghostNoteOpacity, showGuitarNotation, showUkeleleNotation, showTrumpetNotation, ukeleleCols, guitarCols, trumpetCols],
    () => {
      if (!import.meta.client) return
      if (saveTimer) clearTimeout(saveTimer)
      saveTimer = setTimeout(persist, 300)
    },
  )

  // Guardar pendiente al cerrar/recargar la pestaña para no perder el último cambio
  if (import.meta.client) {
    window.addEventListener("pagehide", () => {
      if (saveTimer) clearTimeout(saveTimer)
      persist()
    })
  }

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
      if (typeof data.histogramMinWidth === "number") histogramMinWidth.value = data.histogramMinWidth
      if (typeof data.dbCalibrationOffset === "number") dbCalibrationOffset.value = data.dbCalibrationOffset
      if (typeof data.showScaleOnFretboard === "boolean") showScaleOnFretboard.value = data.showScaleOnFretboard
      if (typeof data.scaleRingOpacity === "number") scaleRingOpacity.value = data.scaleRingOpacity
      if (typeof data.ghostNoteOpacity === "number") ghostNoteOpacity.value = data.ghostNoteOpacity
      if (typeof data.showGuitarNotation === "boolean") showGuitarNotation.value = data.showGuitarNotation
      if (typeof data.showUkeleleNotation === "boolean") showUkeleleNotation.value = data.showUkeleleNotation
      if (typeof data.showTrumpetNotation === "boolean") showTrumpetNotation.value = data.showTrumpetNotation
      if (data.ukeleleCols === "auto" || typeof data.ukeleleCols === "number") ukeleleCols.value = data.ukeleleCols
      if (data.guitarCols === "auto" || typeof data.guitarCols === "number") guitarCols.value = data.guitarCols
      if (data.trumpetCols === "auto" || typeof data.trumpetCols === "number") trumpetCols.value = data.trumpetCols
      // Migración: versiones previas guardaban un único `notationCols` compartido
      if (typeof data.ukeleleCols === "undefined" && typeof data.guitarCols === "undefined" && typeof data.trumpetCols === "undefined") {
        const legacy = data.notationCols
        if (legacy === "auto" || typeof legacy === "number") {
          ukeleleCols.value = legacy
          guitarCols.value = legacy
          trumpetCols.value = legacy
        }
      }
    } catch {
      // Ignore malformed storage
    }
  }

  // Cargar en el setup y de nuevo tras la hidratación (desde onMounted de la página)
  // para que la hidratación SSR de Pinia no pise los valores guardados en localStorage.
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
    histogramMinWidth,
    histogramEffectiveHeight,
    dbCalibrationOffset,
    showScaleOnFretboard,
    scaleRingOpacity,
    ghostNoteOpacity,
    showGuitarNotation,
    showUkeleleNotation,
    showTrumpetNotation,
    ukeleleCols,
    guitarCols,
    trumpetCols,
    loadFromStorage,
    setRootNote,
    setSensitivity,
    setLatinNotation,
    setShowMicrotones,
    setGhostQuarterNote,
    setMaxHistory,
    setTotalNotes,
    setHistogramHeight,
    setHistogramMinWidth,
    setDbCalibrationOffset,
    setShowScaleOnFretboard,
    setScaleRingOpacity,
    setGhostNoteOpacity,
    setShowGuitarNotation,
    setShowUkeleleNotation,
    setShowTrumpetNotation,
    setUkeleleCols,
    setGuitarCols,
    setTrumpetCols,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePitcherStore, import.meta.hot))
}
