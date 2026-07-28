<template>
  <div>
    <VDataTable
      id="dt-organ-table-items-1"
      density="compact"
      mobile-breakpoint="0"
      :headers="headers"
      :items="items"
      v-model:options="optionsTable"
      :items-length="total"
      class="elevation-1"
      @update:options="onUpdateOptions"
    >
      <template #[`item.actions`]="{ item }">
        <VBtn title="Editar" class="ma-1" color="primary" variant="outlined" size="small" icon id="btn-organization-table-edit" @click="emitEdit(item)">
          <VIcon>mdi-pencil</VIcon>
        </VBtn>
        <VBtn title="Config" class="ma-1" color="info" variant="outlined" size="small" icon id="btn-organization-table-config" @click="emitConfig(item)">
          <VIcon>mdi-cog</VIcon>
        </VBtn>
        <VBtn title="Delete" class="ma-1" color="error" variant="outlined" size="small" icon id="btn-organization-table-delete" @click="confirmDelete(item)">
          <VIcon>mdi-delete</VIcon>
        </VBtn>
      </template>
    </VDataTable>
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
  text: string
  value: string
  sortable: boolean
  firstSortDesc?: boolean
  width?: string
}

const props = defineProps<{
  dialogDelete: unknown
  response?: { total?: number; data?: unknown[] } | null
  options?: Record<string, unknown>
  tableHeaders?: unknown
}>()

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'config', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const optionsTable = ref<Record<string, unknown>>({})
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { text: "name", value: "name", sortable: true, firstSortDesc: true },
  { text: "short_code", value: "short_code", sortable: true, firstSortDesc: true },
  { text: "description", value: "description", sortable: true, firstSortDesc: true },
  { text: "Acciones", value: "actions", width: "200px", sortable: false },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])

watch(() => props.options, (val) => {
  if (val) optionsTable.value = val
}, { immediate: true })

watch(optionsTable, (val) => {
  emit("sorting", val)
}, { deep: true })

function onUpdateOptions(val: Record<string, unknown>) {
  const sortBy = ((val.sortBy ?? []) as string[])[0]
  if (sortBy) {
    const head = headers.find((x) => x.value === sortBy)
    if (head?.firstSortDesc) {
      val.sortDesc = [true]
    }
  }
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
