<template>
  <VCard id="cmp-pitcher-ukelele-notation" class="pa-0">
    <VCardTitle class="text-h6 mb-2">
      Diapasón de Ukelele
      <VChip v-if="currentNote" id="pit-ukele-note" class="ml-2" size="small" color="primary" variant="elevated">Nota: {{ currentNote }}</VChip>
    </VCardTitle>

    <VCardText>
      <VRow class="mb-2" density="compact">
        <VCol cols="auto">
          <VSelect id="pit-ukele-strings" v-model="stringCount" hide-details label="Cuerdas" density="compact" variant="outlined" style="max-width: 150px" :items="stringCountOptions" />
        </VCol>
        <VCol cols="auto">
          <VSelect id="pit-ukele-g" v-model="gTuning" label="G" hide-details density="compact" variant="outlined" :items="gTuningOptions" style="max-width: 150px" />
        </VCol>
      </VRow>
      <!-- Fretboard -->
      <div id="pit-ukele-fretboard" class="fretboard-container">
        <svg class="fretboard" preserveAspectRatio="xMidYMid meet" :viewBox="`0 0 ${fretboardWidth} ${fretboardHeight}`">
          <!-- Fret lines -->
          <line v-for="fret in 13" :key="'fret-' + fret" y1="20" stroke="#8B7355" :x1="getFretX(fret - 1)" :x2="getFretX(fret - 1)" :y2="fretboardHeight - 20" :stroke-width="fret === 1 ? 6 : 2" />

          <!-- Strings -->
          <line v-for="(string, index) in strings" :key="'string-' + index" x1="60" stroke="#C0C0C0" :y1="getStringY(index)" :y2="getStringY(index)" :x2="fretboardWidth - 20" :stroke-width="1 + index * 0.3" />

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
import { usePitcherNotes } from "~/composables/usePitcherNotes"

interface FretString {
  name: string
  note: string
  octave: number
}

const props = withDefaults(
  defineProps<{
    frequency?: number | null
    frequencies?: number[]
  }>(),
  {
    frequency: null,
    frequencies: () => [],
  },
)

const store = usePitcherStore()
const { latinNotation, selectedRootNote, showScaleOnFretboard, scaleRingOpacity, ghostNoteOpacity } = storeToRefs(store)
const { targetLabels, isExactMidi, isAdjacentMidi } = usePitcherNotes(() => props.frequency, () => props.frequencies)

const fretboardWidth = 900
const fretboardHeight = 250
const fretSpacing = 65
const noteRadius = 16
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const latinNotes = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"]
const stringCount = ref(6) // 4 or 6 strings
const gTuning = ref<"low" | "high">("low") // Low G (G3) matches the original 6-string config
const stringCountOptions = [
  { title: "6 cuerdas", value: 6 },
  { title: "4 cuerdas", value: 4 },
]
const gTuningOptions = [
  { title: "Low G", value: "low" },
  { title: "High G", value: "high" },
]

const strings = computed<FretString[]>(() => {
  const gOctave = gTuning.value === "low" ? 3 : 4
  if (stringCount.value === 4) {
    // Ukulele estándar (reentrante): la 1ª cuerda (A, la más aguda) arriba
    return [
      { name: "A", note: "A", octave: 4 }, // Primera cuerda (la más aguda)
      { name: "E", note: "E", octave: 4 }, // Segunda cuerda
      { name: "C", note: "C", octave: 4 }, // Tercera cuerda
      { name: "G", note: "G", octave: gOctave }, // Cuarta cuerda
    ]
  }
  // Configuración original de 6 cuerdas; con High G la zona grave también
  // sube una octava (G3→G4, D3→D4, A2→A3)
  return [
    { name: "A", note: "A", octave: 4 }, // Primera cuerda (la más aguda)
    { name: "E", note: "E", octave: 4 }, // Segunda cuerda
    { name: "C", note: "C", octave: 4 }, // Tercera cuerda
    { name: "G", note: "G", octave: gOctave }, // Cuarta cuerda
    { name: "D", note: "D", octave: gOctave }, // Quinta cuerda
    { name: "A", note: "A", octave: gOctave - 1 }, // Sexta cuerda (la más grave)
  ]
})
const fretMarkers = [3, 5, 7, 9]

// Pitch classes (0-11) de la escala mayor seleccionada en pit-root-note
const scaleNoteIndices = computed(() => {
  const rootIndex = latinNotation.value
    ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"].indexOf(selectedRootNote.value)
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"].indexOf(selectedRootNote.value)
  if (rootIndex === -1) return []
  return MAJOR_STEPS.map((step) => (rootIndex + step) % 12)
})

// ¿La nota (cuerda + traste; -1 = cuerda al aire) pertenece a la escala seleccionada?
function isNoteInScale(string: FretString, fret: number): boolean {
  if (!showScaleOnFretboard.value) return false
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (notes.indexOf(string.note) + actualFret) % 12
  return scaleNoteIndices.value.includes(noteIndex)
}

// Nota o acorde que se está resaltando (una sola nota o varias simultáneas).
const currentNote = computed(() => targetLabels.value.join(" ") || null)

function getFretX(fret: number): number {
  return 60 + fret * fretSpacing
}

function getStringY(stringIndex: number): number {
  const stringSpacing = (fretboardHeight - 80) / (strings.value.length - 1)
  return 40 + stringIndex * stringSpacing
}

function getNoteAtFret(string: FretString, fret: number): string {
  const startIndex = notes.indexOf(string.note)
  // Para cuerdas al aire (fret = -1), usamos fret = 0 en el cálculo
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (startIndex + actualFret) % 12
  const noteArray = latinNotation.value ? latinNotes : notes
  const noteName = noteArray[noteIndex]

  // Calcular la octava
  const octaveOffset = Math.floor((startIndex + actualFret) / 12)
  const octave = string.octave + octaveOffset

  return `${noteName}${octave}`
}

// MIDI de la nota que suena en esa cuerda/traste (fret -1 = cuerda al aire).
function fretMidi(string: FretString, fret: number): number {
  const startIndex = notes.indexOf(string.note)
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (startIndex + actualFret) % 12
  const octave = string.octave + Math.floor((startIndex + actualFret) / 12)
  return (octave + 1) * 12 + noteIndex
}

function getNoteHighlightType(string: FretString, fret: number): "none" | "exact" | "adjacent" {
  const midi = fretMidi(string, fret)
  if (isExactMidi(midi)) return "exact"
  if (isAdjacentMidi(midi)) return "adjacent"
  return "none"
}

function getNoteColor(string: FretString, fret: number): string {
  if (getNoteHighlightType(string, fret) === "none") return "#E0E0E0" // Gris por defecto
  return COLORS[(fretMidi(string, fret) % 12) * 2]
}

function getNoteOpacity(string: FretString, fret: number): number {
  const type = getNoteHighlightType(string, fret)
  if (type === "exact") return 1
  if (type === "adjacent") return ghostNoteOpacity.value
  return 0.3
}

function getNoteTextColor(string: FretString, fret: number): string {
  if (getNoteHighlightType(string, fret) === "none") return "#666"
  return COLOR_NEEDS_WHITE_TEXT[(fretMidi(string, fret) % 12) * 2] ? "#FFFFFF" : "#666"
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
