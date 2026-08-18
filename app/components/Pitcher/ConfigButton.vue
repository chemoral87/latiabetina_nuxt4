<template>
  <div>
    <VBtn
      id="pit-config-open-btn"
      class="mr-1 settings-btn-glow"
      @click="settingsDialog = true"
    >
      <VIcon start>mdi-cog</VIcon>
      Config
    </VBtn>
    <VDialog id="pit-config-dlg" v-model="settingsDialog" max-width="500px">
      <VCard>
        <VCardTitle class="d-flex align-center flex-nowrap pe-2">
          <span class="text-truncate">Configuración v2.023</span>
          <VSpacer />
          <VBtn
            id="pit-config-close-icon-btn"
            icon
            rounded="circle"
            class="flex-shrink-0"
            @click="settingsDialog = false"
          >
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCardTitle>

        <VCardText class="config-body">
          <VRow density="comfortable">
            <!-- Microfono Section -->
            <VCol cols="12">
              <h3 id="pit-config-mic-title" class="text-center py-0 my-0">
                Micrófono
              </h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider
                id="pit-config-sensitivity"
                v-model="sensitivity"
                :max="0.01"
                thumb-label
                hide-details
                :min="0.0001"
                :step="0.0001"
                label="Sensibilidad"
              />
              <div
                id="pit-config-sensitivity-value"
                class="text-center font-weight-bold"
              >
                {{ sensitivity.toFixed(4) }}
              </div>
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow density="comfortable">
            <!-- Medidor Section -->
            <VCol cols="12">
              <h3 id="pit-config-meter-title" class="text-center py-0 my-0">
                Medidor de dB
              </h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider
                id="pit-config-db-offset"
                v-model="dbCalibrationOffset"
                :max="30"
                :step="1"
                :min="-30"
                thumb-label
                hide-details
                label="Calibración (offset)"
              />
              <div
                id="pit-config-db-offset-value"
                class="text-center font-weight-bold"
              >
                {{ dbCalibrationOffset > 0 ? "+" : ""
                }}{{ dbCalibrationOffset }} dB
              </div>
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow density="comfortable">
            <!-- Histograma Section -->
            <VCol cols="12">
              <h3 id="pit-config-histogram-title" class="text-center py-0 my-0">
                Histograma
              </h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch
                id="pit-config-latin"
                v-model="latinNotation"
                hide-details
                class="mt-0 pt-0"
                label="Notación latina"
              />
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch
                id="pit-config-microtones"
                v-model="showMicrotones"
                hide-details
                class="mt-0 pt-0"
                :label="
                  latinNotation ? 'Mostrar microtonos' : 'Show microtones'
                "
              />
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider
                id="pit-config-history"
                v-model="maxHistory"
                :max="800"
                :min="300"
                :step="50"
                thumb-label
                hide-details
                label="Máx Historial"
              />
              <div
                id="pit-config-history-value"
                class="text-center font-weight-bold"
              >
                {{ maxHistory }}
              </div>
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider
                id="pit-config-notes"
                v-model="totalNotes"
                :max="25"
                :min="13"
                :step="1"
                thumb-label
                hide-details
                label="# Notas"
              />
              <div
                id="pit-config-notes-value"
                class="text-center font-weight-bold"
              >
                {{ totalNotes }}
              </div>
            </VCol>
            <VCol sm="6" cols="12">
              <div class="text-caption text-medium-emphasis">Altura Histograma</div>
              <VSlider
                id="pit-config-height"
                v-model="histogramHeight"
                :max="600"
                :min="300"
                :step="25"
                thumb-label
                hide-details
              />
              <div
                id="pit-config-height-value"
                class="text-center font-weight-bold"
              >
                {{ histogramHeight }}px
              </div>
            </VCol>
            <VCol sm="6" cols="12">
              <div class="text-caption text-medium-emphasis">Ancho mínimo Histograma</div>
              <VSlider
                id="pit-config-min-width"
                v-model="histogramMinWidth"
                :max="800"
                :min="200"
                :step="25"
                thumb-label
                hide-details
              />
              <div
                id="pit-config-min-width-value"
                class="text-center font-weight-bold"
              >
                {{ histogramMinWidth }}px
              </div>
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow density="comfortable">
            <!-- Pentagrama Section -->
            <VCol cols="12">
              <h3 id="pit-config-staff-title" class="text-center py-0 my-0">
                Pentagrama
              </h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch
                id="pit-config-guitar-notation"
                v-model="showGuitarNotation"
                hide-details
                color="success"
                class="mt-0 pt-0"
                label="Notación guitarra"
              />
              <VSelect
                id="pit-config-guitar-cols"
                v-model="guitarCols"
                hide-details
                label="Columnas"
                density="compact"
                variant="outlined"
                :items="notationColsOptions"
              />
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch
                id="pit-config-ukelele-notation"
                v-model="showUkeleleNotation"
                hide-details
                color="success"
                class="mt-0 pt-0"
                label="Notación ukelele"
              />
              <VSelect
                id="pit-config-ukelele-cols"
                v-model="ukeleleCols"
                hide-details
                label="Columnas"
                density="compact"
                variant="outlined"
                :items="notationColsOptions"
              />
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch
                id="pit-config-trumpet-notation"
                v-model="showTrumpetNotation"
                hide-details
                color="success"
                class="mt-0 pt-0"
                label="Notación trompeta"
              />
              <VSelect
                id="pit-config-trumpet-cols"
                v-model="trumpetCols"
                hide-details
                label="Columnas"
                density="compact"
                variant="outlined"
                :items="notationColsOptions"
              />
            </VCol>
            <VCol cols="12">
              <VSwitch
                id="pit-config-ghost"
                v-model="ghostQuarterNote"
                hide-details
                class="mt-0 pt-0"
                label="Mostrar nota fantasma"
              />
            </VCol>
            <VCol cols="12">
              <VSlider
                id="pit-config-ghost-opacity"
                v-model="ghostNoteOpacity"
                :max="1"
                :min="0"
                thumb-label
                hide-details
                :step="0.05"
                label="Opacidad nota fantasma"
              />
              <div
                id="pit-config-ghost-opacity-value"
                class="text-center font-weight-bold"
              >
                {{ Math.round(ghostNoteOpacity * 100) }}%
              </div>
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow density="comfortable">
            <!-- Diapasón Section -->
            <VCol cols="12">
              <h3 id="pit-config-fretboard-title" class="text-center py-0 my-0">
                Diapasón
              </h3>
            </VCol>
            <VCol cols="12">
              <VSwitch
                id="pit-config-fretboard-scale"
                v-model="showScaleOnFretboard"
                hide-details
                class="mt-0 pt-0"
                label="Mostrar escala en diapasón"
              />
            </VCol>
            <VCol cols="12">
              <VSlider
                id="pit-config-fretboard-opacity"
                v-model="scaleRingOpacity"
                :max="1"
                :min="0"
                thumb-label
                hide-details
                :step="0.05"
                label="Opacidad del anillo"
              />
              <div
                id="pit-config-fretboard-opacity-value"
                class="text-center font-weight-bold"
              >
                {{ Math.round(scaleRingOpacity * 100) }}%
              </div>
            </VCol>
          </VRow>
        </VCardText>

        <div class="d-flex justify-end px-4 pb-4">          <VBtn id="pit-config-close-btn" size="x-large" color="primary" variant="outlined" @click="settingsDialog = false">Cerrar</VBtn>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import {
  NOTATION_COLS_OPTIONS,
  usePitcherStore,
} from "~/composables/usePitcherStore";

