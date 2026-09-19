<template>
  <VDialog id="rel-completion-dlg" persistent max-width="340" :model-value="show" @update:model-value="emit('update:show', $event)">
    <VCard id="rel-completion-card" rounded="xl" class="text-center pa-4">
      <div class="celebration-icon mb-2">🎉</div>
      <VCardTitle class="text-h6 justify-center pb-1">¡Felicidades!</VCardTitle>
      <VCardText class="text-body-1 pb-2">
        Completaste la rutina de
        <strong>{{ goalTime }} minuto{{ goalTime !== 1 ? 's' : '' }}</strong>.<br />
        ¡Excelente trabajo!
      </VCardText>
      <div class="d-flex justify-center">
        <VBtn id="rel-close-btn" rounded elevation="2" color="purple-darken-2" @click="emit('close')">
          <VIcon start size="small">mdi-refresh</VIcon>
          Volver a empezar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
  defineProps<{ show: boolean; goalTime: number }>()
  const emit = defineEmits<{
    'update:show': [value: boolean]
    close: []
  }>()
</script>

<style scoped>
  .celebration-icon { font-size: 3rem; line-height: 1; }
</style>
