<template><VContainer :fluid="true"><VRow justify="center"><VCol md="10" cols="12"><VCard><VCardTitle>Nueva partitura</VCardTitle><VCardText><VTextField id="score-new-title" v-model="title" label="Título" /><ScoreEditor :score="score" @save="score = $event" /></VCardText><VCardActions><VBtn id="score-new-cancel-btn" variant="outlined" @click="navigateTo('/music-score')">Cancelar</VBtn><VBtn id="score-new-save-btn" color="primary" @click="save">Guardar</VBtn></VCardActions></VCard></VCol></VRow></VContainer></template>
<script setup lang="ts">
import { emptyScore } from '~/types/score'
definePageMeta({ title: 'Nueva partitura', middleware: ['authenticated'] })
const { Score } = useRepository(); const title = ref(''); const score = ref(emptyScore())
async function save() { await Score.create({ title: title.value, content: score.value }); navigateTo('/music-score') }
</script>
