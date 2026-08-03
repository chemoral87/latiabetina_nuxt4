<template>
  <VDialog id="dlg-dialo-confi-1" :model-value="true" persistent max-width="450px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="warning">mdi-alert</VIcon>
        {{ title }}
        <VSpacer />
        <VBtn icon size="x-small" id="btn-dialog-confirm-close" @click="emit('cancel')">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>
      <VCardText class="text-body-1 py-4">
        {{ message }}
      </VCardText>
      <div class="d-flex justify-end px-4 pb-4">
        <VBtn color="primary" variant="outlined" class="mr-4" id="btn-dialog-confirm-cancel" @click="emit('cancel')">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn color="error" variant="outlined" class="mr-4" id="btn-dialog-confirm-nosave" @click="emit('no')">
          <VIcon start>mdi-close</VIcon>
          No guardar
        </VBtn>
        <VBtn color="primary" variant="elevated" id="btn-dialog-confirm-save" @click="emit('yes')">
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
