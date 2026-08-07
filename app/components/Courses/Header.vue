<template>
  <h1
    id="cmp-courses-header"
    style="cursor: pointer"
    class="d-inline-flex align-center"
    @click="visible = !visible"
  >
    <VIcon class="mr-2" :color="visible ? 'primary' : 'black'">
      {{ visible ? "mdi-menu-down" : "mdi-menu-right" }}
    </VIcon>
    {{ title }}
  </h1>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()

const visible = defineModel<boolean>({ default: true })
</script>
