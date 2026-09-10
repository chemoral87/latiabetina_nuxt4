<template>
  <VCard id="cmp-pitcher-piano-notation" class="pa-0">
    <VCardTitle class="text-h6 mb-2">
      Piano
      <VChip v-if="currentNote" id="pit-piano-note" class="ml-2" size="small" color="primary" variant="elevated">Nota: {{ currentNote }}</VChip>
    </VCardTitle>

    <VCardText>
      <VRow density="compact" class="mb-2">
        <VCol cols="auto">
          <VSelect
            id="pit-piano-keys"
            v-model="keyboardSize"
            hide-details
            label="Teclas"
            density="compact"
            variant="outlined"
            :items="keyboardSizeOptions"
            style="max-width: 150px"
          />
        </VCol>
      </VRow>
      <div id="pit-piano-container" class="piano-container">
        <svg class="piano" preserveAspectRatio="xMidYMid meet" :viewBox="`0 0 ${pianoWidth} ${pianoHeight}`">
          <!-- White keys -->
          <g v-for="(key, i) in whiteKeys" :key="'wk-' + i">
            <rect
              :x="key.x"
              y="0"
              :width="whiteKeyWidth"
              :height="whiteKeyHeight"
              :fill="getWhiteKeyFill(key)"
              :fill-opacity="getWhiteKeyOpacity(key)"
              stroke="#999"
              stroke-width="1"
              rx="0"
              class="white-key"
            />
            <text
              :x="key.x + whiteKeyWidth / 2"
              :y="whiteKeyHeight - 10"
              text-anchor="middle"
              font-size="11"
              font-weight="bold"
              :fill="getWhiteKeyTextColor(key)"
              class="note-label"
            >
              {{ key.label }}
            </text>
          </g>

          <!-- Black keys -->
          <g v-for="(key, i) in blackKeys" :key="'bk-' + i">
            <rect
              :x="key.x"
              y="0"
              :width="blackKeyWidth"
              :height="blackKeyHeight"
              :fill="getBlackKeyFill(key)"
              :fill-opacity="getBlackKeyOpacity(key)"
              stroke="#333"
              stroke-width="1"
              rx="0"
              class="black-key"
            />
            <text
              :x="key.x + blackKeyWidth / 2"
              :y="blackKeyHeight - 8"
              text-anchor="middle"
              font-size="9"
              font-weight="bold"
              :fill="getBlackKeyTextColor(key)"
              class="note-label"
            >
              {{ key.label }}
            </text>
          </g>
        </svg>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { usePitcherStore } from "~/composables/usePitcherStore"
import { COLORS, COLOR_NEEDS_WHITE_TEXT } from "~/constants/pitcher"

interface PianoKey {
  note: string
  label: string
  octave: number
  midi: number
  x: number
  isBlack: boolean
}

const props = withDefaults(
  defineProps<{
    frequency?: number | null
  }>(),
  {
    frequency: null,
  },
)

const store = usePitcherStore()
const { ghostQuarterNote, latinNotation, ghostNoteOpacity } = storeToRefs(store)

const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const latinAllNotes = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]

interface KeyboardConfig {
  label: string
  keys: number
  startMidi: number
}

const keyboardSizes: KeyboardConfig[] = [
  { label: "88 teclas (A0–C8)", keys: 88, startMidi: 21 },
  { label: "76 teclas (E1–E7)", keys: 76, startMidi: 28 },
  { label: "61 teclas (C2–C7)", keys: 61, startMidi: 36 },
  { label: "49 teclas (C3–C7)", keys: 49, startMidi: 48 },
  { label: "36 teclas (C3–C6)", keys: 36, startMidi: 48 },
  { label: "25 teclas (C4–C6)", keys: 25, startMidi: 60 },
]
const keyboardSizeOptions = keyboardSizes.map((k) => k.label)
const keyboardSize = ref(keyboardSizes[2].label)

const selectedConfig = computed(() => keyboardSizes.find((k) => k.label === keyboardSize.value) ?? keyboardSizes[2])

const whiteKeyWidth = 56
const whiteKeyHeight = 200
const blackKeyWidth = 34
const blackKeyHeight = 125

const whiteKeyNotes = ["C", "D", "E", "F", "G", "A", "B"]
const blackKeyNotes = ["C#", "D#", "F#", "G#", "A#"]

const blackKeyOffsets: Record<string, number> = {
  "C#": 0,
  "D#": 1,
  "F#": 3,
  "G#": 4,
  "A#": 5,
}

function getLabel(note: string, octave: number): string {
  const noteName = latinNotation.value ? latinAllNotes[allNotes.indexOf(note)] : note
  return `${noteName}${octave}`
}

