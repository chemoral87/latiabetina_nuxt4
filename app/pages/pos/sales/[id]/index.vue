<template>
  <VContainer :fluid="true">
    <VRow dense>
      <VCol cols="12" md="8" class="mx-auto">
        <VCard id="psid-main-card" variant="outlined" class="pa-4">
          <!-- Header -->
          <div class="d-flex align-center mb-4">
            <VIcon start color="primary" class="mr-2">mdi-receipt</VIcon>
            <div>
              <div class="text-h6 font-weight-bold">{{ sale.number }}</div>
              <div class="text-caption text-grey">{{ formatShortDate(sale.created_at as string | null) }}</div>
            </div>
            <VSpacer />
            <VChip :color="statusColor" text-color="white" size="small" class="font-weight-bold">
              {{ statusLabel }}
            </VChip>
          </div>

          <VDivider class="mb-4" />

          <!-- Sale info -->
          <VRow dense>
            <VCol cols="6" sm="3">
              <div class="text-caption text-grey">Cliente</div>
              <div class="text-body-2 font-weight-medium">{{ sale.customer_name || '—' }}</div>
            </VCol>
            <VCol cols="6" sm="3">
              <div class="text-caption text-grey">Teléfono</div>
              <div class="text-body-2 font-weight-medium">{{ sale.customer_phone || '—' }}</div>
            </VCol>
            <VCol cols="6" sm="3">
              <div class="text-caption text-grey">Método de pago</div>
              <div class="text-body-2 font-weight-medium">{{ paymentMethodLabel }}</div>
            </VCol>
            <VCol cols="6" sm="3">
              <div class="text-caption text-grey">Vendido el</div>
              <div class="text-body-2 font-weight-medium">{{ formatShortDateTime(sale.sold_at as string | null) }}</div>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <!-- Items table -->
          <div class="text-subtitle-2 font-weight-bold mb-2">Artículos</div>
          <VTable id="psid-items-tbl" density="compact">
            <thead>
              <tr>
                <th class="text-left">Producto</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Precio unitario</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in saleItems" :key="item.product_id as number">
                <td>{{ (item.product as Record<string, unknown>)?.name || '—' }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">${{ formatNumber(item.unit_price) }}</td>
                <td class="text-right font-weight-bold">${{ formatNumber(item.total_price) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold text-grey">Subtotal</td>
                <td class="text-right">${{ formatNumber(sale.subtotal) }}</td>
              </tr>
              <tr v-if="parseFloat(String(sale.discount)) > 0">
                <td colspan="3" class="text-right font-weight-bold text-grey">Descuento</td>
                <td class="text-right text-error">-${{ formatNumber(sale.discount) }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right text-h6 font-weight-black text-primary">Total</td>
                <td class="text-right text-h6 font-weight-black text-primary">${{ formatNumber(sale.total) }}</td>
              </tr>
            </tfoot>
          </VTable>

          <VDivider class="my-4" />

          <div class="d-flex justify-end">
            <VBtn id="psid-back-btn" variant="outlined" color="grey" @click="goBack">
              <VIcon start size="small">mdi-arrow-left</VIcon>
              Regresar
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { formatShortDate, formatShortDateTime } from "~/utils/date"
import { salePaymentLabel, saleStatusColor, saleStatusLabel } from "~/utils/sale"

definePageMeta({
  title: "Detalle de venta",
  icon: "mdi-point-of-sale",
  permission: "sale-index",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { Sale } = useRepository()

const sale = ref<Record<string, unknown>>({})

// Top-level await — loads the sale before render (asyncData equivalent)
{
  const res = await Sale.show<Record<string, unknown>>(route.params.id as string).catch(() => null)
  sale.value = (res as Record<string, unknown>) || {}
}

const statusColor = computed(() => saleStatusColor(sale.value.status as string | null))
const statusLabel = computed(() => saleStatusLabel(sale.value.status as string | null))
const paymentMethodLabel = computed(() => salePaymentLabel(sale.value.payment_method as string | null))

const saleItems = computed<Record<string, unknown>[]>(() => (sale.value.items as Record<string, unknown>[]) || [])

onMounted(() => {
  route.meta.back = "/pos/sales"
})

function goBack() {
  navigateTo("/pos/sales")
}

function formatNumber(val: unknown): string {
  const num = Number(val)
  if (isNaN(num)) return String(val ?? "")
  return num.toLocaleString()
}
</script>

<style scoped></style>
