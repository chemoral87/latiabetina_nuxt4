<template>
  <VDialog id="quiz-results" v-model="show" persistent max-width="600">
    <VCard id="card-cours-quiz-quizr-1" class="rounded-xl text-center pa-6">
      <VCardText>
        <VIcon size="80" class="mb-4" :color="resultIconColor">
          {{ resultIcon }}
        </VIcon>

        <h2 class="text-h4 font-weight-bold mb-2">{{ t("quizCompleted") }}</h2>

        <div class="d-flex justify-center align-center my-4">
          <div class="text-center mx-4">
            <div :class="resultColor" class="text-h2 font-weight-bold">
              {{ Math.round((correct / total) * 100) }}%
            </div>
            <div class="text-body-1 text-grey">{{ t("score") }}</div>
          </div>
          <VDivider vertical class="mx-4" style="height: 80px" />
          <div class="text-center mx-4">
            <div class="text-h2 font-weight-bold text-green">{{ correct }}</div>
            <div class="text-body-1 text-grey">{{ t("correctAnswers") }}</div>
          </div>
          <VDivider vertical class="mx-4" style="height: 80px" />
          <div class="text-center mx-4">
            <div class="text-h2 font-weight-bold text-red">{{ incorrect }}</div>
            <div class="text-body-1 text-grey">{{ t("incorrectAnswers") }}</div>
          </div>
        </div>

        <VDivider class="my-4" />

        <div style="gap: 16px" class="d-flex justify-center flex-wrap">
          <div v-for="stat in levelStats" :key="stat.key" class="text-center">
            <div :class="'text-' + stat.color" class="text-body-2 font-weight-medium">
              {{ stat.label }}
            </div>
            <div class="text-h6">{{ stat.correct }}/{{ stat.total }}</div>
          </div>
        </div>
      </VCardText>

      <!-- VCardActions replacement per ai_rule: plain flex div -->
      <div style="gap: 16px" class="d-flex justify-center flex-wrap pb-4">
        <VBtn id="btn-crsqi-newquiz" size="large" color="primary" class="px-8 rounded-lg" @click="emit('reset')">
          <VIcon start>mdi-refresh</VIcon>
          {{ t("newQuiz") }}
        </VBtn>
        <VBtn id="btn-crsqi-review" color="grey" size="large" variant="outlined" class="px-8 rounded-lg" @click="emit('close')">
          {{ t("review") }}
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface LevelStat {
  key: string
  label: string
  color: string
  correct: number
  total: number
}

const props = withDefaults(
  defineProps<{
    correct?: number
    incorrect?: number
    total: number
    resultColor?: string
    resultIcon?: string
    levelStats?: LevelStat[]
    translations?: Record<string, string>
  }>(),
  {
    correct: 0,
    incorrect: 0,
    resultColor: "text-green",
    resultIcon: "mdi-emoticon-happy",
    levelStats: () => [],
    translations: () => ({}),
  },
)

const show = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  (e: "reset"): void
  (e: "close"): void
}>()

// resultColor is a Vuetify 4 text-* utility class; the VIcon needs the bare
// color name (e.g. "green"), which is also used by text-green.
const resultIconColor = computed(() =>
  props.resultColor.startsWith("text-") ? props.resultColor.slice(5) : props.resultColor,
)

function t(key: string) {
  return props.translations[key] || key
}
</script>
