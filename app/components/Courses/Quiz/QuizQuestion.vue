<template>
  <VCard id="quiz-question" elevation="2" class="mb-4 rounded-lg">
    <!-- Level badge -->
    <div class="pa-4 pb-0 d-flex align-center">
      <VChip id="crsqi-level-chip" class="mb-2" size="small" :color="levelColor">
        <VIcon start size="x-small">{{ levelIcon }}</VIcon>
        {{ levelLabel }}
      </VChip>
    </div>

    <VCardTitle class="text-h6 pt-2 pb-0 text-grey-darken-4">
      {{ question }}
    </VCardTitle>

    <VCardText class="pa-4">
      <div
        v-for="(answer, idx) in answers"
        :id="`crsqi-answer-${idx}`"
        :key="idx"
        :class="getAnswerClasses(idx)"
        @click="onAnswerClick(idx)"
      >
        <div class="d-flex align-center">
          <VIcon
            v-if="isAnswered && answer.isCorrect"
            class="mr-2"
            size="small"
            color="success"
          >
            mdi-check-circle
          </VIcon>
          <VIcon
            v-else-if="isAnswered && userAnswer === idx && !answer.isCorrect"
            class="mr-2"
            size="small"
            color="error"
          >
            mdi-close-circle
          </VIcon>
          <VIcon v-else class="mr-2" size="small" :color="circleColor">
            mdi-circle-outline
          </VIcon>
          <span :class="getAnswerTextClass(idx)">{{ answer.text }}</span>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
interface Answer {
  text: string
  isCorrect: boolean
}

const props = withDefaults(
  defineProps<{
    question: string
    answers: Answer[]
    levelColor?: string
    levelIcon?: string
    levelLabel?: string
    isAnswered?: boolean
    userAnswer?: number | null
    circleColor?: string
  }>(),
  {
    levelColor: "grey",
    levelIcon: "mdi-help",
    levelLabel: "",
    isAnswered: false,
    userAnswer: null,
    circleColor: "grey-darken-1",
  },
)

const emit = defineEmits<{
  (e: "answer", idx: number): void
}>()

function getAnswerClasses(idx: number): string[] {
  const classes = ["d-flex", "align-center", "pa-3", "mb-2", "rounded-lg", "answer-option"]
  if (!props.isAnswered) {
    classes.push("answer-unanswered")
    return classes
  }
  const answer = props.answers[idx]
  if (answer.isCorrect) {
    classes.push("answer-correct")
  } else if (props.userAnswer === idx) {
    classes.push("answer-wrong")
  } else {
    classes.push("answer-disabled")
  }
  return classes
}

function getAnswerTextClass(idx: number): string[] {
  const classes: string[] = []
  if (!props.isAnswered) {
    classes.push("text-grey-darken-4")
    return classes
  }
  const answer = props.answers[idx]
  if (answer.isCorrect) {
    classes.push("text-green", "font-weight-bold")
  } else if (props.userAnswer === idx) {
    classes.push("text-red", "font-weight-bold")
  } else {
    classes.push("text-grey")
  }
  return classes
}

function onAnswerClick(idx: number) {
  if (!props.isAnswered) {
    emit("answer", idx)
  }
}
</script>

<style scoped>
.answer-option {
  transition: all 0.2s ease;
  border: 2px solid transparent;
  cursor: pointer;
  user-select: none;
}
.answer-unanswered:hover {
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}
.answer-correct {
  background-color: #e8f5e9 !important;
  border-color: #4caf50 !important;
}
.answer-wrong {
  background-color: #ffebee !important;
  border-color: #f44336 !important;
}
.answer-disabled {
  opacity: 0.6;
  cursor: default !important;
}
</style>
