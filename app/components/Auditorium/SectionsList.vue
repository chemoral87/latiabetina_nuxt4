<template>
  <div>
    <div class="text-subtitle-2 mb-2">Secciones</div>
    <div v-for="(section, sIdx) in sections" :key="`section-${sIdx}`">
      <VCard id="aed-section-card" class="mb-2" variant="outlined">
        <div class="d-flex align-center pa-2">
          <VBtn id="audid-section-toggle-btn" icon class="mr-1" size="x-small" @click="emit('toggle-section', sIdx)">
            <VIcon size="x-small">{{ openSections[sIdx] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</VIcon>
          </VBtn>
          <VTextField id="audid-section-name-tf" v-model="section.name" hide-details variant="solo" density="compact" :style="mobile ? 'max-width: 120px' : 'max-width: 140px'" />
          <VChip v-if="section.isLabel" id="aed-label-chip" size="x-small" color="secondary" class="ml-1 ml-md-2">Etiqueta</VChip>
          <VSpacer />
          <VBtn id="audid-section-remove-btn" icon color="error" size="x-small" @click="emit('remove-section', sIdx)">
            <VIcon size="x-small">mdi-delete</VIcon>
          </VBtn>
        </div>

        <VCardText v-if="openSections[sIdx] && !section.isLabel" class="pa-2 pt-0">
          <VRow class="mb-2" density="compact">
            <VCol cols="6">
              <VBtn id="audid-subsection-add-btn" block color="secondary" :size="xs ? 'x-small' : mobile ? 'small' : undefined" @click="emit('add-subsection', sIdx, false)">
                <VIcon size="small" :start="smAndUp">mdi-plus</VIcon>
                <span :class="{ 'd-none d-sm-inline': xs }">Agregar subsección</span>
              </VBtn>
            </VCol>
            <VCol cols="6">
              <VBtn id="audid-subsection-add-label-btn" block color="accent" :size="xs ? 'x-small' : mobile ? 'small' : undefined" @click="emit('add-subsection', sIdx, true)">
                <VIcon size="small" :start="smAndUp">mdi-label-outline</VIcon>
                <span :class="{ 'd-none d-sm-inline': xs }">Agregar área</span>
              </VBtn>
            </VCol>
          </VRow>

          <!-- Subsecciones -->
          <VCard v-for="(sub, subIdx) in section.subsections" id="aed-subsection-card" :key="`sub-${subIdx}`" class="mb-2" variant="outlined" :class="mobile ? 'pa-1' : 'pa-2'">
            <div class="d-flex align-center mb-2">
              <VTextField id="audid-sub-name-tf" v-model="sub.name" hide-details density="compact" :style="mobile ? 'font-size: 14px' : ''" :label="sub.isLabel ? 'Nombre área' : 'Nombre subsección'" />
              <VChip v-if="sub.isLabel" id="aed-area-chip" color="accent" size="x-small" class="ml-1 ml-md-2">Área</VChip>
            </div>

            <!-- Ancho de área (solo para etiquetas) -->
            <VSlider v-if="sub.isLabel" id="aed-area-width-sld" v-model="sub.width" :min="50" :max="300" :step="10" thumb-label class="mb-2" hide-details density="compact" label="Ancho del área" />

            <template v-if="!sub.isLabel">
              <!-- Definir filas y columnas -->
              <VRow class="mb-2" density="compact">
                <VCol sm="3" cols="4">
                  <VTextField id="audid-sub-rows-tf" v-model.number="sub.tempRows" type="text" hide-details label="Filas" density="compact" />
                </VCol>
                <VCol sm="3" cols="4">
                  <VTextField id="audid-sub-cols-tf" v-model.number="sub.tempCols" type="text" hide-details label="Columnas" density="compact" />
                </VCol>
                <VCol sm="2" cols="4">
                  <VBtn id="audid-sub-grid-btn" color="primary" :size="xs ? 'x-small' : 'small'" @click="emit('set-grid', sIdx, subIdx)">Set</VBtn>
                </VCol>
              </VRow>

              <!-- Agregar asiento individual por fila -->
              <VDivider class="my-2" />
              <div class="text-caption mb-1">Agregar asiento individual:</div>
              <VRow density="compact">
                <VCol sm="6" cols="12">
                  <VSelect id="audid-sub-row-sel" v-model="selectedRow[`${sIdx}-${subIdx}`]" hide-details density="compact" label="Seleccionar fila" :items="getRowOptions(sub)" />
                </VCol>
                <VCol sm="6" cols="12" class="d-flex" style="gap: 4px">
                  <VBtn id="audid-seat-left-btn" block size="x-small" color="primary" :disabled="!selectedRow[`${sIdx}-${subIdx}`] && selectedRow[`${sIdx}-${subIdx}`] !== 0" @click="emit('add-seat-to-row', sIdx, subIdx, 'left')">
                    <VIcon size="x-small">mdi-arrow-left-circle</VIcon>
                    <span class="ml-1">Izq</span>
                  </VBtn>
                  <VBtn id="audid-seat-right-btn" block size="x-small" color="primary" :disabled="!selectedRow[`${sIdx}-${subIdx}`] && selectedRow[`${sIdx}-${subIdx}`] !== 0" @click="emit('add-seat-to-row', sIdx, subIdx, 'right')">
                    <VIcon size="x-small">mdi-arrow-right-circle</VIcon>
                    <span class="ml-1">Der</span>
                  </VBtn>
                </VCol>
              </VRow>

              <VDivider class="my-2" />
            </template>

            <div class="d-flex gap-2">
              <VSpacer />
              <VBtn id="audid-sub-remove-btn" icon color="error" size="x-small" @click="emit('remove-subsection', sIdx, subIdx)">
                <VIcon size="x-small">mdi-delete</VIcon>
              </VBtn>
            </div>
          </VCard>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Section, Subsection } from '~/utils/auditorium'

defineProps<{
  sections: Section[]
  openSections: Record<number, boolean>
  selectedRow: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'toggle-section', idx: number): void
  (e: 'remove-section', idx: number): void
  (e: 'add-subsection', sectionIdx: number, isLabel: boolean): void
  (e: 'remove-subsection', sectionIdx: number, subIdx: number): void
  (e: 'set-grid', sectionIdx: number, subIdx: number): void
  (e: 'add-seat-to-row', sectionIdx: number, subIdx: number, side: 'left' | 'right'): void
}>()

const { xs, smAndUp, mobile } = useDisplay()

function getRowOptions(sub: Subsection) {
  return (sub.seats ?? []).map((_, idx) => ({
    title: `Fila ${idx + 1}`,
    value: idx,
  }))
}
</script>
