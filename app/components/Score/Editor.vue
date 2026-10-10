<template>
  <VCard id="cmp-score-editor">
    <VCardTitle>Partitura</VCardTitle>
    <VCardText>
      <VRow v-if="!readonly" class="mb-2" align="center" density="compact">
        <VCol md="3" sm="4" cols="6">
          <VTextField id="score-editor-tempo" v-model.number="local.tempo" min="30" max="240" hide-details type="number" density="compact" label="BPM (Tempo)" />
        </VCol>
        <VCol md="3" sm="4" cols="6">
          <VSelect id="score-editor-track" v-model="trackId" hide-details label="Pista" density="compact" :items="local.tracks.map(t => ({ title: t.name, value: t.id }))" />
        </VCol>
        <VCol md="6" sm="12" cols="12" class="d-flex flex-wrap align-center ga-1">
          <span class="text-caption font-weight-bold mr-1">Transponer:</span>
          <VBtn id="score-transpose-down-oct-btn" size="small" density="compact" variant="outlined" @click="applyTranspose(-12)">-1 Oct</VBtn>
          <VBtn id="score-transpose-down-btn" size="small" density="compact" variant="outlined" @click="applyTranspose(-1)">-1 Semi</VBtn>
          <VBtn id="score-transpose-up-btn" size="small" density="compact" variant="outlined" @click="applyTranspose(1)">+1 Semi</VBtn>
          <VBtn id="score-transpose-up-oct-btn" size="small" density="compact" variant="outlined" @click="applyTranspose(12)">+1 Oct</VBtn>
          <VBtn id="score-import-midi-btn" size="small" density="compact" variant="outlined" @click="midiInput?.click()">Cargar MIDI</VBtn>
          <input id="score-midi-file-input" ref="midiInput" type="file" style="display: none" accept=".mid,.midi,audio/midi" @change="onMidiFile" />
        </VCol>
      </VRow>

      <div ref="canvasWrap" class="staff-wrap" :class="{ 'single-row': singleRow, seekable }">
        <canvas ref="canvasEl" class="staff-canvas" @click="handleClick" />
      </div>
      <div v-if="!readonly" class="text-caption text-grey mt-1">Clic en pentagrama → agregar nota. Clic en nota → quitar.</div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import type { Score, ScoreNote } from '~/types/score'
import { midiBytesToScore } from '~/utils/midiScoreImport'
import { MidiParseError } from '~/utils/midiParser'
import { normalizeScore, transposeScore } from '~/utils/score'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ score?: Score; playbackTime?: number | null; singleRow?: boolean; readonly?: boolean; seekable?: boolean }>()
const emit = defineEmits<{ save: [score: Score]; seek: [beat: number] }>()

const local = ref(normalizeScore(props.score))
const trackId = ref(local.value.tracks[0]?.id || 'track-1')
const activeTrack = computed(() => local.value.tracks.find(t => t.id === trackId.value) || local.value.tracks[0]!)

watch(() => props.score, (v) => {
  if (v === local.value) return
  local.value = normalizeScore(v)
  trackId.value = local.value.tracks[0]?.id || 'track-1'
}, { deep: true })
watch(local, v => emit('save', v), { deep: true })

// ── Geometry ────────────────────────────────────────────────────────────────
const SP = 10            // staff space in px (distance between adjacent lines)
const MEASURES_PER_ROW = 4
const FIXED_MEASURE_W = 160 // ancho fijo por compás en modo singleRow
const CLEF_W = 52        // left margin for clef + time sig
const PAD_L = 12
const PAD_T = 28         // top padding per system
const PAD_BOT = 20
const STAFF_GAP = 28     // gap between treble and bass staff (in px)
const NOTE_R = SP * 0.55 // note head radius

// Row height: treble (4*SP) + gap + bass (4*SP) + paddings
const ROW_H = PAD_T + 4 * SP + STAFF_GAP + 4 * SP + PAD_BOT

const canvasWrap = ref<HTMLDivElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let canvasW = 800
// Last measure the single-row strip scrolled to (so we scroll once per measure).
let scrolledMeasure = -1

