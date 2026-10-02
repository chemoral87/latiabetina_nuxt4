<template>
  <div id="cmp-pitcher-histogram" ref="rootEl">
    <h5 id="pit-hist-title" class="text-center font-weight-regular">Histograma de Frecuencia</h5>
    <div class="histogram-row">
      <div v-if="showDbMeter" id="pit-db-meter" class="db-meter" :style="{ width: dbMeterWidth + 'px' }">
        <div
          id="pit-db-track"
          class="db-meter-track"
          :style="{
            height: histogramEffectiveHeight + 'px',
            width: dbMeterTrackWidth + 'px',
            borderRadius: dbMeterBorderRadius + 'px',
          }"
        >
          <div class="db-meter-fill" :style="{ height: dbFillPercent, backgroundColor: dbMeterColor, borderRadius: dbMeterBorderRadius + 'px' }"></div>
        </div>
        <div class="db-meter-label" :style="{ fontSize: dbMeterFontSize + 'px' }">
          <strong id="pit-db-value">{{ dbDisplay }}</strong>
          <span>dB</span>
        </div>
      </div>
      <canvas id="pit-hist-canvas" ref="histogramEl" :width="canvasWidth" :height="histogramEffectiveHeight" style="display: block; background-color: black; flex: 1; min-width: 0" />
    </div>
    <div v-if="showTuningRange" id="pit-hist-meter" class="tuning-meter-container mt-2">
      <div class="tuning-meter-bar">
        <div class="tuning-meter-center"></div>
        <div
          v-if="centsDeviation !== null"
          id="pit-hist-needle"
          class="tuning-meter-needle"
          :style="{
            left: `calc(50% + ${Math.min(50, Math.max(-50, centsDeviation))}%)`,
          }"
        >
          <div class="needle-triangle" :class="tuningAccuracyClass"></div>
        </div>
      </div>
      <div class="tuning-meter-labels">
        <span>-50</span>
        <span>0</span>
        <span>+50</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { usePitcherStore } from "~/composables/usePitcherStore"
import {
  A4_FREQ,
  A4_MIDI,
  COLORS,
  HISTORY_NOW_OFFSET_PX,
  MAJOR_STEPS,
  MIN_MIDI,
  NOTE_LATIN_STRINGS,
  NOTE_LATIN_STRINGS_THIRDS,
  NOTE_SHORT_STRINGS,
  NOTE_SHORT_STRINGS_THIRDS,
  SILENCE_HOLD_FRAMES,
  TEXT_WIDTH,
  TOLERANCE_HZ,
} from "~/constants/pitcher"
import { buildSineSegments, parseSinePitchClasses, sinePhase } from "~/utils/pitcherSine"

interface HistoryPoint {
  freq: number
  midi: number
}

const props = withDefaults(
  defineProps<{
    history: HistoryPoint[]
    freqDisplay?: string
    dbDisplay?: string
    lastFreq?: number | null
    centsDeviation?: number | null
    showDbMeter?: boolean
    showTuningRange?: boolean
    minWidth?: number
    // Ticks (1/60 s) transcurridos desde que se activó el mic: fase de la onda
    // sinusoidal y disparador de redibujo.
    tick?: number
  }>(),
  {
    history: () => [],
    freqDisplay: "--",
    dbDisplay: "--",
    lastFreq: null,
    centsDeviation: null,
    showDbMeter: true,
    showTuningRange: true,
    minWidth: 200,
    tick: 0,
  },
)

const store = usePitcherStore()
const { selectedRootNote, latinNotation, showMicrotones, showTricrotones, maxHistory, totalNotes, histogramEffectiveHeight, histogramBallRadius, sineNotes, sineCycleSeconds } = storeToRefs(store)

const rootEl = ref<HTMLElement | null>(null)
const histogramEl = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(350)
let ctx: CanvasRenderingContext2D | null = null
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

// Tamaños fijos del medidor de dB (ya no dependen de un porcentaje de ancho)
const dbMeterWidth = 44
const dbMeterTrackWidth = 14
const dbMeterBorderRadius = 7
const dbMeterFontSize = 11
// Ancho reservado para el medidor de dB (medidor + separación)
const dbMeterReservedWidth = 52

// Escala del medidor (estilo Decibel X): 50 dB (mínimo) → 110 dB (máximo)
const DB_METER_MIN = 50
const DB_METER_MAX = 110

