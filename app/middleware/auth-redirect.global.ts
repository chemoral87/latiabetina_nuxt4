import { useAuthStore } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return
  if (to.path === "/login") return

  const auth = useAuthStore()
  if (auth.loggedIn) {
    const loginRedirect = sessionStorage.getItem("loginRedirect")
    if (loginRedirect) {
      sessionStorage.removeItem("loginRedirect")
      // Storage is not trusted just because it's same-origin — validate on read.
      return navigateTo(safeInternalRedirect(loginRedirect))
    }
    if (to.path === "/" || to.path === "") {
      return navigateTo("/dashboard")
    }
  }
})
