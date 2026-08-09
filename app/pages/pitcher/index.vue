<template>
  <VContainer class="pa-4" style="max-width: 1000px">
    <h4 id="pit-header" class="text-left mb-1">
      <PitcherConfigButton />
      Tuner
      <span>
        Frec:
        <strong id="pit-freq-display" class="text-right" style="display: inline-block; width: 50px">{{ freqDisplay }}</strong>
        Hz
      </span>
      |
      <span id="pit-db-display">({{ dBDisplay }} dB)</span>
    </h4>

    <VRow id="pit-actions-row" class="mb-1" density="comfortable">
      <VCol cols="6">
        <VBtn id="pit-reset-btn" block size="small" color="primary" @click="resetHistory">
          <VIcon start>mdi-restart</VIcon>
          <span>Reiniciar</span>
        </VBtn>
      </VCol>
      <VCol cols="6">
        <VBtn id="pit-calibrate-btn" block size="small" color="warning" :loading="noiseCalibrating" :disabled="!isMicActive || noiseCalibrating" @click="calibrateNoise">
          <VIcon start>mdi-tune</VIcon>
          <span>Calibrar Ruido</span>
        </VBtn>
      </VCol>
      <VCol cols="6">
        <VBtn id="pit-mic-btn" block size="small" :color="isMicActive ? 'error' : 'success'" @click="toggleMic">
          <VIcon start>{{ isMicActive ? "mdi-microphone-off" : "mdi-microphone" }}</VIcon>
          <span>{{ isMicActive ? "Silenciar" : "Activar mic" }}</span>
        </VBtn>
      </VCol>
      <VCol cols="6">
        <VSelect id="pit-root-note" v-model="selectedRootNote" hide-details density="compact" variant="outlined" :items="currentNoteOptions" :label="latinNotation ? 'Escala Mayor' : 'Mayor Scale'" />
      </VCol>
      <VCol cols="6">
        <VSelect id="pit-processor" v-model="selectedProcessor" hide-details density="compact" variant="outlined" label="Audio Processor" :items="processorOptions" @update:model-value="changeProcessor" />
      </VCol>
    </VRow>

    <VRow id="pit-display-row" density="comfortable">
      <VCol md="5" cols="8" class="pr-1 mx-0">
        <PitcherHistogram ref="histogramComponent" :history="history" :last-freq="lastFreq" :freq-display="freqDisplay" :cents-deviation="centsDeviation" />
      </VCol>

      <VCol md="2" cols="4" class="px-0 mx-0">
        <PitcherStaffNotation v-if="lastValidFreq" :zoom="2" :canvas-width="300" :canvas-height="600" :frequency="lastValidFreq" :show-cents-deviation="true" :cents-deviation="centsDeviation" />
      </VCol>
      <VCol cols="12">
        <PitcherUkeleleNotation v-if="lastValidFreq" :frequency="lastValidFreq" />
      </VCol>
      <VCol cols="12">
        <PitcherGuitarNotation v-if="lastValidFreq" :frequency="lastValidFreq" />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { usePitcherStore } from "~/composables/usePitcherStore"
import { A4_FREQ, A4_MIDI, NOTE_LATIN_STRINGS, NOTE_SHORT_STRINGS } from "~/constants/pitcher"
import type { PitcherAudioProcessor } from "~/services/pitcher/audioProcessor"

definePageMeta({
  title: "Tuner",
  icon: "mdi-tune",
  middleware: "authenticated",
})

interface HistoryPoint {
  freq: number
  midi: number
}

const store = usePitcherStore()
const { selectedRootNote, sensitivity, latinNotation, maxHistory } = storeToRefs(store)

const isMicActive = ref(false)
const audioProcessor = ref<PitcherAudioProcessor | null>(null)
const history = ref<HistoryPoint[]>([])
const freqDisplay = ref("--")
const dBDisplay = ref("--")
const centsDeviation = ref<number | null>(null)
const lastFreq = ref<number | null>(null)
const lastValidFreq = ref<number | null>(null) // Última frecuencia válida detectada
const noiseCalibrating = ref(false) // UI state
const selectedProcessor = ref("ap_gemini10") // Default processor
const processorOptions = ["ap_claude9", "ap_gemini10", "ap_deepseek"]
const histogramComponent = ref<{ resetCanvas: () => void } | null>(null)

