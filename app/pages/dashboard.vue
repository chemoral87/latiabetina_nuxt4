<template>
  <VContainer :fluid="true">
    <VCard id="card-dashboard" flat class="pa-4" border>
      <span class="text-h6">Bienvenidos</span>
      <VRow>
        <ClientOnly>
          <VCol v-if="canViewAuditorium" cols="12" md="6" lg="4">
          <!--  <DashboardConsolidacion /> -->
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
</script>
