<template>
  <VContainer>
    <VRow align="center" justify="center" class="fill-height">
      <VCol lg="4" md="6" sm="8" cols="12">
        <VCard id="login-card" flat class="pa-6">
          <VForm id="login-form" @submit.prevent="submitLogin">
            <VRow density="comfortable">
              <VCol cols="12" class="text-center mb-4">
                <span class="text-h5">Inicio de Sesión</span>
                <div class="text-caption text-grey mt-1">
                  v{{ buildVersion }}
                </div>
              </VCol>

              <VCol cols="12">
                <VBtn
                  id="login-google-btn"
                  block
                  class="mb-4"
                  size="large"
                  variant="outlined"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  style="
                    border-color: #dadce0;
                    color: #3c4043;
                    background-color: white;
                  "
                  @click="loginWithGoogle"
                >
                  <img
                    alt="Google"
                    style="width: 18px; height: 18px; margin-right: 12px"
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  />
                  Acceder con Google
                </VBtn>
              </VCol>

              <VCol cols="12" class="d-flex align-center my-3">
                <VDivider></VDivider>
                <span class="px-3 text-grey-darken-1">o</span>
                <VDivider></VDivider>
              </VCol>

              <VCol cols="12">
                <VTextField
                  id="login-email"
                  v-model="email"
                  density="compact"
                  variant="outlined"
                  autocomplete="username"
                  label="Dirección de correo electrónico"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  id="login-password"
                  v-model="password"
                  density="compact"
                  label="Contraseña"
                  variant="outlined"
                  autocomplete="current-password"
                  :type="showed ? 'text' : 'password'"
                  :append-inner-icon="showed ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append-inner="showed = !showed"
                />
              </VCol>

              <VCol cols="12" class="text-right">
                <a
                  href="#"
                  class="text-primary"
                  style="text-decoration: none"
                  @click.prevent="navigateTo('/forgot-password')"
                >
                  Olvidé mi contraseña
                </a>
              </VCol>

              <VCol cols="12">
                <VBtn
                  id="login-submit"
                  block
                  size="large"
                  type="submit"
                  color="primary"
                  variant="elevated"
                  :loading="isSubmitting"
                  :disabled="isSubmitting"
                  >Ingresar</VBtn
                >
              </VCol>
            </VRow>
          </VForm>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
const route = useRoute();
const auth = useAuthStore();
const buildVersion = useRuntimeConfig().public.version;

definePageMeta({
  title: "Inicio Sesión",
  icon: "mdi-login",
  middleware: ["guest"],
});

const email = ref("");
const password = ref("");
const showed = ref(false);
const isSubmitting = ref(false);

function loginWithGoogle() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  const redirect =
    route.query.redirect || localStorage.getItem("loginRedirect");

  const config = useRuntimeConfig();
  const baseUrl =
    config.public.baseUrl ||
    `http://${window.location.hostname}${config.public.suffixUrl}`;
  let googleRedirectUrl = `${baseUrl}/auth/google/redirect`;

  if (redirect) {
    googleRedirectUrl += `?redirect=${encodeURIComponent(redirect as string)}`;
    localStorage.setItem("loginRedirect", redirect as string);
  }

  window.location.href = googleRedirectUrl;
}

async function submitLogin() {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const credentials = { email: email.value, password: password.value };
    await auth.loginWith("laravelJWT", { data: credentials });
    const redirect =
      localStorage.getItem("loginRedirect") || route.query.redirect || "/";
    localStorage.removeItem("loginRedirect");
    navigateTo(redirect as string);
  } catch (e) {
    console.error(e);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
:deep(.v-field--variant-outlined) input:-webkit-autofill ~ .v-field-label,
:deep(.v-field--variant-outlined)
  input:-webkit-autofill:focus
  ~ .v-field-label {
  transform: translateY(-24px) scale(0.75);
  top: 0px;
  background: white;
  padding: 0 4px;
}
</style>
