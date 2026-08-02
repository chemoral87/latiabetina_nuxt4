export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  useGlobalProgress().beginNavigation()
})
