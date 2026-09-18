<template>
  <VCard id="cmp-pitcher-bass-notation" class="pa-0">
    <VCardTitle class="text-h6 mb-2">
      Diapasón de Bajo
      <VChip v-if="currentNote" id="pit-bass-note" class="ml-2" size="small" color="primary" variant="elevated">Nota: {{ currentNote }}</VChip>
    </VCardTitle>

    <VCardText>
      <!-- Fretboard -->
      <div id="pit-bass-fretboard" class="fretboard-container">
        <svg class="fretboard" preserveAspectRatio="xMidYMid meet" :viewBox="`0 0 ${fretboardWidth} ${fretboardHeight}`">
          <!-- Fret lines -->
          <line v-for="fret in 13" :key="'fret-' + fret" y1="20" stroke="#8B7355" :x1="getFretX(fret - 1)" :x2="getFretX(fret - 1)" :y2="fretboardHeight - 20" :stroke-width="fret === 1 ? 6 : 2" />

          <!-- Strings -->
          <line v-for="(string, index) in strings" :key="'string-' + index" x1="60" stroke="#C0C0C0" :y1="getStringY(index)" :y2="getStringY(index)" :x2="fretboardWidth - 20" :stroke-width="2 + index * 0.5" />

          <!-- Fret numbers -->
          <text v-for="fret in 12" :key="'fret-num-' + fret" fill="#666" font-size="12" text-anchor="middle" :y="fretboardHeight - 5" :x="getFretX(fret) - fretSpacing / 2">
            {{ fret }}
          </text>

          <!-- Fret markers (dots) -->
          <circle v-for="marker in fretMarkers" :key="'marker-' + marker" r="8" fill="red" opacity="0.5" :cy="fretboardHeight / 2" :cx="getFretX(marker) - fretSpacing / 2" />

          <!-- Double dots for 12th fret -->
          <circle r="8" fill="red" opacity="0.5" :cy="fretboardHeight / 2 - 30" :cx="getFretX(12) - fretSpacing / 2" />
          <circle r="8" fill="red" opacity="0.5" :cy="fretboardHeight / 2 + 30" :cx="getFretX(12) - fretSpacing / 2" />

          <!-- Notes on fretboard -->
          <g v-for="(string, stringIndex) in strings" :key="'notes-' + stringIndex">
            <!-- Cuerda al aire (traste 0) -->
            <circle :r="noteRadius" :cx="getFretX(0) - 30" :cy="getStringY(stringIndex)" :fill="getNoteColor(string, -1)" :stroke-opacity="scaleRingOpacity" :fill-opacity="getNoteOpacity(string, -1)" :class="['note-circle', { 'scale-circle': isNoteInScale(string, -1) }]" />
            <text font-size="11" class="note-text" font-weight="bold" text-anchor="middle" :x="getFretX(0) - 30" :y="getStringY(stringIndex) + 5" :fill="getNoteTextColor(string, -1)">
              {{ getNoteAtFret(string, -1) }}
            </text>

            <!-- Notas en los trastes 1-12 -->
            <circle
              v-for="fret in 12"
              :key="'note-' + stringIndex + '-' + fret"
              :r="noteRadius"
              :cy="getStringY(stringIndex)"
              :fill="getNoteColor(string, fret)"
              :stroke-opacity="scaleRingOpacity"
              :cx="getFretX(fret) - fretSpacing / 2"
              :fill-opacity="getNoteOpacity(string, fret)"
              :class="['note-circle', { 'scale-circle': isNoteInScale(string, fret) }]"
            />
            <text
              v-for="fret in 12"
              :key="'note-text-' + stringIndex + '-' + fret"
              font-size="11"
              class="note-text"
              font-weight="bold"
              text-anchor="middle"
              :y="getStringY(stringIndex) + 5"
              :x="getFretX(fret) - fretSpacing / 2"
              :fill="getNoteTextColor(string, fret)"
            >
              {{ getNoteAtFret(string, fret) }}
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
import { COLOR_NEEDS_WHITE_TEXT, COLORS, MAJOR_STEPS } from "~/constants/pitcher"

interface FretString {
  name: string
  note: string
  octave: number
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
const { ghostQuarterNote, latinNotation, selectedRootNote, showScaleOnFretboard, scaleRingOpacity, ghostNoteOpacity } = storeToRefs(store)

const fretboardWidth = 900
const fretboardHeight = 200
const fretSpacing = 65
const noteRadius = 16
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const latinNotes = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]

// Standard bass tuning: G2, D2, A1, E1 (thinnest → thickest, top → bottom)
const strings: FretString[] = [
  { name: "G", note: "G", octave: 2 },
  { name: "D", note: "D", octave: 2 },
  { name: "A", note: "A", octave: 1 },
  { name: "E", note: "E", octave: 1 },
]
const fretMarkers = [3, 5, 7, 9]

