<template>
  <VContainer>
    <VRow align="center" justify="center" class="fill-height">
      <VCol cols="12" sm="8" md="6" lg="4">
        <VCard id="dsh-card" flat class="pa-6">
          <VCardTitle id="dsh-title" class="text-h5 text-center mb-4">Dashboard</VCardTitle>
          <VCardText id="dsh-text" class="text-center text-body-1 text-grey-darken-1">
            Bienvenido, {{ user?.name || "Usuario" }}
          </VCardText>
          <VCardActions class="justify-center pa-4">
            <VBtn id="dsh-logout-btn" color="error" block size="large" class="text-none" @click="handleLogout">
              Cerrar Sesión
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Dashboard",
  middleware: "authenticated",
})

const auth = useAuthStore()
const user = computed(() => auth.user)

function handleLogout() {
  navigateTo("/logout")
}
</script>
