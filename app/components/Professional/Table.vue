<template>
  <div id="cmp-professional-table">
    <VDataTableServer
      id="pro-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      must-sort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      class="elevation-1"
      :items-length="total"
      :search="props.search"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions">
      <template #[`item.status`]="{ item }">
        <VChip
          size="small"
          variant="flat"
          :color="statusColors[(item as Professional).status]">
          {{ statusLabels[(item as Professional).status] }}
        </VChip>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          :id="`pro-table-phone-btn-${(item as Professional).id}`"
          icon
          class="ma-1"
          size="small"
          rel="noopener"
          color="success"
          target="_blank"
          rounded="circle"
          title="WhatsApp"
          variant="outlined"
          :href="`https://wa.me/${String((item as Professional).phone_number).replace(/[^\d]/g, '')}`">
          <VIcon size="x-large">mdi-whatsapp</VIcon>
        </VBtn>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-account-search</VIcon>
          <span class="text-body-1 text-grey">No se encontraron profesionales</span>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import type { Professional, ProfessionalStatus } from "~/types/models/professional"

interface Header {
  title: string
  value: string
  sortable: boolean
  align?: "start" | "center" | "end"
  width?: string
}

const props = withDefaults(defineProps<{
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
  search?: string
  initialSortBy?: { key: string; order: string }[]
}>(), {
  initialSortBy: () => [{ key: "created_at", order: "desc" }],
})

const emit = defineEmits<{
  (e: 'sorting', val: Record<string, unknown>): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: "asc" | "desc" }[]>([...props.initialSortBy] as { key: string; order: "asc" | "desc" }[])

const headers: Header[] = [
  { title: "Nombre", value: "name", align: "start", sortable: true },
  { title: "Apellido", value: "last_name", sortable: true },
  { title: "Profesión", value: "title", sortable: true },
  { title: "Descripción", value: "description", sortable: false },
  { title: "Teléfono", value: "phone_number", sortable: false },
  { title: "Estado", value: "status", sortable: false, align: "center" },
  { title: "", value: "actions", sortable: false, align: "center", width: "80px" },
]

const statusLabels: Record<ProfessionalStatus, string> = {
  unemployed: "Desempleado",
  selfemployed: "Independiente",
  employed: "Empleado",
  student: "Estudiante",
  retired: "Jubilado",
}

const statusColors: Record<ProfessionalStatus, string> = {
  unemployed: "orange",
  selfemployed: "primary",
  employed: "success",
  student: "info",
  retired: "grey",
}

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}
</script>
