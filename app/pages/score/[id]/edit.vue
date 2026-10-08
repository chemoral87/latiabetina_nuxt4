<template><VContainer :fluid="true"><VRow justify="center"><VCol md="10" cols="12"><VCard><VCardTitle>Editar partitura</VCardTitle><VCardText><VTextField id="score-edit-title" v-model="title" label="Título" /><ScoreEditor :score="score" @save="score = $event" /></VCardText><VCardActions><VBtn id="score-edit-cancel-btn" variant="outlined" @click="navigateTo('/music-score')">Cancelar</VBtn><VBtn id="score-edit-save-btn" color="primary" @click="save">Guardar</VBtn></VCardActions></VCard></VCol></VRow></VContainer></template>
<script setup lang="ts">
import { deserializeScore, normalizeScore } from '~/utils/score'
definePageMeta({ title: 'Editar partitura', middleware: ['authenticated'] })
const route = useRoute(); const { Score } = useRepository(); const item = await Score.show<Record<string, unknown>>(route.params.id as string); const title = ref(String(item.title || '')); const score = ref(deserializeScore(item.content))
async function save() { await Score.update(Number(route.params.id), { title: title.value, content: normalizeScore(score.value) }); navigateTo('/music-score') }
</script>
