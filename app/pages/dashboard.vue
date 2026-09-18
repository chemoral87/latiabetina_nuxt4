<template>
  <VContainer class="" :fluid="true">
    <VCard id="dashboard-card" flat border class="pa-4">
      <span class="text-h6">Bienvenidos</span>
      <VRow density="compact">
        <ClientOnly>
          <VCol v-if="canViewAuditorium" lg="4" md="6" cols="12">
            <DashboardConsolidacion />
          </VCol>
          <VCol v-if="canViewAssistanceDashboard" lg="8" md="6" cols="12">
            <DashboardAssistencia />
          </VCol>
        </ClientOnly>
      </VRow>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Dashboard",
  icon: "mdi-view-dashboard",
  middleware: "authenticated",
})

const auth = useAuthStore()
const canViewAuditorium = computed(() => auth.hasPermission("auditorium-index"))
const canViewAssistanceDashboard = computed(() => auth.hasPermission("assitance-dashboard"))
</script>
