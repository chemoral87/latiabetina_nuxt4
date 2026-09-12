export interface Role {
  id: number
  name: string
  label: string
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface CreateRole {
  name: string
  label: string
  permissions: string[]
}

export interface UpdateRole {
  name?: string
  label?: string
  permissions?: string[]
}

export interface RoleListResponse extends PaginatedResponse<Role> {
  data: Role[]
}