const settingsDialog = ref(false);

const store = usePitcherStore();
const { sensitivity: sensitivityRef } = storeToRefs(store);

const notationColsOptions = NOTATION_COLS_OPTIONS;

// Writable computeds → store setters (clamping preserved from the Vuex module)
const latinNotation = computed({
  get: () => store.latinNotation,
  set: (v: boolean) => store.setLatinNotation(v),
});
const showMicrotones = computed({
  get: () => store.showMicrotones,
  set: (v: boolean) => store.setShowMicrotones(v),
});
const ghostQuarterNote = computed({
  get: () => store.ghostQuarterNote,
  set: (v: boolean) => store.setGhostQuarterNote(v),
});
const sensitivity = computed({
  get: () => sensitivityRef.value,
  set: (v: number) => store.setSensitivity(v),
});
const maxHistory = computed({
  get: () => store.maxHistory,
  set: (v: number) => store.setMaxHistory(v),
});
const totalNotes = computed({
  get: () => store.totalNotes,
  set: (v: number) => store.setTotalNotes(v),
});
const histogramHeight = computed({
  get: () => store.histogramHeight,
  set: (v: number) => store.setHistogramHeight(v),
});
const histogramMinWidth = computed({
  get: () => store.histogramMinWidth,
  set: (v: number) => store.setHistogramMinWidth(v),
});
const dbCalibrationOffset = computed({
  get: () => store.dbCalibrationOffset,
  set: (v: number) => store.setDbCalibrationOffset(v),
});
const showScaleOnFretboard = computed({
  get: () => store.showScaleOnFretboard,
  set: (v: boolean) => store.setShowScaleOnFretboard(v),
});
const scaleRingOpacity = computed({
  get: () => store.scaleRingOpacity,
  set: (v: number) => store.setScaleRingOpacity(v),
});
const ghostNoteOpacity = computed({
  get: () => store.ghostNoteOpacity,
  set: (v: number) => store.setGhostNoteOpacity(v),
});
const showGuitarNotation = computed({
  get: () => store.showGuitarNotation,
  set: (v: boolean) => store.setShowGuitarNotation(v),
});
const showUkeleleNotation = computed({
  get: () => store.showUkeleleNotation,
  set: (v: boolean) => store.setShowUkeleleNotation(v),
});
const showTrumpetNotation = computed({
  get: () => store.showTrumpetNotation,
  set: (v: boolean) => store.setShowTrumpetNotation(v),
});
const ukeleleCols = computed({
  get: () => store.ukeleleCols,
  set: (v: string | number) => store.setUkeleleCols(v),
});
const guitarCols = computed({
  get: () => store.guitarCols,
  set: (v: string | number) => store.setGuitarCols(v),
});
const trumpetCols = computed({
  get: () => store.trumpetCols,
  set: (v: string | number) => store.setTrumpetCols(v),
});
</script>

<style scoped>
.settings-btn-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
  }
  50% {
    box-shadow:
      0 0 20px rgba(33, 150, 243, 0.8),
      0 0 30px rgba(33, 150, 243, 0.6);
  }
}

/* El cuerpo del diálogo es el que hace scroll, así la fila del título
   (texto + botón cerrar) nunca se ve afectada por la barra de scroll. */
.config-body {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
