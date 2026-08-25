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
          <VBtn
            id="con-membertable-delete-btn"
            icon
            class="ma-1"
            size="small"
            color="error"
            rounded="circle"
            variant="outlined"
            title="Eliminar miembro"
            @click="emit('delete', item)"
          >
            <VIcon size="x-large">mdi-delete</VIcon>
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
import { useChurchMemberStatus } from "~/composables/useChurchMemberStatus"

const route = useRoute()
const { statuses, statusBgClass } = useChurchMemberStatus()

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
  (e: "delete", item: unknown): void;
}>();

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
    width: "120px",
  },
];
</script>

<style scoped>
.status-select {
  max-width: 170px;
}
</style>
