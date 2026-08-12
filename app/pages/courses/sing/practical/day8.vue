<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 8 · Disociación Corporal" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Simulador de laringe -->
        <CoursesSection icon="mdi-human-male-female" title="Simulador de Posición de la Laringe">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Arrastra el control para simular la altura de la laringe y escucha el efecto en el color
            de la voz (de más oscuro a más brillante). Luego practica en tu voz real.
          </p>
          <div class="text-center py-2">
            <VIcon size="48" class="mb-2"
              :color="larynxHeight > 0.66 ? 'error' : larynxHeight < 0.33 ? 'amber' : 'success'">
              {{ larynxHeight > 0.66 ? 'mdi-arrow-up-bold-circle' : larynxHeight < 0.33 ? 'mdi-arrow-down-bold-circle' : 'mdi-circle-slice-8' }}
            </VIcon>
            <div class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-1">{{ larynxLabel }}</div>
            <div class="text-caption text-grey-darken-2 mb-3">{{ larynxHint }}</div>
            <VSlider v-model="larynxHeight" max="1" min="0" step="0.01" class="px-8" hide-details
              color="primary" track-color="grey-lighten-2" style="max-width: 420px; margin: 0 auto;" />

            <VBtn id="btn-singp8-larynx-tone" class="mt-3" color="primary" variant="tonal"
              @click="playLarynxTone">
              <VIcon start>mdi-music-note</VIcon>
              Escuchar tono con ese color
            </VBtn>
          </div>

          <VRow class="mt-3" density="compact">
            <VCol cols="4" class="text-center">
              <VChip size="small" color="amber" variant="outlined">0 · Baja · oscuro</VChip>
            </VCol>
            <VCol cols="4" class="text-center">
              <VChip size="small" color="success" variant="outlined">1/2 · Neutra</VChip>
            </VCol>
            <VCol cols="4" class="text-center">
              <VChip size="small" color="error" variant="outlined">1 · Alta · brillante</VChip>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Checker de cara neutral -->
        <CoursesSection icon="mdi-checkbox-multiple-marked-outline" title="Lista de Verificación de Cara Neutra">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Canta una nota alta delante de un espejo y marca qué respuestas automáticas detectas.
            Cuantas menos marques, mejor tu disociación.
          </p>
          <VRow density="comfortable">
            <VCol v-for="(item, index) in faceChecks" :key="item" sm="6" cols="12">
              <VCheckbox v-model="faceChecksChecked" dense class="mb-1" hide-details :label="item"
                :value="item" color="primary" @update:model-value="updateCheck" />
            </VCol>
          </VRow>
          <VAlert class="mt-2" density="compact" variant="outlined"
            :type="checkedCount === 0 && attempted ? 'success' : 'info'">
            <template v-if="checkedCount === 0 && attempted">
              ¡Excelente! Cara neutra perfecta.
            </template>
            <template v-else-if="attempted">
              Detectaste {{ checkedCount }} tensión(es). Repite mirando el espejo y suéltalas una a una.
            </template>
            <template v-else>
              Marca lo que notes al cantar y pulsa "Probar ahora" para volver a intentarlo.
            </template>
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Laringe y Disociación">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp8-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp8-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-puzzle</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Cuerpo disociado!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp8-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay8",
  data() {
    return {
      showContent: true,
      larynxHeight: 0.5,
      audioCtx: null,
      volume: 0.4,
      faceChecks: [
        "Levanté las cejas o fruncí la frente",
        "Subí los hombros",
        "Puse la barbilla hacia arriba o rígida",
        "Tensé el cuello / laringe visiblemente",
        "Apreté la mandíbula",
      ],
      faceChecksChecked: [],
      attempted: false,

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La posición de la laringe influye principalmente en…",
          options: ["El color del sonido", "La letra de la canción", "El ritmo", "Nada"],
          answerIndex: 0,
          explanation: "Laringe baja = sonido oscuro; laringe alta = sonido brillante. Afecta el color y el registro.",
        },
        {
          question: "Alzarte los hombros cuando cantas notas altas…",
          options: ["Te da más fuerza", "Es energía perdida que tensa la emisión", "Es necesario", "Mejora la afinación"],
          answerIndex: 1,
          explanation: "Todo movimiento de cuello, hombros y cara es energía perdida: la nota alta se apoya en el abdomen.",
        },
        {
          question: "La disociación corporal al cantar significa…",
          options: ["Cantar sin respirar", "Separar los movimientos innecesarios del cuerpo de la emisión de la nota", "Cantar en dos octavas a la vez", "Nada"],
          answerIndex: 1,
          explanation: "Disociar es impedir que el cuerpo se tense de más cuando la nota es difícil.",
        },
        {
          question: "Si tu laringe se sube con tensión al cantar agudo, lo mejor es…",
          options: ["Apretar más", "Relajar el cuello y sentir el podón abdominal", "Bajar el tono", "Gritar"],
          answerIndex: 1,
          explanation: "Se libera la tensión de la laringe dándole el trabajo al apoyo abdominal.",
        },
        {
          question: "La 'cara neutra' al cantar se logra…",
          options: ["Practicando frente al espejo la misma nota con y sin gesto", "Gritando", "Bostezando siempre", "Cerrando los ojos"],
          answerIndex: 0,
          explanation: "El espejo es la herramienta: comprobar que la nota alta no cambia el gesto de la cara.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    larynxLabel() {
      if (this.larynxHeight > 0.66) return "Laringe alta · brillante"
      if (this.larynxHeight < 0.33) return "Laringe baja · oscuro"
      return "Laringe neutra · equilibrado"
    },

    larynxHint() {
      if (this.larynxHeight > 0.66) return "zona aguda: ¡no tensiones el cuello!"
      if (this.larynxHeight < 0.33) return "zona grave: relaja y suelta"
      return "punto de partida recomendado"
    },

    checkedCount() {
      return this.faceChecksChecked.length
    },
  },

  beforeUnmount() {
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    updateCheck() {
      this.attempted = true
    },

    playLarynxTone() {
      let freq = 261.63
      if (this.larynxHeight > 0.66) freq = 392.00
      else if (this.larynxHeight < 0.33) freq = 196.00
      this.playTone(freq, 1.2)
    },

    playTone(frequency, duration = 1.2) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()

        const ctx = this.audioCtx
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(frequency, ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + duration)
      } catch (e) {
         
        console.error("Audio error:", e)
      }
    },

    stopTone() {
      try {
        if (this.audioCtx && typeof this.audioCtx.close === 'function') this.audioCtx.close()
      } catch (e) { /* noop */ }
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