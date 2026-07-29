let refreshPromise: Promise<string | null> | null = null

export function useApi() {
  const config = useRuntimeConfig()

  const tokenCookie = useCookie<string | null>("auth.token")
  const expiresCookie = useCookie<string | null>("auth.expires")
  const refreshTokenCookie = useCookie<string | null>("auth.refreshToken")
  const strategyCookie = useCookie<string | null>("auth.strategy")

  function getBaseUrl() {
    if (config.public.baseUrl) return config.public.baseUrl
    if (import.meta.client) {
      return `http://${window.location.hostname}${config.public.suffixUrl}`
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
        const newToken = res.access_token
        tokenCookie.value = newToken
        const expiresAt = Date.now() + 3600 * 1000
        expiresCookie.value = String(expiresAt)
        return newToken
      } catch {
        tokenCookie.value = null
        refreshTokenCookie.value = null
        strategyCookie.value = null
        expiresCookie.value = null
        if (import.meta.client) {
          window.location.href = "/login"
        }
        return null
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  function isTokenExpired(): boolean {
    const expires = expiresCookie.value
    if (!expires) return true
    return Date.now() >= Number(expires) - 30000
  }

  async function ensureValidToken(): Promise<string | null> {
    const token = tokenCookie.value
    if (!token) return null
    if (isTokenExpired()) {
      return tryRefreshToken()
    }
    return token
  }

  async function $api<T = unknown>(path: string, opts: Record<string, unknown> = {}): Promise<T> {
    const baseUrl = getBaseUrl()
    const token = await ensureValidToken()
    if (!token) {
      throw new Error("Token no disponible")
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
    return await $fetch<T>(url, { ...rest, headers })
  }

  return { $api, getBaseUrl }
}
