<template>
  <div id="cmp-sale-table">
    <VDataTableServer
      id="dt-sale-table-items-1"
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
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 30]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.total`]="{ item }">
        <span class="font-weight-medium">${{ formatNumber((item as Record<string, unknown>).total) }}</span>
      </template>

      <template #[`item.created_at`]="{ item }">
        <span>{{ formatShortDateTime((item as Record<string, unknown>).created_at as string | null) }}</span>
      </template>

      <template #[`item.payment_method`]="{ item }">
        <VChip size="small" :color="salePaymentColor((item as Record<string, unknown>).payment_method as string | null)" text-color="white" class="font-weight-medium">
          {{ salePaymentLabel((item as Record<string, unknown>).payment_method as string | null) }}
        </VChip>
      </template>

      <template #[`item.status`]="{ item }">
        <VChip size="small" :color="saleStatusColor((item as Record<string, unknown>).status as string | null)" text-color="white" class="font-weight-medium">
          {{ saleStatusLabel((item as Record<string, unknown>).status as string | null) }}
        </VChip>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          id="btn-sale-table-view"
          title="Ver detalle"
          class="ma-1"
          color="primary"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          @click="emitView(item)"
        >
          <VIcon size="x-large">mdi-eye</VIcon>
        </VBtn>
        <VBtn
          id="btn-sale-table-edit"
          title="Editar"
          class="ma-1"
          color="info"
          variant="outlined"
          size="small"
          icon
          rounded="circle"
          @click="emitEdit(item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn
          id="btn-sale-table-delete"
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
          <VIcon color="grey-lighten-1">mdi-receipt</VIcon>
          <span class="text-body-1 text-grey">No se encontraron ventas</span>
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
import { formatShortDateTime } from "~/utils/date"
import { salePaymentColor, salePaymentLabel, saleStatusColor, saleStatusLabel } from "~/utils/sale"

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
  highlightId?: number | null
  removingId?: number | string | null
}>()

const emit = defineEmits<{
  (e: 'update:dialogDelete', val: boolean): void
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'view', val: unknown): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([{ key: "created_at", order: "desc" }])
const dialogDeleteProp = ref<Record<string, unknown>>({})

const headers: Header[] = [
  { title: "Número", value: "number", align: "start", sortable: true },
  { title: "Cliente", value: "customer_name", sortable: false },
  { title: "Teléfono", value: "customer_phone", sortable: false },
  { title: "Pago", value: "payment_method", sortable: false },
  { title: "Estado", value: "status", sortable: false },
  { title: "Total", value: "total", align: "end", sortable: false },
  { title: "Fecha", value: "created_at", sortable: true },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "200px" },
]

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const rowProps = rowPropsFor(() => props.highlightId, () => props.removingId)

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
    text: "¿Desea eliminar la venta ",
    strong: (item as Record<string, unknown>).number as string,
    payload: item,
  }
  emit("update:dialogDelete", true)
}

function emitView(item: unknown) { emit("view", item) }
function emitEdit(item: unknown) { emit("edit", item) }
</script>

<style scoped></style>
