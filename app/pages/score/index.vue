<template><VContainer :fluid="true"><VSheet rounded color="white"><VCardTitle class="d-flex justify-space-between">Partituras <VBtn id="score-new-btn" color="primary" @click="navigateTo('/music-score/new')">Nueva</VBtn></VCardTitle><VList><VListItem v-for="item in items" :key="item.id" :title="item.title || `Partitura ${item.id}`" @click="navigateTo(`/score/${item.id}/edit`)" /></VList></VSheet></VContainer></template>
<script setup lang="ts">
definePageMeta({ title: 'Partituras', icon: 'mdi-music-note', middleware: ['authenticated'] })
const { Score } = useRepository()
const result = await Score.index<unknown[] | { data?: unknown[] }>().catch(() => [])
const items = ref(Array.isArray(result) ? result : result.data || [])
</script>
