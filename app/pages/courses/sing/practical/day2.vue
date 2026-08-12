<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 2 · Entrenando el Apoyo" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Cronómetro Tsss / Chsss -->
        <CoursesSection icon="mdi-timer-outline" title="Carrera de Viento: Tsss y Chsss">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Inhala con el vientre (3 segundos), exhala haciendo <strong>Tsss</strong> o
            <strong>Chsss</strong> con flujo constante, manteniendo el apoyo abdominal. El
            cronómetro registra cuánto aguantas. Objetivo: <strong>20 segundos o más</strong>
            de Tsss estable.
          </p>

          <div class="text-center py-3">
            <div class="text-h2 font-weight-black text-primary my-2 font-mono">
              {{ timerDisplay }}
            </div>
            <div class="text-caption text-grey-darken-2 mb-4">
              {{ exerciseLabel }} — Mantén el flujo parejo
            </div>

            <VBtn :id="'btn-singp2-' + (isRunning ? 'stop' : 'start')" size="large"
              class="mb-3 mr-2" :color="isRunning ? 'red-darken-2' : 'primary'" @click="toggleTimer">
              <VIcon start>{{ isRunning ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isRunning ? 'Detener' : 'Comenzar' }}
            </VBtn>
            <VBtn id="btn-singp2-reset" class="mb-3" size="large" variant="outlined" @click="resetTimer">
              <VIcon start>mdi-refresh</VIcon>
              Reiniciar
            </VBtn>

            <div class="mt-2">
              <VBtnToggle v-model="mode" mandatory class="mb-3" color="primary" variant="outlined"
                density="comfortable">
                <VBtn id="btn-singp2-mode-tsss" value="tsss" :prepend-icon="mode === 'tsss' ? 'mdi-check' : ''">
                  Tsss
                </VBtn>
                <VBtn id="btn-singp2-mode-chsss" value="chsss" :prepend-icon="mode === 'chsss' ? 'mdi-check' : ''">
                  Chsss
                </VBtn>
              </VBtnToggle>
            </div>
          </div>

          <VAlert density="compact" variant="outlined"
            :type="lastResult ? (lastResult >= 20 ? 'success' : 'info') : 'info'">
            <template v-if="lastResult !== null">
              Tu marca: <strong>{{ lastResult }} s</strong>.
              {{ lastResult >= 20 ? '¡Excelente apoyo!' : lastResult >= 12 ? '¡Buen progreso, sigue!' : 'Consejo: exhala más lento y con menos aire por segundo.' }}
            </template>
            <template v-else>
              Realiza el ejercicio completo al menos 3 veces y registra tu mejor marca.
            </template>
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Respiración 4-7-8 y conteos -->
        <CoursesSection icon="mdi-math-compass" title="Cuenta con el Diafragma">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Haz el ejercicio respiratorio guiado con conteos de inspiración-retención-exhalación.
            Usa el contador para mantener la cadencia:
          </p>

          <VRow density="comfortable" class="align-center mb-2">
            <VCol md="4" cols="12" class="text-center">
              <div class="text-h4 font-weight-bold text-primary font-mono">{{ inhaleRatio }}</div>
              <div class="text-caption text-grey-darken-2">Inspirar (s)</div>
            </VCol>
            <VCol md="4" cols="12" class="text-center">
              <div class="text-h4 font-weight-bold text-amber font-mono">{{ holdRatio }}</div>
              <div class="text-caption text-grey-darken-2">Retener (s)</div>
            </VCol>
            <VCol md="4" cols="12" class="text-center">
              <div class="text-h4 font-weight-bold text-green font-mono">{{ exhaleRatio }}</div>
              <div class="text-caption text-grey-darken-2">Exhalar (s)</div>
            </VCol>
          </VRow>

          <div class="text-center my-3">
            <VBtn id="btn-singp2-count-start" size="large" color="primary" @click="startCounts">
              <VIcon start>mdi-account-clock</VIcon>
              Guiar conteos
            </VBtn>
            <span class="ml-3 text-subtitle-1 font-weight-bold text-grey-darken-3">
              {{ countPhase }}
            </span>
          </div>

          <VRow density="compact" class="align-center">
            <VCol md="4" cols="12">
              <VSlider v-model="inhaleRatio" max="8" min="2" step="1" class="px-2" hide-details
                color="primary" label="Inspirar" />
            </VCol>
            <VCol md="4" cols="12">
              <VSlider v-model="holdRatio" max="8" min="0" step="1" class="px-2" hide-details
                color="amber" label="Retener" />
            </VCol>
            <VCol md="4" cols="12">
              <VSlider v-model="exhaleRatio" min="4" max="16" step="1" class="px-2" hide-details
                color="green" label="Exhalar" />
            </VCol>
          </VRow>

          <VAlert type="info" class="mt-3" density="compact" variant="outlined">
            Patrón clásico 4-7-8. Haz 4 ciclos. Nunca fuerces la retención: si te mareas,
            reduce los conteos.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Quiz de respiración -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Respiración">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-2 text-grey-darken-2">Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="text-subtitle-2 font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp2-quiz-option" block variant="outlined" :disabled="answered"
                  :color="getOptionColor(idx)" class="py-4 text-left justify-start" @click="checkAnswer(idx)">
                  <VIcon start class="mr-2" :color="getOptionIconColor(idx)">{{ getOptionIcon(idx) }}</VIcon>
                  <span style="color: inherit;" class="text-body-2 font-weight-medium">{{ option }}</span>
                </VBtn>
              </VCol>
            </VRow>

            <VExpandTransition>
              <div v-if="answered">
                <VAlert class="mb-4" density="compact"
                  variant="outlined" :type="selected === currentQuestion.answerIndex ? 'success' : 'error'">
                  <div class="font-weight-bold mb-1">
                    {{ selected === currentQuestion.answerIndex ? '¡Correcto!' : 'Incorrecto' }}
                  </div>
                  <div class="text-body-2">{{ currentQuestion.explanation }}</div>
                </VAlert>
                <div class="d-flex justify-end">
                  <VBtn id="btn-singp2-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= quiz.length - 1 ? 'success' : 'amber'">mdi-trophy-outline</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Respiración dominada!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp2-quiz-retry" color="primary" @click="resetQuiz">
              <VIcon start>mdi-refresh</VIcon> Intentar de nuevo
            </VBtn>
          </div>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingPracticalDay2",
  data() {
    return {
      showContent: true,
      mode: "tsss",
      isRunning: false,
      elapsed: 0,
      timerInterval: null,
      lastResult: null,

      inhaleRatio: 4,
      holdRatio: 7,
      exhaleRatio: 8,
      countPhase: "Listo",
      countInterval: null,
      counting: false,

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "¿Cuál es la respiración correcta al cantar?",
          options: ["Clavicular (pecho)", "Costodiafragmática (baja y ancha)", "Rápida y corta", "Solo por la boca"],
          answerIndex: 1,
          explanation: "La respiración costodiafragmática baja el diafragma y abre las costillas, dando aire largo y controlado.",
        },
        {
          question: "El apoyo respiratorio se siente en…",
          options: ["El cuello", "La garganta", "El abdomen (músculos abdominales)", "Los hombros"],
          answerIndex: 2,
          explanation: "El apoyo se siente firme en el abdomen. Si sientes tensión en el cuello, estás forzando.",
        },
        {
          question: "El ejercicio 'Tsss' entrena principalmente…",
          options: ["La vibración de las cuerdas", "El control y la constancia del flujo de aire", "El volumen", "La afinación"],
          answerIndex: 1,
          explanation: "Tsss saca el aire dosificado y parejo: es el mejor ejercicio para el control del flujo.",
        },
        {
          question: "Aguantar la respiración al cantar significa…",
          options: ["Quedarse sin aire", "Contener el aire cerrando la garganta", "Mantener el apoyo abierto y el aire fluyendo", "Tragar"],
          answerIndex: 2,
          explanation: "Aguantar es sostener la columna de aire con el apoyo para llegar al final de la frase sin tensión.",
        },
        {
          question: "Si te presionas la garganta al sostener una nota, lo correcto es…",
          options: ["Seguir forzando", "Bajar el volumen", "Revisar el apoyo abdominal para liberar el cuello", "Aguantar más la respiración"],
          answerIndex: 2,
          explanation: "La tensión en la garganta se corrige devolviendo el trabajo al abdomen y relajando el cuello.",
        },
      ],
    }
  },

  computed: {
    timerDisplay() {
      const s = Math.floor(this.elapsed)
      const minutes = Math.floor(s / 60)
      const seconds = s % 60
      return `${String(minutes).padStart(1, '0')}:${String(seconds).padStart(2, '0')}`
    },

    exerciseLabel() {
      return this.mode === 'tsss' ? 'Exhalando con Tsss' : 'Exhalando con Chsss'
    },

    currentQuestion() {
      return this.quiz[this.qIndex]
    },
  },

  beforeUnmount() {
    this.clearIntervals()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    clearIntervals() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      if (this.countInterval) clearInterval(this.countInterval)
      this.timerInterval = null
      this.countInterval = null
      this.isRunning = false
      this.counting = false
      this.countPhase = "Listo"
    },

    toggleTimer() {
      if (this.isRunning) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
        this.isRunning = false
        this.lastResult = this.elapsed
        return
      }
      this.elapsed = 0
      this.isRunning = true
      this.timerInterval = setInterval(() => {
        this.elapsed += 1
      }, 1000)
    },

    resetTimer() {
      clearInterval(this.timerInterval)
      this.timerInterval = null
      this.isRunning = false
      this.elapsed = 0
      this.lastResult = null
    },

    startCounts() {
      if (this.counting) {
        clearInterval(this.countInterval)
        this.countInterval = null
        this.counting = false
        this.countPhase = "Listo"
        return
      }
      this.counting = true
      const steps = [
        { label: "Inspira", time: this.inhaleRatio },
        { label: "Retén", time: this.holdRatio },
        { label: "Exhala", time: this.exhaleRatio },
      ]
      let stepIndex = 0
      let tick = 0
      this.countPhase = `Inspira (${steps[0].time})`
      this.countInterval = setInterval(() => {
        tick++
        const step = steps[stepIndex]
        this.countPhase = `${step.label} · ${step.time - Math.min(tick, step.time)}`
        if (tick >= step.time) {
          tick = 0
          stepIndex++
          if (stepIndex >= steps.length) {
            stepIndex = 0
          }
          this.countPhase = `${steps[stepIndex].label} (${steps[stepIndex].time})`
        }
      }, 1000)
    },

    checkAnswer(optionIdx) {
      this.selected = optionIdx
      this.answered = true
      if (optionIdx === this.currentQuestion.answerIndex) this.score++
    },

    getOptionColor(idx) {
      if (!this.answered) return "grey darken-2"
      if (idx === this.currentQuestion.answerIndex) return "success"
      if (idx === this.selected) return "error"
      return "bg-grey-lighten-2"
    },

    getOptionIcon(idx) {
      if (!this.answered) return "mdi-radiobox-blank"
      if (idx === this.currentQuestion.answerIndex) return "mdi-check-circle"
      if (idx === this.selected) return "mdi-close-circle"
      return "mdi-minus-circle-outline"
    },

    getOptionIconColor(idx) {
      if (!this.answered) return "grey darken-1"
      if (idx === this.currentQuestion.answerIndex) return "success"
      if (idx === this.selected) return "error"
      return "bg-grey-lighten-1"
    },

    nextQuestion() {
      this.answered = false
      this.selected = null
      if (this.qIndex + 1 < this.quiz.length) this.qIndex++
      else this.quizCompleted = true
    },

    resetQuiz() {
      this.qIndex = 0
      this.score = 0
      this.selected = null
      this.answered = false
      this.quizCompleted = false
    },
  },
}
</script>