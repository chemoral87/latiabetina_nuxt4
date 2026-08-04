<template>
  <div id="cmp-pos-cart-footer" ref="posFooter" class="pos-footer">
    <div id="pos-footer-toggle-bar" class="pos-footer-toggle-bar" @click="emit('toggle-cart')">
      <div class="d-flex align-center">
        <VIcon size="small" class="mr-1" color="primary">mdi-cart</VIcon>
        <span class="font-weight-bold">
          {{ cartItemCount }} artículo(s)
        </span>
        <VChip v-if="cart.length > 0" size="x-small" color="primary" variant="elevated" class="ml-2 font-weight-bold">
          ${{ formatPrice(total) }}
        </VChip>
      </div>
      <VIcon size="small" :color="showCart ? 'primary' : 'grey'">
        {{ showCart ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
      </VIcon>
    </div>

    <div v-show="showCart" id="pos-cart-panel" class="pos-cart-panel">
      <div v-if="cart.length === 0" class="text-caption text-grey pa-2 text-center">
        Sin artículos en el carrito
      </div>
      <table v-else id="pos-cart-table" class="pos-cart-table">
        <thead>
          <tr>
            <th class="text-left">Producto</th>
            <th class="text-center">Cant.</th>
            <th class="text-right">Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in cart" :key="item.product.id">
            <td class="pos-ct-name">
              {{ item.product.name }}
              <VIcon v-if="item.product.requires_preparation" size="small" class="ml-1 text-orange">mdi-chef-hat</VIcon>
            </td>
            <td class="pos-ct-qty">
              <div class="d-flex align-center justify-center" style="gap:4px">
                <VBtn icon rounded="circle" size="x-small" variant="flat" color="error" @click="emit('change-qty', { index, delta: -1 })">
                  <VIcon size="x-small" color="white">mdi-minus</VIcon>
                </VBtn>
                <span class="font-weight-bold">{{ item.quantity }}</span>
                <VBtn icon rounded="circle" size="x-small" variant="flat" color="success" @click="emit('change-qty', { index, delta: 1 })">
                  <VIcon size="x-small" color="white">mdi-plus</VIcon>
                </VBtn>
              </div>
            </td>
            <td class="pos-ct-total text-primary font-weight-bold">
              ${{ formatPrice((item.product.price * item.quantity).toFixed(2)) }}
            </td>
            <td class="pos-ct-del">
              <VBtn icon rounded="circle" size="x-small" variant="outlined" color="error" @click="emit('remove-cart-item', index)">
                <VIcon size="small" color="error" class="font-weight-black">mdi-close</VIcon>
              </VBtn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="pos-footer-bottom" class="pos-footer-bottom">
      <div id="pos-footer-fields-row" class="pos-footer-fields-row">
        <VTextField
          id="tf-pos-cliente-1"
          :model-value="customerName"
          label="Cliente"
          variant="outlined"
          density="compact"
          hide-details
          class="pos-field"
          @update:model-value="emit('update:customerName', $event)"
        />
        <VSelect
          id="sel-pos-payment-1"
          :model-value="paymentMethod"
          :items="paymentMethods"
          item-title="text"
          item-value="value"
          label="Método de pago"
          variant="outlined"
          density="compact"
          hide-details
          class="pos-field"
          @update:model-value="emit('update:paymentMethod', $event)"
        />
      </div>
      <div id="pos-footer-action-row" class="pos-footer-action-row">
        <div id="pos-total-block" class="pos-total-block">
          <div class="text-h5 font-weight-black text-primary">${{ formatPrice(total) }}</div>
        </div>
        <VBtn
          id="pos-cobrar-btn"
          color="primary"
          size="x-large"
          block
          :loading="saving"
          :disabled="cart.length === 0"
          class="pos-cobrar-btn"
          @click="emit('checkout')"
        >
          <VIcon start>mdi-cash-register</VIcon>
          Cobrar
        </VBtn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PosProduct {
  id: number
  name: string
  price: number
  requires_preparation?: boolean
}

interface CartItem {
  product: PosProduct
  quantity: number
}

interface PaymentMethod {
  text: string
  value: string
}

const props = defineProps<{
  cart: CartItem[]
  showCart: boolean
  customerName: string
  paymentMethod: string
  paymentMethods: PaymentMethod[]
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-cart'): void
  (e: 'change-qty', payload: { index: number; delta: number }): void
  (e: 'remove-cart-item', index: number): void
  (e: 'update:customerName', val: string): void
  (e: 'update:paymentMethod', val: string): void
  (e: 'checkout'): void
}>()

const total = computed(() =>
  props.cart
    .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    .toFixed(2),
)

const cartItemCount = computed(() =>
  props.cart.reduce((acc, item) => acc + item.quantity, 0),
)

function formatPrice(val: number | string): string {
  const num = parseFloat(String(val))
  if (isNaN(num)) return String(val)
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.pos-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: #fff;
  border-top: 2px solid #e0e0e0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.13);
}
.pos-footer-toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  user-select: none;
  background: #fafafa;
  font-size: 0.88rem;
}
.pos-footer-toggle-bar:active {
  background: #f0f0f0;
}
.pos-cart-panel {
  max-height: 220px;
  overflow-y: auto;
  border-bottom: 1px solid #f0f0f0;
}
.pos-cart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.pos-cart-table thead tr {
  background: #f5f5f5;
}
.pos-cart-table th {
  padding: 6px 10px;
  font-weight: 700;
  color: #555;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.pos-cart-table tbody tr:nth-child(even) {
  background: #fafafa;
}
.pos-cart-table td {
  padding: 6px 10px;
  vertical-align: middle;
}
.pos-ct-name {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pos-ct-qty {
  white-space: nowrap;
}
.pos-ct-total {
  text-align: right;
  white-space: nowrap;
}
.pos-ct-del {
  text-align: center;
  width: 40px;
}
.pos-footer-bottom {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pos-footer-fields-row {
  display: flex;
  gap: 8px;
}
.pos-field {
  flex: 1;
  min-width: 0;
}
.pos-footer-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pos-total-block {
  flex-shrink: 0;
  line-height: 1.1;
}
.pos-cobrar-btn {
  flex: 1;
  height: 52px !important;
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  letter-spacing: 0.03em !important;
}
</style>
