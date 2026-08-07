<template>
  <div id="cmp-quiz-header-title" class="d-flex align-center">
    <VIcon class="mr-2" size="large" color="primary">{{ icon }}</VIcon>
    <div>
      <div class="text-h5 font-weight-bold text-primary">{{ title }}</div>
      <div class="text-caption text-grey">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    title: string
    subtitle?: string
  }>(),
  {
    subtitle: "",
  },
)
</script>
