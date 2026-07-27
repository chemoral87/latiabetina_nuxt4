import { defineStore } from "pinia"

interface AuthUser {
  name?: string
  last_name?: string
  email?: string
  [key: string]: unknown
}

interface AuthStrategy {
  provider: string
  token: { property: string; maxAge: number; type?: string }
  refreshToken: { maxAge: number }
  url: string
  user?: { property?: boolean | string; autoFetch?: boolean }
  endpoints: {
    login: { url: string; method: string }
    refresh: { url: string; method: string }
    logout: { url: string; method: string }
    user: { url: string; method: string }
  }
}

const strategies: Record<string, AuthStrategy> = {
  laravelJWT: {
    provider: "laravel/jwt",
    token: { property: "access_token", maxAge: 60 * 60, type: "Bearer" },
    refreshToken: { maxAge: 20160 * 60 },
    url: "/",
    endpoints: {
      login: { url: "auth/login", method: "post" },
      refresh: { url: "auth/refresh", method: "post" },
      logout: { url: "auth/logout", method: "post" },
      user: { url: "auth/user", method: "post" },
    },
  },
  google: {
    provider: "laravel/jwt",
    token: { property: "access_token", maxAge: 60 * 60, type: "Bearer" },
    refreshToken: { maxAge: 20160 * 60 },
    url: "/",
    user: { property: false, autoFetch: false },
    endpoints: {
      login: { url: "auth/google/validate", method: "post" },
      refresh: { url: "auth/refresh", method: "post" },
      logout: { url: "auth/logout", method: "post" },
      user: { url: "auth/user", method: "post" },
    },
  },
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<AuthUser | null>(null)
  const loggedIn = computed(() => !!user.value)
  const strategy = ref<string>("laravelJWT")
  const redirects = {
    login: "/login",
    logout: "/login",
    home: "/dashboard",
    callback: false,
  }

  function getBaseUrl() {
    const config = useRuntimeConfig()
    if (config.public.baseUrl) {
      return config.public.baseUrl
    }
    if (import.meta.client) {
      const hostname = window.location.hostname
      return `http://${hostname}${config.public.suffixUrl}`
    }
    return ""
  }

  async function loginWith(name: string, { data }: { data: Record<string, string> }) {
    const s = strategies[name]
    if (!s) throw new Error(`Strategy "${name}" not found`)

    const baseUrl = getBaseUrl()
    const res = await $fetch(`${baseUrl}/${s.endpoints.login.url}`, {
      method: s.endpoints.login.method.toUpperCase(),
      body: data,
    })

    const token = (res as Record<string, string>)[s.token.property]
    if (!token) throw new Error("No access token returned")

    localStorage.setItem("auth.token", token)
    localStorage.setItem("auth.strategy", name)
    strategy.value = name

    const expiresAt = Date.now() + s.token.maxAge * 1000
    localStorage.setItem("auth.expires", String(expiresAt))

    if (s.user?.autoFetch !== false) {
      await fetchUser()
    }

    return res
  }

  async function fetchUser() {
    const s = strategies[strategy.value]
    if (!s) return null

    const token = localStorage.getItem("auth.token")
    if (!token) return null

    const baseUrl = getBaseUrl()
    try {
      const res = await $fetch(`${baseUrl}/${s.endpoints.user.url}`, {
        method: s.endpoints.user.method.toUpperCase(),
        headers: { Authorization: `Bearer ${token}` },
      })
      const userData = s.user?.property
        ? (res as Record<string, unknown>)[s.user.property as string]
        : res
      user.value = userData as AuthUser
      return user.value
    } catch {
      user.value = null
      return null
    }
  }

  async function logout() {
    const s = strategies[strategy.value]
    if (s) {
      const token = localStorage.getItem("auth.token")
      const baseUrl = getBaseUrl()
      try {
        await $fetch(`${baseUrl}/${s.endpoints.logout.url}`, {
          method: s.endpoints.logout.method.toUpperCase(),
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch {
        // ignore logout errors
      }
    }

    localStorage.removeItem("auth.token")
    localStorage.removeItem("auth.refreshToken")
    localStorage.removeItem("auth.strategy")
    localStorage.removeItem("auth.expires")
    user.value = null
  }

  function setStrategy(name: string) {
    strategy.value = name
    localStorage.setItem("auth.strategy", name)
  }

  function setUser(userData: AuthUser) {
    user.value = userData
  }

  function setToken(token: string, name = "laravelJWT") {
    const s = strategies[name]
    localStorage.setItem("auth.token", token)
    localStorage.setItem("auth.strategy", name)
    strategy.value = name
    if (s) {
      const expiresAt = Date.now() + s.token.maxAge * 1000
      localStorage.setItem("auth.expires", String(expiresAt))
    }
  }

  const permissions = computed(() => {
    if (!user.value) return []
    return (user.value.all_permissions || user.value.permissions || []) as string[]
  })

  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  return { user, loggedIn, strategy, redirects, permissions, hasPermission, loginWith, fetchUser, logout, setToken, setStrategy, setUser }
})

export function useAuth() {
  return useAuthStore()
}
