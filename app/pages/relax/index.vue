<template>
  <VContainer :fluid="true" class="breathing-container">
    <!-- Header -->
    <VRow justify="center" density="comfortable">
      <VCol cols="12">
        <div class="text-center">
          <h1 class="text-h6 font-weight-medium py-0 my-0">
            Ejercicio de Respiración
          </h1>
        </div>
      </VCol>
    </VRow>
    <!-- Área de animación y controles -->
    <VRow class="mb-3" justify="center" density="comfortable">
      <VCol cols="12">
        <VCard
          id="rel-animation-card"
          class="pa-3"
          rounded="lg"
          elevation="3"
          color="grey-lighten-5"
        >
          <VRow align="center" density="comfortable">
            <!-- Botón de control -->
            <VCol cols="5">
              <VBtn
                id="rel-toggle-btn"
                rounded
                size="small"
                elevation="2"
                :color="isPlaying ? 'error' : 'primary'"
                @click="toggleAnimation"
              >
                <VIcon start size="small">
                  {{ isPlaying ? "mdi-stop" : "mdi-play" }}
                </VIcon>
                {{ isPlaying ? "Detener" : "Comenzar" }}
              </VBtn>
            </VCol>

            <!-- Indicadores de estado -->
            <VCol cols="7" class="d-flex flex-wrap gap-1">
              <VChip
                v-if="initialContract > 0"
                id="rel-status-initial-contract"
                size="small"
                class="mr-1 mb-1"
                :color="
                  animationState === 'initialContract'
                    ? 'orange-darken-2'
                    : 'grey-lighten-1'
                "
              >
                <VIcon start size="x-small">mdi-arrow-collapse-all</VIcon>
                Contracción inicial
                <span
                  v-if="animationState === 'initialContract'"
                  class="rel-countdown"
                  >{{ stepRemainingDisplay }}</span
                >
              </VChip>
              <VChip
                v-if="expansion > 0"
                id="rel-status-expansion"
                size="small"
                class="mr-1 mb-1"
                :color="
                  animationState === 'expansion'
                    ? 'blue-darken-2'
                    : 'grey-lighten-1'
                "
              >
                <VIcon start size="x-small">mdi-arrow-expand-all</VIcon>
                Expansión
                <span
                  v-if="animationState === 'expansion'"
                  class="rel-countdown"
                  >{{ stepRemainingDisplay }}</span
                >
              </VChip>
              <VChip
                v-if="immobile1 > 0"
                id="rel-status-immobile-1"
                size="small"
                class="mr-1 mb-1"
                :color="
                  animationState === 'immobile1'
                    ? 'green-darken-2'
                    : 'grey-lighten-1'
                "
              >
                <VIcon start size="x-small">mdi-timer-sand</VIcon>
                Inmóvil 1
                <span
                  v-if="animationState === 'immobile1'"
                  class="rel-countdown"
                  >{{ stepRemainingDisplay }}</span
                >
              </VChip>
              <VChip
                v-if="contraction > 0"
                id="rel-status-contraction"
                size="small"
                class="mr-1 mb-1"
                :color="
                  animationState === 'contraction'
                    ? 'red-darken-2'
                    : 'grey-lighten-1'
                "
              >
                <VIcon start size="x-small">mdi-arrow-collapse-all</VIcon>
                Contracción
                <span
                  v-if="animationState === 'contraction'"
                  class="rel-countdown"
                  >{{ stepRemainingDisplay }}</span
                >
              </VChip>
              <VChip
                v-if="immobile2 > 0"
                id="rel-status-immobile-2"
                class="mb-1"
                size="small"
                :color="
                  animationState === 'immobile2'
                    ? 'green-darken-2'
                    : 'grey-lighten-1'
                "
              >
                <VIcon start size="x-small">mdi-timer-sand</VIcon>
                Inmóvil 2
                <span
                  v-if="animationState === 'immobile2'"
                  class="rel-countdown"
                  >{{ stepRemainingDisplay }}</span
                >
              </VChip>
            </VCol>

            <!-- Temporizador -->
            <VCol cols="auto">
              <VChip
                v-if="isPlaying"
                id="rel-timer-1"
                size="small"
                color="primary"
                variant="outlined"
              >
                <VIcon start size="x-small">mdi-clock-outline</VIcon>
                {{ formattedTime }}
              </VChip>
              <VChip
                v-else
                id="rel-timer-2"
                disabled
                color="grey"
                size="small"
                variant="outlined"
              >
                <VIcon start size="x-small">mdi-clock-outline</VIcon>
                00:00
              </VChip>
            </VCol>
          </VRow>

          <!-- Círculo de animación -->
          <div class="animation-wrapper">
            <div :style="circleStyle" class="circle-animation">
              <div
                :style="innerCircleStyle"
                class="inner-circle-animation"
              ></div>
            </div>
          </div>
        </VCard>
      </VCol>
    </VRow>
    <!-- Controles de configuración -->
    <VRow justify="center" density="comfortable">
      <VCol cols="12">
        <VCard id="rel-config-card" class="pa-1" rounded="lg" elevation="2">
          <VCardTitle class="text-subtitle-1 py-0 my-0">
            <VIcon start size="small" color="primary">mdi-cog-outline</VIcon>
            Configuración
          </VCardTitle>

          <VRow class="mb-1" density="comfortable">
            <VCol md="4" sm="6" cols="12">
              <VSelect
                id="rel-exercise"
                v-model="selectedExercise"
                hide-details
                density="compact"
                label="Ejercicio"
                variant="outlined"
                :disabled="isPlaying"
                :items="exerciseOptions"
                prepend-inner-icon="mdi-meditation"
              />
            </VCol>
          </VRow>

          <VRow density="comfortable">
            <VCol cols="auto">
              <VTextField
                id="rel-initial-contract"
                v-model.number="initialContract"
                step="0.1"
                suffix="s"
                hide-details
                type="number"
                density="compact"
                variant="outlined"
                :disabled="isPlaying"
                color="orange-darken-2"
                label="Contracción inicial"
              >
                <template #prepend-inner>
                  <VIcon size="small" color="orange-darken-2"
                    >mdi-arrow-collapse-all</VIcon
                  >
                </template>
              </VTextField>
            </VCol>

            <VCol cols="auto">
              <VTextField
                id="rel-expansion"
                v-model.number="expansion"
                step="0.1"
                suffix="s"
                color="blue"
                hide-details
                type="number"
                density="compact"
                label="Expansión"
                variant="outlined"
                :disabled="isPlaying"
              >
                <template #prepend-inner>
                  <VIcon color="blue" size="small">mdi-arrow-expand-all</VIcon>
                </template>
              </VTextField>
            </VCol>

            <VCol cols="auto">
              <VTextField
                id="rel-immobile-1"
                v-model.number="immobile1"
                step="0.1"
                suffix="s"
                hide-details
                color="green"
                type="number"
                density="compact"
                label="Inmóvil 1"
                variant="outlined"
                :disabled="isPlaying"
              >
                <template #prepend-inner>
                  <VIcon size="small" color="green">mdi-timer-sand</VIcon>
                </template>
              </VTextField>
            </VCol>

            <VCol cols="auto">
              <VTextField
                id="rel-contraction"
                v-model.number="contraction"
                step="0.1"
                suffix="s"
                color="red"
                hide-details
                type="number"
                density="compact"
                variant="outlined"
                label="Contracción"
                :disabled="isPlaying"
              >
                <template #prepend-inner>
                  <VIcon color="red" size="small">mdi-arrow-collapse-all</VIcon>
                </template>
              </VTextField>
            </VCol>

            <VCol cols="auto">
              <VTextField
                id="rel-immobile-2"
                v-model.number="immobile2"
                step="0.1"
                suffix="s"
                hide-details
                color="green"
                type="number"
                density="compact"
                label="Inmóvil 2"
                variant="outlined"
                :disabled="isPlaying"
              >
                <template #prepend-inner>
                  <VIcon size="small" color="green">mdi-timer-sand</VIcon>
                </template>
              </VTextField>
            </VCol>
            <VCol cols="auto">
              <VTextField
                id="rel-goal-time"
                v-model.number="goalTime"
                step="1"
                hide-details
                suffix="min"
                type="number"
                density="compact"
                variant="outlined"
                :disabled="isPlaying"
                color="purple-darken-2"
                label="Tiempo objetivo"
              >
                <template #prepend-inner>
                  <VIcon size="small" color="purple-darken-2"
                    >mdi-flag-checkered</VIcon
                  >
                </template>
              </VTextField>
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>

    <!-- Diálogo de felicitación -->
    <VDialog
      id="rel-completion-dlg"
      v-model="showCompletionDialog"
      persistent
      max-width="340"
    >
      <VCard id="rel-completion-card" rounded="xl" class="text-center pa-4">
        <div class="celebration-icon mb-2">🎉</div>
        <VCardTitle class="text-h6 justify-center pb-1"
          >¡Felicidades!</VCardTitle
        >
        <VCardText class="text-body-1 pb-2">
          Completaste la rutina de
          <strong>{{ goalTime }} minuto{{ goalTime !== 1 ? "s" : "" }}</strong
          >.<br />
          ¡Excelente trabajo!
        </VCardText>
        <div class="d-flex justify-center">
          <VBtn
            id="rel-close-btn"
            rounded
            elevation="2"
            color="purple-darken-2"
            @click="closeCompletion"
          >
            <VIcon start size="small">mdi-refresh</VIcon>
            Volver a empezar
          </VBtn>
        </div>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Timer",
  icon: "mdi-clock-outline",
  // permission: "breath-train",
  middleware: ["authenticated", "permission"],
});

