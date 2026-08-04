<template>
  <div id="cmp-pos-product-list">
    <div class="pos-list-header d-flex align-center">
      <div class="pos-list-col-thumb"></div>
      <div class="pos-list-col-name text-caption font-weight-bold text-grey">Producto</div>
      <div class="pos-list-col-price text-caption font-weight-bold text-grey">Precio</div>
      <div class="pos-list-col-actions text-caption font-weight-bold text-grey text-center"></div>
    </div>

    <div
      v-for="product in products"
      :key="product.id"
      class="pos-list-item d-flex align-center"
      :class="{ 'pos-list-item--in-cart': cartQty(product.id) > 0 }"
    >
      <div class="pos-list-col-thumb">
        <VImg :src="product.image_s3 || ''" width="44" height="44" contain class="pos-list-thumb bg-grey-lighten-4 rounded">
          <template #placeholder>
            <VRow class="fill-height ma-0" align="center" justify="center">
              <VIcon color="grey-lighten-2" size="22">mdi-package-variant</VIcon>
            </VRow>
          </template>
        </VImg>
      </div>

      <div class="pos-list-col-name">
        <div class="pos-list-name text-body-2 font-weight-bold">
          {{ product.name }}
          <VIcon v-if="product.requires_preparation" size="small" class="ml-1 text-orange">mdi-chef-hat</VIcon>
        </div>
        <div class="pos-list-col-info">
          <template v-if="showStock">
            <span class="text-caption font-weight-medium" :class="stockColor(product.stock)">
              {{ product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}` }}
            </span>
          </template>
          <span v-else-if="product.stock === 0" class="text-caption font-weight-medium text-error">
            Sin stock
          </span>
          <span class="pos-list-price-inline text-primary font-weight-black">${{ formatPrice(product.price) }}</span>
        </div>
      </div>

      <div class="pos-list-col-price">
        <span class="text-primary font-weight-black">${{ formatPrice(product.price) }}</span>
      </div>

      <div class="pos-list-col-actions">
        <PosProductControls
          :quantity="cartQty(product.id)"
          @add="emit('add', product)"
          @decrease="emit('decrease', product)"
          @remove="emit('remove', product)"
        />
      </div>
    </div>

    <div v-if="products.length === 0" class="text-center py-12">
      <VIcon color="grey-lighten-1" size="56">mdi-package-variant-closed</VIcon>
      <div class="text-body-1 text-grey mt-2">Sin productos disponibles</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PosProduct } from "~/composables/useProducts"

interface CartItem {
  product: PosProduct
  quantity: number
}

const props = defineProps<{
  products: PosProduct[]
  cart: CartItem[]
  showStock?: boolean
}>()

const emit = defineEmits<{
  (e: 'add', product: PosProduct): void
  (e: 'decrease', product: PosProduct): void
  (e: 'remove', product: PosProduct): void
}>()

function cartQty(productId: number): number {
  return props.cart.find((i) => i.product.id === productId)?.quantity ?? 0
}

function formatPrice(val: number | string): string {
  const num = parseFloat(String(val))
  if (isNaN(num)) return String(val)
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function stockColor(stock: number): string {
  if (stock === 0) return 'text-error'
  if (stock < 5) return 'text-warning'
  return 'text-grey'
}
</script>

<style scoped>
.pos-list-header {
  padding: 4px 12px;
  margin-bottom: 4px;
}
.pos-list-item {
  padding: 6px 12px;
  margin-bottom: 6px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.15s, background 0.15s;
  min-height: 60px;
}
.pos-list-item--in-cart {
  border-color: #1976d2;
  border-width: 2px;
  background: #e3f2fd;
}
.pos-list-col-thumb {
  width: 52px;
  min-width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pos-list-col-name {
  flex: 1;
  min-width: 0;
  padding: 0 8px;
}
.pos-list-col-price {
  width: 90px;
  min-width: 90px;
  text-align: right;
  padding: 0 8px;
  font-size: 0.9rem;
}
.pos-list-col-actions {
  width: 180px;
  min-width: 180px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.pos-list-thumb {
  border-radius: 8px;
  background: #fafafa;
}
.pos-list-name {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pos-list-col-info {
  line-height: 1.6;
}

.pos-list-price-inline {
  display: none;
  font-size: 0.9rem;
}

/* ── Responsive: small screens ── */
@media (max-width: 600px) {
  .pos-list-header .pos-list-col-price {
    display: none;
  }
  .pos-list-col-price {
    display: none;
  }
  .pos-list-price-inline {
    display: block;
  }
  .pos-list-col-actions {
    width: 160px;
    min-width: 160px;
  }
}
</style>