// ── Decibel meter helpers ──
const dbValue = computed(() => {
  const parsed = parseFloat(props.dbDisplay)
  return Number.isNaN(parsed) ? DB_METER_MIN : Math.min(DB_METER_MAX, Math.max(DB_METER_MIN, parsed))
})
const dbFillPercent = computed(() => `${((dbValue.value - DB_METER_MIN) / (DB_METER_MAX - DB_METER_MIN)) * 100}%`)
const dbMeterColor = computed(() => {
  if (dbValue.value >= 100) return "#f44336" // rojo: extremo / riesgo
  if (dbValue.value >= 90) return "#ff9800" // naranja: muy fuerte
  if (dbValue.value >= 75) return "#ffeb3b" // amarillo: fuerte
  if (dbValue.value >= 60) return "#8bc34a" // verde claro: cómodo
  return "#4caf50" // verde: suave
})

const tuningAccuracyClass = computed(() => {
  if (props.centsDeviation === null) return ""
  const abs = Math.abs(props.centsDeviation)
  if (abs <= 5) return "tuning-perfect"
  if (abs <= 15) return "tuning-good"
  if (abs <= 30) return "tuning-fair"
  return "tuning-poor"
})

watch([selectedRootNote, latinNotation, showMicrotones, showTricrotones, maxHistory, totalNotes, histogramEffectiveHeight, histogramBallRadius, sineNotes, sineCycleSeconds], () => {
  drawHistogram()
})

watch(
  () => props.minWidth,
  () => {
    updateCanvasSize()
  },
)

// El historial muta en sitio (unshift/pop) y la página incrementa `tick` en cada
// cambio, así que basta observar la referencia y el tick (sin deep watch).
watch([() => props.history, () => props.tick], () => {
  drawHistogram()
})

onMounted(() => {
  ctx = histogramEl.value?.getContext("2d", { willReadFrequently: true }) ?? null
  if (ctx) ctx.lineWidth = 0.5

  updateCanvasSize()
  window.addEventListener("resize", debouncedResize)
  drawHistogram()
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", debouncedResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})

function debouncedResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = setTimeout(() => {
    updateCanvasSize()
  }, 150)
}

function updateCanvasSize() {
  const container = rootEl.value?.parentElement
  if (container) {
    canvasWidth.value = Math.max(props.minWidth, Math.min(container.clientWidth - 32 - dbMeterReservedWidth, 1000))
    nextTick(() => {
      drawHistogram()
    })
  }
}

function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
}

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0
  return 69 + 12 * Math.log2(freq / 440)
}

function getNoteNameNum(midiNote: number): string {
  const roundedMidi = Math.round(midiNote * 2) / 2
  const noteIndex = Math.floor(roundedMidi) % 12
  const isHalfStep = roundedMidi % 1 === 0.5
  const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2
  const noteStrings = latinNotation.value ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
  const note = noteStrings[fullIndex]
  const octave = Math.floor(roundedMidi / 12 - 1)
  return `${note}${octave}`
}

function getNoteName(midiNote: number): string {
  const noteIndex = Math.floor(midiNote) % 12
  const isHalfStep = Math.round(midiNote * 2) % 2 === 1
  const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2
  const noteStrings = latinNotation.value ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
  return noteStrings[fullIndex]
}

function getMajorScaleNotes(root: string): number[] {
  const rootIndex = latinNotation.value
    ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"].indexOf(root)
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"].indexOf(root)
  return MAJOR_STEPS.map((step) => (rootIndex + step) % 12)
}

function resetCanvas() {
  const canvas = histogramEl.value
  if (!canvas) return
  ctx?.clearRect(0, 0, canvas.width, canvas.height)
  drawNoteLines()
}

// Nota "actual": el punto válido más reciente dentro de los últimos
// SILENCE_HOLD_FRAMES ticks. En silencio (frames vacíos) se sostiene unos ticks y
// luego se libera; evita parpadeo por cortes cortos de detección.
function currentPoint(): { point: HistoryPoint; index: number } | null {
  const limit = Math.min(props.history.length, SILENCE_HOLD_FRAMES)
  for (let i = 0; i < limit; i++) {
    const p = props.history[i]!
    if (p.freq && p.freq >= 20 && p.freq <= 2000) return { point: p, index: i }
  }
  return null
}

