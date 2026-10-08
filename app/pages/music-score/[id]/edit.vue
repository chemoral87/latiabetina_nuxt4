<template><VContainer :fluid="true"><VRow justify="center"><VCol md="10" cols="12"><VCard><VCardTitle>Editar partitura</VCardTitle><VCardText><VTextField id="music-score-edit-title" v-model="title" label="Título" /><ScoreEditor :score="score" :playback-time="playbackTime" @save="score = $event" /><div class="playback-float"><VBtn id="music-score-edit-play-btn" color="primary" :disabled="rendering" @click="togglePlayback">{{ rendering ? 'Generando…' : playing ? 'Pausa' : 'Reproducir' }}</VBtn><VBtn id="music-score-edit-stop-btn" color="white" @click="stopPlayback">Detener</VBtn></div></VCardText><div class="d-flex justify-end ga-2 pa-4"><VBtn id="music-score-edit-cancel-btn" variant="outlined" @click="navigateTo('/music-score')">Cancelar</VBtn><VBtn id="music-score-edit-save-btn" color="primary" @click="save">Guardar</VBtn></div></VCard></VCol></VRow></VContainer></template>
<script setup lang="ts">
import { deserializeScore, normalizeScore } from '~/utils/score'
import { useScorePlayback } from '~/composables/useScorePlayback'
definePageMeta({ title: 'Editar partitura', middleware: ['authenticated'] })
const route = useRoute()
const { Score } = useRepository()
const item = await Score.show<Record<string, unknown>>(route.params.id as string)
const title = ref(String(item.title || ''))
const score = ref(deserializeScore(item.content))
const { playing, preparing: rendering, playbackTime, toggle: togglePlayback, stop: stopPlayback } = useScorePlayback(score)

async function save() {
  stopPlayback()
  await Score.update(Number(route.params.id), { title: title.value, content: normalizeScore(score.value) })
  await navigateTo('/music-score')
}
</script>
<style scoped>
.playback-float { position: fixed; right: 24px; bottom: 24px; z-index: 20; display: flex; gap: 8px; padding: 8px 10px; background: #fff; border-radius: 999px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25); }
</style>