// ── Diatonic pitch → staff slot ─────────────────────────────────────────────
const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
function dIdx(pitch: string, octave: number) {
  const b = DIATONIC.indexOf(pitch.replace(/[#b♯♭]/g, ''))
  return octave * 7 + (b < 0 ? 0 : b)
}
const B4 = dIdx('B', 4)
const D3 = dIdx('D', 3)

// Treble ref: B4 = line 3 middle;  Bass ref: D3 = line 3 middle (G-B-D-F-A)
function noteY_system(pitch: string, octave: number, sysTopTreble: number): { y: number; inBass: boolean } {
  const idx = dIdx(pitch, octave)
  const half = SP / 2
  if (idx >= B4 - 6) {
    const y = sysTopTreble + 2 * SP - (idx - B4) * half
    return { y, inBass: false }
  }
  const bassTop = sysTopTreble + 4 * SP + STAFF_GAP
  const y = bassTop + 2 * SP - (idx - D3) * half
  return { y, inBass: true }
}

// ── Layout: distribute notes into measures ──────────────────────────────────
function beatsPerMeasure() { return local.value.beatsPerBar ?? 4 }

interface NoteInMeasure { note: ScoreNote; beat: number }
interface Measure { notes: NoteInMeasure[]; idx: number }

const measures = computed<Measure[]>(() => {
  const bpm = beatsPerMeasure()
  const all = [...activeTrack.value.notes].sort((a, b) => a.start - b.start)
  if (!all.length) return [{ notes: [], idx: 0 }]
  const maxBeat = all.reduce((m, n) => Math.max(m, n.start + n.duration), 0)
  const count = Math.max(1, Math.ceil(maxBeat / bpm))
  const ms: Measure[] = Array.from({ length: count }, (_, i) => ({ notes: [], idx: i }))
  for (const note of all) {
    const mi = Math.floor(note.start / bpm)
    if (mi < ms.length) ms[mi]!.notes.push({ note, beat: note.start - mi * bpm })
  }
  return ms
})
const mpr = computed(() => (props.singleRow ? Math.max(1, measures.value.length) : MEASURES_PER_ROW))

// ── Hit-test map ────────────────────────────────────────────────────────────
interface HitNote { id: string; cx: number; cy: number }
const hitNotes: HitNote[] = []

// ── Render ──────────────────────────────────────────────────────────────────
function noteXInMeasure(beat: number, bpm: number, measureW: number): number {
  return CLEF_W + PAD_L + (beat / bpm) * (measureW - CLEF_W - PAD_L - 8)
}

// ── Clef drawing: align glyph ink box to staff ──────────────────────────────
function drawClef(glyph: string, xCenter: number, inkCenterY: number, targetInkH: number) {
  if (!ctx) return
  ctx.fillStyle = '#222'
  let fontPx = targetInkH
  ctx.font = `${fontPx}px serif`
  let m = ctx.measureText(glyph)
  const ink = (m.actualBoundingBoxAscent || 0) + (m.actualBoundingBoxDescent || 0)
  if (ink > 0) {
    fontPx = fontPx * (targetInkH / ink)
    ctx.font = `${fontPx}px serif`
    m = ctx.measureText(glyph)
  }
  const asc = m.actualBoundingBoxAscent || fontPx * 0.78
  const desc = m.actualBoundingBoxDescent || fontPx * 0.22
  const baseline = inkCenterY + (asc - desc) / 2
  ctx.fillText(glyph, xCenter - m.width / 2, baseline)
}

function draw() {
  if (!ctx || !canvasEl.value) return
  const ms = measures.value
  const cols = mpr.value
  if (props.singleRow) canvasW = 4 + cols * FIXED_MEASURE_W
  const rows = Math.ceil(ms.length / cols)
  const h = rows * ROW_H
  canvasEl.value.width = canvasW
  canvasEl.value.height = h
  ctx.clearRect(0, 0, canvasW, h)
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvasW, h)

  hitNotes.length = 0

  const bpm = beatsPerMeasure()
  const measureW = (canvasW - 4) / cols
  const playTime = props.playbackTime ?? null
  const currentMi = playTime !== null ? Math.floor(playTime / bpm) : -1

  for (let row = 0; row < rows; row++) {
    const sysTop = row * ROW_H + PAD_T
    const trebleTop = sysTop
    const bassTop = sysTop + 4 * SP + STAFF_GAP

    // Current measure highlight (red section)
    if (currentMi >= row * cols && currentMi < (row + 1) * cols && currentMi < ms.length) {
      const col = currentMi - row * MEASURES_PER_ROW
      ctx.fillStyle = 'rgba(229,57,53,0.15)'
      ctx.fillRect(col * measureW, trebleTop - 6, measureW, 4 * SP + STAFF_GAP + 4 * SP + 12)
    }

    // Staff lines: treble
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let l = 0; l < 5; l++) {
      const y = trebleTop + l * SP
      ctx.beginPath()
      ctx.moveTo(4, y)
      ctx.lineTo(canvasW - 4, y)
      ctx.stroke()
    }
    // Staff lines: bass
    for (let l = 0; l < 5; l++) {
      const y = bassTop + l * SP
      ctx.beginPath()
      ctx.moveTo(4, y)
      ctx.lineTo(canvasW - 4, y)
      ctx.stroke()
    }
    // Brace
    ctx.strokeStyle = '#222'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(4, trebleTop - 2)
    ctx.lineTo(4, bassTop + 4 * SP + 2)
    ctx.stroke()
    ctx.lineWidth = 1

    // Treble clef: spiral wraps G4 (line 2), ink spans ~1 ledger below to ~1 above staff
    drawClef('𝄞', 26, trebleTop + 2 * SP, 6 * SP)

    // Bass clef: curl centers on F3 (line 4), dots flank that line
    drawClef('𝄢', 26, bassTop + SP, 3.5 * SP)

    // Time signature
    const timeSigX = 44
    ctx.font = `bold ${SP * 2}px serif`
    ctx.fillStyle = '#222'
    ctx.fillText(String(local.value.beatsPerBar ?? 4), timeSigX, trebleTop + SP * 2)
    ctx.fillText(String(local.value.beatUnit ?? 4), timeSigX, trebleTop + SP * 4)
    ctx.fillText(String(local.value.beatsPerBar ?? 4), timeSigX, bassTop + SP * 2)
    ctx.fillText(String(local.value.beatUnit ?? 4), timeSigX, bassTop + SP * 4)

    for (let col = 0; col < cols; col++) {
      const mi = row * cols + col
      const measure = ms[mi]
      const mLeft = col * measureW
      const mRight = mLeft + measureW

      // Bar line
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(mRight, trebleTop - 1)
      ctx.lineTo(mRight, trebleTop + 4 * SP + 1)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(mRight, bassTop - 1)
      ctx.lineTo(mRight, bassTop + 4 * SP + 1)
      ctx.stroke()

      // Measure number (first of each row)
      if (col === 0 && mi < ms.length) {
        ctx.font = `10px sans-serif`
        ctx.fillStyle = '#888'
        ctx.fillText(String(mi + 1), mLeft + CLEF_W + 2, sysTop - 4)
      }

      if (!measure) continue

      // Notes
      for (const { note, beat } of measure.notes) {
        const nx = mLeft + noteXInMeasure(beat, bpm, measureW)
        const { y: ny, inBass } = noteY_system(note.pitch, note.octave, trebleTop)

        // Ledger lines
        const staffTop = inBass ? bassTop : trebleTop
        ctx.strokeStyle = '#555'
        ctx.lineWidth = 1
        if (ny < staffTop - 2) {
          for (let ly = staffTop - SP; ly >= ny - 2; ly -= SP) {
            ctx.beginPath(); ctx.moveTo(nx - NOTE_R - 4, ly); ctx.lineTo(nx + NOTE_R + 4, ly); ctx.stroke()
          }
        }
        if (ny > staffTop + 4 * SP + 2) {
          for (let ly = staffTop + 5 * SP; ly <= ny + 2; ly += SP) {
            ctx.beginPath(); ctx.moveTo(nx - NOTE_R - 4, ly); ctx.lineTo(nx + NOTE_R + 4, ly); ctx.stroke()
          }
        }

        // Active highlight
        const active = playTime !== null && playTime >= note.start && playTime < note.start + note.duration
        ctx.beginPath()
        ctx.arc(nx, ny, NOTE_R, 0, Math.PI * 2)
        ctx.fillStyle = active ? '#2979ff' : '#1565c0'
        ctx.fill()
        if (active) {
          ctx.shadowColor = 'rgba(41,121,255,0.9)'
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Accidental
        const acc = note.pitch.includes('#') ? '♯' : note.pitch.includes('b') ? '♭' : ''
        if (acc) {
          ctx.font = `${SP * 1.2}px serif`
          ctx.fillStyle = '#222'
          ctx.fillText(acc, nx - NOTE_R - SP * 1.4, ny + SP * 0.4)
        }

        hitNotes.push({ id: note.id, cx: nx, cy: ny })
      }
    }

    // Final double bar line at end of last measure in row
    const lastCol = Math.min(cols, ms.length - row * cols)
    if (lastCol > 0) {
      const x = lastCol * measureW
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x - 2, trebleTop - 1); ctx.lineTo(x - 2, trebleTop + 4 * SP + 1); ctx.stroke()
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(x, trebleTop - 1); ctx.lineTo(x, trebleTop + 4 * SP + 1); ctx.stroke()
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x - 2, bassTop - 1); ctx.lineTo(x - 2, bassTop + 4 * SP + 1); ctx.stroke()
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(x, bassTop - 1); ctx.lineTo(x, bassTop + 4 * SP + 1); ctx.stroke()
      ctx.lineWidth = 1
    }

  }
}

