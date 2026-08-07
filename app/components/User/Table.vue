<template>
  <div id="cmp-user-table">
    <VDataTableServer
      id="usr-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      mustSort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      class="elevation-1"
      :items-length="total"
      :row-props="rowProps"
      :search="props.search"
      initial-sort-order="asc"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.roles`]="{ item }">
        <VChip
          v-for="it in (item as Record<string, unknown>).roles as Record<
            string,
            unknown
          >[]"
          :key="it.id as number"
          class="ma-2"
          color="primary"
          variant="elevated"
        >
          {{ it.name as string }}
        </VChip>
      </template>
      <template #[`item.direct_permissions`]="{ item }">
        <VChip
          v-for="it in (item as Record<string, unknown>).permissions as Record<
            string,
            unknown
          >[]"
          :key="it.id as number"
          class="ma-2"
          color="info"
          variant="elevated"
        >
          {{ it.name as string }}
        </VChip>
      </template>
      <template #[`item.actions`]="{ item }">
        <VBtn
          id="usr-table-edit-btn"
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
          id="usr-table-profiles-btn"
          icon
          class="ma-1"
          size="small"
          color="success"
          rounded="circle"
          title="Perfiles"
          variant="outlined"
          @click="emitEditProfiles(item)"
        >
          <VIcon size="x-large">mdi-shield-key-outline</VIcon>
        </VBtn>
        <VBtn
          id="usr-table-delete-btn"
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
  (e: "editProfiles", val: unknown): void;
  (e: "delete", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "name", order: "asc" },
]);
const dialogDeleteProp = ref<Record<string, unknown>>({});

const headers: Header[] = [
  { title: "Nombre", value: "name", sortable: true },
  { title: "Ap. Paterno", value: "last_name", sortable: true },
  { title: "Ap. Materno", value: "second_last_name", sortable: true },
  { title: "E-Mail", value: "email", sortable: true },
  // { title: "Roles", value: "roles", sortable: false },
  // { title: "Permisos Directos", value: "direct_permissions", sortable: false },
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
  const i = item as Record<string, unknown>;
  dialogDeleteProp.value = {
    text: "Desea eliminar el Usuario ",
    strong: `${i.name ?? ""} ${i.last_name ?? ""} ${i.second_last_name ?? ""}`,
    payload: item,
  };
  emit("update:dialogDelete", true);
}

function emitEdit(item: unknown) {
  emit("edit", item);
}
function emitEditProfiles(item: unknown) {
  emit("editProfiles", item);
}
</script>

<style scoped></style>
