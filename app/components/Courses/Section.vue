<template>
  <VCard
    id="card-cours-secti-1"
    class="mb-8"
    :elevation="outlined ? 0 : elevation"
    :variant="outlined ? 'outlined' : 'elevated'"
  >
    <VCardTitle class="text-h6 font-weight-bold bg-primary text-white py-3 px-4">
      <VIcon v-if="icon" start color="white">{{ icon }}</VIcon>
      {{ title }}
    </VCardTitle>
    <VCardText :class="textClass">
      <slot />
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    icon?: string
    outlined?: boolean
    elevation?: number | string
    textClass?: string
  }>(),
  {
    icon: "",
    outlined: false,
    elevation: 2,
    textClass: "pt-4",
  },
)
</script>
