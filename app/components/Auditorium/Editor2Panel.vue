<template>
  <VRow class="mb-3" density="compact">
    <VCol md="12" cols="6">
      <VBtn
        id="ae2-add-section-btn"
        block
        class="mb-md-2"
        color="primary"
        variant="elevated"
        :size="mobile ? 'small' : undefined"
        @click="emit('add-section')"
      >
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-plus</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Agregar sección</span>
      </VBtn>
    </VCol>
    <VCol md="12" cols="6">
      <VBtn
        id="ae2-add-tag-btn"
        block
        class="mb-md-2"
        color="secondary"
        variant="outlined"
        :size="mobile ? 'small' : undefined"
        @click="emit('add-tag')"
      >
        <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-label</VIcon>
        <span :class="{ 'd-none d-sm-inline': mobile }">Agregar etiqueta</span>
      </VBtn>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
/**
 * Trimmed side-panel controls for Auditorium Editor v2.
 * Only add-section / add-tag — no CSV/JSON toggle, no global seat sliders,
 * no clear-categories (those belonged to the v1 stacking editor).
 */
const emit = defineEmits<{
  (e: "add-section"): void
  (e: "add-tag"): void
}>()

const { mobile, mdAndUp } = useDisplay()
</script>
