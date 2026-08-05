<template>
  <VDialog id="dialo-confi-dlg-1" :model-value="true" persistent max-width="450px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="warning">mdi-alert</VIcon>
        {{ title }}
        <VSpacer />
        <VBtn id="dialog-confirm-close-btn" icon size="x-small" @click="emit('cancel')">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>
      <VCardText class="text-body-1 py-4">
        {{ message }}
      </VCardText>
      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="dialog-confirm-cancel-btn" color="primary" variant="outlined" class="mr-4" @click="emit('cancel')">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="dialog-confirm-nosave-btn" color="error" variant="outlined" class="mr-4" @click="emit('no')">
          <VIcon start>mdi-close</VIcon>
          No guardar
        </VBtn>
        <VBtn id="dialog-confirm-save-btn" color="primary" variant="elevated" @click="emit('yes')">
          <VIcon start>mdi-content-save</VIcon>
          Guardar y salir
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message?: string
}>(), {
  title: "Confirmación",
  message: "¿Desea guardar los cambios?",
})

const emit = defineEmits<{
  (e: 'yes'): void
  (e: 'no'): void
  (e: 'cancel'): void
}>()
</script>
