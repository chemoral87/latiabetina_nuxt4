<template>
  <VContainer :fluid="true" class="cash-close-page px-4 pt-4 pb-16">
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <VIcon start color="primary" class="mr-2">mdi-cash-register</VIcon>
      <span class="text-h6 font-weight-black">Cierre de Caja</span>
    </div>

    <!-- Date filter -->
    <div class="mb-4">
      <MyDatePicker v-model="selectedDate" label="Fecha" @update:model-value="onDateChange" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <VRow density="comfortable" class="mb-4">
        <VCol cols="12" sm="4">
          <VCard id="posc-cash-card" variant="outlined" class="cash-close-card cash-close-card--cash">
            <div class="d-flex align-center mb-2">
              <VIcon color="green-darken-1" class="mr-2">mdi-cash</VIcon>
              <span class="text-subtitle-2 font-weight-bold">Efectivo</span>
            </div>
            <div class="cash-close-card-amount text-green-darken-1 font-weight-black">
              ${{ formatPrice(summary.cash) }}
            </div>
            <div class="text-caption text-grey mt-1">{{ summary.cashCount }} venta(s)</div>
          </VCard>
        </VCol>
        <VCol cols="12" sm="4">
          <VCard id="posc-card-card" variant="outlined" class="cash-close-card cash-close-card--card">
            <div class="d-flex align-center mb-2">
              <VIcon color="blue-darken-1" class="mr-2">mdi-credit-card</VIcon>
              <span class="text-subtitle-2 font-weight-bold">Tarjeta</span>
            </div>
            <div class="cash-close-card-amount text-blue-darken-1 font-weight-black">
              ${{ formatPrice(summary.card) }}
            </div>
            <div class="text-caption text-grey mt-1">{{ summary.cardCount }} venta(s)</div>
          </VCard>
        </VCol>
        <VCol cols="12" sm="4">
          <VCard id="posc-transfer-card" variant="outlined" class="cash-close-card cash-close-card--transfer">
            <div class="d-flex align-center mb-2">
              <VIcon color="purple-darken-1" class="mr-2">mdi-bank-transfer</VIcon>
              <span class="text-subtitle-2 font-weight-bold">Transferencia</span>
            </div>
            <div class="cash-close-card-amount text-purple-darken-1 font-weight-black">
              ${{ formatPrice(summary.transfer) }}
            </div>
            <div class="text-caption text-grey mt-1">{{ summary.transferCount }} venta(s)</div>
          </VCard>
        </VCol>
      </VRow>

      <!-- Total row -->
      <VCard id="posc-total-card" variant="outlined" class="cash-close-total-card mb-6">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-caption text-grey">Total del día</div>
            <div class="text-h4 font-weight-black text-primary">${{ formatPrice(summary.total) }}</div>
          </div>
          <VChip color="primary" size="large" variant="elevated" class="font-weight-bold">
            {{ summary.totalCount }} venta(s)
          </VChip>
        </div>
      </VCard>

      <!-- Product metrics -->
      <div class="d-flex align-center mb-3">
        <VIcon color="orange-darken-2" class="mr-2">mdi-package-variant</VIcon>
        <span class="text-subtitle-1 font-weight-bold">Totales por producto</span>
      </div>

      <VCard id="posc-products-card" variant="outlined" class="mb-6">
        <VTable id="posc-products-tbl" density="compact">
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th class="text-center">Cant. vendida</th>
              <th class="text-right">Total recaudado</th>
              <th class="text-right">% del total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in productTotals" :key="row.id">
              <td class="font-weight-medium">{{ row.name }}</td>
              <td class="text-center">
                <VChip size="x-small" color="orange-darken-2" variant="elevated" class="font-weight-bold">
                  {{ row.qty }}
                </VChip>
              </td>
              <td class="text-right font-weight-bold text-primary">
                ${{ formatPrice(row.total) }}
              </td>
              <td class="text-right text-grey">
                {{ row.pct }}%
              </td>
            </tr>
            <tr v-if="productTotals.length === 0">
              <td colspan="4" class="text-center py-6 text-grey">Sin datos de productos</td>
            </tr>
          </tbody>
          <tfoot v-if="productTotals.length > 0">
            <tr class="font-weight-bold bg-grey-lighten-4">
              <td>Total</td>
              <td class="text-center">{{ productTotals.reduce((a, r) => a + r.qty, 0) }}</td>
              <td class="text-right text-primary">${{ formatPrice(summary.total) }}</td>
              <td class="text-right">100%</td>
            </tr>
          </tfoot>
        </VTable>
      </VCard>

      <!-- Sales detail -->
      <div class="d-flex align-center mb-3">
        <VIcon color="primary" class="mr-2">mdi-receipt</VIcon>
        <span class="text-subtitle-1 font-weight-bold">Detalle de ventas</span>
      </div>
      <VCard variant="outlined">
        <VTable id="posc-sales-tbl" density="compact">
          <thead>
            <tr>
              <th class="text-left">Venta</th>
              <th class="text-left">Cliente</th>
              <th class="text-center">Método</th>
              <th class="text-right">Total</th>
              <th class="text-right">Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id">
              <td class="font-weight-bold">{{ sale.number }}</td>
              <td>{{ sale.customer_name || '—' }}</td>
              <td class="text-center">
                <VChip size="x-small" :color="paymentColor(sale.payment_method as string)" variant="elevated">
                  {{ paymentLabel(sale.payment_method as string) }}
                </VChip>
              </td>
              <td class="text-right font-weight-bold text-primary">
                ${{ formatPrice(sale.total as string) }}
              </td>
              <td class="text-right text-grey">
                {{ formatTime(sale.sold_at) }}
              </td>
            </tr>
            <tr v-if="sales.length === 0">
              <td colspan="5" class="text-center py-6 text-grey">
                Sin ventas en esta fecha
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </template>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Cierre de Caja",
  icon: "mdi-point-of-sale",
  permission: "sale-index",
  middleware: ["authenticated", "permission"],
})

