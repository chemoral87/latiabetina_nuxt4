<template>
  <div class="history-fab">
    <VBtn
      id="song-history-undo-btn"
      size="small"
      elevation="4"
      color="primary"
      variant="elevated"
      :disabled="!canUndo"
      title="Deshacer (Ctrl+Z)"
      @click="emit('undo')"
    >
      <VIcon>mdi-undo</VIcon>
      <VTooltip location="top" activator="parent">Deshacer (Ctrl+Z)</VTooltip>
    </VBtn>
    <VBtn
      id="song-history-redo-btn"
      size="small"
      elevation="4"
      color="primary"
      variant="elevated"
      :disabled="!canRedo"
      title="Rehacer (Ctrl+Y)"
      @click="emit('redo')"
    >
      <VIcon>mdi-redo</VIcon>
      <VTooltip location="top" activator="parent">Rehacer (Ctrl+Y)</VTooltip>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  (e: "undo"): void
  (e: "redo"): void
}>()
</script>

<style scoped>
.history-fab {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  display: flex;
  gap: 8px;
  pointer-events: auto;
}
</style>
