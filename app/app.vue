<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Marks the app as "navigating" as soon as it boots (covers F5 / direct URL load),
// so the initial data fetch inside a page's top-level await gets counted by
// useGlobalProgress the same way client-side route navigations already are.
if (import.meta.client) {
  useGlobalProgress().beginNavigation()
}
</script>
