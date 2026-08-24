<template>
  <div id="cmp-consolidation-member-table">
    <VDataTable
      :id="id"
      :items="members"
      density="compact"
      :headers="headers"
      :loading="loading"
      hide-default-footer
      :items-per-page="-1"
      mobile-breakpoint="0"
      class="elevation-1 xwidth1100"
    >
      <template #[`item.status`]="{ item }">
        <VSelect
          id="det-member-status"
          hide-details
          density="compact"
          :items="statuses"
          item-title="title"
          item-value="value"
          variant="outlined"
          class="status-select"
          :model-value="item.status"
          :class="statusBgClass(item.status)"
          @update:model-value="onStatusChange(item, $event)"
        />
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <VBtn
            id="con-membertable-goto-btn"
            icon
            class="ma-1"
            size="small"
            color="primary"
            rounded="circle"
            variant="outlined"
            title="Ver miembro"
            :href="`/church-member/${item.id}?from=${encodeURIComponent(route.fullPath)}`"
          >
            <VIcon size="x-large">mdi-eye</VIcon>
          </VBtn>
        </div>
      </template>

      <template #[`item.years_old`]="{ item }">
        {{ item.years_old ?? "—" }}
      </template>

      <template #[`item.number_of_children`]="{ item }">
        {{ item.number_of_children ?? "—" }}
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-account-group</VIcon>
          <span class="text-body-1 text-grey ml-1"
            >No hay miembros registrados</span
          >
        </div>
      </template>
    </VDataTable>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

interface Header {
  title: string;
  value: string;
  sortable: boolean;
  align?: string;
  width?: string;
}

withDefaults(
  defineProps<{
    id?: string;
    members?: unknown[];
    loading?: boolean;
  }>(),
  {
    id: "con-membe-members-dt-1",
    members: () => [],
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "status-change", item: unknown, status: string): void;
}>();

const statuses = [
  { title: "Activo", value: "ACTIVO" },
  { title: "No contesta", value: "NO CONTESTA" },
  { title: "No molestar", value: "NO MOLESTAR" },
  { title: "Visita", value: "VISITA" },
];

const statusColors: Record<string, string> = {
  ACTIVO: "green",
  "NO CONTESTA": "amber",
  "NO MOLESTAR": "red",
  VISITA: "blue",
};

function statusLabel(status: unknown): string {
  const found = statuses.find((s) => s.value === status);
  return found ? found.title : String(status ?? "Sin estado");
}

function statusColor(status: unknown): string {
  return statusColors[String(status)] ?? "grey";
}

function statusBgClass(status: unknown): string {
  const map: Record<string, string> = {
    ACTIVO: "status-bg-activo",
    "NO CONTESTA": "status-bg-no-contesta",
    "NO MOLESTAR": "status-bg-no-molestar",
    VISITA: "status-bg-visita",
  };
  return map[String(status)] ?? "";
}

function onStatusChange(item: Record<string, unknown>, status: string) {
  emit("status-change", item, status);
}

const headers: Header[] = [
  { title: "Nombre", value: "name" },
  { title: "Apellido Paterno", value: "last_name" },
  // { title: "Apellido Materno", value: "second_last_name" },
  { title: "Edad", value: "years_old" },
  // { title: "Hijos", value: "number_of_children" },
  { title: "Celular", value: "cellphone" },
  { title: "Dirección", value: "address" },
  { title: "Estado Civil", value: "marriage_status" },
  {
    title: "Estado",
    width: "170px",
    value: "status",
    sortable: false,
    align: "center",
  },
  {
    title: "Acciones",
    value: "actions",
    sortable: false,
    align: "center",
    width: "80px",
  },
];
</script>

<style scoped>
.status-select {
  max-width: 170px;
}

:deep(.status-bg-activo.v-field) {
  background-color: rgba(76, 175, 80, 0.12) !important;
  border-color: rgba(76, 175, 80, 0.4) !important;
}

:deep(.status-bg-no-contesta.v-field) {
  background-color: rgba(255, 193, 7, 0.12) !important;
  border-color: rgba(255, 193, 7, 0.4) !important;
}

:deep(.status-bg-no-molestar.v-field) {
  background-color: rgba(244, 67, 54, 0.12) !important;
  border-color: rgba(244, 67, 54, 0.4) !important;
}

:deep(.status-bg-visita.v-field) {
  background-color: rgba(33, 150, 243, 0.12) !important;
  border-color: rgba(33, 150, 243, 0.4) !important;
}
</style>
