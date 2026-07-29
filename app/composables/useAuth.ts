import { defineStore, acceptHMRUpdate } from "pinia"

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

  // Cookies (en vez de localStorage) para que el token esté disponible
  // tanto en servidor (SSR) como en cliente, y consistente con useApi().
  const tokenCookie = useCookie<string | null>("auth.token")
  const strategyCookie = useCookie<string | null>("auth.strategy")
  const refreshTokenCookie = useCookie<string | null>("auth.refreshToken")

  function getBaseUrl() {
    const config = useRuntimeConfig()
    if (config.public.baseUrl) {
      return config.public.baseUrl
    }
    const reqUrl = useRequestURL()
    return `http://${reqUrl.hostname}${config.public.suffixUrl}`
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

    tokenCookie.value = token
    strategyCookie.value = name
    strategy.value = name

    if (s.user?.autoFetch !== false) {
      await fetchUser()
    }

    return res
  }

  async function fetchUser() {
    const s = strategies[strategy.value]
    if (!s) return null

    const token = tokenCookie.value
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
      const token = tokenCookie.value
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

    tokenCookie.value = null
    refreshTokenCookie.value = null
    strategyCookie.value = null
    user.value = null
  }

  function setStrategy(name: string) {
    strategy.value = name
    strategyCookie.value = name
  }

  function setUser(userData: AuthUser) {
    user.value = userData
  }

  function setToken(token: string, name = "laravelJWT") {
    tokenCookie.value = token
    strategyCookie.value = name
    strategy.value = name
  }

  function getJwtExp(token: string): number | null {
    try {
      const payload = token.split(".")[1]
      if (!payload) return null
      const decoded = JSON.parse(atob(payload))
      return decoded.exp ?? null
    } catch {
      return null
    }
  }

  async function init() {
    const savedStrategy = strategyCookie.value
    if (savedStrategy && strategies[savedStrategy]) {
      strategy.value = savedStrategy
    }

    const token = tokenCookie.value
    if (!token) return

    const exp = getJwtExp(token)
    if (!exp || Date.now() > exp * 1000) {
      tokenCookie.value = null
      strategyCookie.value = null
      return
    }

    await fetchUser()
  }

  const token = computed(() => tokenCookie.value)
  const hasToken = computed(() => !!tokenCookie.value)

  const permissions = computed(() => {
    if (!user.value) return []
    return (user.value.all_permissions || user.value.permissions || []) as string[]
  })

  const permissionsOrg = computed(() => {
    if (!user.value) return {} as Record<string, number[]>
    const p = user.value.permissions_org as Record<string, number[]> | undefined
    return p || {}
  })

  function hasPermission(permission: string): boolean {
    if (!user.value) return false
    if (permission in permissionsOrg.value) return true
    return permissions.value.includes(permission)
  }

  return { user, loggedIn, token, hasToken, strategy, redirects, permissions, permissionsOrg, hasPermission, loginWith, fetchUser, logout, setToken, setStrategy, setUser, init }
})

export function useAuth() {
  return useAuthStore()
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
