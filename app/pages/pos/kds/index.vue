<template>
  <VContainer id="pos-kds-page" fluid class="kds-page pa-3">
    <KdsOrdersBoard
      :active-orders="activeOrders"
      :done-map="doneMap"
      :loading="initialLoading"
      :error="error"
      :echo-connected="echoConnected"
      :sound-enabled="soundEnabled"
      :is-item-completed="isItemCompleted"
      :status-title="statusTitle"
      @reload="loadActiveOrders"
      @update:sound-enabled="soundEnabled = $event"
      @dismiss-order="dismissOrder"
      @toggle-row-done="toggleRowDone"
      @undo-row-done="undoRowDone"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { createRealtimeListeners } from "~/utils/realtime"
import { useUAParser } from "~/utils/userAgent"

definePageMeta({
  title: "Pantalla de Cocina",
  icon: "mdi-point-of-sale",
  permission: "pos-kds",
  middleware: ["authenticated", "permission"],
})

const { Sale } = useRepository()
const notify = useNotifyStore()
const auth = useAuthStore()
const uaParser = useUAParser()
const { $echo } = useNuxtApp()

// All sales loaded from the KDS endpoint (with preparation items only)
const orders = ref<Record<string, unknown>[]>([])
const initialLoading = ref(false)
const error = ref<string | null>(null)

// Per-order, per-item done state: { saleId: { `itemId-rowIndex`: true } }
const doneMap = ref<Record<string, Record<string, boolean>>>({})
// Dismissed order IDs (hidden from view)
const dismissedIds = ref<Record<string, boolean>>({})

// Real-time
const echoConnected = ref(false)

// UI
const soundEnabled = ref(true)

let realtimeCleanup: (() => void) | null = null

/** Non-dismissed orders that have preparation items, sorted oldest-first */
const activeOrders = computed(() =>
  orders.value
    .filter((o) => !dismissedIds.value[o.id as number])
    .sort(
      (a, b) =>
        new Date((a.sold_at as string) || (a.created_at as string)).getTime() -
        new Date((b.sold_at as string) || (b.created_at as string)).getTime(),
    ),
)

