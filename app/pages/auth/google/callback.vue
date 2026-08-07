<template>
  <VContainer>
    <VRow align="center" justify="center">
      <VCol cols="12" md="5" lg="6" class="text-center">
        <VProgressCircular indeterminate color="primary" size="64" />
        <p class="mt-4">Procesando autenticación...</p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Autenticación Google",
  icon: "mdi-google",
})

const auth = useAuthStore()
const processing = ref(false)
const route = useRoute()

useHead({
  meta: [{ name: "referrer", content: "no-referrer" }],
})

onMounted(async () => {
  if (processing.value) return
  processing.value = true

  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get("token")
  const error = urlParams.get("error")

  // Scrub the token (and any other query params) from the address bar and
  // browser history as soon as it has been read, so it doesn't linger in the
  // URL for shoulder-surfers or via the back button. The auth flow below uses
  // the already-extracted values, so clearing the URL is safe to do now.
  if (window.history.replaceState) {
    // Preserve the router's own history state keys (back/forward/position),
    // otherwise vue-router logs VUE_ROUTER_R0121 and scroll restoration breaks.
    window.history.replaceState({ ...window.history.state }, "", window.location.pathname)
  }

  if (error) {
    navigateTo("/login")
    return
  }

  if (token) {
    try {
      auth.setStrategy("google")
      const response = await auth.loginWith("google", { data: { token } })

      if (response && response.user) {
        auth.setUser(response.user as { name?: string; last_name?: string; email?: string; [key: string]: unknown })
      } else if (auth.hasToken) {
        await auth.fetchUser()
      }

      if (!auth.user) {
        throw new Error("No se pudo obtener el usuario.")
      }

      const redirectPath = safeInternalRedirect(route.query.redirect)
      navigateTo(redirectPath)
    } catch (e) {
      console.error("Error during Google authentication:", e)
      navigateTo("/login")
    }
  } else {
    navigateTo("/login")
  }
})
</script>
