<template>
  <div id="cmp-my-tracking-log-table">
    <VDataTableServer
      id="mtl-table-items-dt-1"
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
      class="elevation-1"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn
          :id="`mtl-table-view-btn-${item.id}`"
          icon
          class="ma-1"
          size="small"
          color="success"
          rounded="circle"
          title="Ver miembro"
          variant="outlined"
          @click="emit('view', item)"
        >
          <VIcon size="x-large">mdi-eye</VIcon>
        </VBtn>
      </template>

      <template #[`item.churchMember`]="{ item }">
        {{ item.churchMember ? `${item.churchMember.name} ${item.churchMember.last_name}` : "N/A" }}
      </template>

      <template #[`item.medium`]="{ item }">
        <VChip size="small" variant="flat" :color="mediumColor(item.medium as string)">
          <VIcon start size="small">{{ mediumIcon(item.medium as string) }}</VIcon>
          {{ mediumLabel(item.medium as string) }}
        </VChip>
      </template>

      <template #[`item.contact_datetime`]="{ item }">
        {{ formatShortDateTime12h(item.contact_datetime as string) }}
      </template>

      <template #[`item.created_at`]="{ item }">
        {{ formatShortDateTime12h(item.created_at as string) }}
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
  align?: string;
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
    initialSortBy: () => [{ key: "contact_datetime", order: "desc" }],
  },
);

const emit = defineEmits<{
  (e: "sorting", val: Record<string, unknown>): void;
  (e: "view", val: unknown): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref<{ key: string; order: string }[]>([...props.initialSortBy]);

const headers: Header[] = [
  { title: "Miembro", value: "churchMember", sortable: false },
  { title: "Medio", value: "medium", sortable: true },
  { title: "Fecha contacto", value: "contact_datetime", sortable: true },
  { title: "Descripción", value: "description", sortable: false },
  { title: "Creado", value: "created_at", sortable: true },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "100px" },
];

const total = computed(() => props.response?.total ?? 0);
const items = computed(() => props.response?.data ?? []);
const loading = computed(() => props.loading ?? false);

const rowProps = rowPropsFor(() => props.highlightId);

function mediumColor(medium: string): string {
  const colors: Record<string, string> = {
    whatsapp: "green",
    llamada: "primary",
    presencial: "deep-orange",
    sms: "teal",
  };
  return colors[medium] || "grey";
}

function mediumIcon(medium: string): string {
  const icons: Record<string, string> = {
    whatsapp: "mdi-whatsapp",
    llamada: "mdi-phone",
    presencial: "mdi-account-group",
    sms: "mdi-message-text",
  };
  return icons[medium] || "mdi-help";
}

function mediumLabel(medium: string): string {
  const labels: Record<string, string> = {
    whatsapp: "WhatsApp",
    llamada: "Llamada",
    presencial: "Presencial",
    sms: "SMS",
  };
  return labels[medium] || medium;
}

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val);
}
</script>

<style scoped></style>
