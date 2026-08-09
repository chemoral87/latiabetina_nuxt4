<template>
  <div id="cmp-pitcher-histogram" ref="rootEl">
    <h5 id="pit-hist-title" class="text-center font-weight-regular">Histograma de Frecuencia</h5>
    <canvas id="pit-hist-canvas" ref="histogramEl" :width="canvasWidth" :height="histogramHeight" style="display: block; background-color: black; width: 100%" />
    <div id="pit-hist-meter" class="tuning-meter-container mt-2">
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
  MAJOR_STEPS,
  MIN_MIDI,
  NOTE_LATIN_STRINGS,
  NOTE_SHORT_STRINGS,
  TEXT_WIDTH,
  TOLERANCE_HZ,
} from "~/constants/pitcher"

interface HistoryPoint {
  freq: number
  midi: number
}

const props = withDefaults(
  defineProps<{
    history: HistoryPoint[]
    freqDisplay?: string
    lastFreq?: number | null
    centsDeviation?: number | null
  }>(),
  {
    history: () => [],
    freqDisplay: "--",
    lastFreq: null,
    centsDeviation: null,
  },
)

const store = usePitcherStore()
const { selectedRootNote, latinNotation, showMicrotones, maxHistory, totalNotes, histogramHeight } = storeToRefs(store)

const rootEl = ref<HTMLElement | null>(null)
const histogramEl = ref<HTMLCanvasElement | null>(null)
const canvasWidth = ref(350)
let ctx: CanvasRenderingContext2D | null = null
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

const tuningAccuracyClass = computed(() => {
  if (props.centsDeviation === null) return ""
  const abs = Math.abs(props.centsDeviation)
  if (abs <= 5) return "tuning-perfect"
  if (abs <= 15) return "tuning-good"
  if (abs <= 30) return "tuning-fair"
  return "tuning-poor"
})

watch([selectedRootNote, latinNotation, showMicrotones, maxHistory, totalNotes, histogramHeight], () => {
  drawHistogram()
})

watch(
  () => props.history,
  () => {
    drawHistogram()
  },
  { deep: true },
)

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
    canvasWidth.value = Math.min(container.clientWidth - 32, 1000)
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

function drawHistogram() {
  const canvas = histogramEl.value
  if (!ctx || !canvas) return

  const height = canvas.height
  const width = canvas.width
  const spacing = (width - 50) / maxHistory.value
  const len = Math.min(props.history.length, maxHistory.value)

  ctx.clearRect(0, 0, width, height)
  drawNoteLines()

  const currentData = props.history[0]
  if (!currentData || !currentData.freq || currentData.freq < 20 || currentData.freq > 2000) {
    for (let i = 1; i < len; i++) {
      const { freq, midi } = props.history[i]
      if (!freq || freq < 20 || freq > 2000) continue
      drawHistoryPoints(i, freq, midi, spacing)
    }
    return
  }

  const { freq, midi } = currentData
  const currentNoteName = getNoteNameNum(Math.round(midi * 2) / 2)
  const currentNoteBase = currentNoteName.replace(/[0-9+]/g, "")

  const staticDisplayText = `${currentNoteName} (${props.freqDisplay} Hz)`
  ctx.font = "bold 16px sans-serif"
  const textWidth = ctx.measureText(staticDisplayText).width

  for (let octaveOffset = -2; octaveOffset <= 4; octaveOffset++) {
    const shiftedFreq = freq * Math.pow(2, octaveOffset)
    const shiftedMidi = freqToMidi(shiftedFreq)
    const y = height - ((shiftedMidi - MIN_MIDI) / totalNotes.value) * height
    if (y < 0 || y > height) continue

    const x = width - TEXT_WIDTH - 5
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
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = textColor
    ctx.fillText(staticDisplayText, x - textWidth - 10, y - 5)
  }

  for (let i = 1; i < len; i++) {
    const { freq, midi } = props.history[i]
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

  let currentNoteInfo: { type: string; name: string; base: string; freq: number } | null = null
  if (props.history.length > 0 && props.history[0].freq) {
    const currentMidi = freqToMidi(props.history[0].freq)
    const roundedMidi = Math.round(currentMidi * 2) / 2
    currentNoteInfo = {
      type: roundedMidi % 1 === 0.5 ? "halfstep" : "natural",
      name: getNoteName(roundedMidi),
      base: getNoteName(roundedMidi).replace(/\+/g, ""),
      freq: props.history[0].freq,
    }
  }

  for (let i = 0; i <= totalNotes.value * 2; i++) {
    const y = height - (i / (totalNotes.value * 2)) * height
    const midi = MIN_MIDI + i / 2
    const noteIndex = Math.floor(midi) % 12
    const isHalfStep = i % 2 === 1
    const noteStrings = latinNotation.value ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS
    const noteName = isHalfStep ? noteStrings[noteIndex * 2 + 1] : noteStrings[noteIndex * 2]
    const noteBase = noteName.replace(/\+/g, "")
    const isInScale = scaleNoteIndices.includes(noteIndex)

    const style = {
      stroke: isHalfStep ? "green" : "gray",
      fill: isHalfStep ? "green" : "gray",
      lineWidth: 1,
    }

    if (currentNoteInfo) {
      const freqDistance = Math.abs(currentNoteInfo.freq - midiToFreq(midi))
      const isExactNote = freqDistance <= TOLERANCE_HZ / 2
      const isSameNoteType = isHalfStep === (currentNoteInfo.type === "halfstep")
      const isSameNoteFamily = noteBase === currentNoteInfo.base

      if (isSameNoteFamily && isSameNoteType) {
        if (isHalfStep) {
          style.stroke = style.fill = "yellow"
        } else {
          style.stroke = style.fill = isInScale ? "red" : "orange"
        }
        style.lineWidth = isExactNote ? 2.5 : 2
      } else if (isInScale && !isHalfStep) {
        style.stroke = style.fill = "white"
      }
    }

    ctx.strokeStyle = style.stroke
    ctx.fillStyle = style.fill
    ctx.lineWidth = style.lineWidth

    if ((showMicrotones.value && isHalfStep) || !isHalfStep) {
      ctx.beginPath()
      ctx.moveTo(5, y)
      ctx.lineTo(width - TEXT_WIDTH - 3, y)
      ctx.stroke()

      ctx.font = isHalfStep ? `bold ${style.lineWidth > 1 ? 11 : 10}px sans-serif` : `bold ${style.lineWidth > 1 ? 13 : 12}px sans-serif`
      ctx.fillText(noteName, width - TEXT_WIDTH + (isHalfStep ? 15 : 0), y + 3)
    }
  }

  ctx.strokeStyle = "#444"
  ctx.beginPath()
  ctx.moveTo(width - TEXT_WIDTH - 5, 0)
  ctx.lineTo(width - TEXT_WIDTH - 5, height)
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
      const x = width - i * spacing - TEXT_WIDTH - 5
      const fullIndex = Math.round(shiftedMidi * 2) % 24
      ctx.fillStyle = COLORS[fullIndex]
      ctx.beginPath()
      ctx.arc(x, y, 2.0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}
</script>

<style scoped>
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
