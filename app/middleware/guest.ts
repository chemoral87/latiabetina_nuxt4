export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  if (auth.loggedIn) {
    const redirectPath = safeInternalRedirect(to.query.redirect)
    return navigateTo(redirectPath)
  }
})
