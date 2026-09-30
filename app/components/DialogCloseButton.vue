<template>
  <VBtn :id="id" icon size="x-small" :disabled="disabled" @click="emit('close')">
    <VIcon>mdi-close</VIcon>
  </VBtn>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  id?: string
  disabled?: boolean
}>(), {
  id: "dialog-close-btn",
  disabled: false,
})

const emit = defineEmits<{
  (e: "close"): void
}>()
</script>