const goalTime = ref(5);
const showCompletionDialog = ref(false);
const initialContract = ref(0); // 0.72
const expansion = ref(6); // 5.28
const immobile1 = ref(0);
const contraction = ref(5.04);
const immobile2 = ref(0.96);
const animationState = ref("idle");
const isPlaying = ref(false);
const elapsedSeconds = ref(0);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);
const timeouts = ref<ReturnType<typeof setTimeout>[]>([]);
const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null);
const phaseStartedAt = ref(0);
const phaseDuration = ref(0);
const stepRemaining = ref(0);

interface BreathingExercise {
  initialContract: number;
  expansion: number;
  immobile1: number;
  contraction: number;
  immobile2: number;
}

const exerciseOptions: { title: string; value: string }[] = [
  { title: "Relax", value: "relax" },
  { title: "Box 4", value: "box4" },
  { title: "Box 5", value: "box5" },
  { title: "Box 6", value: "box6" },
  { title: "Box 7", value: "box7" },
  { title: "Militar 4-7-8", value: "military" },
  { title: "Personalizado", value: "custom" },
];

const exerciseMap: Record<string, BreathingExercise> = {
  relax: {
    initialContract: 0,
    expansion: 6,
    immobile1: 0,
    contraction: 5.04,
    immobile2: 0.96,
  },
  box4: {
    initialContract: 0,
    expansion: 4,
    immobile1: 4,
    contraction: 4,
    immobile2: 4,
  },
  box5: {
    initialContract: 0,
    expansion: 5,
    immobile1: 5,
    contraction: 5,
    immobile2: 5,
  },
  box6: {
    initialContract: 0,
    expansion: 6,
    immobile1: 6,
    contraction: 6,
    immobile2: 6,
  },
  box7: {
    initialContract: 0,
    expansion: 7,
    immobile1: 7,
    contraction: 7,
    immobile2: 7,
  },
  military: {
    initialContract: 0,
    expansion: 4,
    immobile1: 7,
    contraction: 8,
    immobile2: 0,
  },
};

