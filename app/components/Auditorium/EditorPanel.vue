<template>
  <!-- Botones de Acción -->
  <VRow class="mb-3" density="compact">
    <VCol md="12" cols="6">
      <VBtn id="audid-add-section-btn" block class="mb-md-2" color="primary" :size="mobile ? 'small' : undefined" @click="emit('add-section', false)">
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-plus</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Agregar sección</span>
      </VBtn>
    </VCol>
    <VCol md="12" cols="6">
      <VBtn id="audid-add-label-btn" block class="mb-md-2" color="secondary" :size="mobile ? 'small' : undefined" @click="emit('add-section', true)">
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-label</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Agregar etiqueta sección</span>
      </VBtn>
    </VCol>
    <VCol md="12" cols="6">
      <VBtn id="audid-clear-cats-btn" block class="mb-md-2" color="warning" :size="mobile ? 'small' : undefined" @click="emit('clear-categories')">
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-broom</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Limpiar categorías</span>
      </VBtn>
    </VCol>
  </VRow>

  <!-- Configuración -->
  <VCard id="aud-edito-card-1" class="mb-3 pa-2" variant="outlined">
    <div class="text-subtitle-2 mb-2">Configuración</div>

    <!-- Save Format Toggle -->
    <div class="d-flex align-center mb-2">
      <span class="text-caption mr-2">Formato:</span>
      <VBtnToggle v-model="localFormat" mandatory density="compact">
        <VBtn id="audid-fmt-csv-btn" value="csv" size="x-small" color="primary">
          <VIcon start size="x-small">mdi-file-delimited</VIcon>CSV
        </VBtn>
        <VBtn id="audid-fmt-json-btn" value="json" size="x-small" color="primary">
          <VIcon start size="x-small">mdi-code-json</VIcon>JSON
        </VBtn>
      </VBtnToggle>
      <VChip id="aed-format-chip" class="ml-2" size="x-small" :color="localFormat === 'csv' ? 'success' : 'info'">
        {{ localFormat === 'csv' ? 'Plano CSV' : 'JSON anidado' }}
      </VChip>
    </div>

    <JsonConfig :config-data="configData" :save-format="localFormat" :config-data-csv="configDataCsv" @imported="emit('imported', $event)" @import-error="emit('import-error', $event)" />

    <VSlider id="aed-seat-size-sld" :min="5" :max="20" :step="1" thumb-label class="mb-1" density="compact" label="Tamaño de asiento" :model-value="settings.SEAT_SIZE" @update:model-value="updateSetting('SEAT_SIZE', $event)" />
    <VSlider id="aed-seat-distance-sld" :max="8" :min="2" :step="1" thumb-label class="mb-1" density="compact" label="Distancia entre asientos" :model-value="settings.SEATS_DISTANCE" @update:model-value="updateSetting('SEATS_DISTANCE', $event)" />
    <VSlider id="aed-section-padding-sld" :min="0" :step="5" :max="160" thumb-label class="mb-0" density="compact" label="Padding superior sección" :model-value="settings.SECTION_TOP_PADDING" @update:model-value="updateSetting('SECTION_TOP_PADDING', $event)" />
  </VCard>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'

const props = defineProps<{
  saveFormat: 'csv' | 'json'
  configData: Record<string, unknown>
  configDataCsv: string
  settings: { SEAT_SIZE: number; SEATS_DISTANCE: number; SECTION_TOP_PADDING: number }
}>()

const emit = defineEmits<{
  (e: 'update:saveFormat', v: 'csv' | 'json'): void
  (e: 'imported', data: unknown): void
  (e: 'import-error', err: Error): void
  (e: 'add-section', isLabel: boolean): void
  (e: 'clear-categories'): void
  (e: 'update:settings', key: string, value: number): void
}>()

const { mobile, mdAndUp } = useDisplay()

const localFormat = computed({
  get: () => props.saveFormat,
  set: (v) => emit('update:saveFormat', v),
})

function updateSetting(key: string, value: number) {
  emit('update:settings', key, value)
}
</script>
