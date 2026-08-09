<template>
  <div id="cmp-pitcher-staff-notation" class="staff-notation">
    <h5 class="text-center font-weight-regular">Pentagrama</h5>
    <canvas ref="staffCanvasEl" :style="canvasStyle" :width="canvasWidth" :height="canvasHeight" />
    <div v-if="showCentsDeviation" class="text-right mt-2">
      <div class="text-caption">
        <strong :class="tuningAccuracyClass" style="display: inline-block; text-align: right">{{ centsDeviation > 0 ? "+" : "" }}{{ centsDeviation !== null ? centsDeviation : "--" }}</strong>
        <strong>cents</strong>
      </div>
      <VChip size="small" variant="elevated" class="text-caption" :color="tuningAccuracyColor">
        {{ tuningAccuracyText }}
      </VChip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { usePitcherStore } from "~/composables/usePitcherStore"
import {
  BASE_LINE_SPACING,
  CANVAS_BG_COLOR,
  COLORS,
  LINE_BASE,
  MARGIN_LINE,
  NATURAL_POSITIONS,
  NOTE_LATIN_STRINGS,
  NOTE_SHORT_STRINGS,
  NOTE_X_B_OFFSET,
  NOTE_X_OFFSET,
  SHORT_LINE_HALF_WIDTH,
  SIMBOL_MARGIN,
  STAFF_TOP_OFFSET,
  STEM_LENGTH,
} from "~/constants/pitcher"

const props = withDefaults(
  defineProps<{
    frequency?: number | null
    centsDeviation?: number | null
    zoom?: number
    canvasHeight?: number | string
    canvasWidth?: number | string
    showCentsDeviation?: boolean
  }>(),
  {
    frequency: null,
    centsDeviation: null,
    zoom: 2,
    canvasHeight: 600,
    canvasWidth: 300,
    showCentsDeviation: true,
  },
)

const store = usePitcherStore()
const { ghostQuarterNote, latinNotation } = storeToRefs(store)

const staffCanvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let trebleClefImage: HTMLImageElement | null = null
let bassClefImage: HTMLImageElement | null = null
let isReady = false
let lastDetectedMidi: number | null = null
let lastDetectedColor: string | null = null

const canvasStyle = {
  display: "block",
  backgroundColor: CANVAS_BG_COLOR,
  border: "10px solid black",
  width: "100%",
}

const tuningMetrics = computed(() => {
  if (props.centsDeviation === null) return { class: "", color: "grey", text: "--" }
  const abs = Math.abs(props.centsDeviation)
  if (abs <= 5) return { class: "tuning-perfect", color: "green", text: "Perfecta afinación" }
  if (abs <= 15) return { class: "tuning-good", color: "light-green", text: "Buena afinación" }
  if (abs <= 30) return { class: "tuning-fair", color: "orange", text: "Afinación aceptable" }
  return { class: "tuning-poor", color: "red", text: "Desafinado" }
})

const tuningAccuracyClass = computed(() => tuningMetrics.value.class)
const tuningAccuracyColor = computed(() => tuningMetrics.value.color)
const tuningAccuracyText = computed(() => tuningMetrics.value.text)

watch([() => props.frequency, ghostQuarterNote, () => props.zoom, latinNotation], () => {
  drawStaff()
})

onMounted(() => {
  initCanvas()
  loadClefImages()
})

function initCanvas() {
  const canvas = staffCanvasEl.value
  if (canvas) {
    ctx = canvas.getContext("2d")
    drawStaff()
  }
}

function loadClefImages() {
  const paths = { treble: "/clave_sol.svg", bass: "/clave_fa.svg" }
  let loaded = 0
  const checkAllLoaded = () => {
    if (++loaded === 2) {
      isReady = true
      drawStaff()
    }
  }
  Object.entries(paths).forEach(([key, src]) => {
    const img = new Image()
    img.onload = () => {
      if (key === "treble") trebleClefImage = img
      else bassClefImage = img
      checkAllLoaded()
    }
    img.onerror = () => {
      if (key === "treble") trebleClefImage = null
      else bassClefImage = null
      checkAllLoaded()
    }
    img.src = src
  })
}

function freqToMidi(freq: number): number {
  return freq <= 0 ? 0 : 69 + 12 * Math.log2(freq / 440)
}

