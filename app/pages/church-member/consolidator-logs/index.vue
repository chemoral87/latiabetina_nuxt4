<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <VCol md="2" sm="4" cols="12">
        <VTextField
          id="cml-index-filter"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Filtro"
          label="Filtro"
          append-inner-icon="mdi-magnify"
        />
      </VCol>
      <VCol md="2" sm="4" cols="6">
        <VSelect
          id="cml-index-action"
          v-model="filterAction"
          clearable
          hide-details
          label="Acción"
          density="compact"
          variant="outlined"
          :items="actionOptions"
        />
      </VCol>
      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="cml-refresh-btn"
          color="primary"
          :loading="loading"
          @click="fetchData"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>
      <VCol cols="12">
        <ChurchMemberConsolidatorLogTable
          :loading="loading"
          :response="response"
          :search="filterTerm"
          :highlight-id="highlightId"
          :initial-sort-by="lastOptions.sortBy as any"
          @sorting="handleSorting"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Historial de Consolidadores",
  icon: "mdi-history",
  permission: "church-member-consolidator-logs-index",
  middleware: ["authenticated", "permission"],
});

const { ChurchMember } = useRepository();
const notify = useNotifyStore();
const { highlightId } = useRowHighlight();

const filterInput = ref("");
const filterTerm = ref("");
const filterAction = ref<string | null>(null);
const loading = ref(false);
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "id", order: "desc" }],
});

const actionOptions = [
  { title: "Asignado", value: "assigned" },
  { title: "Desasignado", value: "unassigned" },
];

useDebouncedFilter(filterInput, filterTerm);

{
  const { data: initialData } = await useAsyncData(
    "church-member-consolidator-logs-index",
    async () => {
      const apiParams = buildApiParams(lastOptions.value);
      return await ChurchMember.consolidatorLogsIndex<{ data: unknown[]; total: number }>(
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
    if (filterTerm.value && !params.filter) params.filter = filterTerm.value;
    if (filterAction.value && !params.action) params.action = filterAction.value;
    const res = await ChurchMember.consolidatorLogsIndex(params);
    response.value = normalizeResponse(res);
    lastOptions.value = requestOptions;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar historial",
    });
    response.value = { data: [], total: 0 };
  } finally {
    loading.value = false;
  }
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true;
    return;
  }
  fetchData(opts);
}

watch(filterTerm, () => fetchData({ page: 1 }));
watch(filterAction, () => fetchData({ page: 1 }));
</script>

<style scoped></style>