function drawHistogram() {
  const canvas = histogramEl.value
  if (!ctx || !canvas) return

  const height = canvas.height
  const width = canvas.width
  const spacing = (width - 50) / maxHistory.value
  const len = Math.min(props.history.length, maxHistory.value)

  ctx.clearRect(0, 0, width, height)
  drawNoteLines()
  drawSineWaves(width, height)
  drawNowBar(width, height)

  const current = currentPoint()
  if (!current) {
    for (let i = 0; i < len; i++) {
      const { freq, midi } = props.history[i]!
      if (!freq || freq < 20 || freq > 2000) continue
      drawHistoryPoints(i, freq, midi, spacing)
    }
    return
  }

  const { freq, midi } = current.point
  const currentNoteName = getNoteNameNum(Math.round(midi * 2) / 2)
  const currentNoteBase = currentNoteName.replace(/[0-9+]/g, "")

  // Se calcula desde el propio punto (props.freqDisplay es "--" durante el silencio)
  const freqText = String(parseFloat(freq.toFixed(2)))
  const staticDisplayText = `${currentNoteName} (${freqText} Hz)`
  ctx.font = "bold 16px sans-serif"
  const textWidth = ctx.measureText(staticDisplayText).width

  for (let octaveOffset = -2; octaveOffset <= 4; octaveOffset++) {
    const shiftedFreq = freq * Math.pow(2, octaveOffset)
    const shiftedMidi = freqToMidi(shiftedFreq)
    const y = height - ((shiftedMidi - MIN_MIDI) / totalNotes.value) * height
    if (y < 0 || y > height) continue

    const x = width - TEXT_WIDTH - 5 - HISTORY_NOW_OFFSET_PX
    const shiftedNoteName = getNoteName(Math.round(shiftedMidi * 2) / 2)
    const shiftedNoteBase = shiftedNoteName.replace(/[0-9+]/g, "")
    const isSameNoteFamily = shiftedNoteBase === currentNoteBase
    const fullIndex = Math.round(shiftedMidi * 2) % 24

    let pointColor: string
    let textColor: string
    if (isSameNoteFamily) {
      pointColor = textColor = "white"
    } else {
      pointColor = textColor = COLORS[fullIndex]
    }

    ctx.fillStyle = pointColor
    ctx.beginPath()
    ctx.arc(x, y, histogramBallRadius.value * 1.5, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = textColor
    ctx.fillText(staticDisplayText, x - textWidth - 10, y - 5)
  }

  // El punto actual se representa con el círculo/etiqueta del borde derecho
  for (let i = 0; i < len; i++) {
    if (i === current.index) continue
    const { freq, midi } = props.history[i]!
    if (!freq || freq < 20 || freq > 2000) continue
    drawHistoryPoints(i, freq, midi, spacing)
  }
}

function drawNoteLines() {
  const canvas = histogramEl.value
  if (!ctx || !canvas) return

  const height = canvas.height
  const width = canvas.width
  const scaleNoteIndices = getMajorScaleNotes(selectedRootNote.value)

  // Subdivisiones por semitono: 1 = solo notas reales, 2 = microtonos, 3 = tricrotonos.
  // Los switches son mutuamente excluyentes (el store apaga uno al activar el otro);
  // si ambos llegaran activos (estado legacy), tricrotonos manda.
  const subdivisions = showTricrotones.value ? 3 : (showMicrotones.value ? 2 : 1)
  const totalSteps = totalNotes.value * subdivisions
  const noteStrings = subdivisions === 3
    ? (latinNotation.value ? NOTE_LATIN_STRINGS_THIRDS : NOTE_SHORT_STRINGS_THIRDS)
    : (latinNotation.value ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS)
  const pxPerStep = height / totalSteps
  // Anti-colisión de etiquetas en modo denso: con poco espacio vertical se
  // omiten etiquetas intermedias (primero la 2ª de tercio, luego todas).
  const labelSecondThird = pxPerStep >= 8
  const labelAnyIntermediate = pxPerStep >= 5

  const noteNameAt = (midi: number): { name: string; base: string; subPos: number; noteIndex: number } => {
    const rounded = Math.round(midi * subdivisions) / subdivisions
    const noteIndex = ((Math.floor(rounded + 1e-6) % 12) + 12) % 12
    const subPos = ((Math.round(rounded * subdivisions) % subdivisions) + subdivisions) % subdivisions
    const fullIndex = subdivisions === 3 ? noteIndex * 3 + subPos : noteIndex * 2 + subPos
    const name = noteStrings[fullIndex]!
    return { name, base: name.replace(/[+⅓⅔]/g, ""), subPos, noteIndex }
  }

  let currentNoteInfo: { subPos: number; base: string; freq: number } | null = null
  const currentFreqPoint = currentPoint()?.point
  if (currentFreqPoint) {
    const currentMidi = freqToMidi(currentFreqPoint.freq)
    const { base, subPos } = noteNameAt(Math.round(currentMidi * subdivisions) / subdivisions)
    currentNoteInfo = {
      subPos,
      base,
      freq: currentFreqPoint.freq,
    }
  }

  for (let i = 0; i <= totalSteps; i++) {
    const y = height - (i / totalSteps) * height
    const midi = MIN_MIDI + i / subdivisions
    const noteIndex = ((Math.floor(midi + 1e-6) % 12) + 12) % 12
    // Posición dentro del "hueco": 0 = nota real, 1..subdivisions-1 = intermedias
    const subPos = i % subdivisions
    const isRealSemitone = subPos === 0
    const fullIndex = subdivisions === 3 ? noteIndex * 3 + subPos : noteIndex * 2 + subPos
    const noteName = noteStrings[fullIndex]!
    const noteBase = noteName.replace(/[+⅓⅔]/g, "")
    const isInScale = scaleNoteIndices.includes(noteIndex)

    const style = {
      stroke: isRealSemitone ? "gray" : "green",
      fill: isRealSemitone ? "gray" : "green",
      lineWidth: 1,
    }

    if (currentNoteInfo) {
      const freqDistance = Math.abs(currentNoteInfo.freq - midiToFreq(midi))
      const isExactNote = freqDistance <= TOLERANCE_HZ / 2
      const isSameSubPos = subPos === currentNoteInfo.subPos
      const isSameNoteFamily = noteBase === currentNoteInfo.base

      if (isSameNoteFamily && isSameSubPos) {
        if (isRealSemitone) {
          style.stroke = style.fill = isInScale ? "red" : "orange"
        } else if (subPos === 1) {
          style.stroke = style.fill = "yellow"
        } else {
          style.stroke = style.fill = "#00E5FF"
        }
        style.lineWidth = isExactNote ? 2.5 : 2
      } else if (isInScale && isRealSemitone) {
        style.stroke = style.fill = "white"
      }
    }

    ctx.strokeStyle = style.stroke
    ctx.fillStyle = style.fill
    ctx.lineWidth = style.lineWidth

    // El filtrado por showMicrotones ya va implícito en `subdivisions`:
    // con subdivisions=1 nunca hay intermedias que filtrar.
    ctx.beginPath()
    ctx.moveTo(5, y)
    ctx.lineTo(width - TEXT_WIDTH - 3, y)
    ctx.stroke()

    const showLabel = isRealSemitone || (labelAnyIntermediate && (subPos === 1 || (subPos === 2 && labelSecondThird)))
    if (showLabel) {
      const fontSize = isRealSemitone
        ? (style.lineWidth > 1 ? 13 : 12)
        : subdivisions === 3
          ? (style.lineWidth > 1 ? 10 : 9)
          : (style.lineWidth > 1 ? 11 : 10)
      ctx.font = `bold ${fontSize}px sans-serif`
      const xOffset = isRealSemitone ? 0 : subdivisions === 3 ? 10 : 15
      ctx.fillText(noteName, width - TEXT_WIDTH + xOffset, y + 3)
    }
  }

  ctx.strokeStyle = "#444"
  ctx.beginPath()
  ctx.moveTo(width - TEXT_WIDTH - 5, 0)
  ctx.lineTo(width - TEXT_WIDTH - 5, height)
  ctx.stroke()
}

// ── Onda sinusoidal de referencia ────────────────────────────────────────────
// Notas separadas por coma ("A,C", también "La,Do", con o sin octava "A4"). Una línea
// por nota: nace abajo en su nota y sube hasta la siguiente nota de la lista (lista
// cíclica), p. ej. "A,C" → C3→A3 y A3→C4. Ver app/utils/pitcherSine.ts.

function drawSineWaves(width: number, height: number) {
  if (!ctx) return
  const segments = buildSineSegments(parseSinePitchClasses(sineNotes.value), MIN_MIDI, MIN_MIDI + totalNotes.value)
  const cycleSeconds = sineCycleSeconds.value
  if (!segments.length || !(cycleSeconds > 0)) return

  // Eje x = tiempo: 1 columna = 1 tick (1/60 s). "Ahora" (xNow) queda HISTORY_NOW_OFFSET_PX
  // a la izquierda del borde derecho: lo que hay entre xNow y xRight es el futuro de la
  // onda (columnas negativas). Con tick = 0 (mic apagado) es una guía estática con "ahora"
  // abajo; con el mic activo la fase avanza con `tick` y la onda se desplaza a la
  // izquierda junto con la traza.
  const spacing = (width - 50) / maxHistory.value
  const xRight = width - TEXT_WIDTH - 5
  const xNow = xRight - HISTORY_NOW_OFFSET_PX
  const midiToY = (m: number) => height - ((m - MIN_MIDI) / totalNotes.value) * height

  ctx.strokeStyle = "#888"
  ctx.lineWidth = 1
  // Todas las líneas van en fase: nacen abajo (fase 0), suben a la siguiente nota y vuelven.
  for (const { lo, hi } of segments) {
    ctx.beginPath()
    for (let x = xRight; x >= 0; x -= 2) {
      const fi = (xNow - x) / spacing
      const midi = lo + ((hi - lo) * (1 - Math.cos(sinePhase(props.tick, fi, cycleSeconds)))) / 2
      const y = midiToY(midi)
      if (x === xRight) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

// Barra vertical fina amarilla en "ahora" (HISTORY_NOW_OFFSET_PX a la izquierda del borde
// derecho): a su derecha queda el futuro de la onda sinusoidal.
function drawNowBar(width: number, height: number) {
  if (!ctx) return
  const x = Math.round(width - TEXT_WIDTH - 5 - HISTORY_NOW_OFFSET_PX) + 0.5 // +0.5: línea nítida de 1 px
  ctx.strokeStyle = "yellow"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, 0)
  ctx.lineTo(x, height)
  ctx.stroke()
}

function drawHistoryPoints(i: number, freq: number, midi: number, spacing: number) {
  const canvas = histogramEl.value
  if (!ctx || !canvas) return

  const height = canvas.height
  const width = canvas.width
  const baseFreq = freq

  for (let octaveOffset = -2; octaveOffset <= 4; octaveOffset++) {
    const shiftedFreq = baseFreq * Math.pow(2, octaveOffset)
    const shiftedMidi = freqToMidi(shiftedFreq)
    const y = height - ((shiftedMidi - MIN_MIDI) / totalNotes.value) * height

    if (y >= 0 && y <= height) {
      const x = width - i * spacing - TEXT_WIDTH - 5 - HISTORY_NOW_OFFSET_PX
      const fullIndex = Math.round(shiftedMidi * 2) % 24
      ctx.fillStyle = COLORS[fullIndex]
      ctx.beginPath()
      ctx.arc(x, y, histogramBallRadius.value, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
</script>

<style scoped>
.histogram-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.db-meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.db-meter-track {
  border-radius: 7px;
  background: #222;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.db-meter-fill {
  width: 100%;
  border-radius: 7px;
  transition: height 0.1s ease-out;
}

.db-meter-label {
  margin-top: 4px;
  line-height: 1.2;
  text-align: center;
  color: #aaa;
}

.tuning-meter-container {
  width: 100%;
  height: 67px;
  max-width: 600px;
  margin: 0 auto;
  padding: 10px;
}

.tuning-meter-bar {
  position: relative;
  width: 100%;
  height: 20px;
  background: linear-gradient(to right, #d32f2f 0%, #ff9800 25%, #4caf50 45%, #4caf50 55%, #ff9800 75%, #d32f2f 100%);
  border-radius: 20px;
  overflow: visible;
}

.tuning-meter-center {
  position: absolute;
  left: 50%;
  top: 0;
  width: 3px;
  height: 100%;
  background-color: white;
  transform: translateX(-50%);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

.tuning-meter-needle {
  position: absolute;
  top: -10px;
  transform: translateX(-50%);
  transition: left 0.1s ease-out;
}

.needle-triangle {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 14px solid white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.needle-triangle.tuning-perfect {
  border-top-color: #4caf50;
}

.needle-triangle.tuning-good {
  border-top-color: #8bc34a;
}

.needle-triangle.tuning-fair {
  border-top-color: #ff9800;
}

.needle-triangle.tuning-poor {
  border-top-color: #d32f2f;
}

.tuning-meter-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  color: #aaa;
}

.tuning-perfect {
  color: #4caf50 !important;
  font-weight: bold;
}

.tuning-good {
  color: #8bc34a !important;
}

.tuning-fair {
  color: #ff9800 !important;
}

.tuning-poor {
  color: #d32f2f !important;
}
</style>
