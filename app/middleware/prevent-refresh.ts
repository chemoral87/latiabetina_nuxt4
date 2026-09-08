let listenerActive = false

function handler(event: BeforeUnloadEvent) {
  event.preventDefault()
  event.returnValue = "Realmente desea salir?"
}

export default defineNuxtRouteMiddleware(() => {
  if (!import.meta.client) return
  if (listenerActive) return
  window.addEventListener("beforeunload", handler)
  listenerActive = true
})