function getNoteName(midiNote: number): string {
  const noteIndex = Math.floor(midiNote) % 12
  const isHalfStep = Math.round(midiNote * 2) % 2 === 1
  const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2
  return (latinNotation.value ? NOTE_LATIN_STRINGS : NOTE_SHORT_STRINGS)[fullIndex]
}

function drawStaff() {
  const canvas = staffCanvasEl.value
  if (!ctx || !isReady || !canvas) return // Ensure canvas exists
  const { width, height } = canvas
  const lineSpacing = BASE_LINE_SPACING * props.zoom
  const trebleTop = STAFF_TOP_OFFSET * props.zoom
  const staffLeft = 20
  const noteX = staffLeft + NOTE_X_OFFSET * props.zoom
  const lineStart = staffLeft + MARGIN_LINE
  const lineEnd = Math.min(lineStart + LINE_BASE * props.zoom, width - MARGIN_LINE)
  const bassTop = trebleTop + 6 * lineSpacing

  ctx.fillStyle = CANVAS_BG_COLOR
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = "#000"
  ctx.lineWidth = 2

  const sStart = noteX - SHORT_LINE_HALF_WIDTH * props.zoom
  const sEnd = noteX + NOTE_X_B_OFFSET * props.zoom + SHORT_LINE_HALF_WIDTH * props.zoom

  for (let i = 1; i <= 2; i++) drawHorizontal(trebleTop - i * lineSpacing, sStart, sEnd)
  for (let i = 0; i < 5; i++) drawHorizontal(trebleTop + i * lineSpacing, lineStart, lineEnd)
  drawHorizontal(trebleTop + 5 * lineSpacing, sStart, sEnd)
  for (let i = 0; i < 5; i++) drawHorizontal(bassTop + i * lineSpacing, lineStart, lineEnd)
  for (let i = 1; i <= 2; i++) drawHorizontal(bassTop + 4 * lineSpacing + i * lineSpacing, sStart, sEnd)

  renderClefs(staffLeft, trebleTop, bassTop, lineSpacing)

  if (props.frequency) {
    renderNotes(trebleTop, bassTop, lineSpacing, noteX)
  }
}

function drawHorizontal(y: number, start: number, end: number) {
  ctx?.beginPath()
  ctx?.moveTo(start, y)
  ctx?.lineTo(end, y)
  ctx?.stroke()
}

function renderClefs(x: number, trebleTop: number, bassTop: number, lineSpacing: number) {
  if (!ctx) return
  if (trebleClefImage) ctx.drawImage(trebleClefImage, x + 5 - 25, trebleTop - lineSpacing, 45 * props.zoom, lineSpacing * 6.5)
  if (bassClefImage) {
    ctx.drawImage(bassClefImage, x - 11 - 25, bassTop - lineSpacing * 1.33, 65 * props.zoom, lineSpacing * 6)
  } else {
    drawBassClefFallback(x, bassTop)
  }
}