function midiToOctave(midi: number): number {
  return Math.floor(midi / 12) - 1
}

// Build all keys dynamically from selected keyboard range
const allKeys = computed(() => {
  const cfg = selectedConfig.value
  const wKeys: PianoKey[] = []
  const bKeys: PianoKey[] = []
  let whiteIndex = 0

  for (let midi = cfg.startMidi; midi < cfg.startMidi + cfg.keys; midi++) {
    const noteIndex = midi % 12
    const note = allNotes[noteIndex]
    const octave = midiToOctave(midi)
    const label = getLabel(note, octave)

    if (!blackKeyNotes.includes(note)) {
      const x = whiteIndex * whiteKeyWidth
      wKeys.push({ note, label, octave, midi, x, isBlack: false })
      whiteIndex++
    } else {
      const prevWhiteX = (whiteIndex - 1) * whiteKeyWidth
      const x = prevWhiteX + whiteKeyWidth - blackKeyWidth / 2
      bKeys.push({ note, label, octave, midi, x, isBlack: true })
    }
  }

  return { whiteKeys: wKeys, blackKeys: bKeys }
})

const whiteKeys = computed(() => allKeys.value.whiteKeys)
const blackKeys = computed(() => allKeys.value.blackKeys)
const pianoWidth = computed(() => whiteKeys.value.length * whiteKeyWidth)
const pianoHeight = whiteKeyHeight + 10

const currentNote = computed(() => {
  if (!props.frequency) return null
  const midi = freqToMidi(props.frequency)
  const roundedMidi = Math.round(midi)
  const noteIndex = roundedMidi % 12
  const octave = Math.floor(roundedMidi / 12) - 1
  const noteName = latinNotation.value ? latinAllNotes[noteIndex] : allNotes[noteIndex]
  return `${noteName}${octave}`
})

const currentMidi = computed(() => {
  if (!props.frequency) return -1
  return Math.round(freqToMidi(props.frequency))
})

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0
  return 69 + 12 * Math.log2(freq / 440)
}

function isExactMatch(midi: number): boolean {
  if (currentMidi.value < 0) return false
  return midi === currentMidi.value
}

function isAdjacentOctave(midi: number): boolean {
  if (currentMidi.value < 0) return false
  if (!ghostQuarterNote.value) return false
  const diff = Math.abs(midi - currentMidi.value)
  return diff === 12
}

function getKeyColor(midi: number): string {
  const colorIndex = (midi % 12) * 2
  return COLORS[colorIndex]
}

function getKeyTextColor(midi: number): string {
  const colorIndex = (midi % 12) * 2
  return COLOR_NEEDS_WHITE_TEXT[colorIndex] ? "#FFFFFF" : "#666"
}

function getWhiteKeyFill(key: PianoKey): string {
  if (isExactMatch(key.midi)) return getKeyColor(key.midi)
  if (isAdjacentOctave(key.midi)) return getKeyColor(key.midi)
  return "#FFFFFF"
}

function getWhiteKeyOpacity(key: PianoKey): number {
  if (isExactMatch(key.midi)) return 1
  if (isAdjacentOctave(key.midi)) return ghostNoteOpacity.value
  return 1
}

function getWhiteKeyTextColor(key: PianoKey): string {
  if (isExactMatch(key.midi) || isAdjacentOctave(key.midi)) return getKeyTextColor(key.midi)
  return "#666"
}

function getBlackKeyFill(key: PianoKey): string {
  if (isExactMatch(key.midi)) return getKeyColor(key.midi)
  if (isAdjacentOctave(key.midi)) return getKeyColor(key.midi)
  return "#333"
}

function getBlackKeyOpacity(key: PianoKey): number {
  if (isExactMatch(key.midi)) return 1
  if (isAdjacentOctave(key.midi)) return ghostNoteOpacity.value
  return 1
}

function getBlackKeyTextColor(key: PianoKey): string {
  if (isExactMatch(key.midi) || isAdjacentOctave(key.midi)) return getKeyTextColor(key.midi)
  return "#AAA"
}
</script>

<style scoped>
.piano-container {
  width: 100%;
  border-radius: 8px;
  padding: 4px;
  overflow: hidden;
}

.piano {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}

.white-key {
  cursor: pointer;
  transition: fill 0.3s ease, fill-opacity 0.3s ease;
}

.white-key:hover {
  fill-opacity: 0.85;
}

.black-key {
  cursor: pointer;
  transition: fill 0.3s ease, fill-opacity 0.3s ease;
}

.black-key:hover {
  fill-opacity: 0.85;
}

.note-label {
  pointer-events: none;
  font-family: "Roboto", sans-serif;
}
</style>
