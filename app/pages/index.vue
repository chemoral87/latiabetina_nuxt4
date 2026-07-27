<template>
  <VContainer :fluid="true" />
</template>

<script setup lang="ts">
onMounted(() => {
  navigateTo("/dashboard")
})
</script>
