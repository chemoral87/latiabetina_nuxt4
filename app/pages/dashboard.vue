<template>
  <VContainer :fluid="true">
    <VCard id="card-dashboard" flat class="pa-4" border>
      <span class="text-h6">Bienvenidos</span>
      <VRow>
        <VCol cols="12" md="6" lg="4">
          <DashboardConsolidacion v-if="canViewAuditorium" />
        </VCol>
      </VRow>
    </VCard>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Dashboard",
  middleware: "authenticated",
})

const auth = useAuthStore()
const canViewAuditorium = computed(() => auth.hasPermission("auditorium-index"))
</script>
