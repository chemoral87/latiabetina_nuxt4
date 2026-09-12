export interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface RefreshTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  permissions: string[]
  permissions_org: Record<string, number[]>
  orgs: Array<{
    id: number
    name: string
    type: string
  }>
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user?: User
}
