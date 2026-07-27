<template>
  <VContainer fluid class="fill-height">
    <VRow align="center" justify="center">
      <VCol cols="auto" class="text-center">
        <VProgressCircular indeterminate color="primary" size="64" />
        <div class="mt-4 text-h6 text-grey-darken-1">Finalizando sesión...</div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Cerrando sesión",
})

const auth = useAuthStore()
const isLoggingOut = ref(false)

onMounted(async () => {
  if (isLoggingOut.value) return
  isLoggingOut.value = true

  try {
    await auth.logout()
  } catch (e) {
    console.warn("Logout warning:", e)
  }

  setTimeout(() => {
    navigateTo("/login", { replace: true })
  }, 500)
})
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
