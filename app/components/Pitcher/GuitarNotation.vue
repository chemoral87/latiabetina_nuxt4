<template>
  <PitcherFretboardNotation
    :strings="strings"
    :frequency="frequency"
    :base-string-stroke="1"
    :fretboard-height="250"
    :string-stroke-step="0.3"
    :frequencies="frequencies"
    title="Diapasón de Guitarra"
    card-id="cmp-pitcher-guitar-notation"
  />
</template>

<script setup lang="ts">
import type { FretString } from './FretboardNotation.vue'

const props = withDefaults(
  defineProps<{
    frequency?: number | null
    frequencies?: number[]
  }>(),
  { frequency: null, frequencies: () => [] },
)

const strings: FretString[] = [
  { name: 'E', note: 'E', octave: 4 },
  { name: 'B', note: 'B', octave: 3 },
  { name: 'G', note: 'G', octave: 3 },
  { name: 'D', note: 'D', octave: 3 },
  { name: 'A', note: 'A', octave: 2 },
  { name: 'E', note: 'E', octave: 2 },
]
</script>
