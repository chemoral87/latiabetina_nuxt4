<template>
  <VCard id="rel-config-card" rounded="lg" elevation="2">
    <VCardTitle class="text-subtitle-1 py-2 my-0">
      <VIcon start size="small" color="primary">mdi-cog-outline</VIcon>
      Configuración
    </VCardTitle>

    <VRow class="mb-1" density="compact">
      <VCol lg="6" sm="6" md="12" cols="6">
        <VSelect
          id="rel-exercise"
          hide-details
          density="compact"
          label="Ejercicio"
          variant="outlined"
          :disabled="isPlaying"
          :items="exerciseOptions"
          :model-value="selectedExercise"
          prepend-inner-icon="mdi-meditation"
          @update:model-value="emit('update:selectedExercise', $event)"
        />
      </VCol>

      <VCol lg="4" md="6" sm="4" cols="6">
        <VTextField
          id="rel-initial-contract"
          step="0.1"
          suffix="s"
          hide-details
          type="number"
          density="compact"
          variant="outlined"
          :disabled="isPlaying"
          color="orange-darken-2"
          label="Contracción inicial"
          :model-value="initialContract"
          @update:model-value="emit('update:initialContract', Number($event))"
        >
          <template #prepend-inner>
            <VIcon size="small" color="orange-darken-2">mdi-arrow-collapse-all</VIcon>
          </template>
        </VTextField>
      </VCol>

      <VCol lg="4" md="6" sm="4" cols="6">
        <VTextField
          id="rel-expansion"
          step="0.1"
          suffix="s"
          color="blue"
          hide-details
          type="number"
          density="compact"
          label="Expansión"
          variant="outlined"
          :disabled="isPlaying"
          :model-value="expansion"
          @update:model-value="emit('update:expansion', Number($event))"
        >
          <template #prepend-inner>
            <VIcon color="blue" size="small">mdi-arrow-expand-all</VIcon>
          </template>
        </VTextField>
      </VCol>

      <VCol lg="4" md="6" sm="4" cols="6">
        <VTextField
          id="rel-immobile-1"
          step="0.1"
          suffix="s"
          hide-details
          color="green"
          type="number"
          density="compact"
          label="Inmóvil 1"
          variant="outlined"
          :disabled="isPlaying"
          :model-value="immobile1"
          @update:model-value="emit('update:immobile1', Number($event))"
        >
          <template #prepend-inner>
            <VIcon size="small" color="green">mdi-timer-sand</VIcon>
          </template>
        </VTextField>
      </VCol>

      <VCol lg="4" md="6" sm="4" cols="6">
        <VTextField
          id="rel-contraction"
          step="0.1"
          suffix="s"
          color="red"
          hide-details
          type="number"
          density="compact"
          variant="outlined"
          label="Contracción"
          :disabled="isPlaying"
          :model-value="contraction"
          @update:model-value="emit('update:contraction', Number($event))"
        >
          <template #prepend-inner>
            <VIcon color="red" size="small">mdi-arrow-collapse-all</VIcon>
          </template>
        </VTextField>
      </VCol>

      <VCol lg="4" md="6" sm="4" cols="6">
        <VTextField
          id="rel-immobile-2"
          step="0.1"
          suffix="s"
          hide-details
          color="green"
          type="number"
          density="compact"
          label="Inmóvil 2"
          variant="outlined"
          :disabled="isPlaying"
          :model-value="immobile2"
          @update:model-value="emit('update:immobile2', Number($event))"
        >
          <template #prepend-inner>
            <VIcon size="small" color="green">mdi-timer-sand</VIcon>
          </template>
        </VTextField>
      </VCol>

      <VCol lg="4" md="6" sm="4" cols="6">
        <VTextField
          id="rel-goal-time"
          step="1"
          hide-details
          suffix="min"
          type="number"
          density="compact"
          variant="outlined"
          :disabled="isPlaying"
          color="purple-darken-2"
          label="Tiempo objetivo"
          :model-value="goalTime"
          @update:model-value="emit('update:goalTime', Number($event))"
        >
          <template #prepend-inner>
            <VIcon size="small" color="purple-darken-2">mdi-flag-checkered</VIcon>
          </template>
        </VTextField>
      </VCol>
    </VRow>
  </VCard>
</template>

<script setup lang="ts">
  defineProps<{
    selectedExercise: string
    exerciseOptions: { title: string; value: string }[]
    initialContract: number
    expansion: number
    immobile1: number
    contraction: number
    immobile2: number
    goalTime: number
    isPlaying: boolean
  }>()

  const emit = defineEmits<{
    'update:selectedExercise': [value: string]
    'update:initialContract': [value: number]
    'update:expansion': [value: number]
    'update:immobile1': [value: number]
    'update:contraction': [value: number]
    'update:immobile2': [value: number]
    'update:goalTime': [value: number]
  }>()
</script>
