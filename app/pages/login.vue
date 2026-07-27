<template>
  <VContainer>
    <VRow align="center" justify="center" class="fill-height">
      <VCol cols="12" sm="8" md="6" lg="4">
        <VCard flat class="pa-6">
          <VForm @submit.prevent="submitLogin">
            <VRow dense>
              <VCol cols="12" class="text-center mb-4">
                <span class="text-h5">Inicio de Sesión</span>
              </VCol>

              <VCol cols="12">
                <VBtn variant="outlined" block size="large" class="mb-4 text-none"
                  style="border-color: #dadce0; color: #3c4043; background-color: white" @click="loginWithGoogle">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google"
                    style="width: 18px; height: 18px; margin-right: 12px" />
                  Acceder con Google
                </VBtn>
              </VCol>

              <VCol cols="12" class="d-flex align-center my-3">
                <VDivider></VDivider>
                <span class="px-3 text-grey-darken-1">o</span>
                <VDivider></VDivider>
              </VCol>

              <VCol cols="12">
                <VTextField v-model="email" variant="outlined" density="compact" autocomplete="username"
                  label="Dirección de correo electrónico" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="password" variant="outlined" density="compact" autocomplete="current-password"
                  label="Contraseña" :append-inner-icon="showed ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showed ? 'text' : 'password'" @click:append-inner="showed = !showed" />
              </VCol>

              <VCol cols="12" class="text-right">
                <a href="#" class="text-decoration-none text-primary" @click.prevent="navigateTo('/forgot-password')">
                  Olvidé mi contraseña
                </a>
              </VCol>

              <VCol cols="12">
                <VBtn type="submit" color="primary" block size="large" class="text-none">Ingresar</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Inicio Sesión",
})

const email = ref("")
const password = ref("")
const showed = ref(false)

function loginWithGoogle() {
  const redirect = route.query.redirect || localStorage.getItem("loginRedirect") || "/"
  const baseUrl = ""
  const googleRedirectUrl = `${baseUrl}/auth/google/redirect`
  localStorage.setItem("loginRedirect", redirect as string)
  window.location.href = googleRedirectUrl + `?redirect=${encodeURIComponent(redirect as string)}`
}

async function submitLogin() {
  try {
    const credentials = { email: email.value, password: password.value }
    const redirect = localStorage.getItem("loginRedirect") || route.query.redirect || "/"
    localStorage.removeItem("loginRedirect")
    navigateTo(redirect as string)
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
:deep(.v-text-field--outlined) input:-webkit-autofill ~ .v-label,
:deep(.v-text-field--outlined) input:-webkit-autofill:focus ~ .v-label {
  transform: translateY(-24px) scale(0.75);
  top: 0px;
  background: white;
  padding: 0 4px;
}
</style>
