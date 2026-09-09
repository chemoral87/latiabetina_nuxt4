<template>
  <div :id="id">
    <VDataTableServer
      v-model:sort-by="sortBy"
      must-sort
      :items="members"
      density="compact"
      :headers="headers"
      mobile-breakpoint="0"
      :loading="props.loading"
      class="elevation-1 xwidth1000"
      :items-length="members.length"
      @update:options="onUpdateOptions"
    >
      <template #[`item.name`]="{ item }">
        {{ item.name }} {{ item.last_name }}
      </template>

      <template #[`item.years_old`]="{ item }">
        {{ item.years_old ?? "—" }}
      </template>

      <template #[`item.status`]="{ item }">
        <VChip size="small" variant="elevated" :color="statusColor(item.status)">
          {{ statusLabel(item.status) }}
        </VChip>
      </template>

      <template #[`item.last_contacted`]="{ item }">
        <div>
          <div>{{ formatShortDateTime12h(String(item.last_contacted ?? "")) || "—" }}</div>
          <div v-if="item.last_contacted_by" class="text-caption text-medium-emphasis">
            {{ item.last_contacted_by }}
          </div>
        </div>
      </template>

      <template #[`item.creator`]="{ item }">
        {{
          item.creator ? `${item.creator.name} ${item.creator.last_name}` : "—"
        }}
      </template>

      <template #[`item.consolidators`]="{ item }">
        <template v-if="Array.isArray(item.consolidators) && item.consolidators.length">
          <div v-for="c in item.consolidators" :key="c.id">
            {{ c.name }} {{ c.last_name }}
          </div>
        </template>
        <span v-else>—</span>
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
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { formatShortDateTime12h } from "~/utils/date";
import { useChurchMemberStatus } from "~/composables/useChurchMemberStatus";

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
    orgs?: { id: number | string; name: string }[];
    loading?: boolean;
  }>(),
  {
    id: "cmp-tracking-table",
    members: () => [],
    orgs: () => [],
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "view", val: unknown): void;
  (e: "update:options", val: Record<string, unknown>): void;
}>();

const auth = useAuthStore();
const { statusLabel, statusColor } = useChurchMemberStatus();

const singleOrg = computed(() => auth.hasSingleOrgFor("conso-sheet-index"));

const sortBy = ref([{ key: "last_contacted", order: "asc" }]);

function onUpdateOptions(opts: Record<string, unknown>) {
  emit("update:options", opts);
}

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
    { title: "Edad", value: "years_old", sortable: false },
    { title: "Estado", value: "status", sortable: false, align: "center" },
    { title: "Último contacto", value: "last_contacted", sortable: true },
    { title: "Creado por", value: "creator", sortable: false },
    { title: "Consolidadores", value: "consolidators", sortable: false },
  ];
  if (!singleOrg.value) {
    cols.push({ title: "Organización", value: "org_id", sortable: false });
  }
  return cols;
});
</script>

<style scoped></style>