const scaleNoteIndices = computed(() => {
  const rootIndex = latinNotation.value
    ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"].indexOf(selectedRootNote.value)
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"].indexOf(selectedRootNote.value)
  if (rootIndex === -1) return []
  return MAJOR_STEPS.map((step) => (rootIndex + step) % 12)
})

function isNoteInScale(string: FretString, fret: number): boolean {
  if (!showScaleOnFretboard.value) return false
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (notes.indexOf(string.note) + actualFret) % 12
  return scaleNoteIndices.value.includes(noteIndex)
}

const currentNote = computed(() => {
  if (!props.frequency) return null
  const midi = freqToMidi(props.frequency)
  const roundedMidi = Math.round(midi)
  const noteIndex = roundedMidi % 12
  const octave = Math.floor(roundedMidi / 12) - 1
  const noteName = latinNotation.value ? latinNotes[noteIndex] : notes[noteIndex]
  return `${noteName}${octave}`
})

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0
  return 69 + 12 * Math.log2(freq / 440)
}

function getFretX(fret: number): number {
  return 60 + fret * fretSpacing
}

function getStringY(stringIndex: number): number {
  const stringSpacing = (fretboardHeight - 80) / (strings.length - 1)
  return 40 + stringIndex * stringSpacing
}

function getNoteAtFret(string: FretString, fret: number): string {
  const startIndex = notes.indexOf(string.note)
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (startIndex + actualFret) % 12
  const noteArray = latinNotation.value ? latinNotes : notes
  const noteName = noteArray[noteIndex]
  const octaveOffset = Math.floor((startIndex + actualFret) / 12)
  const octave = string.octave + octaveOffset
  return `${noteName}${octave}`
}

function getNoteHighlightType(string: FretString, fret: number): "none" | "exact" | "adjacent" {
  if (!currentNote.value) return "none"
  const noteAtFret = getNoteAtFret(string, fret)
  if (noteAtFret === currentNote.value) return "exact"

  if (ghostQuarterNote.value) {
    const currentNoteWithoutOctave = currentNote.value.replace(/\d+$/, "")
    const currentOctave = parseInt(currentNote.value.match(/\d+$/)?.[0] || "0")
    const noteAtFretWithoutOctave = noteAtFret.replace(/\d+$/, "")
    const fretOctave = parseInt(noteAtFret.match(/\d+$/)?.[0] || "0")
    if (noteAtFretWithoutOctave === currentNoteWithoutOctave && Math.abs(fretOctave - currentOctave) === 1) {
      return "adjacent"
    }
  }
  return "none"
}

function getNoteColor(string: FretString, fret: number): string {
  const type = getNoteHighlightType(string, fret)
  if (type === "none") return "#E0E0E0"
  const noteAtFret = getNoteAtFret(string, fret)
  const noteWithoutOctave = noteAtFret.replace(/\d+$/, "")
  const octave = parseInt(noteAtFret.match(/\d+$/)?.[0] || "0")
  const noteArray = latinNotation.value ? latinNotes : notes
  const noteIndex = noteArray.indexOf(noteWithoutOctave)
  const midiNote = (octave + 1) * 12 + noteIndex
  const colorIndex = (midiNote % 12) * 2
  return COLORS[colorIndex]
}

function getNoteOpacity(string: FretString, fret: number): number {
  const type = getNoteHighlightType(string, fret)
  if (type === "exact") return 1
  if (type === "adjacent") return ghostNoteOpacity.value
  return 0.3
}

function getNoteTextColor(string: FretString, fret: number): string {
  const type = getNoteHighlightType(string, fret)
  if (type === "none") return "#666"
  const noteAtFret = getNoteAtFret(string, fret)
  const noteWithoutOctave = noteAtFret.replace(/\d+$/, "")
  const octave = parseInt(noteAtFret.match(/\d+$/)?.[0] || "0")
  const noteArray = latinNotation.value ? latinNotes : notes
  const noteIndex = noteArray.indexOf(noteWithoutOctave)
  const midiNote = (octave + 1) * 12 + noteIndex
  const colorIndex = (midiNote % 12) * 2
  return COLOR_NEEDS_WHITE_TEXT[colorIndex] ? "#FFFFFF" : "#666"
}
</script>

<style scoped>
.fretboard-container {
  width: 100%;
  border-radius: 8px;
  padding: 4px;
  overflow: hidden;
}

.fretboard {
  display: block;
  width: 100%;
  height: auto;
  max-width: 100%;
}

.note-circle {
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-circle:hover {
  fill-opacity: 0.8;
  r: 14;
}

.note-circle.scale-circle {
  stroke: #ff0000;
  stroke-width: 1.5;
}

.note-text {
  pointer-events: none;
  font-family: "Roboto", sans-serif;
}
</style>
