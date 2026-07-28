export function useApi() {
  const config = useRuntimeConfig()

  function getBaseUrl() {
    if (config.public.baseUrl) return config.public.baseUrl
    if (import.meta.client) {
      return `http://${window.location.hostname}${config.public.suffixUrl}`
    }
    return ""
  }

  function getHeaders(options: Record<string, unknown> = {}): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" }
    if (import.meta.client) {
      const token = localStorage.getItem("auth.token")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
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

  async function $api<T = unknown>(path: string, opts: Record<string, unknown> = {}): Promise<T> {
    const baseUrl = getBaseUrl()
    const headers = getHeaders(opts)
    const { headers: _h, params, ...rest } = opts
    let url = `${baseUrl}${path}`
    if (params) {
      url += `?${serializeParams(params as Record<string, unknown>)}`
    }
    return await $fetch<T>(url, { ...rest, headers })
  }

  return { $api, getBaseUrl }
}
