import { useAuthStore } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (auth.loggedIn) {
    const redirectFromQuery = to.query.redirect as string | undefined
    if (redirectFromQuery) {
      return navigateTo(redirectFromQuery)
    }
    if (import.meta.client) {
      const loginRedirect = localStorage.getItem("loginRedirect")
      if (loginRedirect) {
        localStorage.removeItem("loginRedirect")
        return navigateTo(loginRedirect)
      }
    }
    return navigateTo("/dashboard")
  }
})
