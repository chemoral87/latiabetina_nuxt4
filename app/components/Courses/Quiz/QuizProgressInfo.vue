<template>
  <div id="crsqi-progress-info" class="quiz-progress-info mb-2">
    <div class="d-flex align-center justify-space-between mb-1">
      <span class="text-body-2 font-weight-medium">
        {{ t("question") }} {{ currentIndex + 1 }} {{ t("of") }} {{ total }}
      </span>
      <span id="crsqi-score" :class="scoreColor" class="text-body-2 font-weight-medium">
        {{ correct }}/{{ answered }} {{ t("correct") }}
      </span>
    </div>

    <VProgressLinear id="crsqi-progress-bar" rounded height="8" color="primary" :model-value="progress" />

    <!-- AutoPass countdown bar -->
    <div
      v-if="autoPass && countdownActive"
      id="crsqi-countdown"
      class="mt-1"
      style="height: 3px; background: #e0e0e0; border-radius: 2px; overflow: hidden"
    >
      <div class="countdown-bar" :style="{ width: countdownProgress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentIndex: number
    total: number
    correct?: number
    answered?: number
    progress?: number
    scoreColor?: string
    autoPass?: boolean
    countdownActive?: boolean
    countdownProgress?: number
    translations?: Record<string, string>
  }>(),
  {
    correct: 0,
    answered: 0,
    progress: 0,
    scoreColor: "",
    autoPass: false,
    countdownActive: false,
    countdownProgress: 0,
    translations: () => ({}),
  },
)

function t(key: string) {
  return props.translations[key] || key
}
</script>

<style scoped>
.countdown-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  border-radius: 2px;
  transition: width 0.1s linear;
}
</style>
