<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 6 · Sirenas de Glisando" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Sirena interactiva -->
        <CoursesSection icon="mdi-music-note" title="Sirena de Referencia">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Reproduce la "sirena" y canta encima imitando el deslizamiento: sube desde C4 hasta C5 y
            baja de regreso <strong>sin escalones</strong>. Usa la vocal "OO" o "NG" para que el
            paso por los registros sea suave.
          </p>

          <div class="text-center py-3">
            <div class="d-flex justify-center align-center mb-3">
              <VChip size="small" color="primary" variant="outlined" class="mr-3 font-mono">C4</VChip>
              <div class="siren-track d-flex align-center" style="position:relative; width: 220px; height: 70px;">
                <div class="siren-sweep" :class="{ active: isSirenPlaying }"></div>
                <div class="text-caption text-grey-darken-2 mx-auto">deslizamiento continuo C4 ▲ C5</div>
              </div>
              <VChip color="red" size="small" variant="outlined" class="ml-3 font-mono">C5</VChip>
            </div>

            <VBtn id="btn-singp6-siren" class="mb-3" size="x-large"
              :color="isSirenPlaying ? 'red-darken-2' : 'primary'" @click="playSiren">
              <VIcon start>{{ isSirenPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isSirenPlaying ? 'Detener sirena' : 'Reproducir sirena' }}
            </VBtn>
          </div>

          <VRow class="mb-2" density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 text-center mb-2">
                <div class="text-caption text-grey-darken-2">Velocidad</div>
                <div class="text-body-1 font-weight-bold">{{ speedLabel }}</div>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 text-center mb-2">
                <div class="text-caption text-grey-darken-2">Vocales sugeridas</div>
                <div class="text-body-1 font-weight-bold">OO · NG · AH</div>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 text-center mb-2">
                <div class="text-caption text-grey-darken-2">Rango del día</div>
                <div class="text-body-1 font-weight-bold">C4 → C5 → C4</div>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Deslizamientos en pasos -->
        <CoursesSection icon="mdi-arrow-split-horizontal" title="Deslizamientos Incrementales">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Antes de la sirena completa, practica deslizamientos pequeños que crecen de a poco.
            Cada fila es un nivel: comienza en 1 y sube.
          </p>

          <VRow density="comfortable">
            <VCol v-for="level in slideLevels" :key="level.step" md="4" sm="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined" style="cursor:pointer;"
                :color="level.completed ? 'light-green-lighten-5' : 'transparent'" @click="playLevel(level)">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-subtitle-2 font-weight-bold">Nivel {{ level.step }}: {{ level.label }}</span>
                  <VIcon v-if="level.completed" size="small" color="success">mdi-check-circle</VIcon>
                  <VIcon v-else size="small" color="grey-lighten-1">mdi-arrow-right</VIcon>
                </div>
                <div class="font-mono text-body-2 text-primary">{{ level.range }}</div>
              </VCard>
            </VCol>
          </VRow>

          <VAlert type="success" density="compact" variant="outlined">
            Marca cada nivel cuando lo completes cantando sobre la sirena de referencia. Llegar al
            nivel 5 significa que dominas el glisando completo.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Quiz glisando -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: El Glisando">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp6-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp6-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-trophy-outline</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Glisando dominado!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp6-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay6",
  data() {
    return {
      showContent: true,
      isSirenPlaying: false,
      audioCtx: null,
      volume: 0.4,

      slideLevels: [
        { step: 1, label: "Tercera", range: "C4 ▲ E4 (pequeño)", completed: false },
        { step: 2, label: "Quinta", range: "C4 ▲ G4", completed: false },
        { step: 3, label: "Octava", range: "C4 ▲ C5", completed: false },
        { step: 4, label: "Octava + vuelta", range: "C4 ▲ C5 ▼ C4", completed: false },
        { step: 5, label: "Doble octava", range: "C3 ▲ C5 ▼ C3", completed: false },
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "El glisando es…",
          options: ["Una escala nota a nota", "Un deslizamiento continuo entre notas", "Un acorde", "Un ritmo"],
          answerIndex: 1,
          explanation: "El glisando se desliza por todas las alturas intermedias, sin detenerse en ninguna.",
        },
        {
          question: "La principal diferencia entre una escala y un glisando es…",
          options: ["La duración", "Que la escala tiene escalones y el glisando es una rampa", "El volumen", "Que el glisando no usa aire"],
          answerIndex: 1,
          explanation: "La escala avanza por grados (escalones); el glisando es un deslizamiento continuo (rampa).",
        },
        {
          question: "¿Qué vocal o sonido es ideal para un glisando suave?",
          options: ["Una vocal gritada", "OO, NG o AH relajados", "Una consonante dura 'K'", "Ninguna"],
          answerIndex: 1,
          explanation: "OO, NG y AH relajados permiten deslizarse sin tensión y suavizan el paso de registros.",
        },
        {
          question: "El glisando ayuda especialmente a…",
          options: ["Conectar el registro grave y el agudo", "Cantar más fuerte", "Memorizar letras", "Afinar el instrumento"],
          answerIndex: 0,
          explanation: "Al deslizar sin saltos, une pecho y cabeza, relaja la laringe y entrena el flujo de aire.",
        },
        {
          question: "Glisando ascendente significa que la voz…",
          options: ["Baja de tono", "Sube de una nota grave a una aguda", "Se mantiene igual", "Hace acordes"],
          answerIndex: 1,
          explanation: "Ascendente = sube. Descendente = baja. Completo = sube y baja en un solo flujo.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    speedLabel() {
      return "Media (cómoda)"
    },
  },

  beforeUnmount() {
    this.isSirenPlaying = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    playLevel(level) {
      this.playSiren()
      level.completed = true
    },

    async playSiren() {
      if (this.isSirenPlaying) {
        this.isSirenPlaying = false
        return
      }
      this.isSirenPlaying = true
      this.startSirenGlide(261.63, 523.25, 1200)
      await new Promise((r) => setTimeout(r, 1250))
      if (this.isSirenPlaying) {
        this.startSirenGlide(523.25, 261.63, 1200)
        await new Promise((r) => setTimeout(r, 1250))
      }
      this.isSirenPlaying = false
    },

    startSirenGlide(fromFreq, toFreq, ms) {
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
        gain.gain.setValueAtTime(this.volume, now + ms / 1000 - 0.15)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + ms / 1000)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + ms / 1000 + 0.05)
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