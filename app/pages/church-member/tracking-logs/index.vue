<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <VCol md="3" sm="4" cols="12">
        <VTextField
          id="mtl-index-filter"
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
          id="mtl-index-medium"
          v-model="filterMedium"
          clearable
          hide-details
          label="Medio"
          density="compact"
          variant="outlined"
          :items="mediumOptions"
        />
      </VCol>
      <VCol md="3" sm="4" cols="12">
        <MyDateRange v-model="filterDateRange" variant="outlined" />
      </VCol>
      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="mtl-refresh-btn"
          color="primary"
          :loading="loading"
          @click="fetchData"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>
      <VCol cols="12">
        <ChurchMemberMyTrackingLogTable
          :loading="loading"
          :response="response"
          :search="filterTerm"
          :highlight-id="highlightId"
          :initial-sort-by="lastOptions.sortBy as any"
          @view="viewMember"
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
  title: "Mi Actividad de Seguimiento",
  icon: "mdi-account-search",
  permission: "church-member-tracking-logs-index",
  middleware: ["authenticated", "permission"],
});

const { ChurchMemberTrackingLog } = useRepository();
const notify = useNotifyStore();
const { highlightId } = useRowHighlight();

const filterInput = ref("");
const filterTerm = ref("");
const filterMedium = ref<string | null>(null);
const filterDateRange = ref<(Date | string | null)[]>([]);
const loading = ref(false);
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "contact_datetime", order: "desc" }],
});

const mediumOptions = [
  { title: "WhatsApp", value: "whatsapp" },
  { title: "Llamada", value: "llamada" },
  { title: "Presencial", value: "presencial" },
  { title: "SMS", value: "sms" },
];

useDebouncedFilter(filterInput, filterTerm);

{
  const { data: initialData } = await useAsyncData(
    "church-member-tracking-logs-index",
    async () => {
      const apiParams = buildApiParams(lastOptions.value);
      return await ChurchMemberTrackingLog.logsIndex<{ data: unknown[]; total: number }>(
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

function viewMember(item: unknown) {
  const log = item as Record<string, unknown>;
  const member = log.church_member as { id?: number | string } | undefined;
  if (member?.id != null) navigateTo(`/church-member/${member.id}?from=tracking`);
}

async function fetchData(overrides: Record<string, unknown> = {}) {
  loading.value = true;
  try {
    const requestOptions = { ...lastOptions.value, ...overrides };
    const params = buildApiParams(requestOptions);
    if (filterTerm.value && !params.filter) params.filter = filterTerm.value;
    if (filterMedium.value && !params.medium) params.medium = filterMedium.value;
    if (filterDateRange.value?.[0]) params.date_from = filterDateRange.value[0];
    if (filterDateRange.value?.[1]) params.date_to = filterDateRange.value[1];
    const res = await ChurchMemberTrackingLog.logsIndex(params);
    response.value = normalizeResponse(res);
    lastOptions.value = requestOptions;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar actividad",
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
watch(filterMedium, () => fetchData({ page: 1 }));
watch(filterDateRange, () => fetchData({ page: 1 }), { deep: true });
</script>

<style scoped></style>