const currentNoteOptions = computed(() =>
  latinNotation.value
    ? ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"]
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
)

onMounted(() => {
  loadProcessor(selectedProcessor.value)
})

onBeforeUnmount(() => {
  if (audioProcessor.value) {
    audioProcessor.value.cleanupMicrophone().catch(() => {})
  }
})

async function loadProcessor(processorName: string) {
  const module = await import(`./audioProcessors/${processorName}.ts`)
  const Processor = (module as { AudioProcessor: new () => PitcherAudioProcessor }).AudioProcessor
  audioProcessor.value = new Processor()
}

async function changeProcessor() {
  if (isMicActive.value) {
    await cleanup()
  }
  await loadProcessor(selectedProcessor.value)
}

function resetHistory() {
  history.value = []
  lastFreq.value = null
  lastValidFreq.value = null
  centsDeviation.value = null
  // Clear histogram canvas
  if (histogramComponent.value) {
    histogramComponent.value.resetCanvas()
  }
  // Reset audio processor
  audioProcessor.value?.reset()
}

async function calibrateNoise() {
  if (!isMicActive.value || !audioProcessor.value) {
    return
  }

  noiseCalibrating.value = true

  try {
    await audioProcessor.value.calibrateNoise()
    // Update sensitivity in store
    const newSensitivity = audioProcessor.value.getSensitivity()
    store.setSensitivity(newSensitivity)
  } catch {
    // Calibration errors are ignored (mic may drop frames)
  } finally {
    noiseCalibrating.value = false
  }
}

async function cleanup() {
  if (!audioProcessor.value) return
  await audioProcessor.value.cleanupMicrophone()
  isMicActive.value = false
  freqDisplay.value = "--"
  dBDisplay.value = "--"
  centsDeviation.value = null
  history.value = []
  lastFreq.value = null
}

async function toggleMic() {
  if (!isMicActive.value) {
    try {
      if (!audioProcessor.value) return
      // Use audio processor to initialize microphone
      await audioProcessor.value.initializeMicrophone()
      isMicActive.value = true

      // Set initial sensitivity
      audioProcessor.value.setSensitivity(sensitivity.value)

      // Start calibration
      calibrateNoise()

      // Start the update loop
      update()
    } catch (e) {
      alert("Error accediendo al micrófono: " + (e as Error).message)
      isMicActive.value = false
    }
  } else {
    await cleanup()
  }
}

function update() {
  if (!isMicActive.value || !audioProcessor.value) return

  const result = audioProcessor.value.analyzeFrequency()
  dBDisplay.value = Math.max(0, result.dB).toFixed(1)

  if (result.freq !== -1) {
    // Intentar estabilizar el ataque
    const stableFreq = audioProcessor.value.smoothFrequency(result.freq)

    // Solo si la nota es estable la procesamos y dibujamos
    if (stableFreq !== -1) {
      const exactFreq = parseFloat(stableFreq.toFixed(2))
      const midi = freqToMidi(exactFreq)
      const note = getNoteNameNum(midi)

      const nearestMidi = Math.round(midi)
      const nearestFreq = midiToFreq(nearestMidi)
      centsDeviation.value = Math.round(1200 * Math.log2(exactFreq / nearestFreq))

      freqDisplay.value = exactFreq.toString()
      lastFreq.value = exactFreq
      lastValidFreq.value = exactFreq // Guardar la última frecuencia válida

      history.value.unshift({ freq: stableFreq, midi })
      if (history.value.length > maxHistory.value) history.value.pop()
    } else {
      // Nota en fase de estabilización: no actualizamos displays de frecuencia
      freqDisplay.value = "--"
    }
  } else {
    freqDisplay.value = "--"
    centsDeviation.value = null
    lastFreq.value = null
  }

  if (isMicActive.value) requestAnimationFrame(update)
}

// Helper methods for frequency conversion
function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
}

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0
  return 69 + 12 * Math.log2(freq / A4_FREQ)
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
</script>

<style scoped>
h4 {
  font-weight: 600;
}
</style>
