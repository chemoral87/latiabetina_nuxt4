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
  // Authoritative in-memory token. Kept in sync with the `auth.token` cookie
  // so the token survives SSR hydration even when the client cookie ref is
  // momentarily unavailable. It is part of Pinia state, so it is serialized
  // into the Nuxt payload on the server and restored on the client.
  const token = ref<string | null>(null)
  const loggedIn = computed(() => !!user.value)
  const strategy = ref<string>("laravelJWT")
  // Guards the one-time hard redirect to /login after a session expires so a
  // burst of concurrent API failures doesn't navigate the browser repeatedly.
  const sessionExpiryRedirected = ref(false)
  const redirects = {
    login: "/login",
    logout: "/login",
    home: "/dashboard",
    callback: false,
  }

  const config = useRuntimeConfig()

  // Cookies (en vez de localStorage) para que el token esté disponible
  // tanto en servidor (SSR) como en cliente, y consistente con useApi().
  // Flags compartidos (secure/sameSite) definidos en useAuthCookies().
  const { tokenCookie, strategyCookie, refreshTokenCookie } = useAuthCookies()

  // Seed the in-memory token from the cookie and keep both in sync. The store
  // token is the primary source for API calls (useApi reads it first); the
  // cookie remains the cross-reload persistence layer.
  token.value = tokenCookie.value ?? null
  watch(tokenCookie, (val) => {
    token.value = val ?? null
  })

  function getBaseUrl() {
    if (config.public.baseUrl) {
      return config.public.baseUrl
    }
    if (import.meta.client) {
      return `${window.location.protocol}//${window.location.hostname}${config.public.suffixUrl}`
    }
    try {
      const reqUrl = useRequestURL()
      return `${reqUrl.protocol}//${reqUrl.hostname}${config.public.suffixUrl}`
    } catch {
      return ""
    }
  }

  function setAccessToken(value: string | null) {
    token.value = value
    tokenCookie.value = value
    // A successful login/refresh resets the one-shot redirect guard.
    sessionExpiryRedirected.value = false
  }

  function clearSession() {
    user.value = null
    token.value = null
    tokenCookie.value = null
    refreshTokenCookie.value = null
    strategyCookie.value = null
    strategy.value = "laravelJWT"
  }

  async function refreshAccessToken(): Promise<boolean> {
    const s = strategies[strategy.value]
    if (!s) return false
    const current = token.value ?? tokenCookie.value
    if (!current) return false
    const baseUrl = getBaseUrl()
    try {
      const res = await $fetch<{ access_token: string }>(`${baseUrl}/${s.endpoints.refresh.url}`, {
        method: s.endpoints.refresh.method.toUpperCase(),
        headers: { Authorization: `Bearer ${current}` },
      })
      setAccessToken(res.access_token)
      return true
    } catch {
      return false
    }
  }

  async function loginWith(name: string, { data }: { data: Record<string, string> }) {
    const s = strategies[name]
    if (!s) throw new Error(`Strategy "${name}" not found`)

    const baseUrl = getBaseUrl()
    const res = await $fetch(`${baseUrl}/${s.endpoints.login.url}`, {
      method: s.endpoints.login.method.toUpperCase(),
      body: data,
    })

    const accessToken = (res as Record<string, string>)[s.token.property]
    if (!accessToken) throw new Error("No access token returned")

    setAccessToken(accessToken)
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

    const authToken = token.value ?? tokenCookie.value
    if (!authToken) return null

    const baseUrl = getBaseUrl()
    try {
      const res = await $fetch(`${baseUrl}/${s.endpoints.user.url}`, {
        method: s.endpoints.user.method.toUpperCase(),
        headers: { Authorization: `Bearer ${authToken}` },
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
      const authToken = token.value ?? tokenCookie.value
      const baseUrl = getBaseUrl()
      try {
        await $fetch(`${baseUrl}/${s.endpoints.logout.url}`, {
          method: s.endpoints.logout.method.toUpperCase(),
          headers: { Authorization: `Bearer ${authToken}` },
        })
      } catch {
        // ignore logout errors
      }
    }

    clearSession()
  }

  // Session is over (token missing/expired and refresh failed): wipe local
  // state and, on the client, hard-redirect to /login preserving the current
  // path so the user returns after re-login. Server-side it just clears state.
  function expireSession() {
    const wasLoggedIn = !!user.value
    clearSession()
    if (!import.meta.client) return
    if (!wasLoggedIn) return
    if (sessionExpiryRedirected.value) return
    sessionExpiryRedirected.value = true
    if (window.location.pathname === "/login") return
    const current = window.location.pathname + window.location.search
    window.location.href = `/login?redirect=${encodeURIComponent(current)}`
  }

  function setStrategy(name: string) {
    strategy.value = name
    strategyCookie.value = name
  }

  function setUser(userData: AuthUser) {
    user.value = userData
  }

  function setToken(accessToken: string, name = "laravelJWT") {
    setAccessToken(accessToken)
    strategyCookie.value = name
    strategy.value = name
  }

  function getJwtExp(tokenValue: string): number | null {
    try {
      const payload = tokenValue.split(".")[1]
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

    token.value = tokenCookie.value ?? null
    const current = token.value
    if (!current) return

    const exp = getJwtExp(current)
    if (!exp || Date.now() > exp * 1000) {
      // Expired access token: try to refresh it instead of dropping the
      // session. If the refresh fails, the session is really over.
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        await fetchUser()
      } else {
        clearSession()
      }
      return
    }

    await fetchUser()
  }

  const hasToken = computed(() => !!token.value)

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

  return {
    user, loggedIn, token, hasToken, strategy, redirects, permissions, permissionsOrg, hasPermission,
    loginWith, fetchUser, logout, setToken, setStrategy, setUser, init,
    setAccessToken, clearSession, expireSession,
  }
})

export function useAuth() {
  return useAuthStore()
}

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot))
}
