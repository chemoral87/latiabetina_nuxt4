<template>
  <div id="cmp-role-table">
    <VDataTableServer
      id="rol-table-items-dt-1"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      density="compact"
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      :row-props="rowProps"
      class="elevation-1 xwidth800"
      striped="odd"
      mustSort
      :search="props.search"
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.permissions`]="{ item }">
        <div v-if="hasPermissions(item as Record<string, unknown>)" class="d-flex flex-wrap ga-1">
          <VChip
            v-for="permission in (item as Record<string, unknown>).permissions as Record<string, unknown>[]"
            :key="permission.id as number"
            color="primary"
            size="small"
            variant="elevated"
          >
            {{ permission.name as string }}
          </VChip>
        </div>
        <span v-else class="text-grey text-caption">Sin permisos</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          id="rol-table-edit-btn"
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
          id="rol-table-permissions-btn"
          title="Permisos"
          class="ma-1"
          color="success"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          @click="emitEditPermissions(item)"
        >
          <VIcon size="x-large">mdi-key-variant</VIcon>
        </VBtn>
        <VBtn
          id="rol-table-distribute-btn"
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
          id="rol-table-delete-btn"
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
          <VIcon color="grey-lighten-1">mdi-redhat</VIcon>
          <span class="text-body-1 text-grey">No se encontraron roles</span>
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

const props = withDefaults(defineProps<{
  dialogDelete: unknown
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
  search?: string
  highlightId?: number | null
  removingId?: number | string | null
  initialSortBy?: { key: string; order: string }[]
}>(), {
  initialSortBy: () => [{ key: "name", order: "asc" }],
})

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'editPermissions', val: unknown): void
  (e: 'distribution', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([...props.initialSortBy])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: "Nombre", value: "name", align: "start", sortable: true },
  { title: "Permisos", value: "permissions", sortable: false },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "240px" },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const rowProps = rowPropsFor(() => props.highlightId, () => props.removingId)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function hasPermissions(item: Record<string, unknown>): boolean {
  return !!(item.permissions && Array.isArray(item.permissions) && (item.permissions as unknown[]).length > 0)
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "¿Desea eliminar el Rol ",
    strong: (item as Record<string, unknown>).name,
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitEdit(item: unknown) { emit("edit", item) }
function emitEditPermissions(item: unknown) { emit("editPermissions", item) }
function emitDistribution(item: unknown) { emit("distribution", item) }
</script>

<style scoped></style>