function renderNotes(trebleTop: number, bassTop: number, lineSpacing: number, noteX: number) {
  if (!ctx || !props.frequency) return
  const currentMidi = freqToMidi(props.frequency)
  const roundedMidi = Math.round(currentMidi)
  const noteColor = COLORS[(roundedMidi % 12) * 2]

  const drawPair = (midi: number, alpha = 1.0, customColor: string | null = null) => {
    const pairIsSharp = getNoteName(midi).match(/[♯#]/)
    const pairColor = customColor || COLORS[(midi % 12) * 2]

    // 1. Draw original Sharp Note
    const { noteY: ySharp, ledgerLines: lSharp } = calculateNotePos(midi, trebleTop, bassTop, lineSpacing)
    ctx!.globalAlpha = alpha
    lSharp.forEach((ly) => {
      ctx!.beginPath()
      ctx!.moveTo(noteX - 20 * props.zoom, ly)
      ctx!.lineTo(noteX + 20 * props.zoom, ly)
      ctx!.stroke()
    })
    drawQuarterNote(noteX, ySharp, pairColor, !!pairIsSharp, false)

    // 2. Draw enharmonic Flat Note if applicable
    if (pairIsSharp) {
      const flatMidi = midi + 1 // Move to flat position (e.g., D position for Db)
      const flatX = noteX + NOTE_X_B_OFFSET * props.zoom // Use imported constant
      const { noteY: yFlat, ledgerLines: lFlat } = calculateNotePos(flatMidi, trebleTop, bassTop, lineSpacing)

      lFlat.forEach((ly) => {
        ctx!.beginPath()
        ctx!.moveTo(flatX - 20 * props.zoom, ly)
        ctx!.lineTo(flatX + 20 * props.zoom, ly)
        ctx!.stroke()
      })
      drawQuarterNote(flatX, yFlat, pairColor, false, true)
    }
  }

  // Dibujar la última nota detectada con opacidad reducida (si existe y es diferente)
  if (lastDetectedMidi !== null && lastDetectedMidi !== roundedMidi) {
    drawPair(lastDetectedMidi, 0.3, lastDetectedColor)
  }

  if (ghostQuarterNote.value) {
    drawPair(roundedMidi + 12, 0.45)
    drawPair(roundedMidi - 12, 0.45)
  }
  drawPair(roundedMidi, 1.0)
  ctx.globalAlpha = 1.0

  // Guardar la nota actual como última detectada
  lastDetectedMidi = roundedMidi
  lastDetectedColor = noteColor
}

function calculateNotePos(midi: number, trebleTop: number, bassTop: number, lineSpacing: number): { noteY: number; ledgerLines: number[] } {
  const isTreble = midi >= 60
  const refMidi = isTreble ? 64 : 53
  const refY = isTreble ? trebleTop + 4 * lineSpacing : bassTop + lineSpacing
  const totalDiff = (Math.floor(midi / 12) - Math.floor(refMidi / 12)) * 7 + (NATURAL_POSITIONS[midi % 12] - NATURAL_POSITIONS[refMidi % 12]) // Use imported constant
  const noteY = refY - totalDiff * (lineSpacing / 2)
  const ledgerLines: number[] = []

  if (isTreble) {
    const bottom = trebleTop + 4 * lineSpacing
    if (noteY > bottom + lineSpacing) {
      const count = Math.floor((noteY - (bottom + lineSpacing)) / lineSpacing)
      for (let i = 1; i <= count; i++) ledgerLines.push(bottom + lineSpacing + i * lineSpacing)
    }
  } else if (noteY < bassTop) {
    const count = Math.floor((bassTop - noteY) / lineSpacing)
    for (let i = 1; i <= count; i++) ledgerLines.push(bassTop - i * lineSpacing)
  }
  return { noteY, ledgerLines }
}

function drawQuarterNote(x: number, y: number, color: string, isSharp: boolean, isFlat: boolean) {
  if (!ctx) return
  const z = props.zoom

  if (isSharp) {
    ctx.font = `bold ${24 * z}px serif`
    ctx.strokeText("♯", x - SIMBOL_MARGIN * z, y + 8 * z)
    ctx.fillStyle = color
    ctx.fillText("♯", x - SIMBOL_MARGIN * z, y + 8 * z)
  }

  if (isFlat) {
    ctx.font = `bold ${24 * z}px serif`
    ctx.strokeText("♭", x - SIMBOL_MARGIN * z, y + 8 * z)
    ctx.fillStyle = color
    ctx.fillText("♭", x - SIMBOL_MARGIN * z, y + 8 * z)
  }

  ctx.fillStyle = color
  ctx.strokeStyle = "#000"
  ctx.lineWidth = 2 * z
  ctx.beginPath()
  ctx.ellipse(x, y, 8 * z, 6 * z, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(x + 7 * z, y - 1 * z)
  ctx.lineTo(x + 7 * z, y - STEM_LENGTH * z)
  ctx.stroke()
}

function drawBassClefFallback(x: number, y: number) {
  if (!ctx) return
  ctx.fillStyle = "#000"
  ctx.save()
  ctx.translate(x + 15, y + 30)
  ctx.beginPath()
  ctx.arc(-5, 0, 8, Math.PI * 0.5, Math.PI * 1.5)
  ctx.arc(-5, -10, 4, Math.PI * 1.5, Math.PI * 0.5, true)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5, -5, 2.5, 0, Math.PI * 2)
  ctx.arc(5, 5, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function redraw() {
  drawStaff()
}
</script>

<style scoped>
.staff-notation {
  width: 100%;
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
