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
      :mobile-breakpoint="0"
      class="elevation-1 xwidth1100">
      <template #[`item.status`]="{ item }">
        <VSelect
          :id="`det-member-status-${asRec(item).id}`"
          hide-details
          density="compact"
          :items="statuses"
          item-title="title"
          item-value="value"
          variant="outlined"
          class="status-select"
          :model-value="asRec(item).status"
          :class="statusBgClass(String(asRec(item).status ?? ''))"
          @update:model-value="onStatusChange(asRec(item), $event)"
        />
      </template>

      <template #[`item.eye`]="{ item }">
        <VBtn
          :id="`det-member-goto-btn-${asRec(item).id}`"
          icon
          class="ma-1"
          size="small"
          color="primary"
          rounded="circle"
          variant="outlined"
          title="Ver miembro"
          @click="navigateTo(`${memberBase}/${asRec(item).id}?from=${encodeURIComponent(route.fullPath)}`)"
        >
          <VIcon size="x-large">mdi-eye</VIcon>
        </VBtn>
      </template>
      <template #[`item.actions`]="{ item }">
        <VBtn
          v-if="canDelete"
          :id="`det-member-delete-btn-${asRec(item).id}`"
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
      </template>

      <template #[`item.years_old`]="{ item }">
        {{ asRec(item).years_old ?? "—" }}
      </template>

      <template #[`item.number_of_children`]="{ item }">
        {{ asRec(item).number_of_children ?? "—" }}
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
import { useChurchMemberStatus } from "~/composables/useChurchMemberStatus";

const route = useRoute();
const { statuses, statusBgClass } = useChurchMemberStatus();

interface Header {
  title: string;
  value: string;
  sortable?: boolean;
  align?: "start" | "center" | "end";
  width?: string;
}

const asRec = (i: unknown) => i as Record<string, unknown>;

const props = withDefaults(
  defineProps<{
    id?: string;
    members?: unknown[];
    loading?: boolean;
    canDelete?: boolean;
    my?: boolean;
  }>(),
  {
    id: "con-membe-members-dt-1",
    members: () => [],
    loading: false,
    canDelete: true,
    my: false,
  },
);

// "my" tables open the self-service member page; the shared manager view keeps
// the original route.
const memberBase = computed(() =>
  props.my ? "/church-member-my" : "/church-member",
);

const emit = defineEmits<{
  (e: "status-change", item: unknown, status: string): void;
  (e: "delete", item: unknown): void;
}>();

function onStatusChange(item: Record<string, unknown>, status: unknown) {
  emit("status-change", item, status as string);
}

const headers: Header[] = [
  { title: "", value: "eye", width: "60px" },
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
