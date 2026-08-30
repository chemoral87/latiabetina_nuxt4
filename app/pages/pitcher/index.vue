<template>
  <VContainer fluid class="pa-2">
    <h4 id="pit-header" class="text-left my-0">
      Tuner
      <span>
        Frec:
        <strong
          id="pit-freq-display"
          class="text-right"
          style="display: inline-block; width: 50px"
          >{{ freqDisplay }}</strong
        >
        Hz
      </span>
      |
      <span id="pit-db-display">({{ dBDisplay }} dB)</span>
    </h4>

    <VRow id="pit-actions-row" class="mb-1" align="center" density="compact">
      <VCol sm="7" cols="12" class="d-flex flex-wrap ga-1 py-1">
        <PitcherConfigButton />
        <VBtn
          id="pit-reset-btn"
          color="primary"
          density="comfortable"
          @click="resetHistory"
        >
          <VIcon start size="small">mdi-restart</VIcon>
          <span>Reiniciar</span>
        </VBtn>
        <VBtn
          id="pit-calibrate-btn"
          color="warning"
          density="comfortable"
          :loading="noiseCalibrating"
          :disabled="!isMicActive || noiseCalibrating"
          @click="calibrateNoise"
        >
          <VIcon start size="small">mdi-tune</VIcon>
          <span>Calibrar Ruido</span>
        </VBtn>
        <VBtn
          id="pit-mic-btn"
          density="comfortable"
          :color="isMicActive ? 'error' : 'success'"
          @click="toggleMic"
        >
          <VIcon start size="small">{{
            isMicActive ? "mdi-microphone-off" : "mdi-microphone"
          }}</VIcon>
          <span>{{ isMicActive ? "Silenciar" : "Activar mic" }}</span>
        </VBtn>
      </VCol>
      <VCol md="2" sm="3" cols="6" class="py-1">
        <VSelect
          id="pit-root-note"
          v-model="selectedRootNote"
          hide-details
          density="compact"
          variant="outlined"
          :items="currentNoteOptions"
          :label="latinNotation ? 'Escala Mayor' : 'Mayor Scale'"
        />
      </VCol>
      <VCol sm="2" cols="6" class="py-1">
        <VSelect
          id="pit-processor"
          v-model="selectedProcessor"
          hide-details
          density="compact"
          variant="outlined"
          label="Audio Processor"
          :items="processorOptions"
          @update:model-value="changeProcessor"
        />
      </VCol>
    </VRow>

    <VRow id="pit-display-row" density="comfortable">
      <VCol cols="auto" class="px-0 mx-0">
        <PitcherStaffNotation
          v-if="lastValidFreq"
          :zoom="staffZoom"
          :frequency="lastValidFreq"
          :show-cents-deviation="true"
          :canvas-width="staffCanvasWidth"
          :cents-deviation="centsDeviation"
          :canvas-height="staffCanvasHeight"
        />
      </VCol>

      <VCol cols="auto" class="pl-1 mx-0">
        <div :style="{ 'min-width': histogramMinWidth + 'px' }">
          <PitcherHistogram
            ref="histogramComponent"
            :history="history"
            :last-freq="lastFreq"
            :db-display="dBDisplay"
            :freq-display="freqDisplay"
            :cents-deviation="centsDeviation"
          />
        </div>
      </VCol>
      <VCol v-if="showUkeleleNotation" :cols="ukeleleCols">
        <PitcherUkeleleNotation
          v-if="lastValidFreq"
          :frequency="lastValidFreq"
        />
      </VCol>
      <VCol v-if="showGuitarNotation" :cols="guitarCols">
        <PitcherGuitarNotation
          v-if="lastValidFreq"
          :frequency="lastValidFreq"
        />
      </VCol>
      <VCol v-if="showTrumpetNotation" :cols="trumpetCols">
        <PitcherTrumpetNotation
          v-if="lastValidFreq"
          :frequency="lastValidFreq"
        />
      </VCol>
    </VRow>

    <div class="notation-cols-fabs">
      <VMenu v-if="showUkeleleNotation" location="top end">
        <template #activator="{ props }">
          <VBtn
            id="pit-ukelele-cols-btn"
            v-bind="props"
            color="primary"
            icon="mdi-ukulele"
            density="comfortable"
            class="notation-cols-fab"
          />
        </template>
        <VList id="pit-ukelele-cols-menu" density="compact">
          <VListItem
            v-for="opt in notationColsOptions"
            :key="opt"
            :disabled="!isColsOptionEnabled(opt)"
            @click="ukeleleCols = opt"
          >
            <VListItemTitle>{{ opt }}</VListItemTitle>
            <VIcon v-if="ukeleleCols === opt" end>mdi-check</VIcon>
          </VListItem>
        </VList>
      </VMenu>

      <VMenu v-if="showGuitarNotation" location="top end">
        <template #activator="{ props }">
          <VBtn
            id="pit-guitar-cols-btn"
            v-bind="props"
            color="primary"
            density="comfortable"
            class="notation-cols-fab"
            icon="mdi-guitar-acoustic"
          />
        </template>
        <VList id="pit-guitar-cols-menu" density="compact">
          <VListItem
            v-for="opt in notationColsOptions"
            :key="opt"
            :disabled="!isColsOptionEnabled(opt)"
            @click="guitarCols = opt"
          >
            <VListItemTitle>{{ opt }}</VListItemTitle>
            <VIcon v-if="guitarCols === opt" end>mdi-check</VIcon>
          </VListItem>
        </VList>
      </VMenu>

      <VMenu v-if="showTrumpetNotation" location="top end">
        <template #activator="{ props }">
          <VBtn
            id="pit-trumpet-cols-btn"
            v-bind="props"
            color="primary"
            icon="mdi-trumpet"
            density="comfortable"
            class="notation-cols-fab"
          />
        </template>
        <VList id="pit-trumpet-cols-menu" density="compact">
          <VListItem
            v-for="opt in notationColsOptions"
            :key="opt"
            :disabled="!isColsOptionEnabled(opt)"
            @click="trumpetCols = opt"
          >
            <VListItemTitle>{{ opt }}</VListItemTitle>
            <VIcon v-if="trumpetCols === opt" end>mdi-check</VIcon>
          </VListItem>
        </VList>
      </VMenu>
    </div>
  </VContainer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import {
  NOTATION_COLS_OPTIONS,
  usePitcherStore,
} from "~/composables/usePitcherStore";
import {
  A4_FREQ,
  A4_MIDI,
  NOTE_LATIN_STRINGS,
  NOTE_SHORT_STRINGS,
} from "~/constants/pitcher";
import type { PitcherAudioProcessor } from "~/services/pitcher/audioProcessor";

