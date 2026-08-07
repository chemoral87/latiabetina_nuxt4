<template>
  <div id="cmp-permission-table">
    <VDataTableServer
      id="per-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      mustSort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      :items-length="total"
      :row-props="rowProps"
      :search="props.search"
      style="max-width: 850px"
      class="elevation-1 xwidth800"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn
          id="per-table-edit-btn"
          icon
          class="ma-1"
          size="small"
          title="Editar"
          color="primary"
          rounded="circle"
          variant="outlined"
          @click="emitEdit(item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn
          id="per-table-distribute-btn"
          icon
          class="ma-1"
          color="info"
          size="small"
          rounded="circle"
          title="Distribuir"
          variant="outlined"
          @click="emitDistribution(item)"
        >
          <VIcon size="x-large">mdi-share-variant</VIcon>
        </VBtn>
        <VBtn
          id="per-table-delete-btn"
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
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-key-variant</VIcon>
          <span class="text-body-1 text-grey">No se encontraron permisos</span>
        </div>
      </template>
    </VDataTableServer>

    <DialogDelete
      v-if="dialogDelete"
      :dialog="dialogDeleteProp"
      @ok="(item) => emit('delete', item)"
      @close="emit('update:dialogDelete', false)"
    />
  </div>
</template>

<script setup lang="ts">
import { rowPropsFor } from "~/composables/useRowHighlight";

interface Header {
  title: string;
  value: string;
  sortable: boolean;
  align?: string;
  width?: string;
}

const props = defineProps<{
  dialogDelete: unknown;
  response?: { total?: number; data?: unknown[] } | null;
  loading?: boolean;
  search?: string;
  highlightId?: number | null;
  removingId?: number | string | null;
}>();

const emit = defineEmits<{
  (e: "update:dialogDelete", val: boolean): void;
  (e: "sorting", val: Record<string, unknown>): void;
  (e: "edit", val: unknown): void;
  (e: "distribution", val: unknown): void;
  (e: "delete", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "name", order: "asc" },
]);
const dialogDeleteProp = ref<Record<string, unknown>>({});

const headers: Header[] = [
  { title: "Nombre", value: "name", align: "start", sortable: true },
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

const rowProps = rowPropsFor(
  () => props.highlightId,
  () => props.removingId,
);

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val);
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "¿Desea eliminar el Permiso ",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  };
  emit("update:dialogDelete", true);
}

function emitEdit(item: unknown) {
  emit("edit", item);
}
function emitDistribution(item: unknown) {
  emit("distribution", item);
}
</script>

<style scoped></style>
