<template>
  <VContainer :fluid="true" class="page-tracking-logs-all">
    <VRow density="comfortable">
      <VCol md="4" sm="6" cols="12">
        <MyDateMonthPicker
          id="atl-month-picker"
          v-model="selectedMonth"
          label="Mes"
        />
      </VCol>
      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="atl-refresh-btn" color="primary" :loading="loading" @click="refreshActivity">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>

      <VCol cols="12">
        <VCard id="atl-summary-card" class="mt-2">
          <VCardTitle class="d-flex align-center pa-4">
            <VIcon start color="primary">mdi-account-group</VIcon>
            Resumen por consolidador
            <VSpacer />
            <VChip v-if="summary.length" size="small" color="primary" variant="tonal">
              {{ summary.length }} consolidadores
            </VChip>
          </VCardTitle>
          <VDataTable
            id="atl-summary"
            :items="summary"
            density="compact"
            class="elevation-1"
            hide-default-footer
            :headers="summaryHeaders"
            :items-length="summary.length"
          >
            <template #[`item.actions`]="{ item }">
              <VBtn
                :id="`atl-consolidator-btn-${item.created_by}`"
                icon
                class="ma-1"
                size="small"
                rounded="circle"
                title="Ver actividad"
                :color="selectedConsolidator?.created_by === item.created_by ? 'primary' : undefined"
                :variant="selectedConsolidator?.created_by === item.created_by ? 'flat' : 'outlined'"
                @click="selectConsolidator(item)"
              >
                <VIcon size="x-large">mdi-eye</VIcon>
              </VBtn>
            </template>
            <template #[`item.creator`]="{ item }">
              <span class="font-weight-medium">{{ consolidatorName(item.creator) }}</span>
              <span v-if="item.creator?.email" class="text-grey"> ({{ item.creator.email }})</span>
            </template>
            <template #[`item.total`]="{ item }">
              <VChip size="small" color="primary" variant="tonal">
                {{ item.total }}
              </VChip>
            </template>
            <template #[`item.distinct_members`]="{ item }">
              <span class="font-weight-medium">{{ item.distinct_members ?? 0 }}</span>
            </template>
            <template #[`item.active_members`]="{ item }">
              <VChip size="small" color="green" variant="tonal">
                {{ item.active_members ?? 0 }}
              </VChip>
            </template>
            <template #[`item.inactive_members`]="{ item }">
              <VChip size="small" variant="tonal" color="orange-darken-3">
                {{ item.inactive_members ?? 0 }}
              </VChip>
            </template>
            <template #no-data>
              <div class="text-center text-grey pa-6">
                <VIcon size="48" color="grey-lighten-1">mdi-information-outline</VIcon>
                <p class="mt-2">Sin actividad en el rango seleccionado</p>
              </div>
            </template>
          </VDataTable>
        </VCard>
      </VCol>

      <VCol v-if="selectedConsolidator" cols="12">
        <VCard class="mt-4">
          <VCardTitle class="d-flex align-center pa-4">
            <VBtn
              id="atl-back-btn"
              icon
              class="mr-2"
              size="small"
              variant="text"
              @click="clearSelection"
            >
              <VIcon>mdi-close</VIcon>
            </VBtn>
            <VIcon start color="primary">mdi-account</VIcon>
            {{ consolidatorName(selectedConsolidator.creator) }}
            <VSpacer />
            <VChip size="small" color="primary" variant="tonal">
              {{ selectedConsolidator.total }} registros
            </VChip>
          </VCardTitle>
          <VDivider />
          <VCardText>
            <ChurchMemberAllTrackingLogTable
              :loading="detailLoading"
              :response="detailResponse"
              :initial-sort-by="detailOptions.sortBy as { key: string; order: string }[]"
              @sorting="handleDetailSorting"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Actividad General",
  icon: "mdi-chart-box-outline",
  permission: "church-member-tracking-logs-all",
  middleware: ["authenticated", "permission"],
  color: "orange-lighten-4",
});

interface ActivityLog {
  id: number;
  church_member?: Person;
  creator?: Person;
  contact_datetime?: string;
  medium?: string;
  description?: string;
}

interface Person {
  name?: string;
  last_name?: string;
  email?: string;
}

