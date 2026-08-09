<template>
  <div>
    <VBtn id="pit-config-open-btn" class="mr-1 settings-btn-glow" @click="settingsDialog = true">
      <VIcon start>mdi-cog</VIcon>
      Config
    </VBtn>
    <VDialog id="pit-config-dlg" v-model="settingsDialog" max-width="500px">
      <VCard>
        <VCardTitle>
          Configuración v2.023
          <VSpacer />
          <VBtn id="pit-config-close-icon-btn" icon rounded="circle" @click="settingsDialog = false">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VRow density="comfortable">
            <!-- Microfono Section -->
            <VCol cols="12">
              <h3 class="text-center py-0 my-0">Micrófono</h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider id="pit-config-sensitivity" v-model="sensitivity" :max="0.01" thumb-label hide-details :min="0.0001" :step="0.0001" label="Sensibilidad" />
              <div class="text-center font-weight-bold">
                {{ sensitivity.toFixed(4) }}
              </div>
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow density="comfortable">
            <!-- Histograma Section -->
            <VCol cols="12">
              <h3 class="text-center py-0 my-0">Histograma</h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch id="pit-config-latin" v-model="latinNotation" hide-details class="mt-0 pt-0" label="Notación latina" />
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch id="pit-config-microtones" v-model="showMicrotones" hide-details class="mt-0 pt-0" :label="latinNotation ? 'Mostrar microtonos' : 'Show microtones'" />
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider id="pit-config-history" v-model="maxHistory" :max="800" :min="300" :step="50" thumb-label hide-details label="Máx Historial" />
              <div class="text-center font-weight-bold">
                {{ maxHistory }}
              </div>
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider id="pit-config-notes" v-model="totalNotes" :max="25" :min="13" :step="1" thumb-label hide-details label="# Notas" />
              <div class="text-center font-weight-bold">
                {{ totalNotes }}
              </div>
            </VCol>
            <VCol sm="6" cols="12">
              <VSlider id="pit-config-height" v-model="histogramHeight" :max="450" :min="250" :step="25" thumb-label hide-details label="Altura Histograma" />
              <div class="text-center font-weight-bold">{{ histogramHeight }}px</div>
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow density="comfortable">
            <!-- Pentagrama Section -->
            <VCol cols="12">
              <h3 class="text-center py-0 my-0">Pentagrama</h3>
            </VCol>
            <VCol sm="6" cols="12">
              <VSwitch id="pit-config-ghost" v-model="ghostQuarterNote" hide-details class="mt-0 pt-0" label="Mostrar nota fantasma" />
            </VCol>
          </VRow>
        </VCardText>

        <div class="d-flex justify-end px-4 pb-4">
          <VBtn id="pit-config-close-btn" variant="text" color="primary" @click="settingsDialog = false">Cerrar</VBtn>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { usePitcherStore } from "~/composables/usePitcherStore"

const settingsDialog = ref(false)

const store = usePitcherStore()
const { sensitivity: sensitivityRef } = storeToRefs(store)

// Writable computeds → store setters (clamping preserved from the Vuex module)
const latinNotation = computed({
  get: () => store.latinNotation,
  set: (v: boolean) => store.setLatinNotation(v),
})
const showMicrotones = computed({
  get: () => store.showMicrotones,
  set: (v: boolean) => store.setShowMicrotones(v),
})
const ghostQuarterNote = computed({
  get: () => store.ghostQuarterNote,
  set: (v: boolean) => store.setGhostQuarterNote(v),
})
const sensitivity = computed({
  get: () => sensitivityRef.value,
  set: (v: number) => store.setSensitivity(v),
})
const maxHistory = computed({
  get: () => store.maxHistory,
  set: (v: number) => store.setMaxHistory(v),
})
const totalNotes = computed({
  get: () => store.totalNotes,
  set: (v: number) => store.setTotalNotes(v),
})
const histogramHeight = computed({
  get: () => store.histogramHeight,
  set: (v: number) => store.setHistogramHeight(v),
})
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
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.8), 0 0 30px rgba(33, 150, 243, 0.6);
  }
}
</style>
