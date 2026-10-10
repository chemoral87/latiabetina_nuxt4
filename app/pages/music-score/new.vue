<template>
  <VContainer :fluid="true">
    <VRow justify="center"><VCol md="10" cols="12">
      <VCard>
        <VCardTitle>Nueva partitura</VCardTitle>
        <VCardText>
          <div class="d-flex align-center ga-2 mb-4">
            <VFileInput id="music-score-new-file-input" v-model="file" :disabled="uploading" label="Importar partitura" :error-messages="uploadError" accept=".mxl,.musicxml,.xml,.mid,.midi,audio/midi" />
            <VBtn id="music-score-new-upload-btn" color="secondary" :loading="uploading" :disabled="!file || uploading" @click="upload">Importar</VBtn>
          </div>
          <VTextField id="music-score-new-title" v-model="title" label="Título" />
          <ScoreEditor :score="score" @save="score = $event" />
        </VCardText>
        <div class="d-flex justify-end ga-2 pa-4">
          <VBtn id="music-score-new-cancel-btn" variant="outlined" @click="navigateTo('/music-score')">Cancelar</VBtn>
          <VBtn id="music-score-new-save-btn" color="primary" @click="save">Guardar</VBtn>
        </div>
      </VCard>
    </VCol></VRow>
  </VContainer>
</template>
<script setup lang="ts">
import { emptyScore, type Score } from '~/types/score'
import { midiBytesToScore } from '~/utils/midiScoreImport'
definePageMeta({ title: 'Nueva partitura', middleware: ['authenticated'] })
const { Score: ScoreRepository } = useRepository()
const title = ref('')
const score = ref(emptyScore())
const file = ref<File[] | File | null>(null)
const uploading = ref(false)
const uploadError = ref('')

async function upload() {
  if (!file.value) return
  uploadError.value = ''
  uploading.value = true
  try {
    const picked = Array.isArray(file.value) ? file.value[0] : file.value
    if (!picked) return
    const name = picked.name.replace(/\.[^.]+$/, '')
    if (/\.midi?$/i.test(picked.name)) {
      score.value = midiBytesToScore(await picked.arrayBuffer())
      title.value = name
      return
    }
    const response = await ScoreRepository.importFile<{ title?: string; content?: Score; data?: { title?: string; content?: Score } }>(picked)
    const imported = response.data ?? response
    if (!imported.content || typeof imported.content !== 'object') throw new Error('La partitura importada no contiene contenido válido.')
    title.value = imported.title || name
    score.value = imported.content
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : 'No se pudo importar la partitura.'
  } finally {
    uploading.value = false
  }
}

async function save() { await ScoreRepository.create({ title: title.value, content: score.value }); await navigateTo('/music-score') }
</script>
