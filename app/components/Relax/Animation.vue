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
        <div :style="wrapperStyle" class="animation-wrapper">
          <div :style="circleStyle" class="circle-animation">
            <div :style="innerCircleStyle" class="inner-circle-animation"></div>
          </div>
        </div>
      </VCol>
    </VRow>
  </VCard>
</template>

<script setup lang="ts">
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

  const statuses = computed(() => [
    { key: 'initialContract', duration: props.initialContract, icon: 'mdi-arrow-collapse-all', label: 'Contracción inicial', activeColor: 'orange-darken-2' },
    { key: 'expansion', duration: props.expansion, icon: 'mdi-arrow-expand-all', label: 'Expansión', activeColor: 'blue-darken-2' },
    { key: 'immobile1', duration: props.immobile1, icon: 'mdi-timer-sand', label: 'Inmóvil 1', activeColor: 'green-darken-2' },
    { key: 'contraction', duration: props.contraction, icon: 'mdi-arrow-collapse-all', label: 'Contracción', activeColor: 'red-darken-2' },
    { key: 'immobile2', duration: props.immobile2, icon: 'mdi-timer-sand', label: 'Inmóvil 2', activeColor: 'green-darken-2' },
  ])

  const phaseDurationMap: Record<string, () => number> = {
    initialContract: () => props.initialContract,
    expansion: () => props.expansion,
    immobile1: () => props.immobile1,
    contraction: () => props.contraction,
    immobile2: () => props.immobile2,
  }

  // --- Tamaño del anillo, medido en JS (no CSS `vw`) --------------------------------------
  // `vw` se calcula distinto entre motores (Chrome vs Safari cuentan la scrollbar/toolbar
  // dinámica de forma distinta), así que el tamaño de reposo se fija en px vía JS para que
  // sea idéntico en ambos navegadores. `maxScale` limita la expansión al espacio real
  // disponible en el viewport, para que el anillo nunca se salga de la pantalla en móvil.
  const REST_RATIO = 0.52 // equivalente al `52vw` anterior
  const REST_MAX_PX = 220 // equivalente al `220px` anterior
  const BASE_MAX_SCALE = 3 // factor de expansión original (deseado cuando hay espacio de sobra)
  const SAFETY_MARGIN = 0.92 // deja un pequeño margen para que el anillo no toque el borde de la pantalla

  const restDiameter = ref(REST_MAX_PX)
  const maxScale = ref(BASE_MAX_SCALE)
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null

  function computeSizes() {
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = document.documentElement.clientHeight
    const rest = Math.min(viewportWidth * REST_RATIO, REST_MAX_PX)
    const available = Math.min(viewportWidth, viewportHeight) * SAFETY_MARGIN
    restDiameter.value = rest
    maxScale.value = rest > 0 ? Math.max(1, Math.min(BASE_MAX_SCALE, available / rest)) : BASE_MAX_SCALE
  }

  function scheduleComputeSizes() {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(computeSizes, 150)
  }

  onMounted(() => {
    computeSizes()
    window.addEventListener('resize', scheduleComputeSizes)
    window.addEventListener('orientationchange', scheduleComputeSizes)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', scheduleComputeSizes)
    window.removeEventListener('orientationchange', scheduleComputeSizes)
    if (resizeTimeout) clearTimeout(resizeTimeout)
  })

  const wrapperStyle = computed(() => ({
    width: `${restDiameter.value}px`,
    height: `${restDiameter.value}px`,
  }))
  // -----------------------------------------------------------------------------------------

  const phaseStyles = computed<Record<string, { timing: string; color: string; transform: string; innerTransform: string }>>(() => ({
    initialContract: { timing: 'ease-in', color: '#FF9800', transform: 'scale(0.75)', innerTransform: 'scale(1.3)' },
    expansion: { timing: 'ease-out', color: '#1565C0', transform: `scale(${maxScale.value})`, innerTransform: 'scale(0.777)' },
    immobile1: { timing: 'linear', color: '#2E7D32', transform: `scale(${maxScale.value})`, innerTransform: 'scale(0.777)' },
    contraction: { timing: 'ease-in-out', color: '#C62828', transform: 'scale(1)', innerTransform: 'scale(1)' },
    immobile2: { timing: 'linear', color: '#2E7D32', transform: 'scale(1)', innerTransform: 'scale(1)' },
  }))

  const circleStyle = computed(() => {
    const state = props.animationState
    const phase = phaseStyles.value[state]
    if (!phase) return { transitionDuration: '0.5s', backgroundColor: '#2E7D32', transform: 'scale(1)' }
    const duration = phaseDurationMap[state]?.() ?? 0
    return {
      transitionProperty: 'transform, background-color',
      transitionDuration: `${duration}s`,
      transitionTimingFunction: phase.timing,
      backgroundColor: phase.color,
      transform: phase.transform,
    }
  })

  const innerCircleStyle = computed(() => {
    const state = props.animationState
    const phase = phaseStyles.value[state]
    if (!phase) return {}
    const duration = phaseDurationMap[state]?.() ?? 0
    return {
      transitionProperty: 'transform',
      transitionDuration: `${duration}s`,
      transitionTimingFunction: phase.timing,
      transform: phase.innerTransform,
    }
  })
</script>

<style scoped>
  .animation-wrapper {
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
</style>
