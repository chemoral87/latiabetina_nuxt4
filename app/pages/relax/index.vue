<template>
  <VContainer :fluid="true" class="breathing-container">
    <VRow justify="center" density="compact">
      <VCol cols="12" class="py-1">
        <div class="text-center">
          <h1 class="text-h5 text-sm-h4 font-weight-medium py-0 my-0">Ejercicio de Res</h1>
        </div>
      </VCol>
    </VRow>

    <VRow class="mb-1" justify="center" density="compact">
      <VCol md="7" cols="12">
        <RelaxAnimation
          :expansion="expansion"
          :immobile1="immobile1"
          :immobile2="immobile2"
          :is-playing="isPlaying"
          :contraction="contraction"
          :formatted-time="formattedTime"
          :animation-state="animationState"
          :initial-contract="initialContract"
          :step-remaining-display="stepRemainingDisplay"
          @toggle="toggleAnimation"
        />
      </VCol>
      <VCol md="5" cols="12">
        <RelaxConfig
          v-model:selected-exercise="selectedExercise"
          :goal-time="goalTime"
          :expansion="expansion"
          :immobile1="immobile1"
          :immobile2="immobile2"
          :is-playing="isPlaying"
          :contraction="contraction"
          :exercise-options="exerciseOptions"
          :initial-contract="initialContract"
          @update:goal-time="goalTime = $event"
          @update:expansion="expansion = $event"
          @update:immobile1="immobile1 = $event"
          @update:immobile2="immobile2 = $event"
          @update:contraction="contraction = $event"
          @update:initial-contract="initialContract = $event"
        />
      </VCol>
    </VRow>

    <RelaxCompletionDialog
      v-model:show="showCompletionDialog"
      :goal-time="goalTime"
      @close="closeCompletion"
    />
  </VContainer>
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'Timer',
    icon: 'mdi-clock-outline',
    middleware: ['authenticated', 'permission'],
  })

  interface BreathingExercise {
    initialContract: number
    expansion: number
    immobile1: number
    contraction: number
    immobile2: number
  }

  const goalTime = ref(5)
  const showCompletionDialog = ref(false)
  const initialContract = ref(0)
  const expansion = ref(6)
  const immobile1 = ref(0)
  const contraction = ref(5.04)
  const immobile2 = ref(0.96)
  const animationState = ref('idle')
  const isPlaying = ref(false)
  const elapsedSeconds = ref(0)
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null)
  const phaseStartedAt = ref(0)
  const phaseDuration = ref(0)
  const stepRemaining = ref(0)

  const exerciseOptions: { title: string; value: string }[] = [
    { title: 'Relax', value: 'relax' },
    { title: 'Box 4', value: 'box4' },
    { title: 'Box 5', value: 'box5' },
    { title: 'Box 6', value: 'box6' },
    { title: 'Box 7', value: 'box7' },
    { title: 'Rect 4', value: 'rect4' },
    { title: 'Rect 5', value: 'rect5' },
    { title: 'Rect 6', value: 'rect6' },
    { title: 'Rect 7', value: 'rect7' },
    { title: 'Triangle 4', value: 'triangle4' },
    { title: 'Triangle 5', value: 'triangle5' },
    { title: 'Triangle 6', value: 'triangle6' },
    { title: 'Triangle 7', value: 'triangle7' },
    { title: '4-7-8 Weil', value: 'weil' },
    { title: '1:2 Respiración', value: 'ratio12' },
    { title: 'Personalizado', value: 'custom' },
  ]

  const exerciseMap: Record<string, BreathingExercise> = {
    relax: { initialContract: 0, expansion: 6, immobile1: 0, contraction: 5.04, immobile2: 0.96 },
    box4: { initialContract: 0, expansion: 4, immobile1: 4, contraction: 4, immobile2: 4 },
    box5: { initialContract: 0, expansion: 5, immobile1: 5, contraction: 5, immobile2: 5 },
    box6: { initialContract: 0, expansion: 6, immobile1: 6, contraction: 6, immobile2: 6 },
    box7: { initialContract: 0, expansion: 7, immobile1: 7, contraction: 7, immobile2: 7 },
    rect4: { initialContract: 0, expansion: 4, immobile1: 3, contraction: 4, immobile2: 3 },
    rect5: { initialContract: 0, expansion: 5, immobile1: 3, contraction: 5, immobile2: 3 },
    rect6: { initialContract: 0, expansion: 6, immobile1: 3, contraction: 6, immobile2: 3 },
    rect7: { initialContract: 0, expansion: 7, immobile1: 3, contraction: 7, immobile2: 3 },
    triangle4: { initialContract: 0, expansion: 4, immobile1: 4, contraction: 4, immobile2: 0 },
    triangle5: { initialContract: 0, expansion: 5, immobile1: 5, contraction: 5, immobile2: 0 },
    triangle6: { initialContract: 0, expansion: 6, immobile1: 6, contraction: 6, immobile2: 0 },
    triangle7: { initialContract: 0, expansion: 7, immobile1: 7, contraction: 7, immobile2: 0 },
    weil: { initialContract: 0, expansion: 4, immobile1: 7, contraction: 8, immobile2: 0 },
    ratio12: { initialContract: 0, expansion: 4, immobile1: 0, contraction: 8, immobile2: 0 },
  }

  const matchedExercise = computed(() => {
    const values = {
      initialContract: initialContract.value,
      expansion: expansion.value,
      immobile1: immobile1.value,
      contraction: contraction.value,
      immobile2: immobile2.value,
    }
    return Object.entries(exerciseMap).find(([, exercise]) =>
      Object.entries(values).every(([key, value]) => exercise[key as keyof BreathingExercise] === value)
    )?.[0] ?? 'custom'
  })

  const selectedExercise = computed({
    get: () => matchedExercise.value,
    set: (value: string) => {
      const exercise = exerciseMap[value]
      if (!exercise) return
      initialContract.value = exercise.initialContract
      expansion.value = exercise.expansion
      immobile1.value = exercise.immobile1
      contraction.value = exercise.contraction
      immobile2.value = exercise.immobile2
    },
  })

  const formattedTime = computed(() => {
    const minutes = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0')
    const seconds = (elapsedSeconds.value % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  })

  const stepRemainingDisplay = computed(() => stepRemaining.value.toFixed(2))

  function getPhaseDuration(state: string): number {
    return {
      initialContract: initialContract.value,
      expansion: expansion.value,
      immobile1: immobile1.value,
      contraction: contraction.value,
      immobile2: immobile2.value,
    }[state] ?? 0
  }

  function setPhase(nextState: string) {
    // ponytail: skip 0s phases so the ring always expands/contracts from the rest
    // position; drop the loop if a 0s phase ever needs to render its transform
    let guard = 5
    while (getPhaseDuration(nextState) <= 0 && guard-- > 0) {
      nextState = getNextPhase(nextState)
    }
    animationState.value = nextState
    phaseDuration.value = getPhaseDuration(nextState)
    phaseStartedAt.value = Date.now()
    stepRemaining.value = phaseDuration.value
  }

  function startCountdown() {
    clearInterval(countdownInterval.value ?? undefined)
    countdownInterval.value = setInterval(() => {
      if (!isPlaying.value) return
      const remaining = phaseDuration.value - (Date.now() - phaseStartedAt.value) / 1000
      stepRemaining.value = Math.max(0, remaining)
      if (remaining <= 0) {
        animateCircle(getNextPhase(animationState.value))
      }
    }, 10)
  }

  function stopCountdown() {
    clearInterval(countdownInterval.value ?? undefined)
    countdownInterval.value = null
    stepRemaining.value = 0
  }

  function completeAnimation() {
    isPlaying.value = false
    clearInterval(timerInterval.value ?? undefined)
    timerInterval.value = null
    stopCountdown()
    animationState.value = 'idle'
    const { playRelaxSuccess } = useRelaxAudio()
    void playRelaxSuccess()
    showCompletionDialog.value = true
  }

  function closeCompletion() {
    showCompletionDialog.value = false
    elapsedSeconds.value = 0
  }

  async function toggleAnimation() {
    if (isPlaying.value) {
      stopAnimation()
    } else {
      await startAnimation()
    }
  }

  async function startAnimation() {
    const { unlockRelaxAudio } = useRelaxAudio()
    await unlockRelaxAudio().catch(() => undefined)
    isPlaying.value = true
    elapsedSeconds.value = 0
    timerInterval.value = setInterval(() => {
      elapsedSeconds.value++
      if (goalTime.value > 0 && elapsedSeconds.value >= goalTime.value * 60) completeAnimation()
    }, 1000)
    startCountdown()
    animateCircle('initialContract')
  }

  function stopAnimation() {
    isPlaying.value = false
    clearInterval(timerInterval.value ?? undefined)
    timerInterval.value = null
    elapsedSeconds.value = 0
    stopCountdown()
    animationState.value = 'idle'
  }

  function playBeep() {
    const { playRelaxBeep } = useRelaxAudio()
    void playRelaxBeep(1000, 0.3)
  }

  function getNextPhase(state: string): string {
    return {
      initialContract: 'expansion',
      expansion: 'immobile1',
      immobile1: 'contraction',
      contraction: 'immobile2',
      immobile2: 'initialContract',
    }[state] ?? 'initialContract'
  }

  function animateCircle(nextState: string) {
    if (!isPlaying.value) return
    setPhase(nextState)
    playBeep()
  }

  let visibilityCleanup: (() => void) | null = null

  onMounted(() => {
    const { ensureRelaxAudioRunning } = useRelaxAudio()
    const onVisibility = () => {
      if (!document.hidden && isPlaying.value) void ensureRelaxAudioRunning()
    }
    document.addEventListener('visibilitychange', onVisibility)
    visibilityCleanup = () => document.removeEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    visibilityCleanup?.()
    clearInterval(timerInterval.value ?? undefined)
    timerInterval.value = null
    stopCountdown()
  })
</script>

<style scoped>
  .breathing-container { min-height: 100vh; padding: 0.5rem; }
  @media (max-width: 600px) { .breathing-container { padding: 0.375rem; } }
</style>
