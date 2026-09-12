export interface CommonModel {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface TimestampedModel {
  id: number
  created_at: string
  updated_at: string
}

export interface UserAuditModel extends TimestampedModel {
  created_by?: number
  updated_by?: number
}

export interface SoftDeleteModel {
  deleted_at: string | null
}

export interface PaginatedList<T> {
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

export interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  path: string
  per_page: number
  to: number
  total: number
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}
