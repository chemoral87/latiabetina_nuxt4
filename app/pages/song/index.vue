<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <VCol md="4" cols="12">
        <VTextField
          id="song-filter"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          label="Buscar canción..."
          append-inner-icon="mdi-magnify"
          placeholder="Buscar canción..."
        />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="song-refresh-btn"
          class="mr-1"
          color="primary"
          :loading="loading"
          @click="refreshSongs"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="song-new-btn" class="mr-1" color="success" @click="newSong">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
      </VCol>

      <VCol cols="12">
        <SongTable
          id="song-table"
          :loading="loading"
          :response="response"
          :highlight-id="highlightId"
          :initial-sort-by="lastOptions.sortBy as any"
          @edit="editSong"
          @view="viewSong"
          @sorting="handleSorting"
          @delete="beforeDeleteSong"
        />
      </VCol>
    </VRow>

    <DialogDelete
      v-if="songDialogDelete"
      id="song-delete-dlg"
      :loading="deleting"
      :dialog="dialogDelete"
      @ok="deleteSong"
      @close="songDialogDelete = false"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Cancionero",
  icon: "mdi-music-note-eighth",
  middleware: ["authenticated"],
});

const { Song } = useRepository();
const notify = useNotifyStore();
const { highlightId } = useRowHighlight();

const filterInput = ref("");
const filterSong = ref("");
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const songDialogDelete = ref(false);
const dialogDelete = ref<Record<string, unknown>>({});
const loading = ref(false);
const deleting = ref(false);
const skipFilterWatch = ref(false);

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "updated_at", order: "desc" }],
});

// SSR initial load — first paint contains the list
const { data: initialData } = await useAsyncData(
  "song-list",
  async () => {
    const apiParams = buildApiParams(lastOptions.value);
    return await Song.index<{ data: unknown[]; total: number }>(
      apiParams,
    ).catch(() => ({ data: [], total: 0 }));
  },
  { default: () => ({ data: [] as unknown[], total: 0 }) },
);
response.value = normalizeResponse(initialData.value);

let initialLoaded = false;

function normalizeResponse(res: unknown): { data: unknown[]; total: number } {
  if (Array.isArray(res)) return { data: res, total: res.length };
  const r = res as { data?: unknown[]; total?: number } | null | undefined;
  if (r && Array.isArray(r.data)) {
    return { data: r.data, total: r.total ?? r.data.length };
  }
  return { data: [], total: 0 };
}

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterSong);

watch(filterSong, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false;
    if (val === "" && filterInput.value !== "") {
      filterInput.value = "";
    }
    return;
  }
  loadSongs({ filter: val || "", page: 1 });
});

async function loadSongs(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true;

    const requestOptions = { ...lastOptions.value, ...overrides };

    if (
      filterSong.value &&
      !Object.prototype.hasOwnProperty.call(overrides, "filter")
    ) {
      requestOptions.filter = filterSong.value;
    }

    const params = buildApiParams(requestOptions);
    const res = await Song.index(params);
    response.value = normalizeResponse(res);
    lastOptions.value = requestOptions;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar canciones",
    });
  } finally {
    loading.value = false;
  }
}

async function refreshSongs() {
  await loadSongs();
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true;
    return;
  }
  loadSongs(opts);
}

function newSong() {
  navigateTo({ path: "/song/new", query: { from: "table" } });
}

function viewSong(item: unknown) {
  navigateTo(`/song/${(item as Record<string, unknown>).id}`);
}

function editSong(item: unknown) {
  navigateTo(`/song/${(item as Record<string, unknown>).id}/edit`);
}

function beforeDeleteSong(item: unknown) {
  const s = item as Record<string, unknown>;
  dialogDelete.value = {
    text: "¿Desea eliminar la canción ",
    strong: (s.title as string) || String(s.id),
    payload: item,
  };
  songDialogDelete.value = true;
}

async function deleteSong(item: unknown) {
  const s = item as Record<string, unknown>;
  try {
    deleting.value = true;
    await Song.delete(s.id as number);
    skipFilterWatch.value = true;
    filterSong.value = "";
    await loadSongs({ page: 1 });
    songDialogDelete.value = false;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al eliminar canción",
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped></style>