definePageMeta({
  title: "Tuner",
  icon: "mdi-tune",
  // permission: "pitch-train",
  // middleware: ["authenticated", "permission"],
});

interface HistoryPoint {
  freq: number;
  midi: number;
}

const store = usePitcherStore();
const {
  selectedRootNote,
  sensitivity,
  latinNotation,
  maxHistory,
  showGuitarNotation,
  showUkeleleNotation,
  showTrumpetNotation,
  histogramMinWidth,
  histogramEffectiveHeight,
  ukeleleCols,
  guitarCols,
  trumpetCols,
} = storeToRefs(store);

// El pentagrama comparte la misma altura que pit-hist-canvas / pit-db-meter
// (histogramEffectiveHeight = histogramHeight). Cambiar el ancho (histogramMinWidth)
// solo modifica el ancho del histograma: la altura queda intacta.
// El ancho y el zoom del pentagrama se derivan de su altura para mantener la
// proporción original (300x600, zoom 2) con la que fue diseñado.
const STAFF_BASE_HEIGHT = 600;
const STAFF_BASE_WIDTH = 300;
const STAFF_BASE_ZOOM = 2;
const staffCanvasHeight = computed(() => histogramEffectiveHeight.value);
const staffCanvasWidth = computed(() =>
  Math.round((staffCanvasHeight.value / STAFF_BASE_HEIGHT) * STAFF_BASE_WIDTH),
);
const staffZoom = computed(
  () =>
    Math.round(
      (staffCanvasHeight.value / STAFF_BASE_HEIGHT) * STAFF_BASE_ZOOM * 1000,
    ) / 1000,
);

const isMicActive = ref(false);
const audioProcessor = ref<PitcherAudioProcessor | null>(null);
const history = ref<HistoryPoint[]>([]);
const freqDisplay = ref("--");
const dBDisplay = ref("--");
const centsDeviation = ref<number | null>(null);
const lastFreq = ref<number | null>(null);
const lastValidFreq = ref<number | null>(null); // Última frecuencia válida detectada
const noiseCalibrating = ref(false); // UI state
const selectedProcessor = ref("ap_deepseek"); // Default processor
const processorOptions = ["ap_claude9", "ap_gemini10", "ap_deepseek"];
const histogramComponent = ref<{ resetCanvas: () => void } | null>(null);
const notationColsOptions = NOTATION_COLS_OPTIONS;
const { mobile } = useDisplay();
// En móvil solo se permiten las columnas auto / 6 / 12
const isColsOptionEnabled = (opt: string | number) =>
  !mobile.value || ["auto", 6, 12].includes(opt);

const currentNoteOptions = computed(() =>
  latinNotation.value
    ? [
        "Do",
        "Do♯",
        "Re",
        "Re♯",
        "Mi",
        "Fa",
        "Fa♯",
        "Sol",
        "Sol♯",
        "La",
        "La♯",
        "Si",
      ]
    : ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"],
);

onMounted(() => {
  // Restaurar ajustes guardados después de la hidratación SSR de Pinia
  store.loadFromStorage();

  // Apply URL query parameters to override settings.
  // Examples: ?NotGuitar=false&NotUkelele=false&NotTrumpet=false&LatinNotation=true
  const route = useRoute();
  if (route.query.NotGuitar !== undefined) {
    store.setShowGuitarNotation(route.query.NotGuitar !== 'false');
  }
  if (route.query.NotUkelele !== undefined) {
    store.setShowUkeleleNotation(route.query.NotUkelele !== 'false');
  }
  if (route.query.NotTrumpet !== undefined) {
    store.setShowTrumpetNotation(route.query.NotTrumpet !== 'false');
  }
  if (route.query.LatinNotation !== undefined) {
    store.setLatinNotation(route.query.LatinNotation !== 'false');
  }

  loadProcessor(selectedProcessor.value);
});

