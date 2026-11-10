<template>
  <div id="cmp-consolidator-group-table">
    <VDataTableServer
      id="cgr-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      mustSort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      class="elevation-1"
      :items-length="total"
      :row-props="rowProps"
      :search="props.search"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.users`]="{ item }">
        <VChip v-for="u in membersOf(item)" :key="u.id" class="ma-1" size="small" variant="tonal">
          {{ displayUser(u) }}
        </VChip>
        <span v-if="membersOf(item).length === 0" class="text-medium-emphasis">Sin miembros</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          :id="`cgr-table-edit-btn-${item.id}`"
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
          :id="`cgr-table-delete-btn-${item.id}`"
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
          <VIcon color="grey-lighten-1">mdi-account-group-outline</VIcon>
          <span class="text-body-1 text-grey">No se encontraron grupos</span>
        </div>
      </template>
    </VDataTableServer>

    <DialogDelete
      v-if="dialogDelete"
      :dialog="dialogDeleteProp"
      @ok="item => emit('delete', item)"
      @close="emit('update:dialogDelete', false)"
    />
  </div>
</template>

<script setup lang="ts">
import { rowPropsFor } from '~/composables/useRowHighlight'

interface Header {
  title: string
  value: string
  sortable: boolean
  align?: 'start' | 'center' | 'end'
  width?: string
}

interface GroupUser {
  id: number
  name?: string
  last_name?: string
  email?: string
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
  initialSortBy: () => [{ key: 'name', order: 'asc' }],
})

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>([...props.initialSortBy] as { key: string; order: 'asc' | 'desc' }[])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: 'Nombre', value: 'name', align: 'start', sortable: true },
  { title: 'Consolidadores', value: 'users', align: 'start', sortable: false },
  { title: 'Acciones', value: 'actions', align: 'center', sortable: false, width: '160px' },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const rowProps = rowPropsFor(
  () => props.highlightId,
  () => props.removingId,
)

function membersOf(item: unknown): GroupUser[] {
  const users = (item as { users?: GroupUser[] }).users
  return Array.isArray(users) ? users : []
}

function displayUser(u: GroupUser): string {
  const full = [u.name, u.last_name].filter(Boolean).join(' ')
  return full || u.email || String(u.id)
}

function onUpdateOptions(val: Record<string, unknown>) {
  emit('sorting', val)
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    title: '¿Eliminar Grupo?',
    text: 'Se eliminará 1 registro: ',
    strong: (item as Record<string, unknown>).name,
    payload: item,
  }
  emit('update:dialogDelete', true)
}
</script>

<style scoped></style>
