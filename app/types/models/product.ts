export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  cost: number
  stock: number
  category_id: number | null
  is_active: boolean
  barcode: string | null
  created_at: string
  updated_at: string
}

export interface CreateProduct {
  name: string
  description?: string
  price: number
  cost: number
  stock?: number
  category_id?: number
  is_active?: boolean
  barcode?: string
}

export interface UpdateProduct {
  name?: string
  description?: string
  price?: number
  cost?: number
  stock?: number
  category_id?: number
  is_active?: boolean
  barcode?: string
}

export interface ProductListResponse extends PaginatedResponse<Product> {
  data: Product[]
}
