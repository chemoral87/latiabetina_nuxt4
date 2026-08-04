<template>
  <VDataTableServer
    id="dt-audit-table-items-1"
    v-model:page="page"
    v-model:items-per-page="itemsPerPage"
    v-model:sort-by="sortBy"
    density="compact"
    :headers="headers"
    :items="items"
    :items-length="total"
    :loading="loading"
    :row-props="rowProps"
    class="elevation-1"
    mustSort
    items-per-page-text="Filas por página"
    :items-per-page-options="[10, 15, 30]"
    @update:options="onUpdateOptions"
  >
    <template #[`item.event_date`]="{ item }">
      {{ formatShortDate(item.event_date) }}
    </template>

    <template #[`item.time`]="{ item }">
      {{ item.time ? formatHourTime(item.time) : '-' }}
    </template>

    <template #[`item.marks`]="{ item }">
      <VBtn id="btn-auditoriumevent-table-mark" title="Marcar" class="mr-1 my-1" color="primary" variant="outlined" icon
        size="small" @click="emit('mark', item)">
        <VIcon size="x-large">mdi-eye</VIcon>
      </VBtn>
    </template>

    <template #[`item.actions`]="{ item }">
      <VBtn id="btn-auditoriumevent-table-download" title="Descargar Excel" class="mr-1 my-1" color="success" variant="outlined"  icon
        size="small" @click="emit('download', item)">
        <VIcon size="x-large">mdi-file-excel</VIcon>
      </VBtn>
      <VBtn id="btn-auditoriumevent-table-edit" title="Editar" class="mr-1 my-1" color="primary" variant="outlined"  icon
        size="small" @click="emit('edit', item)">
        <VIcon size="x-large">mdi-pencil</VIcon>
      </VBtn>
      <VBtn id="btn-auditoriumevent-table-delete" title="Eliminar" class="my-1" color="error" variant="outlined"    icon
        size="small" @click="emit('delete', item)">
        <VIcon size="x-large">mdi-delete</VIcon>
      </VBtn>
    </template>
  </VDataTableServer>
</template>

<script setup lang="ts">
import { formatShortDate, formatHourTime } from "~/utils/date"
import { rowPropsFor } from "~/composables/useRowHighlight"

interface Header {
  title: string
  value: string
  sortable: boolean
  width?: string
}

const props = defineProps<{
  response?: { total?: number; data?: unknown[] } | null
  options?: Record<string, unknown>
  loading?: boolean
  highlightId?: number | null
  removingId?: number | string | null
}>()

const emit = defineEmits<{
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'mark', val: unknown): void
  (e: 'download', val: unknown): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "event_date", order: "desc" }])

const headers: Header[] = [
  { title: "", value: "marks", sortable: false },
  { title: "Fecha del Evento", value: "event_date", sortable: true },
  { title: "Hora", value: "time", sortable: false },
  { title: "Auditorio", value: "auditorium_name", sortable: false },
  { title: "Organización", value: "org_name", sortable: false },
  { title: "Acciones", value: "actions", width: "200px", sortable: false },
]

const total = computed(() => props.response?.total ?? 0)

const items = computed(() => {
  const data = props.response?.data ?? []
  return data.map((event) => {
    const e = event as Record<string, unknown>
    return {
      ...e,
      auditorium_name: e.auditorium_name || ((e.auditorium_id as Record<string, unknown>)?.name ?? ""),
      org_name: e.org_name || ((e.org_id as Record<string, unknown>)?.name ?? ""),
    }
  })
})

const rowProps = rowPropsFor(() => props.highlightId, () => props.removingId)

onMounted(() => {
  const opts = props.options ?? {}
  page.value = (opts.page as number) ?? 1
  itemsPerPage.value = (opts.itemsPerPage as number) ?? 10
  if (Array.isArray(opts.sortBy)) {
    const sb = opts.sortBy as ({ key: string; order: string } | string)[]
    sortBy.value = sb.map((s) => (typeof s === "string" ? { key: s, order: "asc" } : s))
  }
})

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}
</script>
