<template>
  <div id="cmp-product-table">
    <VDataTableServer
      id="dt-product-table-items-1"
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
      must-sort
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.org_code`]="{ item }">
        {{ orgCodeById((item as Record<string, unknown>).org_id) }}
      </template>

      <template #[`item.hidden`]="{ item }">
        {{ (item as Record<string, unknown>).hidden ? 'Sí' : 'No' }}
      </template>

      <template #[`item.requires_preparation`]="{ item }">
        <VIcon :color="(item as Record<string, unknown>).requires_preparation ? 'orange-darken-1' : 'grey-lighten-2'">
          mdi-chef-hat
        </VIcon>
      </template>

      <template #[`item.price`]="{ item }">
        <span class="font-weight-medium">${{ formatNumber((item as Record<string, unknown>).price) }}</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          title="Editar"
          class="ma-1"
          color="primary"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          id="btn-product-table-edit"
          @click="emitEdit(item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn
          title="Eliminar"
          class="ma-1"
          color="error"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          id="btn-product-table-delete"
          @click="confirmDelete(item)"
        >
          <VIcon size="x-large">mdi-delete</VIcon>
        </VBtn>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-package-variant</VIcon>
          <span class="text-body-1 text-grey">No se encontraron artículos</span>
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

interface Org {
  id: number
  name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  dialogDelete: unknown
  response?: { total?: number; data?: unknown[] } | null
  options?: Record<string, unknown> | null
  loading?: boolean
  permission?: string
  highlightId?: number | null
  removingId?: number | string | null
}>(), {
  response: null,
  options: null,
  loading: false,
  permission: "product-index",
  highlightId: null,
  removingId: null,
})

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const auth = useAuthStore()

function parseSortBy(opts: Record<string, unknown> | null): { key: string; order: string }[] {
  if (!opts) return [{ key: "name", order: "asc" }]
  const sb = opts.sortBy
  const desc = Array.isArray(opts.sortDesc) ? Boolean(opts.sortDesc[0]) : false
  if (Array.isArray(sb) && sb.length > 0) {
    const first = sb[0]
    const key = typeof first === "string" ? first : (first as { key?: string })?.key
    if (key) return [{ key, order: desc ? "desc" : "asc" }]
  }
  return [{ key: "name", order: desc ? "desc" : "asc" }]
}

// Initialized once from the page's current options; the table remounts
// every time the page switches back to table view, so a one-time read is
// enough to keep pagination state in sync.
const page = ref(Number((props.options?.page as number) ?? 1))
const itemsPerPage = ref(Number((props.options?.itemsPerPage as number) ?? 10))
const sortBy = ref<{ key: string; order: string }[]>(parseSortBy(props.options))
const dialogDeleteProp = ref<Record<string, unknown>>({})

const showOrgColumn = computed(() => {
  const orgIds = auth.permissionsOrg[props.permission] ?? []
  return Array.isArray(orgIds) && orgIds.length > 1
})

const headers = computed<Header[]>(() => {
  const cols: Header[] = [
    { title: "Nombre", value: "name", align: "start", sortable: true },
    { title: "Orden", value: "order", sortable: true },
  ]
  if (showOrgColumn.value) {
    cols.push({ title: "Org", value: "org_code", sortable: false })
  }
  cols.push(
    { title: "SKU", value: "sku", sortable: false },
    { title: "Requiere Prep.", value: "requires_preparation", sortable: false },
    { title: "Oculto", value: "hidden", sortable: false },
    { title: "Precio", value: "price", align: "end", sortable: false },
    { title: "Stock", value: "stock", align: "end", sortable: false },
    { title: "Acciones", value: "actions", sortable: false, align: "center", width: "160px" },
  )
  return cols
})

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading)

const rowProps = rowPropsFor(() => props.highlightId, () => props.removingId)

function orgCodeById(orgId: unknown): string {
  const orgs = (auth.user?.orgs as Org[] | undefined) ?? []
  const org = orgs.find((o) => o.id === Number(orgId))
  return org ? org.name : ""
}

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function formatNumber(val: unknown): string {
  const num = Number(val)
  if (isNaN(num)) return String(val ?? "")
  return num.toLocaleString()
}

function confirmDelete(item: unknown) {
  dialogDeleteProp.value = {
    text: "¿Desea eliminar el producto ",
    strong: (item as Record<string, unknown>).name as string,
    text2: "?",
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitEdit(item: unknown) {
  emit("edit", item)
}
</script>

<style scoped></style>
