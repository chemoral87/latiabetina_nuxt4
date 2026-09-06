<template>
  <div id="cmp-church-member-all-tracking-log-table">
    <VDataTableServer
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      must-sort
      :items="items"
      density="compact"
      :headers="headers"
      class="elevation-1"
      :items-length="total"
      :loading="props.loading"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.church_member`]='{ item }'>
        {{ memberName(item.church_member) }}
      </template>
      <template #[`item.contact_datetime`]='{ item }'>
        {{ formatShortDateTime12h(String(item.contact_datetime ?? "")) || "—" }}
      </template>
      <template #[`item.medium`]='{ item }'>
        {{ mediumLabel(String(item.medium ?? "")) }}
      </template>
      <template #no-data>
        <div class="text-center pa-4 text-grey">Sin interacciones registradas</div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { formatShortDateTime12h } from "~/utils/date";

interface Person {
  name?: string;
  last_name?: string;
}

interface ActivityLog {
  church_member?: Person;
  contact_datetime?: string;
  medium?: string;
  description?: string;
}

const props = withDefaults(defineProps<{
  response?: { data?: ActivityLog[]; total?: number } | null;
  loading?: boolean;
  initialSortBy?: { key: string; order: string }[];
}>(), {
  response: null,
  loading: false,
  initialSortBy: () => [{ key: "contact_datetime", order: "desc" }],
});

const emit = defineEmits<{
  (e: "sorting", value: Record<string, unknown>): void;
}>();

const page = ref(1);
const itemsPerPage = ref(10);
const sortBy = ref([...props.initialSortBy]);
const items = computed(() => props.response?.data ?? []);
const total = computed(() => props.response?.total ?? 0);

watch(() => props.initialSortBy, (val) => {
  sortBy.value = [...val];
});

const headers = [
  { title: "Miembro", value: "church_member", sortable: false },
  { title: "Medio", value: "medium", sortable: true },
  { title: "Fecha contacto", value: "contact_datetime", sortable: true },
  { title: "Descripción", value: "description", sortable: false },
];

function onUpdateOptions(value: Record<string, unknown>) {
  emit("sorting", value);
}

function memberName(member?: Person) {
  return [member?.name, member?.last_name].filter(Boolean).join(" ") || "N/A";
}

function mediumLabel(medium: string) {
  return ({ whatsapp: "WhatsApp", llamada: "Llamada", presencial: "Presencial", sms: "SMS" } as Record<string, string>)[medium] || medium;
}
</script>
