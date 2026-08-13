/**
 * Single source of truth for the auth cookie declarations.
 *
 * The auth token/strategy/refresh cookies are JS-readable by design (the app
 * reads them on the client to send Bearer headers), so we compensate with
 * strict transport flags where possible:
 *   - path: "/"        → sent app-wide
 *   - sameSite: "lax"  → blocks cross-site requests from carrying them (CSRF surface)
 *   - maxAge: 14 days  → matches the backend refresh window; previously the
 *                        cookie was session-only and vanished on browser close
 *   - secure: follows the ACTUAL protocol, not the build environment. A cookie
 *             flagged Secure is silently dropped by browsers when the page is
 *             served over plain HTTP (nginx without TLS), which left prod
 *             sessions unable to read the token ("Token no disponible").
 *             The client uses its own protocol; the server infers it from the
 *             x-forwarded-proto header (nginx TLS termination) and falls back
 *             to the configured BASE_URL scheme.
 */
export function useAuthCookies() {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.baseUrl || "") as string

  let secure = false
  if (import.meta.client) {
    secure = window.location.protocol === "https:"
  } else {
    let forwarded = ""
    try {
      forwarded = (useRequestHeaders(["x-forwarded-proto"])["x-forwarded-proto"] || "")
        .split(",")[0]
        .trim()
    } catch {
      forwarded = ""
    }
    secure = forwarded === "https" || baseUrl.startsWith("https://")
  }

  const opts = {
    path: "/",
    sameSite: "lax" as const,
    secure,
    maxAge: 60 * 60 * 24 * 14,
  }

  return {
    tokenCookie: useCookie<string | null>("auth.token", opts),
    refreshTokenCookie: useCookie<string | null>("auth.refreshToken", opts),
    strategyCookie: useCookie<string | null>("auth.strategy", opts),
  }
}