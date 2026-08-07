<template>
  <div id="cmp-testimony-table">
    <VDataTableServer
      id="tes-table-localitems-dt-1"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      density="compact"
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      :row-props="rowProps"
      class="elevation-1 xwidth1100"
      striped="odd"
      mustSort
      :search="props.search"
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.review`]="{ item }">
        <VBtn
          id="tes-table-show-btn"
          title="Revisar"
          color="primary"
          variant="outlined"
          icon
          rounded="circle"
          size="small"
          class="ma-1"
          @click="emit('show', item)"
        >
          <VIcon size="x-large">mdi-eye</VIcon>
        </VBtn>
      </template>

      <template #[`item.status`]="{ item }">
        <div class="d-flex align-center">
          <VChip v-if="item.status === 'approved'" size="small" color="success" variant="elevated">APROBADO</VChip>
          <VChip v-else-if="item.status === 'rejected'" size="small" color="error" variant="elevated">RECHAZADO</VChip>
          <VChip v-else size="small" color="primary" variant="outlined">Pendiente</VChip>
        </div>
      </template>

      <template #[`item.created_at`]="{ item }">
        <span>{{ formatShortDateTime(item.created_at as string | null).toUpperCase() }}</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <VBtn
            id="tes-table-edit-btn"
            title="Editar"
            color="primary"
            variant="outlined"
            icon
            rounded="circle"
                    size="small"
            class="ma-1"
            @click="emit('edit', item)"
          >
            <VIcon size="x-large">mdi-pencil</VIcon>
          </VBtn>

          <VBtn
            id="tes-table-delete-btn"
            title="Eliminar"
            color="error"
            variant="outlined"
                    icon
            class="ma-1"
            rounded="circle"
            size="small"
            @click="emit('delete', item)"
          >
            <VIcon size="x-large">mdi-delete</VIcon>
          </VBtn>
        </div>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-comment-text-outline</VIcon>
          <span class="text-body-1 text-grey">No hay datos</span>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { rowPropsFor } from "~/composables/useRowHighlight"
import { formatShortDateTime } from "~/utils/date"

interface Header {
  title: string
  value: string
  sortable: boolean
  align?: string
  width?: string
}

const props = withDefaults(defineProps<{
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
  search?: string
  highlightId?: number | null
}>(), {
  response: null,
  loading: false,
  search: "",
  highlightId: null,
})

const emit = defineEmits<{
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'show', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "created_at", order: "desc" }])

const headers: Header[] = [
  { title: "", value: "review", sortable: false },
  { title: "Nombre", value: "name" },
  { title: "Estado", value: "status", sortable: false },
  { title: "Categorías", value: "categories" },
  { title: "Fecha", value: "created_at" },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "140px" },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const rowProps = rowPropsFor(() => props.highlightId)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}
</script>

<style scoped></style>