const matchedExercise = computed(() => {
  const vals = {
    initialContract: initialContract.value,
    expansion: expansion.value,
    immobile1: immobile1.value,
    contraction: contraction.value,
    immobile2: immobile2.value,
  };
  for (const [key, ex] of Object.entries(exerciseMap)) {
    if (
      ex.initialContract === vals.initialContract &&
      ex.expansion === vals.expansion &&
      ex.immobile1 === vals.immobile1 &&
      ex.contraction === vals.contraction &&
      ex.immobile2 === vals.immobile2
    ) {
      return key;
    }
  }
  return "custom";
});

const selectedExercise = computed({
  get: () => matchedExercise.value,
  set: (value: string) => {
    const ex = exerciseMap[value];
    if (!ex) return;
    initialContract.value = ex.initialContract;
    expansion.value = ex.expansion;
    immobile1.value = ex.immobile1;
    contraction.value = ex.contraction;
    immobile2.value = ex.immobile2;
  },
});

const circleStyle = reactive({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "#2E7D32",
  transition: "transform 0.5s ease-out",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
});

const innerCircleStyle = reactive({
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  backgroundColor: "white",
  transition: "transform 0.5s ease-out",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
});

const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
    .toString()
    .padStart(2, "0");
  const s = (elapsedSeconds.value % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
});

