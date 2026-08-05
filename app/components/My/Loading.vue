<template>
  <VDialog id="my-loadi-dlg-1" :model-value="modelValue" persistent content-class="centered-dialog">
    <VContainer class="fill-height d-flex flex-column justify-center align-center">
      <VProgressCircular indeterminate :size="70" :width="7" :color="progressColor" />
      <span v-if="message != null" class="text-h5 mt-4">{{ message }}</span>
    </VContainer>
  </VDialog>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: boolean
  message?: string
  progressColor?: string
}>(), {
  modelValue: false,
  message: "Espere...",
  progressColor: "white",
})
</script>

<style>
.dialog.centered-dialog,
.v-dialog.centered-dialog {
  background: #282c2dad;
  box-shadow: none;
  border-radius: 6px;
  width: auto;
  color: whitesmoke;
}
</style>
