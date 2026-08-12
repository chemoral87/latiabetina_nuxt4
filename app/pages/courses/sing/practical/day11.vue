<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 11 · Mide tu Rango" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Mide tu rango -->
        <CoursesSection icon="mdi-ruler" title="Medición de Rango Guiada">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Reproduce la escala descendente y busca tu nota más grave también: repite cantando la
            nota más cómoda y luego sube. Anota tus extremos:
          </p>

          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-4 mb-3" variant="outlined">
                <div class="text-subtitle-1 font-weight-bold mb-2">Zona grave</div>
                <div class="d-flex justify-center flex-wrap mb-3">
                  <VBtn v-for="(g, i) in graveNotes" id="btn-singp11-grave" :key="g" class="ma-1" size="small"
                    variant="outlined" :color="activeGrave === i ? 'primary' : 'grey-darken-2'" @click="playGrave(i)">
                    <span class="font-mono">{{ g }}</span>
                  </VBtn>
                </div>
                <VTextField v-model="lowNote" hide-details density="compact" variant="outlined"
                  placeholder="Ej: A2" label="Tu nota más grave" />
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-4 mb-3" variant="outlined">
                <div class="text-subtitle-1 font-weight-bold mb-2">Zona aguda</div>
                <div class="d-flex justify-center flex-wrap mb-3">
                  <VBtn v-for="(a, i) in acuteNotes" id="btn-singp11-acute" :key="a" class="ma-1" size="small"
                    variant="outlined" :color="activeAcute === i ? 'primary' : 'grey-darken-2'" @click="playAcute(i)">
                    <span class="font-mono">{{ a }}</span>
                  </VBtn>
                </div>
                <VTextField v-model="highNote" hide-details density="compact" variant="outlined"
                  placeholder="Ej: C5" label="Tu nota más aguda" />
              </VCard>
            </VCol>
          </VRow>

          <VAlert class="mb-2" density="compact" variant="outlined" :type="rangeResult.type">
            <template v-if="lowNote || highNote">
              Tu rango estimado: <strong>{{ rangeResult.display }}</strong>.
              {{ rangeResult.estimate }}
            </template>
            <template v-else>
              Completa ambas casillas para ver una estimación de tu rango.
            </template>
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Extiende en sirenas -->
        <CoursesSection icon="mdi-arrow-expand-vertical" title="Extiende tu Rango con Sirenas">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Las sirenas (glisando) son la forma más segura de ampliar tu rango: sube y baja sin
            saltos, uniendo los registros (Día 6 y 9).
          </p>
          <div class="text-center mb-2">
            <VBtn id="btn-singp11-siren" size="large" color="primary" @click="playFullSiren">
              <VIcon start>mdi-play</VIcon>
              Sirena completa C3 ▲ C5 ▼ C3
            </VBtn>
          </div>
          <VAlert type="info" density="compact" variant="outlined">
            Con la práctica diaria de sirenas, tu rango podrá ganar 1-2 notas por mes. La paciencia
            es parte de la técnica.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Rangos">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp11-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp11-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-ruler</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Rango identificado!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp11-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay11",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.4,
      activeGrave: null,
      activeAcute: null,
      lowNote: "",
      highNote: "",

      graveNotes: ["F3", "E3", "D3", "C3", "B2", "A2", "G2", "F2", "E2"],
      graveFreqs: [174.61, 164.81, 146.83, 130.81, 123.47, 110.00, 98.00, 87.31, 82.41],

      acuteNotes: ["G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5"],
      acuteFreqs: [392.00, 440.00, 493.88, 523.25, 587.33, 659.26, 698.46, 783.99, 880.00],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La diferencia entre 'rango vocal' y 'tesitura' es…",
          options: ["Son lo mismo", "Rango = todas las notas posibles; tesitura = la zona cómoda", "Tesitura es más amplia", "Rango es solo agudos"],
          answerIndex: 1,
          explanation: "El rango abarca todos tus límites; la tesitura es la franja donde suenas bien y sin esfuerzo.",
        },
        {
          question: "Una voz masculina aguda y brillante se clasifica típicamente como…",
          options: ["Bajo", "Tenor", "Barítono", "Soprano"],
          answerIndex: 1,
          explanation: "El tenor es la voz masculina aguda (C3 a C5). El barítono es la media.",
        },
        {
          question: "El rango vocal de una persona…",
          options: ["Es fijo para siempre", "Puede expandirse con técnica y práctica", "Se reduce con el tiempo siempre", "No existe"],
          answerIndex: 1,
          explanation: "Con entrenamiento y sirenas, el rango puede crecer varias notas con el tiempo.",
        },
        {
          question: "La voz femenina más aguda y brillante se llama…",
          options: ["Contralto", "Soprano", "Barítono", "Tenor"],
          answerIndex: 1,
          explanation: "La soprano es la voz femenina más aguda (C4-C6). La contralto es la más grave.",
        },
        {
          question: "Al medir tu rango, debes…",
          options: ["Cantar hasta el dolor para encontrar tus límites", "Buscar tus notas cómodas y límites sin forzar", "Solo cantar agudos", "Pedir a otros su rango"],
          answerIndex: 1,
          explanation: "Se mide sin dolor: localiza los extremos pero nunca fuerzas hasta lastimarte.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    rangeResult() {
      const display = `${this.lowNote || '?'} – ${this.highNote || '?'}`
      const hasLow = /^[A-G][0-9]$/i.test(this.lowNote)
      const hasHigh = /^[A-G][0-9]$/i.test(this.highNote)
      if (hasLow && hasHigh) {
        return {
          type: "success",
          display,
          estimate: "Sigue con sirenas para ampliarlo con seguridad.",
        }
      }
      if (hasLow || hasHigh) {
        return {
          type: "info",
          display,
          estimate: "Completa con la nota extremo que falte.",
        }
      }
      return {
        type: "info",
        display,
        estimate: "",
      }
    },
  },

  beforeUnmount() {
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    playGrave(i) {
      this.activeGrave = i
      this.playTone(this.graveFreqs[i], 1.2)
    },

    playAcute(i) {
      this.activeAcute = i
      this.playTone(this.acuteFreqs[i], 1.2)
    },

    async playFullSiren() {
      this.startGlide(130.81, 523.25, 1400)
      await new Promise((r) => setTimeout(r, 1500))
      this.startGlide(523.25, 130.81, 1400)
      await new Promise((r) => setTimeout(r, 1500))
    },

    startGlide(fromFreq, toFreq, ms) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
        this.stopTone()

        const ctx = this.audioCtx
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const now = ctx.currentTime
        osc.type = 'sine'
        osc.frequency.setValueAtTime(fromFreq, now)
        osc.frequency.linearRampToValueAtTime(toFreq, now + ms / 1000)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(this.volume, now + 0.1)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + ms / 1000 + 0.05)
      } catch (e) {
         
        console.error("Audio error:", e)
      }
    },

    playTone(frequency, duration = 1.2) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
        this.stopTone()

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