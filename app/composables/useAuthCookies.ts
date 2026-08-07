/**
 * Single source of truth for the auth cookie declarations.
 *
 * The auth token/strategy/refresh cookies are JS-readable by design (the app
 * reads them on the client to send Bearer headers), so we compensate with
 * strict transport flags:
 *   - path: "/"        → sent app-wide
 *   - sameSite: "lax"  → blocks cross-site requests from carrying them (CSRF surface)
 *   - secure: !dev     → fail-closed in production: if the app is ever served
 *                        over plain HTTP, the cookie simply won't be sent
 *                        instead of leaking the token in cleartext. Relaxed only
 *                        under `nuxt dev` so local development over http keeps working.
 */
export function useAuthCookies() {
  const opts = {
    path: "/",
    sameSite: "lax" as const,
    secure: !import.meta.dev,
  }

  return {
    tokenCookie: useCookie<string | null>("auth.token", opts),
    refreshTokenCookie: useCookie<string | null>("auth.refreshToken", opts),
    strategyCookie: useCookie<string | null>("auth.strategy", opts),
  }
}
