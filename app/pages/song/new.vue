<template>
  <VContainer :fluid="true">
    <VRow justify="center">
      <VCol md="10" cols="12">
        <!-- JSON import / export toolbar for new song -->
        <div class="d-flex align-center flex-wrap mb-3">
          <VBtn
            id="song-new-load-json-btn"
            size="small"
            color="primary"
            class="mr-2 mb-1"
            variant="outlined"
            @click="triggerLoadJson"
          >
            <VIcon start>mdi-file-upload-outline</VIcon>
            Cargar JSON
          </VBtn>
          <VBtn
            id="song-new-export-json-btn"
            class="mb-1"
            size="small"
            color="primary"
            variant="outlined"
            @click="triggerExportJson"
          >
            <VIcon start>mdi-file-download-outline</VIcon>
            Exportar JSON
          </VBtn>
          <input
            id="song-new-json-file-input"
            ref="jsonFileInput"
            type="file"
            style="display: none"
            accept=".json,application/json"
            @change="onJsonFileChange"
          />
        </div>
        <SongEditor
          ref="editorRef"
          :loading="saving"
          permission="song-create"
          :song="importedSong as Record<string, unknown>"
          @close="close"
          @save="saveSong"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { exportSongToJson, importSongFromJson, normalizeContent } from "~/types/song"

definePageMeta({
  title: "Nueva canción",
  icon: "mdi-music-note-plus",
  permission: "song-create",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { Song } = useRepository()
const notify = useNotifyStore()

const saving = ref(false)
const jsonFileInput = ref<HTMLInputElement | null>(null)
const importedSong = ref<Record<string, unknown> | null>(null)
const editorRef = ref<{ exportJson?: () => void } | null>(null)

onMounted(() => {
  route.meta.back = "/song"
})

function triggerLoadJson() {
  jsonFileInput.value?.click()
}

function triggerExportJson() {
  // Prefer editor's own export (has latest item state), fallback to local export
  if (editorRef.value && typeof (editorRef.value as unknown as { exportJson?: () => void }).exportJson === "function") {
    ;(editorRef.value as unknown as { exportJson: () => void }).exportJson()
    return
  }
  // Fallback: export importedSong or empty
  const songData = (importedSong.value as unknown as { title?: string; content?: unknown }) ?? { title: "cancion", content: normalizeContent(null) }
  const payload = exportSongToJson({
    title: (songData.title as string) ?? "",
    artist: (songData as Record<string, unknown>).artist as string ?? "",
    key: (songData as Record<string, unknown>).key as string ?? "",
    tempo: (songData as Record<string, unknown>).tempo as string ?? "",
    org_id: null,
    content: normalizeContent(songData.content),
  } as unknown as import("~/types/song").Song)
  const jsonStr = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const slug = ((payload.title as string) || "cancion").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
  a.href = url
  a.download = `${slug || "cancion"}.json`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}

function onJsonFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string)
      const imported = importSongFromJson(parsed)
      importedSong.value = {
        title: imported.title,
        artist: imported.artist,
        key: imported.key,
        tempo: imported.tempo,
        org_id: null,
        content: imported.content,
      } as unknown as Record<string, unknown>
      notify.notify({ success: `JSON cargado: ${(imported.title as string) || file.name}` })
    } catch (err) {
      notify.notify({ error: `Error al cargar JSON: ${(err as Error).message}` })
    } finally {
      if (input) input.value = ""
    }
  }
  reader.onerror = () => {
    notify.notify({ error: "No se pudo leer el archivo." })
    if (input) input.value = ""
  }
  reader.readAsText(file)
}

function close() {
  navigateTo("/song")
}

async function saveSong(item: Record<string, unknown>) {
  const payload = { ...item }
  // org_id is now global/optional – always null
  payload.org_id = null

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