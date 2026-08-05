<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Filter -->
      <VCol cols="12" md="3">
        <VTextField
          id="poss-filter-tf-1"
          v-model="filterInput"
          append-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          placeholder="Buscar venta..."
        />
      </VCol>

      <!-- Action buttons -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="poss-refresh-btn" color="primary" :loading="loading" class="mr-4" @click="refreshSales">
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
          :response="response"
          :loading="loading"
          :highlight-id="highlightId"
          :removing-id="removingId"
          @sorting="handleSorting"
          @view="viewDetail"
          @edit="editSale"
          @delete="deleteSale"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { createRealtimeListeners } from "~/utils/realtime"
import { useRowHighlight } from "~/composables/useRowHighlight"

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

const lastOptions = ref<Record<string, unknown> | null>(null)
const echoConnected = ref(false)

let realtimeCleanup: (() => void) | null = null

// SSR initial load — first paint contains the list (no hydration mismatch).
const { data: initialData } = await useAsyncData(
  "pos-sales-index",
  async () => {
    const apiParams: Record<string, unknown> = {
      page: 1,
      itemsPerPage: 10,
      sortBy: ["created_at"],
      sortDesc: [true],
    }
    return await Sale.index<{ data: Record<string, unknown>[]; total: number }>(apiParams)
      .catch(() => ({ data: [] as Record<string, unknown>[], total: 0 }))
  },
  { default: () => ({ data: [] as Record<string, unknown>[], total: 0 }) },
)
response.value = initialData.value
lastOptions.value = {
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "created_at", order: "desc" }],
}

// Debounced filter (300ms)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterSale.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterSale.value = val
  }, 300)
})

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
    const params: Record<string, unknown> = {
      page: opts.page ?? 1,
      itemsPerPage: opts.itemsPerPage ?? 10,
    }
    const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
    if (sortBy.length > 0) {
      params.sortBy = [sortBy[0].key]
      params.sortDesc = [sortBy[0].order === 'desc']
    }
    if (filterSale.value) {
      params.filter = filterSale.value
    }
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
      ".sale.completed": (data: unknown) => handleSaleCompleted(data as Record<string, unknown>),
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

function handleSaleCompleted(data: Record<string, unknown>) {
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
