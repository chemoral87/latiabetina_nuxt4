let refreshPromise: Promise<string | null> | null = null

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

// Typed auth failure so callers (pages, withNotify) can react to it instead of
// treating it as a generic error.
function unauthenticatedError(): Error & { code: string } {
  return Object.assign(new Error("Token no disponible"), { code: "UNAUTHENTICATED" })
}

export function useApi() {
  const config = useRuntimeConfig()

  const { tokenCookie, refreshTokenCookie, strategyCookie } = useAuthCookies()

  function getBaseUrl() {
    if (config.public.baseUrl) return config.public.baseUrl
    if (import.meta.client) {
      return `${window.location.protocol}//${window.location.hostname}${config.public.suffixUrl}`
    }
    return ""
  }

  function serializeParams(params: Record<string, unknown>): string {
    const parts: string[] = []
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(v))}`)
        }
      } else if (value !== undefined && value !== null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      }
    }
    return parts.join("&")
  }

  async function tryRefreshToken(): Promise<string | null> {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const baseUrl = getBaseUrl()
        const token = tokenCookie.value
        if (!token) return null
        const res = await $fetch<{ access_token: string }>(`${baseUrl}/auth/refresh`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
        // Persist the new token in both the cookie and the auth store so the
        // next request reads the refreshed value from either source.
        try {
          useAuthStore().setAccessToken(res.access_token)
        } catch {
          // store not available; the cookie is enough for the caller
        }
        return res.access_token
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  function isTokenExpired(token: string): boolean {
    const exp = getJwtExp(token)
    if (!exp) return true
    return Date.now() >= exp * 1000 - 30000
  }

  async function ensureValidToken(): Promise<string | null> {
    let token: string | null = null
    try {
      const auth = useAuthStore()
      // The store holds the payload-restored token (reliable during client
      // hydration); the cookie is the fallback when the store isn't ready.
      token = auth.token ?? tokenCookie.value ?? null
      if (token && !auth.token) {
        auth.setAccessToken(token)
      }
    } catch {
      token = tokenCookie.value ?? null
    }
    if (!token) return null
    if (isTokenExpired(token)) {
      return tryRefreshToken()
    }
    return token
  }

  async function $api<T = unknown>(path: string, opts: Record<string, unknown> = {}): Promise<T> {
    const baseUrl = getBaseUrl()
    const token = await ensureValidToken()
    if (!token) {
      if (import.meta.client) {
        try {
          useAuthStore().expireSession()
        } catch {
          // store not ready
        }
      }
      throw unauthenticatedError()
    }
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }
    if (opts.headers) {
      Object.assign(headers, opts.headers as Record<string, string>)
    }
    const { headers: _h, params, ...rest } = opts
    let url = `${baseUrl}${path}`
    if (params) {
      url += `?${serializeParams(params as Record<string, unknown>)}`
    }

    const { start, finish } = useGlobalProgress()
    start()

    try {
      return await $fetch<T>(url, { ...rest, headers })
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const status = (err as { response: { status: number } }).response?.status
        if (status === 401) {
          const newToken = await tryRefreshToken()
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`
            return await $fetch<T>(url, { ...rest, headers })
          }
          if (import.meta.client) {
            try {
              useAuthStore().expireSession()
            } catch {
              // store not ready
            }
          }
          throw unauthenticatedError()
        }
      }
      throw err
    } finally {
      finish()
    }
  }

  return { $api, getBaseUrl }
}
