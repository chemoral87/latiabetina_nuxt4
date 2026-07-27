import { useAuthStore } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return
  if (to.path === "/login") return

  const auth = useAuthStore()
  if (auth.loggedIn) {
    const loginRedirect = sessionStorage.getItem("loginRedirect")
    if (loginRedirect) {
      sessionStorage.removeItem("loginRedirect")
      return navigateTo(loginRedirect)
    }
    if (to.path === "/" || to.path === "") {
      return navigateTo("/dashboard")
    }
  }
})
