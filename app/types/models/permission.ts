export interface Permission {
  id: number
  name: string
  label: string
  created_at: string
  updated_at: string
}

export interface CreatePermission {
  name: string
  label: string
}

export interface UpdatePermission {
  name?: string
  label?: string
}

export interface PermissionListResponse extends PaginatedResponse<Permission> {
  data: Permission[]
}
