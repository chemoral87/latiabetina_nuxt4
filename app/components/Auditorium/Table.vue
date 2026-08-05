<template>
  <div id="cmp-auditorium-table">
    <VDataTableServer
      id="aud-table-items-dt-1"
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
      striped="odd"
      mustSort
      initial-sort-order="asc"
      :search="props.search"
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn id="aud-table-edit-btn" title="Editar" class="ma-1" color="primary" variant="outlined" size="small" icon rounded="circle" @click="emitEdit(item)">
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn id="aud-table-layout-btn" title="Editar Auditorio" class="ma-1" color="success" variant="outlined" size="small" icon rounded="circle" @click="emitLayout(item)">
          <VIcon size="x-large">mdi-seat</VIcon>
        </VBtn>
        <VBtn id="aud-table-delete-btn" title="Eliminar" class="ma-1" color="error" variant="outlined" size="small" icon rounded="circle" @click="confirmDelete(item)">
          <VIcon size="x-large">mdi-delete</VIcon>
        </VBtn>
      </template>
    </VDataTableServer>
    <DialogDelete
      v-if="dialogDelete"
      :dialog="dialogDeleteProp"
      @ok="(item) => emit('delete', item)"
      @close="emit('update:dialogDelete', false)"
    />
  </div>
</template>

<script setup lang="ts">
import { rowPropsFor } from "~/composables/useRowHighlight"

interface Header {
  title: string
  value: string
  sortable: boolean
  width?: string
}

const props = defineProps<{
  dialogDelete: unknown
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
  search?: string
  highlightId?: number | null
}>()

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'layout', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "name", order: "asc" }])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: "Nombre", value: "name", sortable: true },
  { title: "Organización", value: "org_name", sortable: false },
  { title: "Acciones", value: "actions", width: "200px", sortable: false },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => {
  const data = props.response?.data ?? []
  return data.map((aud) => {
    const a = aud as Record<string, unknown>
    return {
      ...a,
      org_name: a.org_name || ((a.org_id as Record<string, unknown>)?.name ?? ""),
    }
  })
})
const loading = computed(() => props.loading ?? false)

const rowProps = rowPropsFor(() => props.highlightId)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function confirmDelete(item: unknown) {
  const i = item as Record<string, unknown>
  dialogDeleteProp.value = {
    text: "Desea eliminar el Auditorio ",
    strong: i.name,
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitEdit(item: unknown) { emit("edit", item) }
function emitLayout(item: unknown) { emit("layout", item) }
</script>

<style scoped></style>
