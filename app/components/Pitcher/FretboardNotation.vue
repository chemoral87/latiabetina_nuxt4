<template>
  <VCard :id="cardId" class="pa-0">
    <VCardTitle class="text-h6 mb-2">
      {{ title }}
      <VChip v-if="currentNote" :id="`${cardId}-note`" class="ml-2" size="small" color="primary" variant="elevated">Nota: {{ currentNote }}</VChip>
    </VCardTitle>

    <VCardText>
      <slot name="controls" />
      <div :id="`${cardId}-fretboard`" class="fretboard-container">
        <svg class="fretboard" preserveAspectRatio="xMidYMid meet" :viewBox="`0 0 ${fretboardWidth} ${fretboardHeight}`">
          <line v-for="fret in 13" :key="'fret-' + fret" y1="20" stroke="#8B7355" :x1="getFretX(fret - 1)" :x2="getFretX(fret - 1)" :y2="fretboardHeight - 20" :stroke-width="fret === 1 ? 6 : 2" />
          <line v-for="(string, index) in strings" :key="'string-' + index" x1="60" stroke="#C0C0C0" :y1="getStringY(index)" :y2="getStringY(index)" :x2="fretboardWidth - 20" :stroke-width="stringStrokeWidth(index)" />
          <text v-for="fret in 12" :key="'fret-num-' + fret" fill="#666" font-size="12" text-anchor="middle" :y="fretboardHeight - 5" :x="getFretX(fret) - fretSpacing / 2">{{ fret }}</text>
          <circle v-for="marker in fretMarkers" :key="'marker-' + marker" r="8" fill="red" opacity="0.5" :cy="fretboardHeight / 2" :cx="getFretX(marker) - fretSpacing / 2" />
          <circle r="8" fill="red" opacity="0.5" :cy="fretboardHeight / 2 - 30" :cx="getFretX(12) - fretSpacing / 2" />
          <circle r="8" fill="red" opacity="0.5" :cy="fretboardHeight / 2 + 30" :cx="getFretX(12) - fretSpacing / 2" />
          <g v-for="(string, stringIndex) in strings" :key="'notes-' + stringIndex">
            <circle :r="noteRadius" :cx="getFretX(0) - 30" :cy="getStringY(stringIndex)" :fill="getNoteColor(string, -1)" :stroke-opacity="scaleRingOpacity" :fill-opacity="getNoteOpacity(string, -1)" :class="['note-circle', { 'scale-circle': isNoteInScale(string, -1) }]" />
            <text font-size="11" class="note-text" font-weight="bold" text-anchor="middle" :x="getFretX(0) - 30" :y="getStringY(stringIndex) + 5" :fill="getNoteTextColor(string, -1)">{{ getNoteAtFret(string, -1) }}</text>
            <circle v-for="fret in 12" :key="'note-' + stringIndex + '-' + fret" :r="noteRadius" :cy="getStringY(stringIndex)" :fill="getNoteColor(string, fret)" :stroke-opacity="scaleRingOpacity" :cx="getFretX(fret) - fretSpacing / 2" :fill-opacity="getNoteOpacity(string, fret)" :class="['note-circle', { 'scale-circle': isNoteInScale(string, fret) }]" />
            <text v-for="fret in 12" :key="'note-text-' + stringIndex + '-' + fret" font-size="11" class="note-text" font-weight="bold" text-anchor="middle" :y="getStringY(stringIndex) + 5" :x="getFretX(fret) - fretSpacing / 2" :fill="getNoteTextColor(string, fret)">{{ getNoteAtFret(string, fret) }}</text>
          </g>
        </svg>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { usePitcherStore } from '~/composables/usePitcherStore'
import { usePitcherNotes } from '~/composables/usePitcherNotes'
import { COLOR_NEEDS_WHITE_TEXT, COLORS, MAJOR_STEPS } from '~/constants/pitcher'

export interface FretString {
  name: string
  note: string
  octave: number
}

const props = withDefaults(defineProps<{
  cardId: string
  title: string
  strings: FretString[]
  frequency?: number | null
  frequencies?: number[]
  fretboardHeight?: number
  baseStringStroke?: number
  stringStrokeStep?: number
}>(), {
  frequency: null,
  frequencies: () => [],
  fretboardHeight: 250,
  baseStringStroke: 1,
  stringStrokeStep: 0.3,
})

const store = usePitcherStore()
const { latinNotation, selectedRootNote, showScaleOnFretboard, scaleRingOpacity, ghostNoteOpacity } = storeToRefs(store)
const { targetLabels, isExactMidi, isAdjacentMidi } = usePitcherNotes(() => props.frequency, () => props.frequencies)

const fretboardWidth = 900
const fretSpacing = 65
const noteRadius = 16
const fretMarkers = [3, 5, 7, 9]
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const latinNotes = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

const currentNote = computed(() => targetLabels.value.join(' ') || null)

const scaleNoteIndices = computed(() => {
  const rootIndex = latinNotation.value
    ? ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'].indexOf(selectedRootNote.value)
    : ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'].indexOf(selectedRootNote.value)
  if (rootIndex === -1) return []
  return MAJOR_STEPS.map((step) => (rootIndex + step) % 12)
})

function stringStrokeWidth(index: number): number {
  return props.baseStringStroke + index * props.stringStrokeStep
}

function getFretX(fret: number): number {
  return 60 + fret * fretSpacing
}

function getStringY(stringIndex: number): number {
  const stringSpacing = (props.fretboardHeight - 80) / Math.max(1, props.strings.length - 1)
  return 40 + stringIndex * stringSpacing
}

function fretMidi(string: FretString, fret: number): number {
  const startIndex = notes.indexOf(string.note)
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (startIndex + actualFret) % 12
  const octave = string.octave + Math.floor((startIndex + actualFret) / 12)
  return (octave + 1) * 12 + noteIndex
}

function getNoteAtFret(string: FretString, fret: number): string {
  const startIndex = notes.indexOf(string.note)
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (startIndex + actualFret) % 12
  const noteName = (latinNotation.value ? latinNotes : notes)[noteIndex]
  const octave = string.octave + Math.floor((startIndex + actualFret) / 12)
  return `${noteName}${octave}`
}

function isNoteInScale(string: FretString, fret: number): boolean {
  if (!showScaleOnFretboard.value) return false
  const actualFret = fret === -1 ? 0 : fret
  const noteIndex = (notes.indexOf(string.note) + actualFret) % 12
  return scaleNoteIndices.value.includes(noteIndex)
}

function getNoteHighlightType(string: FretString, fret: number): 'none' | 'exact' | 'adjacent' {
  const midi = fretMidi(string, fret)
  if (isExactMidi(midi)) return 'exact'
  if (isAdjacentMidi(midi)) return 'adjacent'
  return 'none'
}

function getNoteColor(string: FretString, fret: number): string {
  if (getNoteHighlightType(string, fret) === 'none') return '#E0E0E0'
  return COLORS[(fretMidi(string, fret) % 12) * 2]!
}

function getNoteOpacity(string: FretString, fret: number): number {
  const type = getNoteHighlightType(string, fret)
  if (type === 'exact') return 1
  if (type === 'adjacent') return ghostNoteOpacity.value
  return 0.3
}

function getNoteTextColor(string: FretString, fret: number): string {
  if (getNoteHighlightType(string, fret) === 'none') return '#666'
  return COLOR_NEEDS_WHITE_TEXT[(fretMidi(string, fret) % 12) * 2] ? '#FFFFFF' : '#666'
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
  font-family: 'Roboto', sans-serif;
}
</style>
