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

export function useApi() {
  const config = useRuntimeConfig()

  const tokenCookie = useCookie<string | null>("auth.token")
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
        tokenCookie.value = res.access_token
        return res.access_token
      } catch {
        tokenCookie.value = null
        refreshTokenCookie.value = null
        strategyCookie.value = null
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
    const token = tokenCookie.value
    if (!token) return true
    const exp = getJwtExp(token)
    if (!exp) return true
    return Date.now() >= exp * 1000 - 30000
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
    try {
      return await $fetch<T>(url, { ...rest, headers })
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response: { status: number } }).response?.status
        if (status === 401) {
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
