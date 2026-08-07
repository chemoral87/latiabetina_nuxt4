import { acceptHMRUpdate, defineStore } from "pinia"

export interface QuizAnswer {
  text: string
  isCorrect: boolean
  childId?: string
}

export interface QuizQuestion {
  id: number | string
  level: string
  question: string
  answers: QuizAnswer[]
}

interface LevelConfig {
  color: string
  icon: string
  label: { en: string; es: string }
  count: { en: number; es: number }
}

const LEVEL_CONFIG: Record<string, LevelConfig> = {
  basic: { color: "green", icon: "mdi-star", label: { en: "Basic", es: "Básico" }, count: { en: 60, es: 60 } },
  intermediate: { color: "orange", icon: "mdi-star-half-full", label: { en: "Intermediate", es: "Intermedio" }, count: { en: 60, es: 60 } },
  expert: { color: "red", icon: "mdi-star-outline", label: { en: "Expert", es: "Experto" }, count: { en: 60, es: 60 } },
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function clampCount(v: number): number {
  return Math.max(1, Math.min(v, 999))
}

/**
 * Pinia port of the AUI `quiz` Vuex module (store/quiz.js). Holds the whole
 * quiz session state (language, selected levels, questions, answers) and the
 * level config, so the same quiz state survives across the Courses pages that
 * mount `CoursesQuizQuizPage`.
 */
export const useQuizStore = defineStore("quiz", () => {
  // ---- state ----
  const lang = ref("es")
  const allQuestions = ref<QuizQuestion[]>([])
  const selectedLevels = ref<string[]>(["basic", "intermediate", "expert"])
  const questionCount = ref(15)
  const quizStarted = ref(false)
  const starting = ref(false)
  const questions = ref<QuizQuestion[]>([])
  const userAnswers = ref<(number | null)[]>([])
  const currentQuestionIndex = ref(0)
  const showFinalResults = ref(false)
  const autoPass = ref(true)
  const autoPassDelay = ref(3)

  // ---- getters ----
  const levelConfig = computed(() => LEVEL_CONFIG)

  function levelColor(level: string): string {
    return LEVEL_CONFIG[level]?.color || "grey"
  }

  function levelIcon(level: string): string {
    return LEVEL_CONFIG[level]?.icon || "mdi-help"
  }

  function levelLabel(level: string): string {
    return LEVEL_CONFIG[level]?.label?.[lang.value] || LEVEL_CONFIG[level]?.label?.es || level
  }

  function levelCount(level: string, l: string): number {
    return LEVEL_CONFIG[level]?.count?.[l] || 50
  }

  const maxQuestions = computed(() => {
    if (selectedLevels.value.length === 0) return 0
    return allQuestions.value.filter((q) => selectedLevels.value.includes(q.level)).length
  })

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])

  const answeredCount = computed(
    () => userAnswers.value.filter((a) => a !== null && a !== undefined).length,
  )

  const correctCount = computed(() =>
    questions.value.reduce((count, question, idx) => {
      const ua = userAnswers.value[idx]
      if (ua === null || ua === undefined) return count
      return count + (question.answers[ua]?.isCorrect ? 1 : 0)
    }, 0),
  )

  const incorrectCount = computed(() => answeredCount.value - correctCount.value)

  const allAnswered = computed(() => answeredCount.value === questions.value.length)

  function isAnswered(index: number): boolean {
    const ua = userAnswers.value[index]
    return ua !== null && ua !== undefined
  }

  const scoreColor = computed(() => {
    if (answeredCount.value === 0) return ""
    const pct = correctCount.value / answeredCount.value
    if (pct >= 0.8) return "text-green"
    if (pct >= 0.5) return "text-orange"
    return "text-red"
  })

  const finalResultColor = computed(() => {
    const pct = questions.value.length > 0 ? correctCount.value / questions.value.length : 0
    if (pct >= 0.8) return "text-green"
    if (pct >= 0.5) return "text-orange"
    return "text-red"
  })

  const finalResultIcon = computed(() => {
    const pct = questions.value.length > 0 ? correctCount.value / questions.value.length : 0
    if (pct >= 0.9) return "mdi-trophy"
    if (pct >= 0.7) return "mdi-emoticon-happy"
    if (pct >= 0.5) return "mdi-emoticon-neutral"
    return "mdi-emoticon-sad"
  })

  const progressPercent = computed(() =>
    questions.value.length > 0 ? ((currentQuestionIndex.value + 1) / questions.value.length) * 100 : 0,
  )

  function questionChipColor(idx: number): string {
    if (idx === currentQuestionIndex.value) return "primary"
    if (!isAnswered(idx)) return "grey-lighten-3"
    const answer = questions.value[idx]?.answers[userAnswers.value[idx] as number]
    return answer && answer.isCorrect ? "success" : "error"
  }

  const answerCircleColor = computed(() =>
    isAnswered(currentQuestionIndex.value) ? "grey-lighten-1" : "grey-darken-1",
  )

  function levelStats(level: string): { total: number; correct: number } {
    let total = 0
    let correct = 0
    questions.value.forEach((q, realIdx) => {
      if (q.level !== level) return
      total++
      if (!isAnswered(realIdx)) return
      if (q.answers[userAnswers.value[realIdx] as number]?.isCorrect) correct++
    })
    return { total, correct }
  }

  // ---- mutations → plain setters ----
  function setSelectedLevels(levels: string[]) {
    selectedLevels.value = levels
  }

  function setQuestionCount(count: number) {
    questionCount.value = clampCount(count)
  }

  function setAutoPass(value: boolean) {
    autoPass.value = value
  }

  function setAutoPassDelay(value: number) {
    autoPassDelay.value = Math.max(1, Math.min(value, 10))
  }

  function setShowResults(value: boolean) {
    showFinalResults.value = value
  }

  function setQuiz(q: QuizQuestion[], ua: (number | null)[], currentIndex: number) {
    questions.value = q
    userAnswers.value = ua
    currentQuestionIndex.value = currentIndex
  }

  function resetQuiz() {
    quizStarted.value = false
    questions.value = []
    userAnswers.value = []
    currentQuestionIndex.value = 0
    showFinalResults.value = false
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < questions.value.length - 1) currentQuestionIndex.value++
  }

  function previousQuestion() {
    if (currentQuestionIndex.value > 0) currentQuestionIndex.value--
  }

  function goToQuestion(idx: number) {
    if (idx >= 0 && idx < questions.value.length) currentQuestionIndex.value = idx
  }

  // ---- actions ----
  function init(payload: { questions: QuizQuestion[] }) {
    allQuestions.value = payload.questions
  }

  function switchLang(payload: { lang: string; questions: QuizQuestion[] }) {
    const wasStarted = quizStarted.value
    lang.value = payload.lang
    allQuestions.value = payload.questions

    if (wasStarted && questions.value.length > 0) {
      // Remap questions to the new language using their id, and preserve
      // user answers by matching childId
      const newPoolById: Record<string, QuizQuestion> = {}
      payload.questions.forEach((q) => {
        newPoolById[String(q.id)] = q
      })

      const newQuestions = questions.value.map((oldQ) => {
        const match = newPoolById[String(oldQ.id)]
        if (!match) return { ...oldQ }
        return {
          ...match,
          answers: shuffleArray([...match.answers]),
        }
      })

      const newUserAnswers = questions.value.map((oldQ, idx) => {
        const oldAnswerIdx = userAnswers.value[idx]
        if (oldAnswerIdx === null || oldAnswerIdx === undefined) return null

        const oldAnswer = oldQ.answers[oldAnswerIdx]
        if (!oldAnswer || oldAnswer.childId === undefined) return null

        const newQ = newQuestions[idx]
        const newIdx = newQ.answers.findIndex((a) => a.childId === oldAnswer.childId)
        return newIdx >= 0 ? newIdx : null
      })

      setQuiz(newQuestions, newUserAnswers, currentQuestionIndex.value)
    } else if (!wasStarted) {
      // Reset selections if needed (counts may differ)
      const max = payload.questions.filter((q) => selectedLevels.value.includes(q.level)).length
      if (questionCount.value > max) {
        setQuestionCount(max)
      }
    }
  }

  function startQuiz() {
    starting.value = true

    let pool = allQuestions.value.filter((q) => selectedLevels.value.includes(q.level))
    pool = shuffleArray(pool)
    const count = Math.min(questionCount.value, pool.length)
    const questionsList = pool.slice(0, count).map((q) => ({
      ...q,
      answers: shuffleArray(q.answers),
    }))

    setQuiz(questionsList, new Array(questionsList.length).fill(null), 0)
    quizStarted.value = true
    starting.value = false
  }

  function answer(answerIdx: number) {
    if (isAnswered(currentQuestionIndex.value)) return
    const answers = [...userAnswers.value]
    answers[currentQuestionIndex.value] = answerIdx
    setQuiz(questions.value, answers, currentQuestionIndex.value)
  }

  return {
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
    levelColor,
    levelIcon,
    levelLabel,
    levelCount,
    maxQuestions,
    currentQuestion,
    answeredCount,
    correctCount,
    incorrectCount,
    allAnswered,
    isAnswered,
    scoreColor,
    finalResultColor,
    finalResultIcon,
    progressPercent,
    questionChipColor,
    answerCircleColor,
    levelStats,
    setSelectedLevels,
    setQuestionCount,
    setAutoPass,
    setAutoPassDelay,
    setShowResults,
    resetQuiz,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    init,
    switchLang,
    startQuiz,
    answer,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useQuizStore, import.meta.hot))
}
