<template>
  <VRow id="cmp-pos-kds-order-grid">
    <VCol
      v-for="order in activeOrders"
      :id="'pos-kds-order-' + order.id"
      :key="order.id"
      cols="12"
      sm="6"
      md="4"
      lg="3"
      xl="2"
    >
      <VCard
        variant="outlined"
        class="kds-order-card"
        :class="{ 'kds-order-completed': allDoneForSale(order) }"
      >
        <div class="kds-order-header">
          <div class="kds-order-number">{{ order.number }}</div>
          <div class="kds-order-header-right">
            <div class="kds-elapsed" :title="formatSoldAt(order.sold_at)">
              <VIcon size="x-small">mdi-clock-outline</VIcon>
              {{ elapsedTime(order.sold_at) }}
            </div>
          </div>
        </div>

        <div v-if="order.customer_name" class="kds-customer px-3 pt-1 pb-0">
          <VIcon size="small" color="grey-darken-1">mdi-account</VIcon>
          <span class="kds-customer-name">{{ order.customer_name }}</span>
        </div>

        <VDivider class="mx-3 my-2" />

        <PosKdsItemsList
          :order="order"
          :done-map="doneMap"
          :is-item-completed="isItemCompleted"
          :status-title="statusTitle"
          @toggle-row-done="(saleId, itemId, rowIndex) => emit('toggle-row-done', saleId, itemId, rowIndex)"
          @undo-row-done="(saleId, itemId, rowIndex) => emit('undo-row-done', saleId, itemId, rowIndex)"
        />

        <!-- Dismiss progress bar (20s countdown) -->
        <VProgressLinear
          v-if="orderTimers[order.id]"
          :model-value="orderTimers[order.id]?.progress || 0"
          height="4"
          color="success"
          absolute
          bottom
          class="kds-dismiss-progress"
        />
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
const DISMISS_DELAY_MS = 20_000

interface PrepItem {
  id: number
  quantity: number
  completed_quantity?: number
  product?: { requires_preparation?: boolean }
}

interface KdsOrder {
  id: number
  number?: string | number
  customer_name?: string
  sold_at?: string
  items?: PrepItem[]
}

interface TimerState {
  progress: number
  startedAt: number
  intervalId: ReturnType<typeof setInterval>
}

const props = defineProps<{
  activeOrders: KdsOrder[]
  doneMap: Record<string, Record<string, boolean>>
  isItemCompleted: (item: PrepItem) => boolean
  statusTitle: (item: PrepItem) => string
}>()

const emit = defineEmits<{
  (e: 'toggle-row-done', saleId: number, itemId: number, rowIndex: number): void
  (e: 'undo-row-done', saleId: number, itemId: number, rowIndex: number): void
  (e: 'dismiss-order', orderId: number): void
}>()

const orderTimers = ref<Record<number, TimerState>>({})

// Ticker that re-renders elapsed-time labels every 30s (replaces the aui
// parent's $forceUpdate interval).
const nowTick = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  ticker = setInterval(() => {
    nowTick.value = Date.now()
  }, 30_000)
})

onBeforeUnmount(() => {
  Object.values(orderTimers.value).forEach((timer) => {
    clearInterval(timer.intervalId)
  })
  if (ticker) clearInterval(ticker)
})

watch(
  () => props.doneMap,
  () => {
    props.activeOrders.forEach((order) => {
      if (allDoneForSale(order)) {
        // All items done — start or keep the dismissal timer
        if (!orderTimers.value[order.id]) {
          startDismissTimer(order)
        }
      } else if (orderTimers.value[order.id]) {
        // Some item was undone — cancel the dismissal timer
        cancelDismissTimer(order.id)
      }
    })
  },
  { deep: true },
)

// ── Item / Order state helpers ────────────────────────────────────────

function rowKey(itemId: number, rowIndex: number): string {
  return `${itemId}-${rowIndex}`
}

function isRowDone(sale: KdsOrder, itemId: number, rowIndex: number): boolean {
  const doneEntry = props.doneMap[sale.id]?.[rowKey(itemId, rowIndex)]
  if (doneEntry !== undefined) return !!doneEntry

  const item = sale.items?.find((i) => i.id === itemId)
  return (item?.completed_quantity ?? 0) > rowIndex
}

function getPreparationRows(sale: KdsOrder): { item: PrepItem; rowIndex: number }[] {
  const rows: { item: PrepItem; rowIndex: number }[] = []
  const items = sale.items?.filter((i) => i.product?.requires_preparation === true) || []
  items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      rows.push({ item, rowIndex: i })
    }
  })
  return rows
}

function allDoneForSale(sale: KdsOrder): boolean {
  const rows = getPreparationRows(sale)
  return rows.length > 0 && rows.every((r) => isRowDone(sale, r.item.id, r.rowIndex))
}

// ── Elapsed time ──────────────────────────────────────────────────────

function elapsedTime(soldAt?: string | null): string {
  void nowTick.value
  if (!soldAt) return '—'
  const diffMin = Math.floor((Date.now() - new Date(soldAt).getTime()) / 60_000)
  if (diffMin < 1) return 'Ahora'
  if (diffMin < 60) return `${diffMin} min`
  return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
}

function formatSoldAt(soldAt?: string | null): string {
  if (!soldAt) return ''
  return new Date(soldAt).toLocaleString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

// ── Dismiss timer ─────────────────────────────────────────────────────

function startDismissTimer(order: KdsOrder) {
  if (orderTimers.value[order.id]) return

  const startedAt = Date.now()
  const intervalId = setInterval(() => {
    const elapsed = Date.now() - startedAt
    const progress = Math.min(100, (elapsed / DISMISS_DELAY_MS) * 100)

    orderTimers.value = {
      ...orderTimers.value,
      [order.id]: { progress, startedAt, intervalId },
    }

    if (progress >= 100) {
      _finishDismissTimer(order.id)
    }
  }, 100)

  orderTimers.value = {
    ...orderTimers.value,
    [order.id]: { progress: 0, startedAt, intervalId },
  }
}

function cancelDismissTimer(orderId: number) {
  const timer = orderTimers.value[orderId]
  if (!timer) return
  clearInterval(timer.intervalId)
  const next = { ...orderTimers.value }
  delete next[orderId]
  orderTimers.value = next
}

function _finishDismissTimer(orderId: number) {
  const timer = orderTimers.value[orderId]
  if (timer) clearInterval(timer.intervalId)
  const next = { ...orderTimers.value }
  delete next[orderId]
  orderTimers.value = next
  emit('dismiss-order', orderId)
}
</script>

<style scoped>
/* ── Order cards ── */
.kds-order-card {
  transition: box-shadow 0.2s, opacity 0.2s;
  overflow: hidden;
}

.kds-order-card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12) !important;
}

.kds-order-card.kds-order-completed {
  border-color: #4caf50 !important;
  background: #f1f8e9;
}

/* ── Order header ── */
.kds-order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 12px 4px;
  gap: 8px;
}

.kds-order-number {
  font-size: 20px;
  font-weight: 800;
  color: #e65100;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.kds-order-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.kds-elapsed {
  font-size: 11px;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

/* ── Dismiss progress bar ── */
.kds-dismiss-progress {
  margin: 0;
}

/* ── Customer ── */
.kds-customer {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kds-customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #37474f;
  letter-spacing: 0.2px;
}
</style>
