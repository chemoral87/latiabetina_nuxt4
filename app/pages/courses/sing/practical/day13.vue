<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 13 · Laboratorio de Frecuencias" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Osciloscope -->
        <CoursesSection icon="mdi-sine-wave" title="Experimento de Frecuencia">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Arrastra el deslizador para cambiar la frecuencia y escucha cómo sube y baja el tono.
            Fíjate: al doblar (o reducir a la mitad) la frecuencia, la nota suena una octava más alta
            (o baja). Es física real de tu voz.
          </p>

          <div class="text-center py-2">
            <div class="text-h3 font-weight-bold text-primary font-mono">{{ currentFreq }} Hz</div>
            <VChip class="mb-3" size="small" color="primary" variant="outlined">{{ freqLabel }}</VChip>
            <VSlider v-model="freq" step="1" :min="55" :max="880" class="px-8" hide-details
              color="primary" track-color="grey-lighten-2" style="max-width: 460px; margin: 0 auto;" />
            <div style="max-width: 460px; margin: 0 auto;"
              class="d-flex justify-space-between text-caption text-grey-darken-2 px-8 mb-2">
              <span>A1 · 55 Hz</span>
              <span>La4 · 440</span>
              <span>La5 · 880</span>
            </div>

            <VBtn id="btn-singp13-play" size="x-large" :color="isPlaying ? 'red-darken-2' : 'primary'"
              @click="togglePlay">
              <VIcon start>{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isPlaying ? 'Detener tono' : 'Reproducir tono' }}
            </VBtn>
          </div>

          <VRow class="mt-3" density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-2" variant="outlined">
                <div class="text-subtitle-2 font-weight-bold mb-1">Prueba 1 · La octava</div>
                <div class="text-body-2 text-grey-darken-2">
                  Ponte en 440 Hz, escucha; sube a 880 Hz (doble) y escucha: la misma nota, una octava
                  más alta.
                </div>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-2" variant="outlined">
                <div class="text-subtitle-2 font-weight-bold mb-1">Prueba 2 · Tu nota</div>
                <div class="text-body-2 text-grey-darken-2">
                  Busca la frecuencia que coincide con tu nota más cómoda (p. ej. 261.63 = C4) y canta
                  encima.
                </div>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Quiz frecuencias -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Frecuencia">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp13-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp13-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-sine-wave</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Frecuencias claras!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp13-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay13",
  data() {
    return {
      showContent: true,
      freq: 440,
      isPlaying: false,
      audioCtx: null,
      osc: null,
      gain: null,
      volume: 0.4,

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "¿Qué unidad mide la frecuencia del sonido?",
          options: ["Voltios", "Hercios (Hz)", "Decibelios (dB)", "Watios"],
          answerIndex: 1,
          explanation: "La frecuencia se mide en hercios (Hz) = vibraciones por segundo.",
        },
        {
          question: "Si doblas la frecuencia de una nota, obtienes…",
          options: ["La misma nota una octava más alta", "La nota más grave", "Un semitono", "Ninguna"],
          answerIndex: 0,
          explanation: "Relación 2:1 = octava. 440 Hz x2 = 880 Hz = La una octava arriba.",
        },
        {
          question: "El estándar internacional de afinación del La central es…",
          options: ["260 Hz", "440 Hz", "432 Hz", "1000 Hz"],
          answerIndex: 1,
          explanation: "A4 = 440 Hz, adoptado en 1939 y normalizado como ISO 16 en 1955.",
        },
        {
          question: "Antes de su estandarización, el La de las orquestas…",
          options: ["Siempre fue 440", "Variaba entre regiones y épocas", "No existía", "Era 1000 Hz"],
          answerIndex: 1,
          explanation: "Históricamente cada orquesta afilaba su La distinto (aprox. 415-470 Hz).",
        },
        {
          question: "Un sonido CON más frecuencia se percibe como…",
          options: ["Más grave", "Más agudo", "Más silencioso", "Más lento"],
          answerIndex: 1,
          explanation: "Más vibraciones por segundo = nota más aguda.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    freqLabel() {
      if (this.freq < 150) return "Zona grave"
      if (this.freq < 400) return "Zona media"
      if (this.freq < 600) return "Zona aguda"
      return "Muy aguda"
    },
  },

  watch: {
    freq() {
      if (this.isPlaying) this.startOsc()
    },
  },

  beforeUnmount() {
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    togglePlay() {
      if (this.isPlaying) {
        this.stopTone()
        this.isPlaying = false
        return
      }
      this.isPlaying = true
      this.startOsc()
    },

    startOsc() {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
        this.stopOsc()

        const ctx = this.audioCtx
        this.osc = ctx.createOscillator()
        this.gain = ctx.createGain()
        this.osc.type = 'sine'
        this.osc.frequency.setValueAtTime(this.freq, ctx.currentTime)
        this.gain.gain.setValueAtTime(0, ctx.currentTime)
        this.gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.05)
        this.osc.connect(this.gain)
        this.gain.connect(ctx.destination)
        this.osc.start()
      } catch (e) {
         
        console.error("Audio error:", e)
        this.isPlaying = false
      }
    },

    stopOsc() {
      try {
        if (this.osc) { this.osc.stop(); this.osc.disconnect(); this.osc = null }
        if (this.gain) { this.gain.disconnect(); this.gain = null }
      } catch (e) { /* noop */ }
    },

    stopTone() {
      this.stopOsc()
      try {
        if (this.audioCtx && typeof this.audioCtx.close === 'function') this.audioCtx.close()
        this.audioCtx = null
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