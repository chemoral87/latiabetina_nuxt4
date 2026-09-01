<template>
  <VDialog id="song-paste-dlg" persistent max-width="700px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-content-paste</VIcon>
        Pegar letra
        <VSpacer />
        <VBtn id="song-paste-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VTextarea
          id="song-paste-text"
          v-model="text"
          auto-grow
          rows="10"
          persistent-hint
          density="compact"
          variant="outlined"
          label="Pega la letra con acordes"
          placeholder="[CORO]&#10;G&#10;Fe&#10;&#10;D&#10;es la certeza de lo que se espera"
          hint="Las líneas [Nombre] crean secciones. Los acordes en su propia línea se asignan a la primera sílaba de la siguiente línea. Las líneas de tablatura (e|---) se guardan como tabs."
        />
        <VRadioGroup id="song-paste-mode" v-model="mode" inline hide-details density="compact">
          <VRadio value="replace" label="Reemplazar contenido" />
          <VRadio value="append" label="Agregar al final" />
        </VRadioGroup>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="song-paste-cancel-btn" class="mr-4" color="primary" variant="outlined" @click="close">
          Cancelar
        </VBtn>
        <VBtn id="song-paste-apply-btn" color="primary" variant="elevated" :disabled="!text.trim()" @click="apply">
          <VIcon start>mdi-check</VIcon>
          Aplicar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void
  (e: "apply", text: string, mode: "replace" | "append"): void
}>()

const text = ref("")
const mode = ref<"replace" | "append">("replace")

function close() {
  emit("close")
}

function apply() {
  emit("apply", text.value, mode.value)
}
</script>

<style scoped></style>