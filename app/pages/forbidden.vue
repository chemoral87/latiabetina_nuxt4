<template>
  <VContainer class="fill-height d-flex align-center justify-center">
    <VCard id="forbidden-card" flat border max-width="560">
      <VCardTitle class="text-h5 d-flex align-center">
        <VIcon start size="40" color="orange">mdi-shield-lock-outline</VIcon>
        Acceso denegado
      </VCardTitle>
      <VCardText>
        <div class="error-yellow-box">
          <div class="text-h6 text-grey-darken-4">
            No tiene los suficientes permisos para ver esta página, verifique con el Administrador del sistema.
            <template v-if="requiredPermission">
              <br /><br />
              <span class="error-message">Se requiere el permiso: {{ requiredPermission }}</span>
            </template>
          </div>
        </div>
        <div class="text-h6 text-grey-darken-4">Presione un botón para continuar.</div>
      </VCardText>
      <VCardText class="d-flex justify-end pt-0">
        <VBtn id="forbidden-back-btn" class="mr-4" color="primary" variant="outlined" @click="goBack">
          <VIcon start>mdi-arrow-left</VIcon>
          Volver
        </VBtn>
        <VBtn id="forbidden-dashboard-btn" color="primary" variant="elevated" @click="navigateTo('/dashboard')">
          <VIcon start>mdi-view-dashboard</VIcon>
          Ir al Dashboard
        </VBtn>
      </VCardText>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Acceso denegado",
  icon: "mdi-shield-lock-outline",
  middleware: "authenticated",
})

const route = useRoute()
const requiredPermission = route.query.permission as string | undefined

function goBack() {
  // Return to the previous in-app page when possible; otherwise the dashboard.
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo("/dashboard")
  }
}
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
