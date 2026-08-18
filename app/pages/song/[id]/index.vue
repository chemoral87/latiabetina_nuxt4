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
            <SongViewer :content="song.content" />
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
  permission: "song-index",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { Song } = useRepository()

const loadingItem = ref(true)
const song = ref<Record<string, unknown>>({})

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

onMounted(() => {
  const title = (song.value.title as string) || ""
  route.meta.title = title ? `Canción - ${title}` : "Canción"
  route.meta.icon = "mdi-music-note-eighth"
  route.meta.back = "/song"
})
</script>

<style scoped></style>