onMounted(() => {
  setupRealtimeListeners()
  loadActiveOrders()
  document.addEventListener("visibilitychange", handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (realtimeCleanup) realtimeCleanup()
  document.removeEventListener("visibilitychange", handleVisibilityChange)
})

// ── Data loading ──────────────────────────────────────────────────────

async function loadActiveOrders() {
  try {
    initialLoading.value = true
    error.value = null

    // Fetch all sales currently in 'preparing' status (no date constraint).
    const response = await Sale.kds<{ data?: unknown[] }>()
    const prepSales = response?.data || response || []

    orders.value = prepSales as Record<string, unknown>[]
  } catch (err) {
    error.value = "No se pudieron cargar las órdenes."
    console.error(err)
  } finally {
    initialLoading.value = false
  }
}

// ── Real-time ─────────────────────────────────────────────────────────

function setupRealtimeListeners() {
  const orgIds = auth.permissionsOrg["pos-kds"] ?? []

  const channelConfigs = orgIds.map((orgId) => ({
    name: `pos.kds.${orgId}`,
    events: {
      ".sale.created": (data: unknown) => handleIncomingSale(data as Record<string, unknown>),
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

function handleIncomingSale(data: Record<string, unknown>) {
  // Only show orders that have preparation items
  const items = (data.items as { product?: { requires_preparation?: boolean } }[]) ?? []
  const hasPrepItems = items.some((i) => i.product?.requires_preparation === true)
  if (!hasPrepItems) return

  // Avoid duplicates — all side effects gated here
  if (orders.value.some((o) => o.id === data.id)) return

  if (soundEnabled.value) {
    playNotificationSound()
  }

  notify.notify({
    info: `Nueva orden: ${data.number}${data.customer_name ? " — " + data.customer_name : ""}`,
  })

  orders.value = [...orders.value, data]
}

/**
 * Mobile reconnect: when the tab becomes visible again, reload the KDS
 * orders so any orders missed while the screen was off are picked up.
 */
async function handleVisibilityChange() {
  if (document.hidden || !uaParser.isMobile()) return
  try {
    await loadActiveOrders()
  } catch (_) {
    // Silent — loadActiveOrders handles its own error state
  }
}

// ── Item / Order state ────────────────────────────────────────────────

function rowKey(itemId: number, rowIndex: number) {
  return `${itemId}-${rowIndex}`
}

function isRowDone(saleId: number, itemId: number, rowIndex: number): boolean {
  const sale = orders.value.find((o) => o.id === saleId)
  const item = (sale?.items as { id: number; completed_quantity?: number }[] | undefined)?.find((i) => i.id === itemId)
  if ((item?.completed_quantity ?? 0) > rowIndex) return true
  return !!doneMap.value[saleId]?.[rowKey(itemId, rowIndex)]
}

function isItemCompleted(item: { completed_quantity?: number; quantity?: number }): boolean {
  return (item?.completed_quantity ?? 0) >= (item?.quantity ?? 0)
}

function preparationStatusLabel(code: string): string {
  const labels: Record<string, string> = {
    PEN: "Pendiente",
    REA: "Listo",
    COM: "Completada",
  }
  return labels[code] || code || "—"
}

function statusTitle(item: { preparation_status?: string }): string {
  if (!item?.preparation_status) return ""
  return `${preparationStatusLabel(item.preparation_status)} ${item.preparation_status}`
}

function markRowDone(saleId: number, itemId: number, rowIndex: number) {
  const map = { ...(doneMap.value[saleId] || {}) }
  map[rowKey(itemId, rowIndex)] = true
  doneMap.value = { ...doneMap.value, [saleId]: map }
}

async function toggleRowDone(saleId: number, itemId: number, rowIndex: number) {
  if (isRowDone(saleId, itemId, rowIndex)) return

  const sale = orders.value.find((o) => o.id === saleId)
  if (!sale) return

  const key = rowKey(itemId, rowIndex)
  markRowDone(saleId, itemId, rowIndex)

  try {
    const response = await Sale.updateItem<{ data?: unknown }>(saleId, itemId, "COM")
    const updatedItem = response?.data
    if (updatedItem) {
      const items = sale.items as { id: number }[] | undefined
      const itemIndex = items?.findIndex((i) => i.id === itemId) ?? -1
      if (itemIndex !== -1 && items) {
        items[itemIndex] = updatedItem as { id: number }
      }
    }
  } catch (err) {
    console.error(err)
    const map = { ...(doneMap.value[saleId] || {}) }
    map[key] = false
    doneMap.value = { ...doneMap.value, [saleId]: map }
  }
}

async function undoRowDone(saleId: number, itemId: number, rowIndex: number) {
  const sale = orders.value.find((o) => o.id === saleId)
  if (!sale) return

  const key = rowKey(itemId, rowIndex)
  const map = { ...(doneMap.value[saleId] || {}) }
  map[key] = false
  doneMap.value = { ...doneMap.value, [saleId]: map }

  try {
    const response = await Sale.updateItem<{ data?: unknown }>(saleId, itemId, "PEN")
    const updatedItem = response?.data
    if (updatedItem) {
      const items = sale.items as { id: number }[] | undefined
      const itemIndex = items?.findIndex((i) => i.id === itemId) ?? -1
      if (itemIndex !== -1 && items) {
        items[itemIndex] = updatedItem as { id: number }
      }
    }
  } catch (err) {
    console.error(err)
    const newMap = { ...(doneMap.value[saleId] || {}) }
    newMap[key] = true
    doneMap.value = { ...doneMap.value, [saleId]: newMap }
  }
}

function dismissOrder(orderId: number) {
  // Items were already individually completed via toggleRowDone.
  // Just hide the order from the KDS board.
  dismissedIds.value = { ...dismissedIds.value, [orderId]: true }
}

// ── Audio ─────────────────────────────────────────────────────────────

async function playNotificationSound() {
  try {
    if (!import.meta.client) return
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    await ctx.resume()

    const masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7)

    const note = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
      g.gain.setValueAtTime(0, ctx.currentTime + start)
      g.gain.linearRampToValueAtTime(1, ctx.currentTime + start + 0.02)
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur)
      osc.connect(g).connect(masterGain)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + dur)
    }

    note(698, 0, 0.12)    // F5
    note(1047, 0.13, 0.2) // C6

    setTimeout(() => ctx.close(), 1000)
  } catch (_) {
    // Audio not supported
  }
}
</script>

<style scoped>
.kds-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