onBeforeUnmount(() => {
  if (audioProcessor.value) {
    audioProcessor.value.cleanupMicrophone().catch(() => {});
  }
});

async function loadProcessor(processorName: string) {
  const module = await import(`./audioProcessors/${processorName}.ts`);
  const Processor = (
    module as { AudioProcessor: new () => PitcherAudioProcessor }
  ).AudioProcessor;
  audioProcessor.value = new Processor();
}

async function changeProcessor() {
  if (isMicActive.value) {
    await cleanup();
  }
  await loadProcessor(selectedProcessor.value);
}

function resetHistory() {
  history.value = [];
  lastFreq.value = null;
  lastValidFreq.value = null;
  centsDeviation.value = null;
  // Clear histogram canvas
  if (histogramComponent.value) {
    histogramComponent.value.resetCanvas();
  }
  // Reset audio processor
  audioProcessor.value?.reset();
}

async function calibrateNoise() {
  if (!isMicActive.value || !audioProcessor.value) {
    return;
  }

  noiseCalibrating.value = true;

  try {
    await audioProcessor.value.calibrateNoise();
    // Update sensitivity in store
    const newSensitivity = audioProcessor.value.getSensitivity();
    store.setSensitivity(newSensitivity);
  } catch {
    // Calibration errors are ignored (mic may drop frames)
  } finally {
    noiseCalibrating.value = false;
  }
}

async function cleanup() {
  if (!audioProcessor.value) return;
  await audioProcessor.value.cleanupMicrophone();
  isMicActive.value = false;
  freqDisplay.value = "--";
  dBDisplay.value = "--";
  centsDeviation.value = null;
  history.value = [];
  lastFreq.value = null;
}

async function toggleMic() {
  if (!isMicActive.value) {
    try {
      if (!audioProcessor.value) return;
      // Use audio processor to initialize microphone
      await audioProcessor.value.initializeMicrophone();
      isMicActive.value = true;

      // Set initial sensitivity
      audioProcessor.value.setSensitivity(sensitivity.value);

      // Start calibration
      calibrateNoise();

      // Start the update loop
      update();
    } catch (e) {
      alert("Error accediendo al micrófono: " + (e as Error).message);
      isMicActive.value = false;
    }
  } else {
    await cleanup();
  }
}

function update() {
  if (!isMicActive.value || !audioProcessor.value) return;

  const result = audioProcessor.value.analyzeFrequency();
  // El medidor arranca en 0 dB: nunca muestra valores negativos
  dBDisplay.value = Math.max(0, result.dB + store.dbCalibrationOffset).toFixed(
    1,
  );

  if (result.freq !== -1) {
    // Intentar estabilizar el ataque
    const stableFreq = audioProcessor.value.smoothFrequency(result.freq);

    // Solo si la nota es estable la procesamos y dibujamos
    if (stableFreq !== -1) {
      const exactFreq = parseFloat(stableFreq.toFixed(2));
      const midi = freqToMidi(exactFreq);
      const note = getNoteNameNum(midi);

      const nearestMidi = Math.round(midi);
      const nearestFreq = midiToFreq(nearestMidi);
      centsDeviation.value = Math.round(
        1200 * Math.log2(exactFreq / nearestFreq),
      );

      freqDisplay.value = exactFreq.toString();
      lastFreq.value = exactFreq;
      lastValidFreq.value = exactFreq; // Guardar la última frecuencia válida

      history.value.unshift({ freq: stableFreq, midi });
      if (history.value.length > maxHistory.value) history.value.pop();
    } else {
      // Nota en fase de estabilización: no actualizamos displays de frecuencia
      freqDisplay.value = "--";
    }
  } else {
    freqDisplay.value = "--";
    centsDeviation.value = null;
    lastFreq.value = null;
  }

  if (isMicActive.value) requestAnimationFrame(update);
}

// Helper methods for frequency conversion
function midiToFreq(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0;
  return 69 + 12 * Math.log2(freq / A4_FREQ);
}

function getNoteNameNum(midiNote: number): string {
  const roundedMidi = Math.round(midiNote * 2) / 2;
  const noteIndex = Math.floor(roundedMidi) % 12;
  const isHalfStep = roundedMidi % 1 === 0.5;
  const fullIndex = isHalfStep ? noteIndex * 2 + 1 : noteIndex * 2;

  const noteStrings = latinNotation.value
    ? NOTE_LATIN_STRINGS
    : NOTE_SHORT_STRINGS;
  const note = noteStrings[fullIndex];
  const octave = Math.floor(roundedMidi / 12 - 1);
  return `${note}${octave}`;
}
</script>

<style scoped>
h4 {
  font-weight: 600;
}

.notation-cols-fabs {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
