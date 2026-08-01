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

onMounted(async () => {
  if (processing.value) return
  processing.value = true

  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get("token")
  const error = urlParams.get("error")

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

      const route = useRoute()
      const redirectPath = (route.query.redirect as string) || "/dashboard"
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
