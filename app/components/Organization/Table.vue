<template>
  <div id="cmp-organization-table">
    <VDataTableServer
      id="org-table-items-dt-1"
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
      initial-sort-order="desc"
      class="elevation-1 xwidth800"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn
          id="org-table-edit-btn"
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
          id="org-table-config-btn"
          icon
          class="ma-1"
          color="info"
          size="small"
          title="Config"
          rounded="circle"
          variant="outlined"
          @click="emitConfig(item)"
        >
          <VIcon size="x-large">mdi-cog</VIcon>
        </VBtn>
        <VBtn
          id="org-table-delete-btn"
          icon
          class="ma-1"
          size="small"
          color="error"
          title="Delete"
          rounded="circle"
          variant="outlined"
          @click="confirmDelete(item)"
        >
          <VIcon size="x-large">mdi-delete</VIcon>
        </VBtn>
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
  (e: "config", val: unknown): void;
  (e: "delete", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "name", order: "desc" },
]);
const dialogDeleteProp = ref<Record<string, unknown>>({});

const headers: Header[] = [
  { title: "Nombre", value: "name", sortable: true },
  { title: "Código", value: "short_code", sortable: true },
  { title: "Descripción", value: "description", sortable: true },
  { title: "Acciones", value: "actions", width: "200px", sortable: false },
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
    text: "Desea eliminar ",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  };
  emit("update:dialogDelete", true);
}

function emitEdit(item: unknown) {
  emit("edit", item);
}
function emitConfig(item: unknown) {
  emit("config", item);
}
</script>

<style scoped></style>
