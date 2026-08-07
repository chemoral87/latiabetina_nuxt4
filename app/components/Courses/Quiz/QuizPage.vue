<template>
  <VContainer id="crsqi-page" class="pa-4" style="max-width: 900px">
    <!-- Header -->
    <div style="gap: 12px" class="d-flex align-center justify-space-between flex-wrap mb-4">
      <QuizHeaderTitle :icon="icon" :title="title" :subtitle="subtitle" />
      <QuizLanguageToggle :model-value="lang" @update:model-value="setLang" />
    </div>

    <!-- Config screen (before starting) -->
    <QuizConfig
      v-if="!quizStarted"
      :starting="starting"
      :levels="levelOptions"
      :translations="translations"
      :max-questions="maxQuestions"
      :question-count="questionCount"
      :selected-levels="selectedLevels"
      @start="handleStart"
      @update:questionCount="quiz.setQuestionCount"
      @update:selectedLevels="quiz.setSelectedLevels"
    />

    <!-- Quiz in progress -->
    <template v-else>
      <QuizProgressInfo
        :auto-pass="autoPass"
        :correct="correctCount"
        :answered="answeredCount"
        :score-color="scoreColor"
        :total="questions.length"
        :progress="progressPercent"
        :translations="translations"
        :countdown-active="countdownActive"
        :current-index="currentQuestionIndex"
        :countdown-progress="countdownProgress"
      />

      <div style="gap: 12px" class="d-flex align-center justify-space-between flex-wrap mb-3">
        <QuizProgressChips
          :chips="progressChips"
          :current-index="currentQuestionIndex"
          @go-to="goToQuestion"
        />
        <QuizProgressAutoPass
          :auto-pass="autoPass"
          :delay="autoPassDelay"
          :translations="translations"
          @toggle-autopass="quiz.setAutoPass"
          @update:delay="quiz.setAutoPassDelay"
        />
      </div>

      <QuizQuestion
        v-if="currentQuestion && currentQuestion.question"
        :key="String(currentQuestion.id)"
        :circle-color="answerCircleColor"
        :answers="currentQuestion.answers"
        :question="currentQuestion.question"
        :user-answer="userAnswers[currentQuestionIndex]"
        :level-icon="quiz.levelIcon(currentQuestion.level)"
        :is-answered="quiz.isAnswered(currentQuestionIndex)"
        :level-color="quiz.levelColor(currentQuestion.level)"
        :level-label="quiz.levelLabel(currentQuestion.level)"
        @answer="onAnswer"
      />

      <QuizNavigation
        :answered="answeredCount"
        :total="questions.length"
        :all-answered="allAnswered"
        :translations="translations"
        :current-index="currentQuestionIndex"
        @finish="finishQuiz"
        @next="goToNextQuestion"
        @previous="goToPreviousQuestion"
      />
    </template>

    <QuizResults
      :correct="correctCount"
      :total="questions.length"
      :incorrect="incorrectCount"
      :translations="translations"
      :level-stats="levelStatsList"
      :result-icon="finalResultIcon"
      :model-value="showFinalResults"
      :result-color="finalResultColor"
      @reset="resetQuiz"
      @close="quiz.setShowResults(false)"
      @update:model-value="quiz.setShowResults"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useQuizStore, type QuizQuestion as QuizQuestionData } from "~/composables/useQuiz"
import QuizHeaderTitle from "~/components/Courses/Quiz/QuizHeaderTitle.vue"
import QuizLanguageToggle from "~/components/Courses/Quiz/QuizLanguageToggle.vue"
import QuizConfig from "~/components/Courses/Quiz/QuizConfig.vue"
import QuizProgressInfo from "~/components/Courses/Quiz/QuizProgressInfo.vue"
import QuizProgressChips from "~/components/Courses/Quiz/QuizProgressChips.vue"
import QuizProgressAutoPass from "~/components/Courses/Quiz/QuizProgressAutoPass.vue"
import QuizQuestion from "~/components/Courses/Quiz/QuizQuestion.vue"
import QuizNavigation from "~/components/Courses/Quiz/QuizNavigation.vue"
import QuizResults from "~/components/Courses/Quiz/QuizResults.vue"

const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    configTitle: "Configura tu quiz",
    selectLevels: "Selecciona los niveles",
    numQuestions: "Número de preguntas",
    questions: "preguntas",
    available: "Disponibles",
    startQuiz: "Comenzar quiz",
    previous: "Anterior",
    next: "Siguiente",
    finish: "Finalizar",
    autoPass: "Avance automático",
    question: "Pregunta",
    of: "de",
    correct: "correctas",
    quizCompleted: "¡Quiz completado!",
    score: "Puntaje",
    correctAnswers: "Correctas",
    incorrectAnswers: "Incorrectas",
    newQuiz: "Nuevo quiz",
    review: "Revisar",
  },
  en: {
    configTitle: "Configure your quiz",
    selectLevels: "Select levels",
    numQuestions: "Number of questions",
    questions: "questions",
    available: "Available",
    startQuiz: "Start quiz",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    autoPass: "Auto advance",
    question: "Question",
    of: "of",
    correct: "correct",
    quizCompleted: "Quiz completed!",
    score: "Score",
    correctAnswers: "Correct",
    incorrectAnswers: "Incorrect",
    newQuiz: "New quiz",
    review: "Review",
  },
}