watch([measures, () => props.playbackTime], () => nextTick(draw), { deep: true })

// In single-row mode keep the measure being played inside the visible strip.
function scrollToPlayhead() {
  const wrap = canvasWrap.value
  if (!wrap || !props.singleRow) return
  const time = props.playbackTime
  if (time === null || time === undefined) {
    scrolledMeasure = -1
    return
  }
  const bpm = beatsPerMeasure()
  const cols = mpr.value
  const measureW = (canvasW - 4) / cols
  const measure = Math.min(Math.max(0, Math.floor(time / bpm)), cols - 1)
  if (measure === scrolledMeasure) return
  scrolledMeasure = measure
  const maxScroll = Math.max(0, wrap.scrollWidth - wrap.clientWidth)
  const target = Math.max(0, Math.min(maxScroll, measure * measureW + measureW / 2 - wrap.clientWidth / 2))
  wrap.scrollTo({ left: target, behavior: 'smooth' })
}
watch(() => props.playbackTime, () => nextTick(scrollToPlayhead), { flush: 'post' })

// ── Click handling ──────────────────────────────────────────────────────────
// Emits the start beat of the measure under the pointer (used to seek playback).
function emitSeek(cx: number, cy: number) {
  const cols = mpr.value
  const measureW = (canvasW - 4) / cols
  const row = Math.floor(cy / ROW_H)
  const measure = row * cols + Math.floor(cx / measureW)
  if (measure < 0 || measure >= measures.value.length) return
  emit('seek', measure * beatsPerMeasure())
}

