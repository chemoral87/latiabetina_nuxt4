<template>
  <VDataTableServer
    id="aud-table-items-dt-1"
    v-model:page="page"
    v-model:sort-by="sortBy"
    v-model:items-per-page="itemsPerPage"
    mustSort
    :items="items"
    density="compact"
    :headers="headers"
    :loading="loading"
    :items-length="total"
    :row-props="rowProps"
    style="max-width: 900px"
    class="elevation-1 xwidth900"
    :items-per-page-options="[10, 15, 30]"
    items-per-page-text="Filas por página"
    @update:options="onUpdateOptions"
  >
    <template #[`item.event_date`]="{ item }">
      {{ formatShortDate(item.event_date) }}
    </template>

    <template #[`item.time`]="{ item }">
      {{ item.time ? formatHourTime(item.time) : "-" }}
    </template>

    <template #[`item.marks`]="{ item }">
      <VBtn
        id="auev-table-mark-btn"
        icon
        class="ma-1"
        size="small"
        title="Marcar"
        color="primary"
        variant="outlined"
        @click="emit('mark', item)"
      >
        <VIcon size="x-large">mdi-eye</VIcon>
      </VBtn>
    </template>

    <template #[`item.actions`]="{ item }">
      <VBtn
        id="auev-table-download-btn"
        icon
        class="ma-1"
        size="small"
        color="success"
        variant="outlined"
        title="Descargar Excel"
        @click="emit('download', item)"
      >
        <VIcon size="x-large">mdi-file-excel</VIcon>
      </VBtn>
      <VBtn
        v-if="auth.hasPermission('auditorium-event-update')"
        id="auev-table-edit-btn"
        icon
        class="ma-1"
        size="small"
        title="Editar"
        color="primary"
        variant="outlined"
        @click="emit('edit', item)"
      >
        <VIcon size="x-large">mdi-pencil</VIcon>
      </VBtn>
      <VBtn
        v-if="auth.hasPermission('auditorium-event-delete')"
        id="auev-table-delete-btn"
        icon
        class="ma-1"
        size="small"
        color="error"
        title="Eliminar"
        variant="outlined"
        @click="emit('delete', item)"
      >
        <VIcon size="x-large">mdi-delete</VIcon>
      </VBtn>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { formatShortDate, formatHourTime } from "~/utils/date";
import { rowPropsFor } from "~/composables/useRowHighlight";

interface Header {
  title: string;
  value: string;
  sortable: boolean;
  width?: string;
}

const props = withDefaults(defineProps<{
  response?: { total?: number; data?: unknown[] } | null;
  options?: Record<string, unknown>;
  loading?: boolean;
  highlightId?: number | null;
  removingId?: number | string | null;
  initialSortBy?: { key: string; order: string }[];
}>(), {
  options: () => ({}),
  initialSortBy: () => [{ key: "event_date", order: "desc" }],
});

const emit = defineEmits<{
  (e: "sorting", val: Record<string, unknown>): void;
  (e: "mark", val: unknown): void;
  (e: "download", val: unknown): void;
  (e: "edit", val: unknown): void;
  (e: "delete", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([...props.initialSortBy]);

const auth = useAuthStore();

// Hide the "Organización" column when the user has only one org for this
// permission — the backend resolves the org from auth context.
const singleOrg = computed(() => auth.hasSingleOrgFor("auditorium-event-index"))

const headers = computed<Header[]>(() => {
  const list: Header[] = [];
  if (auth.hasPermission("auditorium-event-mark")) {
    list.push({ title: "", value: "marks", sortable: false });
  }
  list.push({ title: "Fecha del Evento", value: "event_date", sortable: true });
  list.push({ title: "Hora", value: "time", sortable: false });
  list.push({ title: "Auditorio", value: "auditorium_name", sortable: false });
  if (!singleOrg.value) {
    list.push({ title: "Organización", value: "org_name", sortable: false });
  }
  list.push({
    title: "Acciones",
    value: "actions",
    width: "200px",
    sortable: false,
  });
  return list;
});

const total = computed(() => props.response?.total ?? 0);

const items = computed(() => {
  const data = props.response?.data ?? [];
  return data.map((event) => {
    const e = event as Record<string, unknown>;
    return {
      ...e,
      auditorium_name:
        e.auditorium_name ||
        ((e.auditorium_id as Record<string, unknown>)?.name ?? ""),
      org_name:
        e.org_name || ((e.org_id as Record<string, unknown>)?.name ?? ""),
    };
  });
});

const rowProps = rowPropsFor(
  () => props.highlightId,
  () => props.removingId,
);

onMounted(() => {
  const opts = props.options ?? {};
  page.value = (opts.page as number) ?? 1;
  itemsPerPage.value = (opts.itemsPerPage as number) ?? 10;
  if (Array.isArray(opts.sortBy)) {
    const sb = opts.sortBy as ({ key: string; order: string } | string)[];
    sortBy.value = sb.map((s) =>
      typeof s === "string" ? { key: s, order: "asc" } : s,
    );
  }
});

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val);
}
</script>
