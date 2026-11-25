<template>
  <VContainer :fluid="true" class="page-consolidation-my">
    <VSheet rounded class="pa-1" color="white" elevation="3">
      <VRow density="compact">
        <VCol md="2" sm="4" cols="12">
          <VTextField
            id="cnm-index-filter"
            v-model="filterInput"
            clearable
            hide-details
            label="Folio"
            density="compact"
            variant="outlined"
            inputmode="numeric"
            placeholder="Folio"
            append-inner-icon="mdi-magnify"
          />
        </VCol>
        <VCol cols="auto" class="d-flex align-center">
          <VBtn
            id="cnm-refresh-btn"
            class="mr-4"
            color="primary"
            :loading="loading"
            variant="outlined"
            @click="fetchData"
          >
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
          <VBtn v-if="canCreate" id="cnm-new-btn" color="success" @click="newSheet">
            <VIcon start>mdi-plus</VIcon>
            Nuevo
          </VBtn>
        </VCol>
        <VCol cols="12">
          <ConsolidationTable
            v-model:dialog-delete="dialogDelete"
            :loading="loading"
            :deleting="deleting"
            :response="response"
            :search="filterTerm"
            :can-delete="canDelete"
            :can-update="canUpdate"
            :removing-id="removingId"
            :highlight-id="highlightId"
            :initial-sort-by="lastOptions.sortBy"
            @edit="editSheet"
            @view="viewSheet"
            @delete="deleteSheet"
            @sorting="handleSorting"
          />
        </VCol>
      </VRow>
    </VSheet>

    <ConsolidationDialog
      v-if="dialog"
      id="cnm-sheet-dlg-1"
      :sheet="sheet"
      :loading="saving"
      @save="saveSheet"
      @close="closeDialog"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Mi Consolidación",
  icon: "mdi-clipboard-list",
  permission: "conso-sheet-my-index",
  middleware: ["authenticated", "permission"],
  color: "yellow-lighten-4",
});

const { ConsoSheet } = useRepository();
const auth = useAuthStore();
const canCreate = computed(() => auth.hasPermission("conso-sheet-my-manage"));
const canUpdate = computed(() => auth.hasPermission("conso-sheet-my-manage", "conso-sheet-my-update"));
const canDelete = computed(() => auth.hasPermission("conso-sheet-my-manage", "conso-sheet-my-delete"));
const {
  highlightId,
  prependCreated,
  updateRow,
  removingId,
  removeWithAnimation,
} = useRowHighlight();

const filterInput = ref("");
const filterTerm = ref("");
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const dialog = ref(false);
const dialogDelete = ref(false);
const sheet = ref<Record<string, unknown>>({});
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
type SortBy = { key: string; order: string }[];

const lastOptions = ref<Record<string, unknown> & { sortBy: SortBy }>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "date", order: "desc" }],
});

// Debounced filter - shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterTerm)

watch(filterInput, (v) => {
  const digits = String(v ?? "").replace(/\D/g, "");
  if (digits !== String(v ?? "")) filterInput.value = digits;
})

// Initial list data is loaded during SSR via useAsyncData so the payload is
// reused on the client (no double fetch, no hydration mismatch).
  const { data: initialData } = await useAsyncData(
    "consolidation-my-index",
    async () => {
      const apiParams = buildApiParams(lastOptions.value);
      return await ConsoSheet.myIndex<{ data: unknown[]; total: number }>(
        apiParams,
      ).catch(() => ({ data: [] as unknown[], total: 0 }));
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  );

  response.value = normalizeResponse(initialData.value);
function normalizeResponse(res: unknown): { data: unknown[]; total: number } {
  if (Array.isArray(res)) return { data: res, total: res.length };
  const r = res as { data?: unknown[]; total?: number } | null | undefined;
  if (r && Array.isArray(r.data)) {
    return { data: r.data, total: r.total ?? r.data.length };
  }
  return { data: [], total: 0 };
}

async function fetchData(overrides: Record<string, unknown> = {}) {
  loading.value = true;
  try {
    const requestOptions = { ...lastOptions.value, ...overrides };
    const params = buildApiParams(requestOptions);
    if (filterTerm.value && !params.filter) params.filter = filterTerm.value;
    const res = await ConsoSheet.myIndex(params);
    response.value = normalizeResponse(res);
  } catch {
    // toast comes from withNotify
    response.value = { data: [], total: 0 };
  } finally {
    loading.value = false;
  }
}

function newSheet() {
  useValidationErrors().clearErrors();
  sheet.value = {};
  dialog.value = true;
}

function viewSheet(item: unknown) {
  navigateTo(`/consolidation-my/${(item as Record<string, unknown>).id}/details`);
}

function editSheet(item: unknown) {
  useValidationErrors().clearErrors();
  sheet.value = { ...(item as Record<string, unknown>) };
  dialog.value = true;
}

async function deleteSheet(item: unknown) {
  const s = item as Record<string, unknown>;
  try {
    deleting.value = true;
    await ConsoSheet.myDelete(s.id as number);
    dialogDelete.value = false;
    await removeWithAnimation(response, s.id as number);
  } catch {
    // toast comes from withNotify
  } finally {
    deleting.value = false;
  }
}

async function saveSheet(item: Record<string, unknown>) {
  try {
    saving.value = true;
    const isUpdate = Boolean(item.id);

    if (isUpdate) {
      const res = await ConsoSheet.myUpdate<Record<string, unknown>>(
        item.id as number,
        item,
      );
      updateRow(response, (res as Record<string, unknown>) ?? item);
    } else {
      const res = await ConsoSheet.myCreate<Record<string, unknown>>(item);
      const created = (res as Record<string, unknown>) ?? item;
      prependCreated(response, created);
      dialog.value = false;
      navigateTo(`/consolidation-my/${created.id}/details`);
      return;
    }

    dialog.value = false;
  } catch {
    // toast comes from withNotify
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  dialog.value = false;
  sheet.value = {};
  useValidationErrors().clearErrors();
}
  let initialLoaded = false;


function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true
    return
  }
  fetchData(opts);
}
</script>

<style scoped></style>