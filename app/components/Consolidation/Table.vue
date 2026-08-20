<template>
  <div id="cmp-consolidation-table">
    <VDataTableServer
      id="con-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      must-sort
      striped="odd"
      :items="items"
      :search="search"
      density="compact"
      :headers="headers"
      :loading="loading"
      :items-length="total"
      :row-props="rowProps"
      class="elevation-1 xwidth1100"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <VBtn
            id="con-table-view-btn"
            icon
            class="ma-1"
            size="small"
            color="success"
            rounded="circle"
            title="Detalles"
            variant="outlined"
            @click="emit('view', item)"
          >
            <VIcon size="x-large">mdi-clipboard-list</VIcon>
          </VBtn>

          <VBtn
            id="con-table-edit-btn"
            icon
            class="ma-1"
            size="small"
            title="Editar"
            color="primary"
            rounded="circle"
            variant="outlined"
            @click="emit('edit', item)"
          >
            <VIcon size="x-large">mdi-pencil</VIcon>
          </VBtn>

          <VBtn
            id="con-table-delete-btn"
            icon
            class="ma-1"
            size="small"
            color="error"
            rounded="circle"
            title="Eliminar"
            variant="outlined"
            @click="confirmDelete(item)"
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

    <DialogDelete
      v-if="dialogDelete"
      :loading="deleting"
      :dialog="dialogDeleteProp"
      @ok="(item) => emit('delete', item)"
      @close="emit('update:dialogDelete', false)"
    />
  </div>
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
    removingId?: number | string | null;
    dialogDelete?: boolean;
    deleting?: boolean;
  }>(),
  {
    response: null,
    loading: false,
    search: "",
    highlightId: null,
    removingId: null,
    dialogDelete: false,
    deleting: false,
  },
);

const emit = defineEmits<{
  (e: "sorting", val: Record<string, unknown>): void;
  (e: "update:dialogDelete", val: boolean): void;
  (e: "view", val: unknown): void;
  (e: "edit", val: unknown): void;
  (e: "delete", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "id", order: "asc" },
]);

const auth = useAuthStore();

// Hide the "Organización" column when the user has only one org for this
// permission — the backend resolves the org from auth context.
const singleOrg = computed(() => auth.hasSingleOrgFor("conso-sheet-index"));

const headers = computed<Header[]>(() => {
  const list: Header[] = [
    { title: "Folio", value: "folio_number" },
    { title: "Fecha", value: "date" },
  ];
  if (!singleOrg.value) {
    list.push({ title: "Organización", value: "organization" });
  }
  list.push({ title: "Creado por", value: "creator" });
  list.push({
    title: "Acciones",
    value: "actions",
    sortable: false,
    align: "center",
    width: "200px",
  });
  return list;
});

const total = computed(() => props.response?.total ?? 0);
const items = computed(() => props.response?.data ?? []);
const loading = computed(() => props.loading ?? false);

const rowProps = rowPropsFor(
  () => props.highlightId,
  () => props.removingId,
);

const dialogDeleteProp = ref<{
  text?: string;
  strong?: string;
  payload?: unknown;
}>({});

function confirmDelete(item: unknown) {
  const s = item as Record<string, unknown>;
  dialogDeleteProp.value = {
    text: "¿Desea eliminar el Consolidado con folio ",
    strong: String(s.folio_number),
    payload: item,
  };
  emit("update:dialogDelete", true);
}

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val);
}
</script>

<style scoped></style>
