<template>
  <VContainer :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol md="2" cols="12">
          <VSelect
            id="le-index-level"
            v-model="filterLevel"
            hide-details
            label="Nivel"
            density="compact"
            variant="outlined"
            :items="levelOptions"
          />
        </VCol>
        <VCol md="2" sm="4" cols="6">
          <VTextField
            id="le-index-filter"
            v-model="filterInput"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            placeholder="Buscar..."
            append-inner-icon="mdi-magnify"
          />
        </VCol>
        <VCol cols="auto" class="d-flex align-center">
          <VBtn id="le-refresh-btn" color="primary" :loading="loading" variant="outlined" @click="fetchLogs">
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
          <VBtn id="le-test-error-btn" color="error" variant="outlined" @click="testError">
            <VIcon start>mdi-alert-outline</VIcon>
            Probar Error
          </VBtn>
        </VCol>
      </VRow>

      <VRow density="compact">
        <VCol cols="12">
          <VDataTableServer
            v-model:sort-by="sortBy"
            must-sort
            :items="logs"
            density="compact"
            :headers="headers"
            :loading="loading"
            class="elevation-1"
            :items-length="total"
            mobile-breakpoint="0"
            @update:options="onUpdateOptions"
          >
            <template #header.level>Nivel</template>
            <template #item.level="{ item }">
              <VChip size="small" variant="elevated" :color="levelColor(item.level)">{{ item.level }}</VChip>
            </template>
            <template #header.channel>Canal</template>
            <template #item.channel="{ item }">{{ item.channel || '-' }}</template>
            <template #header.message>Mensaje</template>
            <template #item.message="{ item }">{{ item.message || '-' }}</template>
            <template #header.context>Contexto</template>
            <template #item.context="{ item }">
              <div v-if="item.context">{{ JSON.stringify(item.context) }}</div>
              <div v-else>—</div>
            </template>
            <template #header.created_at>Fecha</template>
            <template #item.created_at="{ item }">{{ formatCreated(item.created_at) || '—' }}</template>
            <template #no-data>
              <div class="text-center pa-4">
                <VIcon color="grey-lighten-1">mdi-alert-circle-outline</VIcon>
                <span class="text-body-1 text-grey ml-1">No hay errores registrados</span>
              </div>
            </template>
          </VDataTableServer>
        </VCol>
      </VRow>
    </VSheet>
  </VContainer>
</template>

<script setup lang="ts">
import { formatShortDateTime } from "~/utils/date";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Errores",
  icon: "mdi-alert-circle-outline",
  permission: "log-entry-index",
  middleware: ["authenticated", "permission"],
});

const { LogEntry } = useRepository();

const filterInput = ref("");
const filterLevel = ref("");
const loading = ref(false);
const logs = ref<Record<string, unknown>[]>([]);
const total = ref(0);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "created_at", order: "desc" },
]);
const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
});

const levelOptions = [
  { title: "DEBUG", value: "debug" },
  { title: "INFO", value: "info" },
  { title: "NOTICE", value: "notice" },
  { title: "WARNING", value: "warning" },
  { title: "ERROR", value: "error" },
  { title: "CRITICAL", value: "critical" },
  { title: "ALERT", value: "alert" },
  { title: "EMERGENCY", value: "emergency" },
];

const headers = computed<{ title: string; value: string; sortable?: boolean }[]>(() => [
  { title: "Nivel", value: "level", sortable: true },
  { title: "Canal", value: "channel" },
  { title: "Mensaje", value: "message" },
  { title: "Contexto", value: "context" },
  { title: "Fecha", value: "created_at", sortable: true },
]);

function levelColor(level: unknown): string {
  const l = String(level ?? "").toLowerCase();
  const map: Record<string, string> = {
    debug: "info",
    info: "info",
    notice: "info",
    warning: "warning",
    error: "error",
    critical: "error",
    alert: "error",
    emergency: "error",
  };
  return map[l] ?? "grey";
}

function formatCreated(value: unknown): string {
  if (!value) return "";
  return formatShortDateTime(String(value)) || "";
}

async function fetchLogs() {
  loading.value = true;
  const params: Record<string, unknown> = {
    page: lastOptions.value.page,
    itemsPerPage: lastOptions.value.itemsPerPage,
  };
  if (sortBy.value.length) {
    params["sortBy"] = sortBy.value.map((s) => s.key);
    params["sortDesc"] = sortBy.value.map((s) => (s.order === "desc" ? "true" : "false"));
  }
  if (filterLevel.value) params.level = filterLevel.value;
  if (filterInput.value) params.filter = filterInput.value;

  try {
    const res = await LogEntry.index<{ data: unknown[]; total: number }>(params);
    logs.value = Array.isArray(res?.data) ? res.data : [];
    total.value = Number(res?.total ?? 0);
  } catch (error) {
    console.error("Error al cargar registros de error", error);
    logs.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onUpdateOptions(opts: Record<string, unknown>) {
  lastOptions.value = { ...lastOptions.value, ...opts };
  const newSortBy = (opts.sortBy as { key: string; order: string }[]) ?? [];
  if (newSortBy.length) sortBy.value = newSortBy;
  fetchLogs();
}

watch(filterLevel, fetchLogs);

async function testError() {
  try {
    await LogEntry.testError<{ success: boolean }>();
    await fetchLogs();
  } catch (error) {
    console.error("Error al disparar prueba de error", error);
  }
}

{
  await fetchLogs();
}
</script>

<style scoped></style>
