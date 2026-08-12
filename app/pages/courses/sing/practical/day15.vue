<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 15 · Escala Cromática" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Navegador cromático -->
        <CoursesSection icon="mdi-format-list-numbered" title="Desliza la Escala Cromática">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Reproduce la escala cromática completa (12 semitonos) de una octava y cántala por encima
            pasando por <strong>todas</strong> las notas, sin saltar ninguna.
          </p>

          <div class="text-center mb-3">
            <VBtn id="btn-singp15-play-chromatic" size="x-large" :color="isPlaying ? 'red-darken-2' : 'deep-purple'"
              @click="playChromatic">
              <VIcon start>{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isPlaying ? 'Detener' : 'Reproducir escala cromática' }}
            </VBtn>
          </div>

          <div class="d-flex flex-wrap justify-center gap-1 mb-4">
            <VChip v-for="(n, i) in chromaticDisplay" :key="i" size="small"
              variant="flat"
              class="font-mono font-weight-bold ma-1 px-2" :color="activeIndex === i ? 'deep-purple' : 'grey-lighten-2'"
              :class="activeIndex === i ? 'text-white' : 'text-grey-darken-3'">
              {{ n }}
            </VChip>
          </div>

          <VAlert type="info" density="compact" variant="outlined">
            Reto del día: canta la cromática ascendente y descendente sin dejar de apoyar. Cada nota
            debe sonar <strong>exacta</strong>: es el mejor ejercicio de afinación absoluta.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Semitono a semitono -->
        <CoursesSection title="Parejas de Semitonos" icon="mdi-layers-triple-outline">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Practica por parejas: cada botón toca dos notas separadas por un semitono. Escucha la
            diferencia y canta ambas notas.
          </p>
          <VRow density="comfortable">
            <VCol v-for="(pair, i) in semitonePairs" :key="pair.label" md="3" sm="4" cols="6">
              <VCard variant="outlined" style="cursor:pointer;" class="pa-2 text-center mb-2"
                @click="playPair(i)">
                <div class="font-mono text-body-1 font-weight-bold text-primary">{{ pair.label }}</div>
                <VBtn id="btn-singp15-pair" class="mt-1" size="x-small" color="primary" variant="tonal">
                  <VIcon start size="small">mdi-play</VIcon>
                </VBtn>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Cromática">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp15-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp15-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-rainbow</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Cromática dominada!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp15-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay15",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.4,
      activeIndex: -1,
      isPlaying: false,

      chromaticDisplay: ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"],
      chromaticFreqs: [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88],

      semitonePairs: [
        { label: "Do–Do#", a: 261.63, b: 277.18 },
        { label: "Re–Re#", a: 293.66, b: 311.13 },
        { label: "Mi–Fa", a: 329.63, b: 349.23 },
        { label: "Fa–Fa#", a: 349.23, b: 369.99 },
        { label: "Sol–Sol#", a: 392.00, b: 415.30 },
        { label: "La–La#", a: 440.00, b: 466.16 },
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La escala cromática contiene…",
          options: ["5 notas", "7 notas", "12 semitonos", "24 notas"],
          answerIndex: 2,
          explanation: "La cromática pasa por los 12 semitonos de la octava, sin saltar ninguno.",
        },
        {
          question: "Entre Do y Mi, la escala cromática pasa por…",
          options: ["Solo Do y Mi", "Do, Do#, Re, Re#, Mi", "Do, Re, Mi nada más", "Todos los agudos"],
          answerIndex: 1,
          explanation: "Cromáticamente: Do – Do# – Re – Re# – Mi, dos notas extra entre medios.",
        },
        {
          question: "La tonalidad (key) de una canción define…",
          options: ["Su letra", "El centro tonal y qué notas son naturales", "Su duración", "El volumen"],
          answerIndex: 1,
          explanation: "La tonalidad fija la escala base y las alteraciones; dice en qué nota se resuelve.",
        },
        {
          question: "Una escala pentatónica…",
          options: ["Tiene 12 notas", "Tiene 5 notas sin semitonos (muy cómoda)", "No sirve para cantar", "Es lo mismo que la mayor"],
          answerIndex: 1,
          explanation: "La pentatónica usa 5 notas sin semitonos: suena natural y cómoda, muy usada en gospel.",
        },
        {
          question: "La tonalidad de Sol Mayor (G) tiene…",
          options: ["Un bemol", "Un sostenido (Fa#)", "Ninguna alteración", "Dos bemoles"],
          answerIndex: 1,
          explanation: "Sol Mayor usa Fa#: es una tonalidad de 1 sostenido.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },
  },

  beforeUnmount() {
    this.isPlaying = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    async playChromatic() {
      if (this.isPlaying) {
        this.isPlaying = false
        return
      }
      this.isPlaying = true
      for (let i = 0; i < this.chromaticFreqs.length; i++) {
        if (!this.isPlaying) break
        this.activeIndex = i
        this.playTone(this.chromaticFreqs[i], 0.7)
        await new Promise((r) => setTimeout(r, 750))
      }
      for (let i = this.chromaticFreqs.length - 2; i >= 0; i--) {
        if (!this.isPlaying) break
        this.activeIndex = i
        this.playTone(this.chromaticFreqs[i], 0.7)
        await new Promise((r) => setTimeout(r, 750))
      }
      this.isPlaying = false
      this.activeIndex = -1
    },

    async playPair(i) {
      const pair = this.semitonePairs[i]
      this.playTone(pair.a, 0.8)
      await new Promise((r) => setTimeout(r, 900))
      this.playTone(pair.b, 0.8)
    },

    playTone(frequency, duration = 0.7) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()

        const ctx = this.audioCtx
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
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
