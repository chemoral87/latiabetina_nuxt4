export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  if (auth.loggedIn) {
    const redirectPath = (to.query.redirect as string) || "/dashboard"
    return navigateTo(redirectPath)
  }
})
