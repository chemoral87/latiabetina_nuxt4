<template>
  <div id="cmp-consolidator-log-table">
    <VDataTableServer
      id="cml-table-items-dt-1"
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
      class="elevation-1"
      :items-length="total"
      :row-props="rowProps"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions">
      <template #[`item.consolidator`]="{ item }">
        {{ asRec(item).consolidator ? `${(asRec(item).consolidator as Record<string, unknown>).name} ${(asRec(item).consolidator as Record<string, unknown>).last_name}` : "N/A" }}
      </template>

      <template #[`item.churchMember`]="{ item }">
        {{ asRec(item).churchMember ? `${(asRec(item).churchMember as Record<string, unknown>).name} ${(asRec(item).churchMember as Record<string, unknown>).last_name}` : "N/A" }}
      </template>

      <template #[`item.changer`]="{ item }">
        {{ asRec(item).changer ? `${(asRec(item).changer as Record<string, unknown>).name} ${(asRec(item).changer as Record<string, unknown>).last_name}` : "N/A" }}
      </template>

      <template #[`item.action`]="{ item }">
        <VChip
          size="small"
          variant="flat"
          :color="asRec(item).action === 'assigned' ? 'success' : 'error'"
        >
          <VIcon start size="small">
            {{ asRec(item).action === 'assigned' ? 'mdi-account-plus' : 'mdi-account-minus' }}
          </VIcon>
          {{ asRec(item).action === 'assigned' ? 'Asignado' : 'Desasignado' }}
        </VChip>
      </template>

      <template #[`item.created_at`]="{ item }">
        {{ formatShortDateTime12h(asRec(item).created_at as string) }}
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-history</VIcon>
          <span class="text-body-1 text-grey ml-1"
            >No se encontraron registros</span
          >
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { rowPropsFor } from "~/composables/useRowHighlight";
import { formatShortDateTime12h } from "~/utils/date";

interface Header {
  title: string;
  value: string;
  sortable: boolean;
  align?: "start" | "center" | "end";
  width?: string;
}

const props = withDefaults(
  defineProps<{
    response?: { total?: number; data?: unknown[] } | null;
    loading?: boolean;
    search?: string;
    highlightId?: number | null;
    initialSortBy?: { key: string; order: string }[];
  }>(),
  {
    response: null,
    loading: false,
    search: "",
    highlightId: null,
    initialSortBy: () => [{ key: "id", order: "desc" }],
  },
);

const emit = defineEmits<{
  (e: "sorting", val: Record<string, unknown>): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const asRec = (i: unknown) => i as Record<string, unknown>;
const sortBy = ref<{ key: string; order: "asc" | "desc" }[]>([...props.initialSortBy] as { key: string; order: "asc" | "desc" }[]);

const headers: Header[] = [
  { title: "Miembro", value: "churchMember", sortable: false },
  { title: "Consolidador", value: "consolidator", sortable: false },
  { title: "Acción", value: "action", sortable: true },
  { title: "Realizado por", value: "changer", sortable: false },
  { title: "Fecha", value: "created_at", sortable: true },
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
