<template>
  <div :id="id">
    <VDataTableServer
      v-model:sort-by="sortBy"
      must-sort
      :items="members"
      density="compact"
      :headers="headers"
      :items-length="total"
      :mobile-breakpoint="0"
      :loading="props.loading"
      class="elevation-1 xwidth1000"
      @update:options="onUpdateOptions">
      <template #[`item.name`]="{ item }">
        {{ asRec(item).name }} {{ asRec(item).last_name }}
      </template>

      <template #[`item.cellphone`]="{ item }">
        {{ maskedCellphone(asRec(item).cellphone) }}
      </template>

      <template #[`item.years_old`]="{ item }">
        {{ asRec(item).years_old ?? "—" }}
      </template>

      <template #[`item.status`]="{ item }">
        <VChip size="small" variant="elevated" :color="statusColor(asRec(item).status as string)">
          {{ statusLabel(asRec(item).status as string) }}
        </VChip>
      </template>

      <template #[`item.last_contacted`]="{ item }">
        <div>
          <div>{{ formatHumanDate(String(asRec(item).last_contacted ?? "")) || "—" }}</div>
          <div v-if="asRec(item).last_contacted_by" class="text-caption text-medium-emphasis">
            {{ asRec(item).last_contacted_by }}
          </div>
        </div>
      </template>

      <template #[`item.creator`]="{ item }">
        {{
          asRec(item).creator ? `${(asRec(item).creator as Record<string, unknown>).name} ${(asRec(item).creator as Record<string, unknown>).last_name}` : "—"
        }}
      </template>

      <template #[`item.consolidators`]="{ item }">
        <template v-if="Array.isArray(asRec(item).consolidators) && (asRec(item).consolidators as unknown[]).length">
          <div v-for="c in asRec(item).consolidators as Record<string, unknown>[]" :key="String(c.id)">
            {{ c.name }} {{ c.last_name }}
          </div>
        </template>
        <span v-else>—</span>
      </template>

      <template #[`item.org_id`]="{ item }">
        {{ orgLabel(asRec(item).org_id) }}
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
import { formatHumanDate } from "~/utils/date";
import { useChurchMemberStatus } from "~/composables/useChurchMemberStatus";

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
    orgs?: { id: number | string; name: string }[];
    loading?: boolean;
    total?: number;
  }>(),
  {
    id: "cmp-tracking-table",
    members: () => [],
    orgs: () => [],
    loading: false,
    total: 0,
  },
);

const emit = defineEmits<{
  (e: "view", val: unknown): void;
  (e: "update:options", val: Record<string, unknown>): void;
}>();

const auth = useAuthStore();
const { statusLabel, statusColor } = useChurchMemberStatus();

const singleOrg = computed(() => auth.hasSingleOrgFor("conso-sheet-index"));

const sortBy = ref<{ key: string; order: "asc" | "desc" }[]>([{ key: "last_contacted", order: "asc" }]);

function onUpdateOptions(opts: Record<string, unknown>) {
  emit("update:options", opts);
}

function orgLabel(id: unknown): string {
  const found = props.orgs.find((o) => String(o.id) === String(id));
  return found ? found.name : "—";
}

function maskedCellphone(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? `-${digits.slice(-6)}` : "—";
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
    { title: "Teléfono", value: "cellphone", sortable: false },
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
