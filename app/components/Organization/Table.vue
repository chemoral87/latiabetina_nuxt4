<template>
  <div>
    <VDataTableServer
      id="dt-organ-table-items-1"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      density="compact"
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      class="elevation-1"
      striped="odd"
      mustSort
      initial-sort-order="desc"
      :search="props.search"
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn title="Editar" class="ma-1" color="primary" variant="outlined" size="small" icon rounded="circle" id="btn-organization-table-edit" @click="emitEdit(item)">
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn title="Config" class="ma-1" color="info" variant="outlined" size="small" icon rounded="circle" id="btn-organization-table-config" @click="emitConfig(item)">
          <VIcon size="x-large">mdi-cog</VIcon>
        </VBtn>
        <VBtn title="Delete" class="ma-1" color="error" variant="outlined" size="small" icon rounded="circle" id="btn-organization-table-delete" @click="confirmDelete(item)">
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
}>()

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'config', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "name", order: "desc" }])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: "name", value: "name", sortable: true },
  { title: "short_code", value: "short_code", sortable: true },
  { title: "description", value: "description", sortable: true },
  { title: "Acciones", value: "actions", width: "200px", sortable: false },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "Desea eliminar ",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitEdit(item: unknown) { emit("edit", item) }
function emitConfig(item: unknown) { emit("config", item) }
</script>

<style scoped></style>