<template>
  <VContainer :fluid="true">
    <VRow justify="center">
      <VCol md="10" cols="12">
        <SongEditor
          :loading="saving"
          permission="song-create"
          @close="close"
          @save="saveSong"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Nueva canción",
  icon: "mdi-music-note-plus",
  permission: "song-index",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { Song } = useRepository()
const notify = useNotifyStore()

const saving = ref(false)

onMounted(() => {
  route.meta.back = "/song"
})

function close() {
  navigateTo("/song")
}

async function saveSong(item: Record<string, unknown>) {
  const payload = { ...item }
  if (payload.org_id && typeof payload.org_id === "object") {
    payload.org_id = (payload.org_id as { id?: unknown }).id
  }

  try {
    saving.value = true
    const res = await Song.create<Record<string, unknown>>(payload)
    const created = (res as Record<string, unknown>)?.data as
      | { id?: number | string }
      | undefined
    navigateTo(created?.id ? `/song/${created.id}` : "/song")
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al crear la canción",
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped></style>