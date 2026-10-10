<template>
  <PitcherFretboardNotation
    :strings="strings"
    :frequency="frequency"
    :base-string-stroke="1"
    :fretboard-height="250"
    :string-stroke-step="0.3"
    :frequencies="frequencies"
    title="Diapasón de Ukelele"
    card-id="cmp-pitcher-ukelele-notation"
  >
    <template #controls>
      <VRow class="mb-2" density="compact">
        <VCol cols="auto">
          <VSelect id="pit-ukele-strings" v-model="stringCount" hide-details label="Cuerdas" density="compact" variant="outlined" style="max-width: 150px" :items="stringCountOptions" />
        </VCol>
        <VCol cols="auto">
          <VSelect id="pit-ukele-g" v-model="gTuning" label="G" hide-details density="compact" variant="outlined" :items="gTuningOptions" style="max-width: 150px" />
        </VCol>
      </VRow>
    </template>
  </PitcherFretboardNotation>
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

const stringCount = ref(6)
const gTuning = ref<'low' | 'high'>('low')
const stringCountOptions = [
  { title: '6 cuerdas', value: 6 },
  { title: '4 cuerdas', value: 4 },
]
const gTuningOptions = [
  { title: 'Low G', value: 'low' },
  { title: 'High G', value: 'high' },
]

const strings = computed<FretString[]>(() => {
  const gOctave = gTuning.value === 'low' ? 3 : 4
  if (stringCount.value === 4) {
    return [
      { name: 'A', note: 'A', octave: 4 },
      { name: 'E', note: 'E', octave: 4 },
      { name: 'C', note: 'C', octave: 4 },
      { name: 'G', note: 'G', octave: gOctave },
    ]
  }
  return [
    { name: 'A', note: 'A', octave: 4 },
    { name: 'E', note: 'E', octave: 4 },
    { name: 'C', note: 'C', octave: 4 },
    { name: 'G', note: 'G', octave: gOctave },
    { name: 'D', note: 'D', octave: gOctave },
    { name: 'A', note: 'A', octave: gOctave - 1 },
  ]
})
</script>