const stepRemainingDisplay = computed(() => stepRemaining.value.toFixed(2));

function getPhaseDuration(state: string): number {
  switch (state) {
    case "initialContract":
      return initialContract.value;
    case "expansion":
      return expansion.value;
    case "immobile1":
      return immobile1.value;
    case "contraction":
      return contraction.value;
    case "immobile2":
      return immobile2.value;
    default:
      return 0;
  }
}

function setPhase(nextState: string) {
  animationState.value = nextState;
  phaseDuration.value = getPhaseDuration(nextState);
  phaseStartedAt.value = Date.now();
  stepRemaining.value = phaseDuration.value;
}

function startCountdown() {
  clearInterval(countdownInterval.value ?? undefined);
  countdownInterval.value = setInterval(() => {
    if (!isPlaying.value) return;
    const elapsed = (Date.now() - phaseStartedAt.value) / 1000;
    stepRemaining.value = Math.max(0, phaseDuration.value - elapsed);
  }, 10);
}

function stopCountdown() {
  clearInterval(countdownInterval.value ?? undefined);
  countdownInterval.value = null;
  stepRemaining.value = 0;
}

function completeAnimation() {
  isPlaying.value = false;
  clearInterval(timerInterval.value ?? undefined);
  timerInterval.value = null;
  timeouts.value.forEach((timeout) => clearTimeout(timeout));
  timeouts.value = [];
  stopCountdown();
  animationState.value = "idle";
  circleStyle.backgroundColor = "#2E7D32";
  circleStyle.transform = "scale(1)";
  circleStyle.transitionDuration = "0.5s";
  innerCircleStyle.transform = "scale(1)";
  innerCircleStyle.transitionDuration = "0.5s";
  showCompletionDialog.value = true;
}

function closeCompletion() {
  showCompletionDialog.value = false;
  elapsedSeconds.value = 0;
}

function toggleAnimation() {
  if (isPlaying.value) {
    stopAnimation();
  } else {
    startAnimation();
  }
}

function startAnimation() {
  ensureAudioContext();
  isPlaying.value = true;
  elapsedSeconds.value = 0;
  timerInterval.value = setInterval(() => {
    elapsedSeconds.value++;
    if (goalTime.value > 0 && elapsedSeconds.value >= goalTime.value * 60) {
      completeAnimation();
    }
  }, 1000);
  startCountdown();
  setPhase("initialContract");
  animateCircle();
}

function stopAnimation() {
  isPlaying.value = false;
  clearInterval(timerInterval.value ?? undefined);
  timerInterval.value = null;
  elapsedSeconds.value = 0;

  timeouts.value.forEach((timeout) => clearTimeout(timeout));
  timeouts.value = [];
  stopCountdown();

  animationState.value = "idle";
  circleStyle.backgroundColor = "#2E7D32";
  circleStyle.transform = "scale(1)";
  circleStyle.transitionDuration = "0.5s";
  innerCircleStyle.transform = "scale(1)";
  innerCircleStyle.transitionDuration = "0.5s";
}

let audioContext: AudioContext | null = null;