interface ProductTotalsRow {
  id: number
  name: unknown
  qty: number
  total: string
  pct: string
}

const { Sale } = useRepository()
const notify = useNotifyStore()
const auth = useAuthStore()

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const sales = ref<Record<string, unknown>[]>([])
const loading = ref(false)

async function fetchDaily(date: string) {
  const orgIds = auth.permissionsOrg["sale-index"] ?? []
  const orgId = orgIds.length === 1 ? orgIds[0] : null
  const res = await Sale.daily<{ data?: Record<string, unknown>[] }>(date, orgId)
  return res?.data ?? []
}

// SSR initial load — first paint contains today's sales (no mismatch).
const { data: initialData } = await useAsyncData(
  "pos-cash-close-index",
  () => fetchDaily(selectedDate.value).catch(() => []),
  { default: () => [] },
)
sales.value = initialData.value

async function onDateChange(date: string | null) {
  if (!date) return
  selectedDate.value = date
  loading.value = true
  try {
    sales.value = await fetchDaily(date)
  } catch (error) {
    console.error("Error al cargar ventas", error)
    notify.notify({ error: "Error al cargar ventas del día" })
  } finally {
    loading.value = false
  }
}

const summary = computed(() => {
  const list = (method: string) =>
    sales.value.filter((s) => s.payment_method === method)
  const sumTotal = (rows: Record<string, unknown>[]) =>
    rows.reduce((acc, s) => acc + parseFloat(s.total as string), 0)

  const cash = sumTotal(list("cash"))
  const card = sumTotal(list("card"))
  const transfer = sumTotal(list("transfer"))

  return {
    cash: cash.toFixed(2),
    cashCount: list("cash").length,
    card: card.toFixed(2),
    cardCount: list("card").length,
    transfer: transfer.toFixed(2),
    transferCount: list("transfer").length,
    total: (cash + card + transfer).toFixed(2),
    totalCount: sales.value.length,
  }
})

/** Aggregate quantities and totals per product across all sales */
const productTotals = computed<ProductTotalsRow[]>(() => {
  const map: Record<number, { id: number; name: unknown; qty: number; total: number }> = {}
  const grandTotal = parseFloat(summary.value.total) || 0

  sales.value.forEach((sale) => {
    const items = (sale.items as Record<string, unknown>[]) ?? []
    items.forEach((item) => {
      const product = item.product as Record<string, unknown> | undefined
      if (!product) return
      const id = product.id as number
      if (!map[id]) {
        map[id] = { id, name: product.name, qty: 0, total: 0 }
      }
      map[id].qty += item.quantity as number
      map[id].total += parseFloat(String(item.total_price || 0))
    })
  })

  return Object.values(map)
    .sort((a, b) => b.total - a.total)
    .map((row) => ({
      ...row,
      total: row.total.toFixed(2),
      pct: grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : "0.0",
    }))
})

function formatPrice(val: unknown): string {
  const num = parseFloat(String(val))
  if (isNaN(num)) return String(val)
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTime(datetime: unknown): string {
  if (!datetime) return "—"
  const m = String(datetime).match(/(?:T|\s)(\d{1,2}):(\d{2})/)
  if (m) return `${m[1].padStart(2, "0")}:${m[2]}`
  return "—"
}

function paymentLabel(method: string): string {
  return { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia" }[method] || method
}

function paymentColor(method: string): string {
  return { cash: "green", card: "blue", transfer: "purple" }[method] || "grey"
}
</script>

<style scoped>
.cash-close-page {
  max-width: 900px;
}
.cash-close-card {
  border-radius: 12px !important;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.cash-close-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.cash-close-card--cash { border-left: 4px solid #43a047; }
.cash-close-card--card { border-left: 4px solid #1565c0; }
.cash-close-card--transfer { border-left: 4px solid #7b1fa2; }
.cash-close-card-amount {
  font-size: 1.6rem;
  line-height: 1.2;
}
.cash-close-total-card {
  border-radius: 12px !important;
  padding: 16px 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}
</style>
