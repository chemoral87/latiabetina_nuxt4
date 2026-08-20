<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <VCol md="2" sm="4" cols="12">
        <VTextField
          id="cnsld-index-filter"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Filtro"
          append-inner-icon="mdi-magnify"
        />
      </VCol>
      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="cnsld-refresh-btn"
          class="mr-4"
          color="primary"
          :loading="loading"
          @click="fetchData"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="cnsld-new-btn" color="success" @click="newSheet">
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
          :removing-id="removingId"
          :highlight-id="highlightId"
          @edit="editSheet"
          @view="viewSheet"
          @delete="deleteSheet"
          @sorting="handleSorting"
        />
      </VCol>
    </VRow>

    <ConsolidationDialog
      v-if="dialog"
      id="cnsld-sheet-dlg-1"
      :sheet="sheet"
      :loading="saving"
      @save="saveSheet"
      @close="closeDialog"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";

definePageMeta({
  title: "Consolidación",
  icon: "mdi-clipboard-list",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
});

const { ConsoSheet } = useRepository();
const notify = useNotifyStore();
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
const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "id", order: "asc" }],
});

// Debounced filter — 300ms, matches the index page pattern. filterInput is
// bound to the VTextField; filterTerm drives the API call (and the table's
// :search). Clear immediately when the input empties.
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val) {
    filterTerm.value = "";
    return;
  }
  debounceTimer = setTimeout(() => {
    filterTerm.value = val;
  }, 300);
});

// Initial list data is loaded during SSR via useAsyncData so the payload is
// reused on the client (no double fetch, no hydration mismatch).
{
  const { data: initialData } = await useAsyncData(
    "consolidation-index",
    async () => {
      const apiParams: Record<string, unknown> = {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["id"],
        sortDesc: [false],
      };
      return await ConsoSheet.index<{ data: unknown[]; total: number }>(
        apiParams,
      ).catch(() => ({ data: [] as unknown[], total: 0 }));
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  );

  response.value = normalizeResponse(initialData.value);
}

let initialLoaded = false;

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
    const res = await ConsoSheet.index(params);
    response.value = normalizeResponse(res);
    lastOptions.value = requestOptions;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar consolidados",
    });
    response.value = { data: [], total: 0 };
  } finally {
    loading.value = false;
  }
}

function buildApiParams(
  opts: Record<string, unknown>,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    itemsPerPage: opts.itemsPerPage ?? 10,
  };
  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? [];
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key];
    params.sortDesc = [sortBy[0].order === "desc"];
  }
  if (filterTerm.value) params.filter = filterTerm.value;
  return params;
}

function newSheet() {
  useValidationErrors().clearErrors();
  sheet.value = {};
  dialog.value = true;
}

function viewSheet(item: unknown) {
  navigateTo(`/consolidation/${(item as Record<string, unknown>).id}/details`);
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
    await ConsoSheet.delete(s.id as number);
    dialogDelete.value = false;
    await removeWithAnimation(response, s.id as number);
    notify.notify({ success: "Consolidado eliminado exitosamente" });
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al eliminar consolidado",
    });
  } finally {
    deleting.value = false;
  }
}

async function saveSheet(item: Record<string, unknown>) {
  try {
    saving.value = true;
    const isUpdate = Boolean(item.id);

    if (isUpdate) {
      const res = await ConsoSheet.update<Record<string, unknown>>(
        item.id as number,
        item,
      );
      updateRow(response, (res as Record<string, unknown>) ?? item);
    } else {
      const res = await ConsoSheet.create<Record<string, unknown>>(item);
      prependCreated(response, (res as Record<string, unknown>) ?? item);
    }

    notify.notify({
      success: `Consolidado ${isUpdate ? "actualizado" : "creado"} exitosamente`,
    });
    dialog.value = false;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        `Error al ${item.id ? "actualizar" : "crear"} consolidado`,
    });
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  dialog.value = false;
  sheet.value = {};
  useValidationErrors().clearErrors();
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true;
    return;
  }
  fetchData(opts);
}
</script>

<style scoped></style>
