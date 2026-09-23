<template>
  <VContainer class="" :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
      <!-- Filter -->
      <VCol md="3" cols="12">
        <VTextField
          id="poss-filter-tf-1"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Buscar venta..."
          append-inner-icon="mdi-magnify"
        />
      </VCol>

      <!-- Action buttons -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="poss-refresh-btn" class="mr-4" color="primary" :loading="loading" variant="outlined" @click="refreshSales">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="poss-goto-pos-btn" color="success" @click="navigateTo('/pos')">
          <VIcon start>mdi-point-of-sale</VIcon>
          Ir al POS
        </VBtn>
      </VCol>

      <!-- Sales table -->
      <VCol cols="12">
        <SaleTable
          v-model:dialog-delete="saleDialogDelete"
          :loading="loading"
          :response="response"
          :removing-id="removingId"
          :highlight-id="highlightId"
          :initial-sort-by="lastOptions.sortBy"
          @edit="editSale"
          @view="viewDetail"
          @delete="deleteSale"
          @sorting="handleSorting"
        />
      </VCol>
    </VRow>
    </VSheet>
  </VContainer>
</template>

<script setup lang="ts">
import { createRealtimeListeners } from "~/utils/realtime"
import { useRowHighlight } from "~/composables/useRowHighlight"
import { buildApiParams } from "~/utils/buildApiParams"

definePageMeta({
  title: "Ventas",
  icon: "mdi-receipt",
  permission: "sale-index",
  middleware: ["authenticated", "permission"],
})

const { Sale } = useRepository()
const auth = useAuthStore()
const { $echo } = useNuxtApp()

const filterInput = ref("")
const filterSale = ref("")
const response = ref<{ data: Record<string, unknown>[]; total: number }>({ data: [], total: 0 })
const loading = ref(false)
const saving = ref(false)
const saleDialogDelete = ref(false)
const { highlightId, removingId, removeWithAnimation } = useRowHighlight()

type SortBy = { key: string; order: string }[]

const lastOptions = ref<Record<string, unknown> & { sortBy: SortBy }>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "created_at", order: "desc" }],
})
const echoConnected = ref(false)

let realtimeCleanup: (() => void) | null = null

// SSR initial load — first paint contains the list (no hydration mismatch).
const { data: initialData } = await useAsyncData(
  "pos-sales-index",
  async () => {
    const apiParams = buildApiParams(lastOptions.value)
    return await Sale.index<{ data: Record<string, unknown>[]; total: number }>(apiParams)
      .catch(() => ({ data: [] as Record<string, unknown>[], total: 0 }))
  },
  { default: () => ({ data: [] as Record<string, unknown>[], total: 0 }) },
)
response.value = initialData.value

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterSale)

watch(filterSale, () => {
  loadSales({
    page: 1,
    itemsPerPage: (lastOptions.value?.itemsPerPage as number) ?? 10,
    sortBy: lastOptions.value?.sortBy ?? [{ key: "created_at", order: "desc" }],
  })
})

async function loadSales(opts: Record<string, unknown>) {
  try {
    loading.value = true
    lastOptions.value = opts
    const params = buildApiParams(opts)
    if (filterSale.value && !params.filter) params.filter = filterSale.value
    response.value = await Sale.index<{ data: Record<string, unknown>[]; total: number }>(params)
  } catch (e) {
    console.error("Error al cargar ventas", e)
  } finally {
    loading.value = false
  }
}

async function refreshSales() {
  if (lastOptions.value) {
    await loadSales(lastOptions.value)
  }
}

let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded during SSR
    initialLoaded = true
    return
  }
  loadSales(opts)
}

function viewDetail(item: Record<string, unknown>) {
  navigateTo(`/pos/sales/${item.id}`)
}

function editSale(item: Record<string, unknown>) {
  navigateTo(`/pos/sales/${item.id}/edit`)
}

async function deleteSale(item: Record<string, unknown>) {
  try {
    saving.value = true
    await Sale.delete(item.id as number)
    saleDialogDelete.value = false
    await removeWithAnimation(response, item.id as number)
  } catch (e) {
    console.error("Error al eliminar la venta", e)
  } finally {
    saving.value = false
  }
}

// ── Real-time: keep sale statuses in sync with the KDS ────────────────

function setupRealtimeListeners() {
  const orgIds = auth.permissionsOrg["sale-index"] ?? []

  const channelConfigs = orgIds.map((orgId) => ({
    name: `pos.sales.${orgId}`,
    events: {
      ".sale.completed": (data: unknown) => handleSaleStatusUpdate(data as Record<string, unknown>),
      // Fired when a completed sale is reopened from the KDS (item undone)
      ".sale.status.updated": (data: unknown) => handleSaleStatusUpdate(data as Record<string, unknown>),
    },
  }))

  realtimeCleanup = createRealtimeListeners(
    $echo as Parameters<typeof createRealtimeListeners>[0],
    channelConfigs,
    {
      onConnected: () => { echoConnected.value = true },
      onDisconnected: () => { echoConnected.value = false },
      onError: () => { echoConnected.value = false },
    },
    realtimeCleanup,
  )
}

function handleSaleStatusUpdate(data: Record<string, unknown>) {
  const sale = response.value.data.find((s) => s.id === data.id)
  if (sale && data.status) {
    sale.status = data.status
  }
}

onMounted(() => {
  setupRealtimeListeners()
})

onBeforeUnmount(() => {
  if (realtimeCleanup) realtimeCleanup()
})
</script>

<style scoped></style>