interface SummaryItem {
  created_by: number;
  total: number;
  distinct_members: number;
  active_members: number;
  inactive_members: number;
  creator?: Person;
}

const summaryHeaders = [
  { title: "", key: "actions", sortable: false, align: "center" as const, width: "60px" },
  { title: "Consolidador", key: "creator", sortable: false },
  { title: "Actividad", key: "total", align: "center" as const, sortable: false },
  { title: "Miembros", key: "distinct_members", align: "center" as const, sortable: false },
  { title: "Activos", key: "active_members", align: "center" as const, sortable: false },
  { title: "Inactivos", key: "inactive_members", align: "center" as const, sortable: false },
];

const route = useRoute();
const { ChurchMemberTrackingLog } = useRepository();
const notify = useNotifyStore();
const now = new Date();
const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
const selectedMonth = ref<string>((route.query.month as string) || currentMonth);
const loading = ref(false);
const summary = ref<SummaryItem[]>([]);
const selectedConsolidator = ref<SummaryItem | null>(null);
const detailLoading = ref(false);
const detailResponse = ref<{ data: ActivityLog[]; total: number }>({ data: [], total: 0 });
const detailOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "created_at", order: "desc" }],
});
let detailRequestId = 0;

async function fetchSummary() {
  loading.value = true;
  try {
    const params: Record<string, unknown> = {};
    if (selectedMonth.value) params.year_month = selectedMonth.value;
    const result = await ChurchMemberTrackingLog.allLogsSummary<SummaryItem[]>(params);
    summary.value = result ?? [];
  } catch (error) {
    notify.notify({
      error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al cargar resumen",
    });
    summary.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchDetail(options: Record<string, unknown> = {}) {
  if (!selectedConsolidator.value) return;
  const requestId = ++detailRequestId;
  detailLoading.value = true;
  try {
    const params = buildApiParams({ ...detailOptions.value, ...options });
    if (selectedMonth.value) params.year_month = selectedMonth.value;
    params.consolidator_id = selectedConsolidator.value.created_by;
    const result = await ChurchMemberTrackingLog.allLogs<{ data: ActivityLog[]; total: number }>(params);
    if (requestId !== detailRequestId) return;
    detailResponse.value = { data: result.data ?? [], total: result.total ?? 0 };
    detailOptions.value = { ...detailOptions.value, ...options };
  } catch (error) {
    if (requestId !== detailRequestId) return;
    notify.notify({
      error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al cargar actividad",
    });
    detailResponse.value = { data: [], total: 0 };
  } finally {
    if (requestId === detailRequestId) detailLoading.value = false;
  }
}

function consolidatorName(creator?: Person) {
  return [creator?.name, creator?.last_name].filter(Boolean).join(" ") || "N/A";
}

function selectConsolidator(consolidator: SummaryItem) {
  selectedConsolidator.value = consolidator;
  detailOptions.value = { page: 1, itemsPerPage: 10, sortBy: [{ key: "created_at", order: "desc" }] };
  fetchDetail({ page: 1 });
}

function clearSelection() {
  selectedConsolidator.value = null;
  detailResponse.value = { data: [], total: 0 };
}

function handleDetailSorting(options: Record<string, unknown>) {
  fetchDetail(options);
}

function refreshActivity() {
  if (selectedConsolidator.value) {
    fetchDetail({ page: 1 });
  } else {
    fetchSummary();
  }
}

watch(selectedMonth, () => {
  selectedConsolidator.value = null;
  detailResponse.value = { data: [], total: 0 };
  fetchSummary();
});

{
  const { data: initialData } = await useAsyncData(
    "church-member-tracking-logs-all-summary",
    () => ChurchMemberTrackingLog.allLogsSummary<SummaryItem[]>(buildApiParams({ year_month: selectedMonth.value })).catch(() => [] as SummaryItem[]),
    { default: () => [] as SummaryItem[] },
  );
  summary.value = initialData.value ?? [];

  const qConsolidatorId = Number(route.query.consolidator_id);
  if (qConsolidatorId) {
    const found = summary.value.find((s) => s.created_by === qConsolidatorId);
    if (found) {
      selectedConsolidator.value = found;
      fetchDetail({ page: 1 });
    }
  }
}
</script>

<style scoped></style>
