export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  if (auth.loggedIn) {
    const redirectPath = (to.query.redirect as string) || "/dashboard"
    return navigateTo(redirectPath)
  }
})
