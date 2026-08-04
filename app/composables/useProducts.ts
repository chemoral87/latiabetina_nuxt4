export interface PosProduct {
  id: number
  name: string
  sku?: string
  price: number
  stock: number
  description?: string
  image_s3?: string
  org_id?: number | null
  requires_preparation?: boolean
  hidden?: boolean
  [key: string]: unknown
}

export const useProductsStore = defineStore("products", () => {
  const products = ref<PosProduct[]>([])
  const loading = ref(false)

  /**
   * Load the POS product catalog. Mirrors the AUI `products` store:
   * fetches only when empty (unless forced), `skipLoading` keeps the
   * POS page from flashing the spinner on silent refreshes.
   */
  async function fetchProducts(opts: { skipLoading?: boolean; force?: boolean } = {}) {
    if (products.value.length > 0 && !opts.force) return products.value
    if (!opts.skipLoading) loading.value = true
    try {
      const { Product } = useRepository()
      const res = await Product.pos<{ data?: PosProduct[] }>(null)
      products.value = res?.data ?? []
      return products.value
    } catch {
      return []
    } finally {
      if (!opts.skipLoading) loading.value = false
    }
  }

  // Store mutations that mirror the AUI `products` store so the product
  // index page and the POS share the same catalog cache.
  function setProducts(list: PosProduct[]) {
    products.value = list
  }

  function addProduct(product: PosProduct) {
    const idx = products.value.findIndex((p) => p.id === product.id)
    if (idx !== -1) products.value[idx] = product
    else products.value.unshift(product)
  }

  function updateProduct(product: PosProduct) {
    const idx = products.value.findIndex((p) => p.id === product.id)
    if (idx !== -1) products.value[idx] = product
  }

  function removeProduct(id: number | string) {
    const idx = products.value.findIndex((p) => p.id === Number(id))
    if (idx !== -1) products.value.splice(idx, 1)
  }

  return { products, loading, fetchProducts, setProducts, addProduct, updateProduct, removeProduct }
})
