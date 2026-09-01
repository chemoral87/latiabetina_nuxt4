<template>
  <VContainer :fluid="true">
    <VRow justify="center">
      <VCol md="10" cols="12">
        <div v-if="loadingItem" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </div>

        <VCard v-else id="cmp-song-viewer-card">
          <VCardTitle class="d-flex align-start flex-column">
            <div style="width: 100%" class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h6">{{ song.title || "Sin título" }}</div>
                <div v-if="song.artist" class="text-subtitle-1 text-grey">{{ song.artist }}</div>
              </div>
              <div class="text-right d-flex align-center">
                <VChip v-if="song.key" class="mr-2" size="small" color="primary" variant="outlined">{{ song.key }}</VChip>
                <VChip v-if="song.tempo" class="mr-2" size="small" variant="outlined">{{ song.tempo }}</VChip>
              </div>
            </div>
          </VCardTitle>

          <VCardText>
            <div style="gap: 8px" class="d-flex justify-end align-center flex-wrap mb-2 print-hide">
              <div class="d-flex align-center">
                <VBtn
                  id="song-view-columns-1-btn"
                  size="small"
                  title="1 columna"
                  :color="columns === 1 ? 'primary' : undefined"
                  :variant="columns === 1 ? 'flat' : 'outlined'"
                  @click="columns = 1"
                >
                  <VIcon start size="small">mdi-view-sequential</VIcon>
                  1
                </VBtn>
                <VBtn
                  id="song-view-columns-2-btn"
                  class="ml-1"
                  size="small"
                  title="2 columnas"
                  :color="columns === 2 ? 'primary' : undefined"
                  :variant="columns === 2 ? 'flat' : 'outlined'"
                  @click="columns = 2"
                >
                  <VIcon start size="small">mdi-view-column</VIcon>
                  2
                </VBtn>
                <VBtn
                  id="song-view-columns-3-btn"
                  class="ml-1"
                  size="small"
                  title="3 columnas"
                  :color="columns === 3 ? 'primary' : undefined"
                  :variant="columns === 3 ? 'flat' : 'outlined'"
                  @click="columns = 3"
                >
                  <VIcon start size="small">mdi-view-grid</VIcon>
                  3
                </VBtn>
              </div>
              <VBtn
                id="song-view-print-btn"
                size="small"
                color="primary"
                title="Imprimir"
                variant="outlined"
                @click="printSong"
              >
                <VIcon start size="small">mdi-printer</VIcon>
                Imprimir
              </VBtn>
              <VBtn
                id="song-viewer-toggle-repeat-btn"
                size="small"
                variant="outlined"
                :color="expandRepeats ? 'primary' : 'grey'"
                :title="expandRepeats ? 'Mostrar ×' : 'Repetir texto con acordes'"
                @click="expandRepeats = !expandRepeats"
              >
                <VIcon start size="small">{{ expandRepeats ? 'mdi-collapse-all' : 'mdi-repeat' }}</VIcon>
                {{ expandRepeats ? 'Colapsar repeticiones' : 'Expandir repeticiones' }}
              </VBtn>
            </div>
            <SongViewer :columns="columns" :content="song.content as any" :expand-repeats="expandRepeats" />
          </VCardText>

          <div class="d-flex justify-end px-4 pb-4">
            <VBtn id="song-view-back-btn" text class="mr-5" variant="text" color="primary" @click="navigateTo('/song')">
              Volver
            </VBtn>
            <VBtn
              id="song-view-edit-btn"
              color="primary"
              variant="outlined"
              :to="`/song/${song.id}/edit`"
            >
              <VIcon start>mdi-pencil</VIcon>
              Editar
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { normalizeContent } from "~/types/song"

definePageMeta({
  title: "Canción",
  icon: "mdi-music-note-eighth",
  middleware: ["authenticated"],
})

const route = useRoute()
const { Song } = useRepository()

const loadingItem = ref(true)
const song = ref<Record<string, unknown>>({})
const expandRepeats = ref(true)
const columns = ref<1 | 2 | 3>(1)

// Initial load (asyncData equivalent)
{
  try {
    const dbItem = await Song.show<Record<string, unknown>>(
      route.params.id as string,
    )
    song.value = dbItem as Record<string, unknown>
    song.value.content = normalizeContent(song.value.content)
  } catch (e) {
    throw createError({ statusCode: 404, message: "Canción no encontrada" })
  } finally {
    loadingItem.value = false
  }
}

function printSong() {
  window.print()
}

onMounted(() => {
  const title = (song.value.title as string) || ""
  route.meta.title = title ? `Canción - ${title}` : "Canción"
  route.meta.icon = "mdi-music-note-eighth"
  route.meta.back = "/song"
})
</script>

<style scoped>
@media print {
  .print-hide {
    display: none !important;
  }
  #song-view-back-btn,
  #song-view-edit-btn {
    display: none !important;
  }
  #cmp-song-viewer-card {
    box-shadow: none !important;
    border: none !important;
  }
  :deep(.song-viewer) {
    font-family: "Consolas", "SFMono-Regular", "Monaco", "Courier New", monospace;
    font-variant-ligatures: none;
  }
}
</style>

<style>
@media print {
  #lay-nav-drawer,
  #lay-app-bar,
  #lay-nav-list,
  header,
  nav,
  .v-navigation-drawer,
  .v-app-bar,
  .v-toolbar {
    display: none !important;
  }
  .v-main {
    padding: 0 !important;
    --v-layout-top: 0 !important;
  }
  .v-application,
  body {
    background: white !important;
  }
  #cmp-song-viewer-card {
    box-shadow: none !important;
    border: none !important;
    margin: 0 !important;
    max-width: 100% !important;
  }
}
</style>