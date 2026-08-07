<template>
  <div id="quiz-language-toggle" class="d-flex justify-end">
    <VBtnToggle v-model="model" rounded mandatory density="compact">
      <VBtn id="btn-crsqi-lang-es" value="es" size="small" :class="{ 'font-weight-bold': model === 'es' }">
        <VIcon class="mr-1" size="small">mdi-flag</VIcon> ES
      </VBtn>
      <VBtn id="btn-crsqi-lang-en" value="en" size="small" :class="{ 'font-weight-bold': model === 'en' }">
        <VIcon class="mr-1" size="small">mdi-flag-outline</VIcon> EN
      </VBtn>
    </VBtnToggle>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>({ default: "es" })
</script>
