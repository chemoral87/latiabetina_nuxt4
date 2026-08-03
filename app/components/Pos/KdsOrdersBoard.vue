<template>
  <div>
    <!-- ── Loading ──────────────────────────────────────────────────── -->
    <div v-if="loading" class="kds-state kds-state--loading">
      <VProgressCircular indeterminate color="primary" size="56" />
    </div>

    <!-- ── Error ────────────────────────────────────────────────────── -->
    <div v-else-if="error" class="kds-state kds-state--error">
      <VAlert type="error" max-width="480">{{ error }}</VAlert>
    </div>

    <!-- ── Empty (all orders completed) ─────────────────────────────── -->
    <div v-else-if="activeOrders.length === 0" class="kds-state kds-state--empty">
      <VIcon size="72" color="success">mdi-check-circle-outline</VIcon>
      <div class="text-h6 mt-4 text-grey">Sin órdenes pendientes</div>
      <div class="text-body-2 text-grey mt-1">Todas las órdenes han sido completadas</div>
      <div class="mt-6">
        <VBtn variant="outlined" color="grey" id="btn-kds-reload" @click="emit('reload')">
          <VIcon start size="small">mdi-refresh</VIcon>
          Recargar
        </VBtn>
      </div>
    </div>

    <!-- ── Orders board ─────────────────────────────────────────────── -->
    <template v-else>
      <!-- Header strip -->
      <VRow align="center" class="mb-4">
        <VCol cols="auto">
          <VIcon size="32" color="orange-darken-2">mdi-chef-hat</VIcon>
        </VCol>
        <VCol>
          <div class="text-h5 font-weight-bold d-flex align-center" style="gap: 12px">
            Pantalla de Cocina
            <VChip color="orange-darken-2" size="small" variant="elevated" class="font-weight-bold">
              {{ activeOrders.length }} {{ activeOrders.length === 1 ? 'orden' : 'órdenes' }}
            </VChip>
          </div>
        </VCol>
        <VCol cols="auto" class="d-flex align-center" style="gap: 10px">
          <!-- Sound toggle -->
          <VTooltip text="Sonido activado / desactivado" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <VBtn
                icon
                size="small"
                v-bind="tooltipProps"
                :color="soundEnabled ? 'orange-darken-2' : 'grey'"
                variant="flat"
                id="btn-kds-sound"
                @click="emit('update:sound-enabled', !soundEnabled)"
              >
                <VIcon>{{ soundEnabled ? 'mdi-volume-high' : 'mdi-volume-off' }}</VIcon>
              </VBtn>
            </template>
          </VTooltip>

          <!-- Live indicator -->
          <VTooltip :text="echoConnected ? 'Conectado' : 'Sin conexión en tiempo real'" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps" class="d-flex align-center">
                <span
                  class="kds-live-dot"
                  :class="echoConnected ? 'kds-live-dot--on' : 'kds-live-dot--off'"
                />
              </span>
            </template>
          </VTooltip>
        </VCol>
      </VRow>

      <KdsOrderGrid
        :active-orders="activeOrders"
        :done-map="doneMap"
        :is-item-completed="isItemCompleted"
        :status-title="statusTitle"
        @toggle-row-done="(saleId, itemId, rowIndex) => emit('toggle-row-done', saleId, itemId, rowIndex)"
        @undo-row-done="(saleId, itemId, rowIndex) => emit('undo-row-done', saleId, itemId, rowIndex)"
        @dismiss-order="(orderId) => emit('dismiss-order', orderId)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
interface PrepItem {
  id: number
  quantity: number
  completed_quantity?: number
  product?: { requires_preparation?: boolean }
}

interface KdsOrder {
  id: number
  items?: PrepItem[]
}

const props = withDefaults(defineProps<{
  activeOrders: KdsOrder[]
  doneMap: Record<string, Record<string, boolean>>
  isItemCompleted: (item: PrepItem) => boolean
  statusTitle: (item: PrepItem) => string
  loading?: boolean
  error?: string | null
  echoConnected?: boolean
  soundEnabled?: boolean
}>(), {
  loading: false,
  error: null,
  echoConnected: false,
  soundEnabled: true,
})

const emit = defineEmits<{
  (e: 'reload'): void
  (e: 'update:sound-enabled', val: boolean): void
  (e: 'dismiss-order', orderId: number): void
  (e: 'toggle-row-done', saleId: number, itemId: number, rowIndex: number): void
  (e: 'undo-row-done', saleId: number, itemId: number, rowIndex: number): void
}>()
</script>

<style scoped>
/* ── Full-page background ── */
.kds-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* ── Live indicator dot ── */
.kds-live-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}

.kds-live-dot--on {
  background: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.25);
  animation: kds-pulse 2s infinite;
}

.kds-live-dot--off {
  background: #bdbdbd;
}

@keyframes kds-pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
</style>
