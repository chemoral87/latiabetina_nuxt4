import { useAuthStore } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
  const meta = to.meta as { permission?: string }
  const required = meta?.permission
  if (!required) return

  const auth = useAuthStore()
  if (!auth.hasPermission(required)) {
    // Redirect to a dedicated in-app 403 page instead of throwing createError.
    // A thrown middleware error triggers `app:error` → the NUXT_E1005 dev
    // diagnostic on initial loads and renders the generic error layout; a
    // normal redirect keeps the app chrome, a clean console, and the same
    // "no access" UX for every permission-protected page (see /forbidden).
    return navigateTo(`/forbidden?permission=${encodeURIComponent(required)}`)
  }
})
