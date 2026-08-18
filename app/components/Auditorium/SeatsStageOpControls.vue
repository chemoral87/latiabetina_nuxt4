<template>
  <div ref="rootEl">
    <div style="gap: 6px" class="d-flex flex-wrap align-center py-1">
      <template v-if="selectedSubsection">
        <VBtn
          id="aud-stageop-main-btn"
          size="small"
          color="primary"
          prepend-icon="mdi-arrow-left"
          @click="emit('main')"
          >Main</VBtn
        >
        <VBtn
          id="aud-stageop-prev-sub-btn"
          icon
          class="ml-1"
          size="x-small"
          color="primary"
          @click="emit('prev')"
        >
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <VBtn
          id="aud-stageop-next-sub-btn"
          icon
          class="ml-1"
          size="x-small"
          color="primary"
          @click="emit('next')"
        >
          <VIcon>mdi-arrow-right</VIcon>
        </VBtn>
      </template>

      <VBtn
        id="aud-stageop-fit-width-btn"
        size="small"
        color="secondary"
        title="Fit Width"
        @click="emit('fit-width')"
      >
        <VIcon>mdi-arrow-expand-horizontal</VIcon>
        Fit
      </VBtn>
      <VBtn
        id="aud-stageop-fit-height-btn"
        size="small"
        color="secondary"
        title="Fit Height"
        @click="emit('fit-height')"
      >
        <VIcon>mdi-arrow-expand-vertical</VIcon>
        Fit
      </VBtn>
      <VBtn
        v-if="selectedSubsection"
        id="aud-stageop-history-btn"
        size="small"
        color="success"
        title="Historial de asientos"
        @click="emit('history')"
      >
        <VIcon start>mdi-history</VIcon>
        Hist
      </VBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Subsection } from "~/types/auditorium"

const props = defineProps<{
  selectedSubsection: Subsection | null
}>()

const emit = defineEmits<{
  (e: 'main'): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'fit-width'): void
  (e: 'fit-height'): void
  (e: 'history'): void
}>()

const rootEl = ref<HTMLElement | null>(null)

defineExpose({
  rootEl,
})
</script>