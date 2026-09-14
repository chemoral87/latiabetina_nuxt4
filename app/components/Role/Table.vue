<template>
  <div id="cmp-role-table">
    <VDataTableServer
      id="rol-table-items-dt-1"
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
      :search="props.search"
      class="elevation-1 xwidth800"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions">
      <template #[`item.permissions`]="{ item }">
        <div v-if="hasPermissions(item as Record<string, unknown>)" class="d-flex flex-wrap ga-1">
          <VChip
            v-for="permission in sortedPermissions((item as Record<string, unknown>).permissions as Record<string, unknown>[])"
            :key="permission.id as number"
            size="small"
            variant="flat"
            :color="permissionColors[permission.name as string] ?? 'primary'"
          >
            {{ permission.name as string }}
          </VChip>
        </div>
        <span v-else class="text-grey text-caption">Sin permisos</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          id="rol-table-edit-btn"
          icon
          class="ma-1"
          size="small"
          title="Editar"
          color="primary"
          rounded="circle"
          variant="outlined"
          @click="emitEdit(item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn
          id="rol-table-permissions-btn"
          icon
          class="ma-1"
          size="small"
          color="success"
          rounded="circle"
          title="Permisos"
          variant="outlined"
          @click="emitEditPermissions(item)"
        >
          <VIcon size="x-large">mdi-key-variant</VIcon>
        </VBtn>
        <VBtn
          id="rol-table-distribute-btn"
          icon
          class="ma-1"
          color="info"
          size="small"
          rounded="circle"
          title="Distribuir"
          variant="outlined"
          @click="emitDistribution(item)"
        >
          <VIcon size="x-large">mdi-share-variant</VIcon>
        </VBtn>
        <VBtn
          id="rol-table-delete-btn"
          icon
          class="ma-1"
          size="small"
          color="error"
          rounded="circle"
          title="Eliminar"
          variant="outlined"
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
import { buildPermissionColorMap, sortPermissionsForDisplay } from "~/utils/permissionChipColor"

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

const { catalog: allPermissionNames, loadCatalog } = usePermissionCatalog()

const permissionColors = computed(() => {
  const combined = new Set([
    ...allPermissionNames.value,
    ...items.value.flatMap((item) => {
      const perms = (item as Record<string, unknown>).permissions as Record<string, unknown>[] | undefined
      return (perms ?? []).map((p) => p.name as string)
    }),
  ])
  return buildPermissionColorMap([...combined])
})

onMounted(() => {
  loadCatalog()
})

const rowProps = rowPropsFor(() => props.highlightId, () => props.removingId)

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function hasPermissions(item: Record<string, unknown>): boolean {
  return !!(item.permissions && Array.isArray(item.permissions) && (item.permissions as unknown[]).length > 0)
}

function sortedPermissions(permissions: Record<string, unknown>[]) {
  return sortPermissionsForDisplay(permissions as { name: string }[])
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
