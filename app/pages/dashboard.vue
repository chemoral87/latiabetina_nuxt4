<template>
  <VContainer :fluid="true">
    <span class="text-h6 ml-2">Bienvenidos</span>
    <VRow>
      <VCol cols="12" md="6" lg="4">
        <DashboardConsolidacion v-if="canViewAuditorium" />
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
const canViewAuditorium = computed(() => auth.hasPermission("auditorium-index"))
</script>
