<template>
  <NuxtLayout name="error">
    <VCard id="error-layout-card">
      <VCardTitle class="text-h4">
        <VIcon :color="iconColor" size="40">mdi-alert</VIcon>
        Ocurrió un problema
      </VCardTitle>

      <VCardText>
          <div class="error-yellow-box">
            <div class="text-h6 text-grey-darken-4" v-html="errorMessage" />
          </div>
          <div class="text-h6 text-grey-darken-4">Presione el siguiente botón para regresar.</div>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <template v-if="isReady && !isRedirecting">
          <VBtn id="btn-layout-error-redirect" color="primary" variant="elevated" @click="handleRedirect">
            {{ redirectButtonText }}
          </VBtn>
        </template>
        <VSkeletonLoader v-else type="button" width="150px" />
      </div>
    </VCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
const ERROR_MESSAGES: Record<number, string> = {
  403: "No tiene los suficientes permisos para ver esta página, verifique con el Administrador del sistema.",
  404: "Esta página no pudo ser encontrada.",
  500: "Error interno del servidor.",
  405: "Método no permitido.",
}

const AXIOS_GENERIC_403 = "Request failed with status code 403"

const props = defineProps({
  error: {
    type: [Object, String] as PropType<unknown>,
    default: null,
  },
})

const auth = useAuthStore()
const iconColor = ref("orange")
const isRedirecting = ref(false)
const isReady = ref(false)

const statusCode = computed(() => {
  const err = props.error as Record<string, unknown> | null
  const code = err?.statusCode as number | undefined
  if (code) return code
  const resp = err?.response as Record<string, unknown> | null
  return resp?.status as number | undefined
})

const authenticated = computed(() => auth.loggedIn)

const redirectButtonText = computed(() =>
  authenticated.value ? "Ir al Dashboard" : "Ir al Inicio"
)

const errorMessage = computed(() => {
  let message = extractErrorMessage()
  if (message === AXIOS_GENERIC_403) {
    message = ERROR_MESSAGES[403]
  }
  return formatErrorMessage(message)
})

function extractErrorMessage() {
  if (typeof props.error === "string") return props.error
  const err = props.error as Record<string, unknown> | null
  if (err?.message) return err.message as string
  const resp = err?.response as Record<string, unknown> | null
  if (resp?.data) return (resp.data as Record<string, unknown>)?.message as string || ""
  return ""
}

function formatErrorMessage(message: string) {
  const code = statusCode.value
  if (message === "This page could not be found") {
    message = ERROR_MESSAGES[404]
  }
  if (code === 403) {
    // Read the required permission directly from error.data (structured, no regex needed)
    const err = props.error as Record<string, unknown> | null
    const permissionData = err?.data as { permission?: string } | undefined
    if (permissionData?.permission) {
      return `${ERROR_MESSAGES[403]}<br/><br/>Se requiere el permiso: <span class="error-message">${permissionData.permission}</span>`
    }
    return `${ERROR_MESSAGES[403]}<br/><br/>${message}`
  }
  if ([404, 500, 405].includes(code)) {
    return message
      ? `<span class="error-message">${message}</span>`
      : `<span class="error-message">${ERROR_MESSAGES[code]}</span>`
  }
  return message || "Ocurrió un error inesperado."
}

function handleRedirect() {
  isRedirecting.value = true
  const destination = authenticated.value ? "/dashboard" : "/login"
  navigateTo(destination)
}

onMounted(() => {
  isReady.value = true
})
</script>

<style scoped>
.error-yellow-box {
  background: #fffbe6;
  border: 2px solid #ffe066;
  border-radius: 8px;
  padding: 18px 20px;
  margin-bottom: 18px;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(255, 224, 102, 0.15);
}
</style>

<style>
.error-message {
  color: #e53935;
  font-weight: bold;
  background: rgba(229, 57, 53, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.95em;
}
</style>
