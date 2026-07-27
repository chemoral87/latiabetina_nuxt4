import { useAuthStore } from "~/composables/useAuth"

export default defineNuxtRouteMiddleware((to) => {
  const meta = to.meta as { permission?: string }
  const required = meta?.permission
  if (!required) return

  const auth = useAuthStore()
  if (!auth.hasPermission(required)) {
    throw createError({
      statusCode: 403,
      statusMessage: `No tienes permiso para acceder a esta página. Se requiere el permiso: ${required}`,
    })
  }
})
