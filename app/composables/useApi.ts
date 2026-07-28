let refreshing = false

export function useApi() {
  const config = useRuntimeConfig()

  // Cookies (en vez de localStorage) para que el token esté disponible
  // tanto en servidor (SSR) como en cliente.
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

  function getHeaders(options: Record<string, unknown> = {}): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" }
    const token = tokenCookie.value
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>)
    }
    return headers
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
    if (refreshing) return null
    refreshing = true
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
      const s = { token: { maxAge: 60 * 60 } }
      const expiresAt = Date.now() + (s.token.maxAge || 3600) * 1000
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
      refreshing = false
    }
  }

  async function $api<T = unknown>(path: string, opts: Record<string, unknown> = {}): Promise<T> {
    const baseUrl = getBaseUrl()
    const headers = getHeaders(opts)
    const { headers: _h, params, ...rest } = opts
    let url = `${baseUrl}${path}`
    if (params) {
      url += `?${serializeParams(params as Record<string, unknown>)}`
    }
    try {
      return await $fetch<T>(url, { ...rest, headers })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response: { status: number } }).response
        if (response.status === 401) {
          const newToken = await tryRefreshToken()
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`
            return await $fetch<T>(url, { ...rest, headers })
          }
        }
      }
      throw err
    }
  }

  return { $api, getBaseUrl }
}
