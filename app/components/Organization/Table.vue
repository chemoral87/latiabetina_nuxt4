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
      :search="props.search"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn title="Editar" class="ma-1" color="primary" variant="outlined" size="small" icon rounded="circle" id="btn-organization-table-edit" @click="emitEdit(item)">
          <VIcon>mdi-pencil</VIcon>
        </VBtn>
        <VBtn title="Config" class="ma-1" color="info" variant="outlined" size="small" icon rounded="circle" id="btn-organization-table-config" @click="emitConfig(item)">
          <VIcon>mdi-cog</VIcon>
        </VBtn>
        <VBtn title="Delete" class="ma-1" color="error" variant="outlined" size="small" icon rounded="circle" id="btn-organization-table-delete" @click="confirmDelete(item)">
          <VIcon>mdi-delete</VIcon>
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
  firstSortDesc?: boolean
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
const itemsPerPage = ref(5)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "name", order: "desc" }])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: "name", value: "name", sortable: true, firstSortDesc: true },
  { title: "short_code", value: "short_code", sortable: true, firstSortDesc: true },
  { title: "description", value: "description", sortable: true, firstSortDesc: true },
  { title: "Acciones", value: "actions", width: "200px", sortable: false },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

function onUpdateOptions(val: Record<string, unknown>) {
  const sortByArr = (val.sortBy as { key: string; order: string }[]) ?? []
  if (sortByArr.length) {
    const first = sortByArr[0]
    const head = headers.find((x) => x.value === first.key)
    if (head?.firstSortDesc && first.order !== 'desc') {
      sortBy.value = [{ key: first.key, order: 'desc' }]
      return
    }
  }
  emit("sorting", val)
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "Desea eliminar undefined",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitEdit(item: unknown) { emit("edit", item) }
function emitConfig(item: unknown) { emit("config", item) }
</script>

<style scoped>
:deep(.v-data-table th) {
  color: rgba(0, 0, 0, 0.87);
}
</style>