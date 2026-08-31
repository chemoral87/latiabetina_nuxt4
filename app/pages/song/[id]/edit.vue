<template>
  <VContainer :fluid="true">
    <VRow justify="center">
      <VCol md="10" cols="12">
        <div v-if="loadingItem" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </div>
        <SongEditor
          v-else
          :song="song"
          :loading="saving"
          permission="song-update"
          @close="close"
          @save="saveSong"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { normalizeContent } from "~/types/song"

definePageMeta({
  title: "Editar canción",
  icon: "mdi-music-note-edit",
  permission: "song-update",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { Song } = useRepository()
const notify = useNotifyStore()

const saving = ref(false)
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
  route.meta.title = title ? `Editar - ${title}` : "Editar canción"
  route.meta.icon = "mdi-music-note-edit"
  route.meta.back = "/song"
})

function close() {
  navigateTo("/song")
}

async function saveSong(item: Record<string, unknown>) {
  const payload = { ...item }
  delete payload.org_id

  try {
    saving.value = true
    await Song.update(payload.id as number, payload)
    navigateTo(`/song/${payload.id}`)
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al actualizar la canción",
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped></style>