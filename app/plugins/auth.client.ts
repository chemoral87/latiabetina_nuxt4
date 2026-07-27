export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const token = localStorage.getItem("auth.token")
  if (token) {
    auth.fetchUser()
  }
})
