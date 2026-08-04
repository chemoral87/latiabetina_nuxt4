<template>
  <VRow id="cmp-pos-product-grid" density="comfortable">
    <VCol v-for="product in products" :key="product.id" cols="6" sm="4" md="3">
      <VCard
        variant="outlined"
        class="pos-product-card d-flex flex-column"
        :class="{ 'pos-product-card--in-cart': cartQty(product.id) > 0 }"
      >
        <div class="pos-product-image">
          <VImg :src="product.image_s3 || ''" height="100px" contain class="bg-grey-lighten-4 flex-shrink-0">
            <template #placeholder>
              <VRow class="fill-height ma-0" align="center" justify="center">
                <VIcon color="grey-lighten-2" size="40">mdi-package-variant</VIcon>
              </VRow>
            </template>
          </VImg>
          <VChip v-if="cartQty(product.id) > 0" color="primary" size="small" variant="elevated" class="pos-cart-badge font-weight-bold">
            {{ cartQty(product.id) }}
          </VChip>
        </div>

        <div class="px-2 pt-2 flex-grow-1">
          <div class="pos-info-row">
            <div class="pos-name text-body-2 font-weight-bold">
              {{ product.name }}
              <VIcon v-if="product.requires_preparation" size="small" class="ml-1 text-orange">mdi-chef-hat</VIcon>
            </div>
            <div class="pos-price text-primary font-weight-black">${{ formatPrice(product.price) }}</div>
          </div>
          <div v-if="showStock" class="text-caption font-weight-medium" :class="stockColor(product.stock)">
            {{ product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}` }}
          </div>
          <div v-else-if="product.stock === 0" class="text-caption font-weight-medium text-error">
            Sin stock
          </div>
        </div>

        <div class="pos-card-controls">
          <PosProductControls
            :quantity="cartQty(product.id)"
            @add="emit('add', product)"
            @decrease="emit('decrease', product)"
            @remove="emit('remove', product)"
          />
        </div>
      </VCard>
    </VCol>

    <VCol v-if="products.length === 0" cols="12" class="text-center py-12">
      <VIcon color="grey-lighten-1" size="56">mdi-package-variant-closed</VIcon>
      <div class="text-body-1 text-grey mt-2">Sin productos disponibles</div>
    </VCol>
  </VRow>
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
.pos-product-card {
  border-radius: 10px !important;
  overflow: hidden;
  transition: border-color 0.15s;
}
.pos-product-card--in-cart {
  border-color: #1976d2 !important;
  border-width: 2px !important;
}
.pos-product-image {
  position: relative;
}
.pos-cart-badge {
  position: absolute;
  top: 6px;
  right: 6px;
}
.pos-info-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
}
.pos-name {
  flex: 1;
  min-width: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pos-price {
  flex-shrink: 0;
  font-size: 0.95rem;
}
.pos-card-controls {
  padding: 8px;
}
</style>