function handleClick(e: MouseEvent) {
  const rect = canvasEl.value!.getBoundingClientRect()
  const cx = (e.clientX - rect.left) * (canvasEl.value!.width / rect.width)
  const cy = (e.clientY - rect.top) * (canvasEl.value!.height / rect.height)

  if (props.seekable) {
    emitSeek(cx, cy)
    return
  }
  if (props.readonly) return

  for (const h of hitNotes) {
    if (Math.hypot(cx - h.cx, cy - h.cy) <= NOTE_R + 4) {
      activeTrack.value.notes = activeTrack.value.notes.filter(n => n.id !== h.id)
      return
    }
  }

  const bpm = beatsPerMeasure()
  const cols = mpr.value
  const measureW = (canvasW - 4) / cols
  const row = Math.floor(cy / ROW_H)
  const sysTop = row * ROW_H + PAD_T
  const trebleTop = sysTop
  const bassTop = sysTop + 4 * SP + STAFF_GAP
  const col = Math.floor(cx / measureW)
  const mi = row * cols + col
  const xInMeasure = cx - col * measureW

  if (xInMeasure < CLEF_W) return

  const beat = Math.max(0, Math.round(((xInMeasure - CLEF_W - PAD_L) / (measureW - CLEF_W - PAD_L - 8)) * bpm * 4) / 4)
  const globalBeat = mi * bpm + beat

  const inBass = cy > (trebleTop + 4 * SP + bassTop) / 2
  const refTop = inBass ? bassTop : trebleTop
  const refIdx = inBass ? D3 : B4
  const rawStep = Math.round((refTop + 2 * SP - cy) / (SP / 2))
  const diatonicIdx = refIdx + rawStep
  const octave = Math.floor(diatonicIdx / 7)
  const pitch = DIATONIC[((diatonicIdx % 7) + 7) % 7] ?? 'C'

  activeTrack.value.notes.push({ id: `${Date.now()}`, pitch, octave, start: globalBeat, duration: 1 })
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  ctx = canvasEl.value?.getContext('2d') ?? null
  if (canvasWrap.value) {
    canvasW = canvasWrap.value.clientWidth || 800
    canvasEl.value!.width = canvasW
  }
  nextTick(draw)
  const ro = new ResizeObserver(() => {
    if (!canvasWrap.value || !canvasEl.value || props.singleRow) return
    canvasW = canvasWrap.value.clientWidth
    canvasEl.value.width = canvasW
    draw()
  })
  if (canvasWrap.value) ro.observe(canvasWrap.value)
  onBeforeUnmount(() => ro.disconnect())
})

function applyTranspose(semitones: number) {
  local.value = transposeScore(local.value, semitones)
}

const midiInput = ref<HTMLInputElement | null>(null)
async function onMidiFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  try {
    local.value = normalizeScore(midiBytesToScore(await file.arrayBuffer()))
    trackId.value = local.value.tracks[0]?.id || 'track-1'
    useNotifyStore().notify({ success: `MIDI cargado: ${file.name}` })
  } catch (err) {
    useNotifyStore().notify({ error: err instanceof MidiParseError ? err.message : 'No es un archivo MIDI válido' })
  }
}
</script>

<style scoped>
.staff-wrap { width: 100%; overflow-x: hidden; }
.staff-wrap.single-row { overflow-x: auto; }
.staff-canvas { display: block; width: 100%; cursor: crosshair; background: #fff; border-radius: 4px; border: 1px solid #e0e0e0; }
.staff-wrap.single-row .staff-canvas { width: auto; cursor: default; }
.staff-wrap.seekable .staff-canvas { cursor: pointer; }
</style>
