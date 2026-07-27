export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault()
      event.returnValue = "Realmente desea salir?"
    })
  }
})
