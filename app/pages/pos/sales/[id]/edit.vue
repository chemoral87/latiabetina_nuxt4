<template>
  <VContainer :fluid="true">
    <VRow dense>
      <VCol cols="12" md="8" class="mx-auto">
        <VCard id="card-psed-main" variant="outlined" class="pa-4">
          <!-- Header -->
          <div class="d-flex align-center mb-4">
            <VIcon start color="warning" class="mr-2">mdi-pencil</VIcon>
            <div>
              <div class="text-h6 font-weight-bold">Editar venta {{ sale.number }}</div>
              <div class="text-caption text-grey">Modifique los datos del cliente y las cantidades de los artículos</div>
            </div>
          </div>

          <VDivider class="mb-4" />

          <!-- Customer info -->
          <VRow dense>
            <VCol cols="12" sm="6">
              <VTextField
                id="tf-psed-customer-name"
                v-model="form.customer_name"
                label="Cliente"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="compact"
                hide-details
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField
                id="tf-psed-customer-phone"
                v-model="form.customer_phone"
                label="Teléfono"
                prepend-inner-icon="mdi-phone"
                variant="outlined"
                density="compact"
                hide-details
              />
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <!-- Items -->
          <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <VIcon start size="small" class="mr-1">mdi-cart</VIcon>
            Artículos
          </div>

          <VTable id="tbl-psed-items" density="compact">
            <thead>
              <tr>
                <th class="text-left">Producto</th>
                <th class="text-center" style="width: 120px">Cantidad</th>
                <th class="text-right" style="width: 130px">Precio unitario</th>
                <th class="text-right" style="width: 130px">Total</th>
                <th class="text-center" style="width: 40px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="item.id || item.product_id">
                <td>
                  <div class="font-weight-medium">{{ (item.product as Record<string, unknown>)?.name || '—' }}</div>
                </td>
                <td class="text-center">
                  <VTextField
                    v-model.number="item.quantity"
                    type="number"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="quantity-input"
                    style="max-width: 80px; margin: 0 auto"
                    @update:model-value="recalculateItem(index)"
                  />
                </td>
                <td class="text-right">${{ formatNumber(item.unit_price) }}</td>
                <td class="text-right font-weight-medium">${{ formatNumber(item.total_price) }}</td>
                <td class="text-center pa-1">
                  <VBtn :id="`btn-psed-remove-item-${index}`" icon size="small" color="error" @click="removeItem(index)">
                    <VIcon size="small">mdi-delete</VIcon>
                  </VBtn>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold text-grey">Subtotal</td>
                <td class="text-right">${{ formatNumber(subtotal) }}</td>
                <td></td>
              </tr>
              <tr v-if="parseFloat(String(sale.discount)) > 0">
                <td colspan="3" class="text-right font-weight-bold text-grey">Descuento</td>
                <td class="text-right text-error">-${{ formatNumber(sale.discount) }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3" class="text-right text-h6 font-weight-black text-primary">Total</td>
                <td class="text-right text-h6 font-weight-black text-primary">${{ formatNumber(subtotal - Number(sale.discount)) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </VTable>

          <VDivider class="my-4" />

          <!-- Product selector grid -->
          <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <VIcon start size="small" class="mr-1">mdi-plus-circle</VIcon>
            Agregar producto
          </div>

          <div v-if="productsStore.loading" class="text-center py-4">
            <VProgressCircular indeterminate color="primary" size="36" />
          </div>

          <VRow v-else dense>
            <VCol
              v-for="product in availableProducts"
              :key="product.id"
              cols="4"
              sm="3"
              md="3"
            >
              <VCard
                :id="`card-psed-product-${product.id}`"
                variant="outlined"
                class="add-product-card"
                @click="addProduct(product)"
              >
                <VImg :src="product.image_s3 || ''" height="80px" contain class="bg-grey-lighten-4">
                  <template #placeholder>
                    <VRow class="fill-height ma-0" align="center" justify="center">
                      <VIcon color="grey-lighten-1" size="28">mdi-package-variant</VIcon>
                    </VRow>
                  </template>
                </VImg>
                <div class="pa-2">
                  <div class="text-caption font-weight-bold text-truncate">{{ product.name }}</div>
                  <div class="text-body-2 text-primary font-weight-black">${{ formatNumber(product.price) }}</div>
                  <div class="text-caption text-grey mt-1">Click para agregar</div>
                </div>
              </VCard>
            </VCol>
            <VCol v-if="availableProducts.length === 0" cols="12" class="text-center py-4">
              <VIcon color="grey-lighten-1" size="40">mdi-package-variant-closed</VIcon>
              <div class="text-caption text-grey mt-1">Todos los productos ya están en la lista</div>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <!-- Actions -->
          <div class="d-flex justify-end gap-2">
            <VBtn id="btn-psed-cancel" variant="outlined" color="grey" class="mr-2" :disabled="saving" @click="goBack">
              <VIcon start size="small">mdi-arrow-left</VIcon>
              Cancelar
            </VBtn>
            <VBtn id="btn-psed-save" color="warning" :loading="saving" @click="saveSale">
              <VIcon start size="small">mdi-content-save</VIcon>
              Guardar cambios
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import type { PosProduct } from "~/composables/useProducts"

definePageMeta({
  title: "Editar venta",
  icon: "mdi-point-of-sale",
  permission: "sale-index",
  middleware: ["authenticated", "permission"],
})

interface SaleItem {
  id?: number
  product_id?: number
  product?: PosProduct | Record<string, unknown>
  quantity: number
  unit_price: number | string
  total_price: number | string
}

interface EditForm {
  customer_name: string
  customer_phone: string
  items: SaleItem[]
}

const route = useRoute()
const { Sale } = useRepository()
const productsStore = useProductsStore()

const sale = ref<Record<string, unknown>>({})
const form = ref<EditForm>({ customer_name: "", customer_phone: "", items: [] })
const saving = ref(false)

// Top-level await — loads the sale before render (asyncData equivalent)
{
  const res = await Sale.show<Record<string, unknown>>(route.params.id as string).catch(() => null)
  const loaded = (res as Record<string, unknown>) || {}
  sale.value = loaded
  form.value = {
    customer_name: (loaded.customer_name as string) || "",
    customer_phone: (loaded.customer_phone as string) || "",
    items: ((loaded.items as Record<string, unknown>[]) || []).map((item) => ({
      id: item.id as number | undefined,
      product_id: item.product_id as number,
      product: item.product as Record<string, unknown>,
      quantity: item.quantity as number,
      unit_price: item.unit_price as number,
      total_price: item.total_price as number,
    })),
  }
}

const subtotal = computed(() =>
  form.value.items.reduce((sum, item) => sum + Number(item.total_price), 0),
)

/** Products not yet added to the items list, and visible (not hidden) */
const availableProducts = computed<PosProduct[]>(() => {
  const addedIds = new Set(form.value.items.map((i) => i.product_id))
  return productsStore.products.filter((p) => !p.hidden && !addedIds.has(p.id))
})

onMounted(() => {
  route.meta.back = "/pos/sales"
  // Load products into the store only if empty (skip if already populated)
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts()
  }
})

function goBack() {
  navigateTo("/pos/sales")
}

function recalculateItem(index: number) {
  const item = form.value.items[index]
  if (!item) return
  const qty = Math.max(0, Math.floor(Number(item.quantity) || 0))
  item.quantity = qty
  item.total_price = round(Number(item.unit_price) * qty, 2)
}

function addProduct(product: PosProduct) {
  if (!product) return
  const exists = form.value.items.find((i) => i.product_id === product.id)
  if (exists) {
    exists.quantity += 1
    recalculateItem(form.value.items.indexOf(exists))
    return
  }
  form.value.items.push({
    product_id: product.id,
    product,
    quantity: 1,
    unit_price: product.price,
    total_price: product.price,
  })
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
}

async function saveSale() {
  try {
    saving.value = true
    const payload = {
      customer_name: form.value.customer_name,
      customer_phone: form.value.customer_phone,
      items: form.value.items.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    }
    await Sale.update(sale.value.id as number, payload)
    navigateTo("/pos/sales")
  } catch (e) {
    console.error("Error al guardar la venta", e)
  } finally {
    saving.value = false
  }
}

function formatNumber(val: unknown): string {
  const num = Number(val)
  if (isNaN(num)) return String(val ?? "")
  return num.toLocaleString()
}

function round(value: number, decimals: number): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
}
</script>

<style scoped>
/* Hide number input spinners */
.quantity-input :deep(input[type="number"])::-webkit-outer-spin-button,
.quantity-input :deep(input[type="number"])::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
.quantity-input :deep(input[type="number"]) {
  -moz-appearance: textfield !important;
}

/* Product card grid */
.add-product-card {
  border-radius: 8px !important;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: border-color 0.15s, transform 0.12s;
}
.add-product-card:hover {
  border-color: #1976d2 !important;
  transform: translateY(-2px);
}
.add-product-card:active {
  transform: translateY(0);
}
</style>
