export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  if (!auth.loggedIn) {
    return navigateTo("/login?redirect=" + encodeURIComponent(to.fullPath))
  }
})
