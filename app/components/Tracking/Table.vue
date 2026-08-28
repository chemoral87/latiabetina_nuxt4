<template>
  <div :id="id">
    <VDataTable
      :items="members"
      density="compact"
      :headers="headers"
      :loading="loading"
      class="elevation-1"
      hide-default-footer
      :items-per-page="-1"
      mobile-breakpoint="0"
      v-model:sort-by="sortBy"
    >
      <template #[`item.name`]="{ item }">
        {{ item.name }} {{ item.last_name }}
      </template>

      <template #[`item.cellphone`]="{ item }">
        {{ item.cellphone || "—" }}
      </template>

      <template #[`item.status`]="{ item }">
        <VChip size="small" :color="statusColor(item.status)">
          {{ statusLabel(item.status) }}
        </VChip>
      </template>

     <template #[`item.last_contacted`]="{ item }">
       {{ formatShortDateTime12h(String(item.last_contacted ?? "")) || "—" }}
     </template>
    
      
      <template #[`item.last_contacted_by`]="{ item }">
        {{ item.last_contacted_by || "—" }}
      </template>
      
     <template #[`item.org_id`]="{ item }">
       {{ orgLabel(item.org_id) }}
     </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          id="seg-table-view-btn"
          icon
          class="ma-1"
          size="small"
          color="primary"
          rounded="circle"
          variant="outlined"
          title="Ver miembro"
          @click="emit('view', item)"
        >
          <VIcon size="x-large">mdi-eye</VIcon>
        </VBtn>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-account-search</VIcon>
          <span class="text-body-1 text-grey ml-1"
            >No hay miembros para mostrar</span
          >
        </div>
      </template>
    </VDataTable>
  </div>
</template>

<script setup lang="ts">
import { formatShortDateTime12h } from "~/utils/date"
import { useChurchMemberStatus } from "~/composables/useChurchMemberStatus"

interface Header {
  title: string;
  value: string;
  sortable: boolean;
  align?: string;
  width?: string;
}

const props = withDefaults(
  defineProps<{
    id?: string;
    members?: unknown[];
    loading?: boolean;
    orgs?: { id: number | string; name: string }[];
  }>(),
  {
    id: "cmp-tracking-table",
    members: () => [],
    loading: false,
    orgs: () => [],
  },
);

const emit = defineEmits<{
  (e: "view", val: unknown): void;
}>();

const auth = useAuthStore();
const { statusLabel, statusColor } = useChurchMemberStatus()

const singleOrg = computed(() => auth.hasSingleOrgFor("conso-sheet-index"));

const sortBy = ref([{ key: "last_contacted", order: "asc" }]);

function orgLabel(id: unknown): string {
  const found = props.orgs.find((o) => String(o.id) === String(id));
  return found ? found.name : "—";
}

const headers = computed<Header[]>(() => {
  const cols: Header[] = [
    {
      title: "",
      value: "actions",
      sortable: false,
      align: "center",
      width: "60px",
    },
    { title: "Nombre", value: "name" },
    { title: "Teléfono", value: "cellphone" },
    { title: "Estado", value: "status", sortable: false, align: "center" },
    { title: "Último contacto", value: "last_contacted", sortable: true },
    { title: "Contactado por", value: "last_contacted_by", sortable: false },
    ];
    if (!singleOrg.value) {
      cols.push({ title: "Organización", value: "org_id", sortable: false });
    }
    return cols;
  });
</script>

<style scoped></style>
