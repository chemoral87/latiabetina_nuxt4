<template>
  <VDataTableServer
    id="dt-conso-table-items-1"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    v-model:sort-by="sortBy"
    density="compact"
    :headers="headers"
    :items="items"
    :items-length="total"
    :loading="loading"
    :row-props="rowProps"
    class="elevation-1"
    striped="odd"
    must-sort
    :search="search"
    items-per-page-text="Filas por página"
    :items-per-page-options="[10, 15, 30]"
    @update:options="onUpdateOptions"
  >
    <template #[`item.actions`]="{ item }">
      <div class="d-flex flex-nowrap justify-center">
        <VBtn
          id="btn-consolidation-table-view"
          title="Detalles"
          color="success"
          variant="outlined"
          icon
          rounded="circle"
          size="small"
          class="ma-1"
          @click="emit('view', item)"
        >
          <VIcon size="x-large">mdi-clipboard-list</VIcon>
        </VBtn>

        <VBtn
          id="btn-consolidation-table-edit"
          title="Editar"
          color="primary"
          variant="outlined"
          icon
          rounded="circle"
          size="small"
          class="ma-1"
          @click="emit('edit', item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>

        <VBtn
          id="btn-consolidation-table-delete"
          title="Eliminar"
          color="error"
          variant="outlined"
          icon
          rounded="circle"
          size="small"
          class="ma-1"
          @click="emit('delete', item)"
        >
          <VIcon size="x-large">mdi-delete</VIcon>
        </VBtn>
      </div>
    </template>

    <template #[`item.creator`]="{ item }">
      {{ item.creator ? item.creator.name : "N/A" }}
    </template>

    <template #[`item.organization`]="{ item }">
      {{ item.organization ? item.organization.name : "N/A" }}
    </template>

    <template #[`item.date`]="{ item }">
      {{ formatShortDate(item.date as string | null) }}
    </template>

    <template #no-data>
      <div class="text-center pa-4">
        <VIcon color="grey-lighten-1">mdi-clipboard-list</VIcon>
        <span class="text-body-1 text-grey ml-1"
          >No se encontraron consolidados</span
        >
      </div>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { rowPropsFor } from "~/composables/useRowHighlight";
import { formatShortDate } from "~/utils/date";

interface Header {
  title: string;
  value: string;
  sortable: boolean;
  align?: string;
  width?: string;
}

const props = withDefaults(
  defineProps<{
    response?: { total?: number; data?: unknown[] } | null;
    loading?: boolean;
    search?: string;
    highlightId?: number | null;
  }>(),
  {
    response: null,
    loading: false,
    search: "",
    highlightId: null,
  },
);

const emit = defineEmits<{
  (e: "sorting", val: Record<string, unknown>): void;
  (e: "view", val: unknown): void;
  (e: "edit", val: unknown): void;
  (e: "delete", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "id", order: "asc" },
]);

const headers: Header[] = [
  { title: "Folio", value: "folio_number" },
  { title: "Fecha", value: "date" },
  { title: "Organización", value: "organization" },
  { title: "Creado por", value: "creator" },
  {
    title: "Acciones",
    value: "actions",
    sortable: false,
    align: "center",
    width: "200px",
  },
];

const total = computed(() => props.response?.total ?? 0);
const items = computed(() => props.response?.data ?? []);
const loading = computed(() => props.loading ?? false);

const rowProps = rowPropsFor(() => props.highlightId);

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val);
}
</script>

<style scoped></style>
