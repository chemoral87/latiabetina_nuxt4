<template>
  <VDataTable
    id="atl-summary"
    :items="items"
    density="compact"
    class="elevation-1"
    hide-default-footer
    :headers="headers"
    :items-length="items.length">
    <template #[`item.actions`]="{ item }">
      <VBtn
        :id="`atl-consolidator-btn-${item.created_by}`"
        icon
        class="ma-1"
        size="small"
        rounded="circle"
        title="Ver actividad"
        :color="selectedId === item.created_by ? 'primary' : undefined"
        :variant="selectedId === item.created_by ? 'flat' : 'outlined'"
        @click="emit('select', item)"
      >
        <VIcon size="x-large">mdi-eye</VIcon>
      </VBtn>
    </template>
    <template #[`item.creator`]="{ item }">
      <span class="font-weight-medium">{{ formatName(item.creator) }}</span>
      <span v-if="item.creator?.email" class="text-grey"> ({{ item.creator.email }})</span>
    </template>
    <template #[`item.total`]="{ item }">
      <VChip size="small" color="primary" variant="tonal">
        {{ item.total }}
      </VChip>
    </template>
    <template #[`item.distinct_members`]="{ item }">
      <span class="font-weight-medium">{{ item.distinct_members ?? 0 }}</span>
    </template>
    <template #[`item.active_members`]="{ item }">
      <VChip size="small" color="green" variant="tonal">
        {{ item.active_members ?? 0 }}
      </VChip>
    </template>
    <template #[`item.inactive_members`]="{ item }">
      <VChip size="small" variant="tonal" color="orange-darken-3">
        {{ item.inactive_members ?? 0 }}
      </VChip>
    </template>
    <template #no-data>
      <div class="text-center text-grey pa-6">
        <VIcon size="48" color="grey-lighten-1">mdi-information-outline</VIcon>
        <p class="mt-2">Sin actividad en el rango seleccionado</p>
      </div>
    </template>
  </VDataTable>
</template>

<script setup lang="ts">
interface Person {
  name?: string;
  last_name?: string;
  email?: string;
}

interface SummaryItem {
  created_by: number;
  total: number;
  distinct_members: number;
  active_members: number;
  inactive_members: number;
  creator?: Person;
}

const props = defineProps<{
  items: SummaryItem[];
  selectedId?: number | null;
}>();

const emit = defineEmits<{
  (e: "select", item: SummaryItem): void;
}>();

const headers = [
  { title: "", key: "actions", sortable: false, align: "center" as const, width: "60px" },
  { title: "Consolidador", key: "creator", sortable: false },
  { title: "Actividad", key: "total", align: "center" as const, sortable: false },
  { title: "Miembros", key: "distinct_members", align: "center" as const, sortable: false },
  { title: "Activos", key: "active_members", align: "center" as const, sortable: false },
  { title: "Inactivos", key: "inactive_members", align: "center" as const, sortable: false },
];

function formatName(person?: Person) {
  return [person?.name, person?.last_name].filter(Boolean).join(" ") || "N/A";
}
</script>