function ensureAudioContext(): AudioContext {
  if (!audioContext) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new AC({ latencyHint: "interactive" });
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

async function playBeep() {
  const ctx = ensureAudioContext();
  try {
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const t = ctx.currentTime + 0.05;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 1000;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.0001, t);
    gainNode.gain.exponentialRampToValueAtTime(0.8, t + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    oscillator.start(t);
    oscillator.stop(t + 0.3);
  } catch {
    // ignore
  }
}

onMounted(() => {
  const unlock = () => ensureAudioContext();
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
  window.addEventListener("click", unlock, { once: true });
  onBeforeUnmount(() => {
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("touchstart", unlock);
    window.removeEventListener("click", unlock);
  });
});

function animateCircle() {
  if (!isPlaying.value) return;

  setPhase(animationState.value);
  playBeep();

  if (animationState.value === "initialContract") {
    // 1. Contracción inicial: el círculo se encoge levemente
    circleStyle.transitionDuration = `${initialContract.value}s`;
    circleStyle.transitionTimingFunction = "ease-in";
    circleStyle.backgroundColor = "#FF9800";
    circleStyle.transform = "scale(0.75)";
    innerCircleStyle.transitionDuration = `${initialContract.value}s`;
    innerCircleStyle.transitionTimingFunction = "ease-in";
    innerCircleStyle.transform = "scale(1.3)";
    const t1 = setTimeout(() => {
      animationState.value = "expansion";
      animateCircle();
    }, initialContract.value * 1000);
    timeouts.value.push(t1);
  } else if (animationState.value === "expansion") {
    // 2. Expansión: el círculo crece al máximo
    circleStyle.transitionDuration = `${expansion.value}s`;
    circleStyle.transitionTimingFunction = "ease-out";
    circleStyle.backgroundColor = "#1565C0";
    circleStyle.transform = "scale(3)";
    innerCircleStyle.transitionDuration = `${expansion.value}s`;
    innerCircleStyle.transitionTimingFunction = "ease-out";
    innerCircleStyle.transform = "scale(0.777)";
    const t2 = setTimeout(() => {
      animationState.value = "immobile1";
      animateCircle();
    }, expansion.value * 1000);
    timeouts.value.push(t2);
  } else if (animationState.value === "immobile1") {
    // 2.5 Inmóvil 1: el círculo permanece expandido
    circleStyle.transitionDuration = `${immobile1.value}s`;
    circleStyle.transitionTimingFunction = "linear";
    circleStyle.backgroundColor = "#2E7D32";
    circleStyle.transform = "scale(3)";
    innerCircleStyle.transitionDuration = `${immobile1.value}s`;
    innerCircleStyle.transitionTimingFunction = "linear";
    innerCircleStyle.transform = "scale(0.777)";
    const t25 = setTimeout(() => {
      animationState.value = "contraction";
      animateCircle();
    }, immobile1.value * 1000);
    timeouts.value.push(t25);
  } else if (animationState.value === "contraction") {
    // 3. Contracción: el círculo vuelve a su tamaño normal
    circleStyle.transitionDuration = `${contraction.value}s`;
    circleStyle.transitionTimingFunction = "ease-in-out";
    circleStyle.backgroundColor = "#C62828";
    circleStyle.transform = "scale(1)";
    innerCircleStyle.transitionDuration = `${contraction.value}s`;
    innerCircleStyle.transitionTimingFunction = "ease-in-out";
    innerCircleStyle.transform = "scale(1)";
    const t3 = setTimeout(() => {
      animationState.value = "immobile2";
      animateCircle();
    }, contraction.value * 1000);
    timeouts.value.push(t3);
  } else if (animationState.value === "immobile2") {
    // 4. Inmóvil 2: el círculo permanece quieto
    circleStyle.transitionDuration = `${immobile2.value}s`;
    circleStyle.transitionTimingFunction = "linear";
    circleStyle.backgroundColor = "#2E7D32";
    circleStyle.transform = "scale(1)";
    innerCircleStyle.transitionDuration = `${immobile2.value}s`;
    innerCircleStyle.transitionTimingFunction = "linear";
    innerCircleStyle.transform = "scale(1)";
    const t4 = setTimeout(() => {
      // Reinicia el ciclo
      animationState.value = "initialContract";
      animateCircle();
    }, immobile2.value * 1000);
    timeouts.value.push(t4);
  }
}

onBeforeUnmount(() => {
  clearInterval(timerInterval.value ?? undefined);
  timerInterval.value = null;
  timeouts.value.forEach((timeout) => clearTimeout(timeout));
  timeouts.value = [];
  stopCountdown();
});
</script>

<style scoped>
.breathing-container {
  min-height: 100vh;
  padding: 0.5rem;
}

.animation-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
  overflow: hidden;
  padding: 10px;
}

.circle-animation {
  display: inline-block;
  margin: auto;
}

.celebration-icon {
  font-size: 3rem;
  line-height: 1;
}

.rel-countdown {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.9;
  margin-left: 4px;
  font-variant-numeric: tabular-nums;
}
</style>
