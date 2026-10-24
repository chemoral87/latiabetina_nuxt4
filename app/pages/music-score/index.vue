<template><VContainer :fluid="true"><VSheet rounded color="white"><VCardTitle class="d-flex justify-space-between">Partituras <VBtn id="music-score-new-btn" color="primary" @click="navigateTo('/music-score/new')">Nueva</VBtn></VCardTitle><VList><VListItem v-for="item in items" :key="item.id" :title="item.title || `Partitura ${item.id}`" @click="navigateTo(`/music-score/${item.id}/edit`)" /></VList></VSheet></VContainer></template>
<script setup lang="ts">
definePageMeta({ title: 'Partituras', icon: 'mdi-music-clef-treble', middleware: ['authenticated'] })
const { Score } = useRepository()
const result = await Score.index<unknown[] | { data?: unknown[] }>().catch(() => [])
type ScoreItem = { id: number | string; title?: string }
const items = ref<ScoreItem[]>(Array.isArray(result) ? (result as ScoreItem[]) : ((result.data as ScoreItem[]) || []))
</script>
