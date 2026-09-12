export interface User {
  id: number
  name: string
  last_name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  permissions: string[]
  permissions_org: Record<string, number[]>
  orgs: Org[]
}

export interface Org {
  id: number
  name: string
  type: string
}

export interface CreateUser {
  name: string
  last_name: string
  email: string
  password: string
  permissions: string[]
}

export interface UpdateUser {
  name?: string
  last_name?: string
  email?: string
  permissions?: string[]
  org_ids?: number[]
}

export interface UserListResponse extends PaginatedResponse<User> {
  data: User[]
}
