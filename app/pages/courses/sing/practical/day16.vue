<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 16 · Color y Dinámica" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Dinámica guiada -->
        <CoursesSection icon="mdi-volume-high" title="Entreador de Dinámica (p – f)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Reproduce cada nivel y canta encima con el volumen indicado. La meta: pasar de suave a
            fuerte y regresar <strong>con control</strong>, como un piano.
          </p>

          <div class="d-flex flex-wrap align-center justify-center mb-3">
            <template v-for="(n, i) in dynLevels" :key="n.mark">
              <VCard variant="outlined" style="cursor:pointer;" class="pa-2 px-3 text-center"
                :color="activeDyn === i ? 'grey-lighten-4' : 'transparent'" @click="playDyn(i)">
                <div class="text-subtitle-1 font-weight-bold">{{ n.mark }}</div>
                <div class="text-caption text-grey-darken-2">{{ n.name }}</div>
              </VCard>
              <VIcon v-if="i < dynLevels.length - 1" class="mx-1" size="small" color="grey-lighten-1">mdi-chevron-right</VIcon>
            </template>
          </div>

          <VAlert type="success" density="compact" variant="outlined">
            Los botones reproducen con <em>volumen creciente</em>: primero identifica la diferencia,
            luego imítala cantando "Ah" sobre el tono de referencia.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Crescendo -->
        <CoursesSection icon="mdi-music-note" title="Crescendo – Diminuendo">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El ejercicio del día: en una sola nota (C4), empieza suavísimo (pp), crece hasta forte
            (f), y vuelve a suavísimo, sin cambiar la afinación.
          </p>
          <div class="text-center mb-3">
            <VBtn id="btn-singp16-cresc" size="x-large" :color="isCresc ? 'red-darken-2' : 'primary'"
              @click="playCrescendo">
              <VIcon start>{{ isCresc ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isCresc ? 'Detener' : 'Escuchar cresc / dim' }}
            </VBtn>
          </div>
          <VCard variant="outlined" class="pa-3 bg-grey-lighten-5">
            <div class="d-flex align-center justify-center mb-2">
              <span class="font-mono font-weight-bold text-caption mr-2">pp</span>
              <div class="cresc-bar flex-grow-1 rounded" style="height: 8px; background: linear-gradient(90deg, #bbdefb 0%, #1976d2 50%, #0d47a1 100%);"></div>
              <span class="font-mono font-weight-bold text-caption ml-2">f</span>
            </div>
            <p class="text-body-2 text-center text-grey-darken-2 mb-0">
              Visualiza la frase como esta barra: la intensidad sube en "cresc." y baja en "dim.".
            </p>
          </VCard>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Color y Dinámica">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp16-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp16-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-palette-swatch</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Voz expresiva!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp16-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay16",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      activeDyn: null,
      isCresc: false,
      volume: 0.4,

      dynLevels: [
        { mark: "p", name: "Piano · suave", gain: 0.2 },
        { mark: "mp", name: "Mezzopiano", gain: 0.4 },
        { mark: "mf", name: "Mezzoforte", gain: 0.55 },
        { mark: "f", name: "Forte · fuerte", gain: 0.75 },
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La dinámica en la música se refiere a…",
          options: ["El color de la voz", "El control intencional del volumen", "La afinación", "El ritmo"],
          answerIndex: 1,
          explanation: "La dinámica es el volumen planeado: p, f, cresc, dim, etc.",
        },
        {
          question: "La marca 'f' (forte) indica…",
          options: ["Muy suave", "Fuerte", "Medio", "Rápido"],
          answerIndex: 1,
          explanation: "f = forte (fuerte). pp = pianísimo (muy suave).",
        },
        {
          question: "'Crescendo' significa…",
          options: ["Bajar de volumen", "Subir de volumen progresivamente", "Cantar igual", "Detenerse"],
          answerIndex: 1,
          explanation: "Crescendo = aumentar poco a poco. Diminuendo = disminuir.",
        },
        {
          question: "El color 'brillante' de la voz se logra con…",
          options: ["Resonancia en la máscara y vocales 'e/i'", "Todas las vocales bajas", "Cantar apenas", "Susurro"],
          answerIndex: 0,
          explanation: "La máscara alta y las vocales anteriores (e, i) dan brillo a la voz.",
        },
        {
          question: "En el canto expresivo, color y dinámica…",
          options: ["Se usan por separado", "Van juntos para transmitir emoción", "No importan", "Solo en ópera"],
          answerIndex: 1,
          explanation: "Color (matiz) y dinámica (fuerza) se combinan en cada frase para expresar emoción.",
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
    this.isCresc = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    playDyn(i) {
      this.activeDyn = i
      this.playToneWithGain(293.66, this.dynLevels[i].gain, 1.4)
    },

    async playCrescendo() {
      if (this.isCresc) {
        this.isCresc = false
        return
      }
      this.isCresc = true
      const levels = [0.15, 0.35, 0.55, 0.75, 0.55, 0.35, 0.15]
      for (const gain of levels) {
        if (!this.isCresc) break
        this.playToneWithGain(261.63, gain, 0.8)
        await new Promise((r) => setTimeout(r, 850))
      }
      this.isCresc = false
    },

    playToneWithGain(frequency, gain, duration = 1.2) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()

        const ctx = this.audioCtx
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(frequency, ctx.currentTime)
        g.gain.setValueAtTime(0, ctx.currentTime)
        g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.1)
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
        osc.connect(g)
        g.connect(ctx.destination)
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