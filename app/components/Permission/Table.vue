<template>
  <div id="cmp-permission-table">
    <VDataTableServer
      id="dt-permission-table-items-1"
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
      :search="props.search"
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn
          id="btn-permission-table-edit"
          title="Editar"
          class="ma-1"
          color="primary"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          @click="emitEdit(item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn
          id="btn-permission-table-distribute"
          title="Distribuir"
          class="ma-1"
          color="info"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          @click="emitDistribution(item)"
        >
          <VIcon size="x-large">mdi-share-variant</VIcon>
        </VBtn>
        <VBtn
          id="btn-permission-table-delete"
          title="Eliminar"
          class="ma-1"
          color="error"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          @click="confirmDelete(item)"
        >
          <VIcon size="x-large">mdi-delete</VIcon>
        </VBtn>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-key-variant</VIcon>
          <span class="text-body-1 text-grey">No se encontraron permisos</span>
        </div>
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
  align?: string
  width?: string
}

const props = defineProps<{
  dialogDelete: unknown
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
  search?: string
  highlightId?: number | null
  removingId?: number | string | null
}>()

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'distribution', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "name", order: "asc" }])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: "Nombre", value: "name", align: "start", sortable: true },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "200px" },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const rowProps = rowPropsFor(() => props.highlightId, () => props.removingId)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "¿Desea eliminar el Permiso ",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitEdit(item: unknown) { emit("edit", item) }
function emitDistribution(item: unknown) { emit("distribution", item) }
</script>

<style scoped></style>