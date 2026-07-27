import { useAuthStore } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (!auth.loggedIn) {
    return navigateTo("/login?redirect=" + encodeURIComponent(to.fullPath))
  }
})
