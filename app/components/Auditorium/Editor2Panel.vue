<template>
  <VRow class="mb-3" density="compact">
    <VCol md="12" cols="6">
      <VBtn id="ae2-add-section-btn" block class="mb-md-2" color="primary" variant="elevated" :size="mobile ? 'small' : undefined" @click="emit('add-section')">
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-plus</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Agregar sección</span>
      </VBtn>
    </VCol>
    <VCol md="12" cols="6">
      <VBtn id="ae2-add-tag-btn" block class="mb-md-2" color="secondary" variant="outlined" :size="mobile ? 'small' : undefined" @click="emit('add-tag')">
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-label</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Agregar etiqueta</span>
      </VBtn>
    </VCol>
  </VRow>

  <VSheet v-if="sections.length > 0" rounded color="white" class="pa-3 mb-3">
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-subtitle-2">Alinear secciones</div>
    </div>

    <div class="d-flex align-center text-caption font-weight-bold mb-1 px-1">
      <span style="width: 28px" />
      <span class="flex-grow-1">Sección</span>
      <span class="text-center" style="width: 60px">Grupo</span>
      <span style="width: 28px" />
      <span style="width: 56px" />
    </div>

    <div v-for="(section, idx) in sections" :key="section.id" class="d-flex align-center mb-1">
      <VCheckbox
        :id="`ae2-section-check-${section.id}`"
        hide-details
        density="compact"
        class="flex-grow-0"
        :aria-label="`Seleccionar ${section.name}`"
        :model-value="selectedIds.includes(section.id)"
        @update:model-value="toggleSection(section.id)"
      />
      <span class="text-body-2 ml-1 text-truncate flex-grow-1">{{ section.name }}</span>
      <VTextField
        :id="`ae2-group-${section.id}`"
        label=""
        hide-details
        type="number"
        density="compact"
        variant="outlined"
        style="width: 60px"
        :model-value="section.group"
        class="text-center flex-grow-0"
        :aria-label="`Grupo ${section.name}`"
        @update:model-value="updateSectionGroup(section.id, $event)"
      />
      <VCheckbox
        v-if="isFirstInGroup(section.id, section.group)"
        :id="`ae2-group-check-${section.group}`"
        hide-details
        density="compact"
        class="flex-grow-0"
        style="width: 28px"
        :model-value="isGroupSelected(section.group)"
        :aria-label="`Seleccionar grupo ${section.group}`"
        @update:model-value="toggleGroup(section.group)"
      />
      <span v-else style="width: 28px" />
      <div style="width: 56px" class="d-flex flex-grow-0">
        <VBtn :id="`ae2-section-up-${section.id}`" icon size="x-small" variant="text" :disabled="idx === 0" @click="emit('move-section', idx, -1)">
          <VIcon size="16">mdi-chevron-up</VIcon>
        </VBtn>
        <VBtn :id="`ae2-section-down-${section.id}`" icon size="x-small" variant="text" :disabled="idx === sections.length - 1" @click="emit('move-section', idx, 1)">
          <VIcon size="16">mdi-chevron-down</VIcon>
        </VBtn>
      </div>
    </div>

    <VDivider class="my-2" />

    <VTextField
      id="ae2-gap-input"
      min="0"
      class="mb-2"
      hide-details
      type="number"
      density="compact"
      :model-value="gap"
      variant="outlined"
      label="Espacio entre secciones (px)"
      @update:model-value="emit('update:gap', Number($event))"
    />

    <div class="d-flex flex-wrap ga-1">
      <VTooltip v-for="action in alignActions" :key="action.key" location="top">
        <template #activator="{ props: tipProps }">
          <VBtn :id="`ae2-align-${action.key}-btn`" v-bind="tipProps" icon size="small" variant="text" :disabled="selectedIds.length < 2" @click="emit('align', action.key)">
            <VIcon size="18">{{ action.icon }}</VIcon>
          </VBtn>
        </template>
        <span>{{ action.label }}</span>
      </VTooltip>
    </div>
  </VSheet>
</template>

<script setup lang="ts">
  import type { FloatingSection } from '~/types/auditorium'

  const props = defineProps<{
    sections: FloatingSection[]
    selectedIds: string[]
    gap: number
  }>()

  const emit = defineEmits<{
    (e: 'add-section'): void
    (e: 'add-tag'): void
    (e: 'align', key: string): void
    (e: 'toggle-section', id: string): void
    (e: 'update-section-group', id: string, group: number | undefined): void
    (e: 'move-section', fromIndex: number, direction: -1 | 1): void
    (e: 'update:gap', value: number): void
  }>()

  function updateSectionGroup(id: string, value: string | number | null) {
    const group = value === null || value === '' ? undefined : Number(value)
    emit('update-section-group', id, group)
  }

  const { mobile, mdAndUp } = useDisplay()

  const alignActions = [
    { key: 'left', icon: 'mdi-format-align-left', label: 'Bordes izquierdos' },
    { key: 'center-h', icon: 'mdi-format-align-center', label: 'Centros horizontales' },
    { key: 'right', icon: 'mdi-format-align-right', label: 'Bordes derechos' },
    { key: 'top', icon: 'mdi-format-align-top', label: 'Bordes superiores' },
    { key: 'center-v', icon: 'mdi-format-align-middle', label: 'Centros verticales' },
    { key: 'bottom', icon: 'mdi-format-align-bottom', label: 'Bordes inferiores' },
    { key: 'dist-h', icon: 'mdi-view-column', label: 'Distribuir horizontal' },
    { key: 'dist-v', icon: 'mdi-view-split-vertical', label: 'Distribuir vertical' },
  ]

  function toggleSection(id: string) {
    emit('toggle-section', id)
  }

  function isFirstInGroup(sectionId: string, group: number | undefined): boolean {
    if (group === undefined) return false
    const idx = props.sections.findIndex(s => s.group === group)
    return idx >= 0 && props.sections[idx].id === sectionId
  }

  function isGroupSelected(group: number | undefined): boolean {
    if (group === undefined) return false
    const groupSections = props.sections.filter(s => s.group === group)
    return groupSections.length > 0 && groupSections.every(s => props.selectedIds.includes(s.id))
  }

  function toggleGroup(group: number | undefined) {
    if (group === undefined) return
    const groupSections = props.sections.filter(s => s.group === group)
    const allSelected = groupSections.every(s => props.selectedIds.includes(s.id))
    for (const section of groupSections) {
      if (allSelected && props.selectedIds.includes(section.id)) {
        emit('toggle-section', section.id)
      } else if (!allSelected && !props.selectedIds.includes(section.id)) {
        emit('toggle-section', section.id)
      }
    }
  }
</script>
