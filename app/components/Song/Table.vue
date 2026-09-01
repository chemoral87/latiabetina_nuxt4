<template>
  <div id="cmp-song-table">
    <VDataTableServer
      id="song-table-localitems-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      mustSort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      :items-length="total"
      :row-props="rowProps"
      class="elevation-1 xwidth1100"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.view`]="{ item }">
        <VBtn
          :id="`song-table-view-btn-${(item as Record<string, unknown>).id}`"
          icon
          title="Ver"
          class="ma-1"
          size="small"
          color="primary"
          rounded="circle"
          variant="outlined"
          @click="emit('view', item)"
        >
          <VIcon size="x-large">mdi-eye</VIcon>
        </VBtn>
      </template>

      <template #[`item.key`]="{ item }">
        <VChip v-if="item.key" size="small" color="primary" variant="outlined">{{ item.key }}</VChip>
        <span v-else>—</span>
      </template>

      <template #[`item.updated_at`]="{ item }">
        <span>{{ formatShortDateTime(item.updated_at as string | null).toUpperCase() }}</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <VBtn
            :id="`song-table-edit-btn-${(item as Record<string, unknown>).id}`"
            icon
            class="ma-1"
            size="small"
            title="Editar"
            color="primary"
            rounded="circle"
            variant="outlined"
            @click="emit('edit', item)"
          >
            <VIcon size="x-large">mdi-pencil</VIcon>
          </VBtn>

          <VBtn
            :id="`song-table-delete-btn-${(item as Record<string, unknown>).id}`"
            icon
            class="ma-1"
            size="small"
            color="error"
            rounded="circle"
            title="Eliminar"
            variant="outlined"
            @click="emit('delete', item)"
          >
            <VIcon size="x-large">mdi-delete</VIcon>
          </VBtn>
        </div>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-music-note-off</VIcon>
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
  highlightId?: number | null
  initialSortBy?: { key: string; order: string }[]
}>(), {
  response: null,
  loading: false,
  highlightId: null,
  initialSortBy: () => [{ key: "updated_at", order: "desc" }],
})

const emit = defineEmits<{
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'view', val: unknown): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([...props.initialSortBy])

const headers: Header[] = [
  { title: "", value: "view", sortable: false },
  { title: "Título", value: "title" },
  { title: "Autor", value: "artist" },
  { title: "Tonalidad", value: "key", sortable: false },
  { title: "Tempo", value: "tempo" },
  { title: "Actualizado", value: "updated_at" },
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