<template>
  <div style="gap: 4px" class="d-flex flex-wrap">
    <VChip
      v-for="(chip, idx) in chips"
      :id="`crsqi-goto-${idx}`"
      :key="idx"
      size="small"
      :color="chip.color"
      class="question-dot"
      :class="{ 'current-dot': idx === currentIndex }"
      @click="emit('goTo', idx)"
    >
      {{ idx + 1 }}
    </VChip>
  </div>
</template>

<script setup lang="ts">
interface Chip {
  color: string
}

defineProps<{
  chips: Chip[]
  currentIndex: number
}>()

const emit = defineEmits<{
  (e: "goTo", idx: number): void
}>()
</script>

<style scoped>
.question-dot {
  cursor: pointer;
  transition: transform 0.15s ease;
  min-width: 32px;
  justify-content: center;
}
.question-dot:hover {
  transform: scale(1.15);
}
.current-dot {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
