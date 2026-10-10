<template>
  <PitcherFretboardNotation
    :strings="strings"
    :frequency="frequency"
    :base-string-stroke="2"
    :fretboard-height="200"
    title="Diapasón de Bajo"
    :string-stroke-step="0.5"
    :frequencies="frequencies"
    card-id="cmp-pitcher-bass-notation"
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
  { name: 'G', note: 'G', octave: 2 },
  { name: 'D', note: 'D', octave: 2 },
  { name: 'A', note: 'A', octave: 1 },
  { name: 'E', note: 'E', octave: 1 },
]
</script>
