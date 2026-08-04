<template>
  <VContainer id="pos-page" :fluid="true" class="pos-page px-2 pt-2" :style="{ paddingBottom: footerHeight + 'px' }">
    <!-- Loading -->
    <div v-if="productsStore.loading" id="pos-loading" class="text-center py-10">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- View toggle + Product grid/list -->
    <div v-else>
      <div id="pos-view-toggle" class="pos-view-toggle mb-2">
        <VBtnToggle v-model="viewMode" mandatory density="compact" color="primary" class="bg-grey-lighten-3">
          <VBtn id="btn-pos-toggle-grid" value="grid" icon>
            <VIcon>mdi-view-grid</VIcon>
          </VBtn>
          <VBtn id="btn-pos-toggle-list" value="list" icon>
            <VIcon>mdi-view-list</VIcon>
          </VBtn>
        </VBtnToggle>
        <VTooltip location="top">
          <template #activator="{ props }">
            <VBtn
              id="btn-pos-toggle-stock"
              size="small"
              icon
              class="ml-2 pos-stock-toggle"
              :color="showStock ? 'blue' : 'blue-darken-3'"
              v-bind="props"
              @click="showStock = !showStock"
            >
              <VIcon>{{ showStock ? 'mdi-package-variant' : 'mdi-package-variant-closed' }}</VIcon>
            </VBtn>
          </template>
          <span>{{ showStock ? 'Ocultar stock' : 'Mostrar stock' }}</span>
        </VTooltip>
      </div>

      <!-- GRID VIEW -->
      <div v-if="viewMode === 'grid'" id="pos-grid-view">
        <PosProductGrid :products="productsStore.products" :cart="cart" :show-stock="showStock" @add="addToCart" @decrease="decreaseCart" @remove="removeProduct" />
      </div>

      <!-- LIST VIEW -->
      <div v-if="viewMode === 'list'" id="pos-list-view">
        <PosProductList :products="productsStore.products" :cart="cart" :show-stock="showStock" @add="addToCart" @decrease="decreaseCart" @remove="removeProduct" />
      </div>

      <!-- Footer -->
      <PosCartFooter
        ref="posFooterEl"
        :cart="cart"
        :show-cart="showCart"
        :customer-name="customerName"
        :payment-method="paymentMethod"
        :payment-methods="paymentMethods"
        :saving="saving"
        @toggle-cart="showCart = !showCart"
        @change-qty="changeQuantity($event.index, $event.delta)"
        @remove-cart-item="removeFromCart"
        @update:customer-name="customerName = $event"
        @update:payment-method="paymentMethod = $event"
        @checkout="registerSale"
      />
    </div>
  </VContainer>
</template>

<script setup lang="ts">
import type { PosProduct } from "~/composables/useProducts"

definePageMeta({
  title: "Punto de Venta",
  icon: "mdi-point-of-sale",
  permission: "sale-index",
  middleware: ["authenticated", "permission"],
})

interface CartItem {
  product: PosProduct
  quantity: number
}

interface PaymentMethod {
  text: string
  value: string
}

const productsStore = useProductsStore()
const { Sale } = useRepository()

const cart = ref<CartItem[]>([])
const showCart = ref(false)
const customerName = ref("")
const paymentMethod = ref("cash")
const paymentMethods: PaymentMethod[] = [
  { text: "Efectivo", value: "cash" },
  { text: "Tarjeta", value: "card" },
  { text: "Transferencia", value: "transfer" },
]
const saving = ref(false)
const footerHeight = ref(160)
const viewMode = ref("grid")
const showStock = ref(false)
const posFooterEl = ref<InstanceType<typeof PosCartFooter> | null>(null)

let footerObserver: ResizeObserver | null = null

// ── localStorage persistence (client-only) ─────────────────────────────

function loadFromStorage() {
  if (!import.meta.client) return
  try {
    cart.value = JSON.parse(localStorage.getItem("pos-cart") || "[]") as CartItem[]
    customerName.value = localStorage.getItem("pos-customer-name") || ""
    paymentMethod.value = localStorage.getItem("pos-payment-method") || "cash"
    viewMode.value = localStorage.getItem("pos-view-mode") || "grid"
    showStock.value = localStorage.getItem("pos-show-stock") === "true"
  } catch {
    // Corrupted storage — start with a clean state
  }
}

watch(viewMode, (val) => {
  if (import.meta.client) localStorage.setItem("pos-view-mode", val)
})
watch(showStock, (val) => {
  if (import.meta.client) localStorage.setItem("pos-show-stock", String(val))
})
watch(customerName, (val) => {
  if (import.meta.client) localStorage.setItem("pos-customer-name", val)
})
watch(paymentMethod, (val) => {
  if (import.meta.client) localStorage.setItem("pos-payment-method", val)
})
watch(cart, (val) => {
  if (import.meta.client) localStorage.setItem("pos-cart", JSON.stringify(val))
}, { deep: true })

onMounted(() => {
  loadFromStorage()
  // Load products into the store only if empty (skip if already populated)
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
  nextTick(() => {
    const footer = posFooterEl.value?.$el || posFooterEl.value
    if (footer && typeof ResizeObserver !== "undefined") {
      footerObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          footerHeight.value = entry.contentRect.height + 8
        }
      })
      footerObserver.observe(footer)
      footerHeight.value = footer.offsetHeight + 8
    }
  })
})

onBeforeUnmount(() => {
  if (footerObserver) footerObserver.disconnect()
})

// ── Cart operations ────────────────────────────────────────────────────

function addToCart(product: PosProduct) {
  const existing = cart.value.find((i) => i.product.id === product.id)
  if (existing) {
    existing.quantity += 1
  } else {
    cart.value.push({ product, quantity: 1 })
  }
}

function decreaseCart(product: PosProduct) {
  const index = cart.value.findIndex((i) => i.product.id === product.id)
  if (index === -1) return
  if (cart.value[index].quantity <= 1) {
    cart.value.splice(index, 1)
  } else {
    cart.value[index].quantity -= 1
  }
}

function removeProduct(product: PosProduct) {
  const index = cart.value.findIndex((i) => i.product.id === product.id)
  if (index !== -1) cart.value.splice(index, 1)
}

function changeQuantity(index: number, delta: number) {
  const item = cart.value[index]
  if (!item) return
  const next = item.quantity + delta
  if (next <= 0) cart.value.splice(index, 1)
  else item.quantity = next
}

function removeFromCart(index: number) {
  cart.value.splice(index, 1)
}

// ── Checkout ───────────────────────────────────────────────────────────

async function registerSale() {
  if (cart.value.length === 0) return
  const orgId = cart.value[0]?.product?.org_id
  if (!orgId) return

  try {
    saving.value = true
    await Sale.create({
      org_id: orgId,
      customer_name: customerName.value || null,
      customer_phone: null,
      payment_method: paymentMethod.value,
      discount: 0,
      items: cart.value.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    })

    cart.value = []
    customerName.value = ""
    showCart.value = false
    if (import.meta.client) localStorage.removeItem("pos-cart")

    // Refresh product stock from server (silent — don't hide products)
    await productsStore.fetchProducts({ skipLoading: true, force: true })
  } catch (error) {
    console.error("Error al registrar la venta", error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.pos-page {
  padding-bottom: 16px;
}

/* ── View toggle ── */
.pos-view-toggle {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 4px;
}

.pos-stock-toggle {
  transition: color 0.2s;
}
</style>
