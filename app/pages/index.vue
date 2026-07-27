<template>
  <VContainer>
    <VRow align="center" justify="center" class="fill-height">
      <VCol cols="12" sm="8" md="6" lg="4">
        <VCard flat class="pa-6">
          <VCardTitle class="text-h5 text-center mb-4">Bienvenido</VCardTitle>
          <VCardText class="text-center text-body-1 text-grey-darken-1">
            Seleccione una opción para continuar
          </VCardText>
          <VCardActions class="justify-center flex-column pa-4">
            <VBtn color="primary" block size="large" class="text-none mb-3" @click="navigateTo('/login')">
              Iniciar Sesión
            </VBtn>
            <VBtn variant="outlined" block size="large" class="text-none" @click="navigateTo('/register')">
              Crear Cuenta
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Inicio",
})
</script>