const props = withDefaults(
  defineProps<{
    icon?: string
    titleEn: string
    subtitleEn?: string
    titleEs: string
    subtitleEs?: string
    questionsEn: QuizQuestionData[]
    questionsEs: QuizQuestionData[]
  }>(),
  {
    icon: "mdi-help-circle",
    subtitleEn: "",
    subtitleEs: "",
  },
)

const quiz = useQuizStore()

const {
  lang,
  allQuestions,
  selectedLevels,
  questionCount,
  quizStarted,
  starting,
  questions,
  userAnswers,
  currentQuestionIndex,
  showFinalResults,
  autoPass,
  autoPassDelay,
  levelConfig,
  maxQuestions,
  currentQuestion,
  answeredCount,
  correctCount,
  incorrectCount,
  allAnswered,
  scoreColor,
  finalResultColor,
  finalResultIcon,
  progressPercent,
  answerCircleColor,
} = storeToRefs(quiz)

const title = computed(() => (lang.value === "en" ? props.titleEn : props.titleEs))
const subtitle = computed(() => (lang.value === "en" ? props.subtitleEn : props.subtitleEs))

const currentLangQuestions = computed(() =>
  lang.value === "en" ? props.questionsEn : props.questionsEs,
)

const translations = computed(() => TRANSLATIONS[lang.value] || TRANSLATIONS.es)

const levelOptions = computed(() =>
  Object.keys(levelConfig.value).map((key) => ({
    key,
    icon: quiz.levelIcon(key),
    color: quiz.levelColor(key),
    label: quiz.levelLabel(key),
    count: allQuestions.value.filter((q) => q.level === key).length,
  })),
)

const progressChips = computed(() =>
  questions.value.map((_q, idx) => ({ color: quiz.questionChipColor(idx) })),
)

const levelStatsList = computed(() =>
  Object.keys(levelConfig.value)
    .map((key) => {
      const stat = quiz.levelStats(key)
      return {
        key,
        label: quiz.levelLabel(key),
        color: quiz.levelColor(key),
        correct: stat.correct,
        total: stat.total,
      }
    })
    .filter((stat) => stat.total > 0),
)

// ---- AutoPass countdown (was component data in AUI) ----
const countdownActive = ref(false)
const countdownProgress = ref(0)
const countdownTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null)
const countdownToken = ref(0)

function clearCountdown() {
  countdownToken.value += 1
  if (countdownTimer.value) {
    clearTimeout(countdownTimer.value)
    countdownTimer.value = null
  }
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
  countdownActive.value = false
  countdownProgress.value = 0
}

function startCountdown() {
  clearCountdown()
  countdownActive.value = true
  countdownProgress.value = 0
  countdownToken.value += 1
  const token = countdownToken.value

  const totalMs = autoPassDelay.value * 1000
  const stepMs = 50
  let elapsed = 0

  countdownInterval.value = setInterval(() => {
    if (token !== countdownToken.value) return
    elapsed += stepMs
    countdownProgress.value = Math.min(100, (elapsed / totalMs) * 100)
  }, stepMs)

  countdownTimer.value = setTimeout(() => {
    if (token !== countdownToken.value) return
    clearCountdown()
    if (currentQuestionIndex.value < questions.value.length - 1) {
      quiz.nextQuestion()
    } else if (allAnswered.value) {
      finishQuiz()
    }
  }, totalMs)
}

function setLang(newLang: string) {
  if (newLang === lang.value) return
  quiz.switchLang({
    lang: newLang,
    questions: newLang === "en" ? props.questionsEn : props.questionsEs,
  })
}

function onAnswer(idx: number) {
  if (quiz.isAnswered(currentQuestionIndex.value)) return
  quiz.answer(idx)

  if (autoPass.value) {
    startCountdown()
  }
}

function goToNextQuestion() {
  clearCountdown()
  quiz.nextQuestion()
}

function goToPreviousQuestion() {
  clearCountdown()
  quiz.previousQuestion()
}

function goToQuestion(index: number) {
  clearCountdown()
  quiz.goToQuestion(index)
}

function handleStart() {
  quiz.startQuiz()
}

function finishQuiz() {
  clearCountdown()
  quiz.setShowResults(true)
}

function resetQuiz() {
  clearCountdown()
  quiz.resetQuiz()
}

// AUI `created()`: reset + seed the question pool once per page mount
quiz.resetQuiz()
quiz.init({ questions: currentLangQuestions.value })

onBeforeUnmount(clearCountdown)
</script>
