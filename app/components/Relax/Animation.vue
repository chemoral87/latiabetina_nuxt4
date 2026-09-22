<template>
  <VCard id="rel-animation-card" class="pa-3" rounded="lg" elevation="3" color="grey-lighten-5">
    <VRow align="center" density="compact">
      <VCol cols="7">
        <div class="d-flex flex-column ga-2">
          <div>
            <VBtn
              id="rel-toggle-btn"
              rounded
              size="small"
              elevation="2"
              :color="isPlaying ? 'error' : 'primary'"
              @click="emit('toggle')"
            >
              <VIcon start size="small">{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isPlaying ? 'Detener' : 'Comenzar' }}
            </VBtn>
          </div>

          <div class="d-flex flex-wrap gap-1">
            <VChip
              v-for="status in statuses"
              v-show="status.duration > 0"
              :id="`rel-status-${status.key}`"
              :key="status.key"
              size="small"
              class="mr-1 mb-1"
              :color="animationState === status.key ? status.activeColor : 'grey-lighten-1'"
            >
              <VIcon start size="x-small">{{ status.icon }}</VIcon>
              {{ status.label }}
              <span v-if="animationState === status.key" class="rel-countdown">{{ stepRemainingDisplay }}</span>
            </VChip>
          </div>

          <div>
            <VChip v-if="isPlaying" id="rel-timer-1" size="small" color="primary" variant="outlined">
              <VIcon start size="x-small">mdi-clock-outline</VIcon>
              {{ formattedTime }}
            </VChip>
            <VChip v-else id="rel-timer-2" disabled color="grey" size="small" variant="outlined">
              <VIcon start size="x-small">mdi-clock-outline</VIcon>
              00:00
            </VChip>
          </div>
        </div>
      </VCol>

      <VCol cols="5">
        <div class="animation-wrapper">
          <div :ref="circleEl" class="circle-animation">
            <div :ref="innerCircleEl" class="inner-circle-animation"></div>
          </div>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps<{
    isPlaying: boolean
    initialContract: number
    expansion: number
    immobile1: number
    contraction: number
    immobile2: number
    animationState: string
    stepRemainingDisplay: string
    formattedTime: string
  }>()

  const emit = defineEmits<{ toggle: [] }>()
  const circleEl = ref<HTMLElement | null>(null)
  const innerCircleEl = ref<HTMLElement | null>(null)

  const statuses = computed(() => [
    { key: 'initialContract', duration: props.initialContract, icon: 'mdi-arrow-collapse-all', label: 'Contracción inicial', activeColor: 'orange-darken-2' },
    { key: 'expansion', duration: props.expansion, icon: 'mdi-arrow-expand-all', label: 'Expansión', activeColor: 'blue-darken-2' },
    { key: 'immobile1', duration: props.immobile1, icon: 'mdi-timer-sand', label: 'Inmóvil 1', activeColor: 'green-darken-2' },
    { key: 'contraction', duration: props.contraction, icon: 'mdi-arrow-collapse-all', label: 'Contracción', activeColor: 'red-darken-2' },
    { key: 'immobile2', duration: props.immobile2, icon: 'mdi-timer-sand', label: 'Inmóvil 2', activeColor: 'green-darken-2' },
  ])

  defineExpose({ circleEl, innerCircleEl })
</script>

<style scoped>
  .animation-wrapper {
    width: min(52vw, 220px);
    height: min(52vw, 220px);
    max-width: 220px;
    max-height: 220px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-inline: auto;
    overflow: visible;
    position: relative;
    flex-shrink: 0;
  }

  .circle-animation {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #2E7D32;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition-property: transform, background-color;
    transition-duration: 0.5s;
    transition-timing-function: ease-out;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: center center;
    transform: scale(1);
    -webkit-transform: scale(1);
  }

  .inner-circle-animation {
    width: 50%;
    height: 50%;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition-property: transform;
    transition-duration: 0.5s;
    transition-timing-function: ease-out;
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: center center;
  }

  .rel-countdown { font-size: 0.75rem; font-weight: 600; opacity: 0.9; margin-left: 4px; font-variant-numeric: tabular-nums; }
  @supports not (aspect-ratio: 1/1) { .animation-wrapper { padding-bottom: 100%; height: 0; } }
</style>
