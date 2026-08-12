<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 5 · Ejercicios de Ataque" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Vocales de ataque -->
        <CoursesSection icon="mdi-format-letter-case" title="Suelta la Nota con Vocales">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Canta cada vocal de forma <strong>staccato</strong> (corta y precisa) sobre una misma
            nota. El ataque limpio se entrena con vocales: <strong>A, E, I, O, U</strong>. Pulsa el
            tono de referencia y dispara la vocal con un pequeño golpe de apoyo, sin aspirada.
          </p>

          <VRow density="comfortable" class="align-center mb-2">
            <VCol md="4" cols="12" class="text-center">
              <VBtn id="btn-singp5-tone" size="large" color="primary" variant="tonal" @click="playTone(261.63, 1.5)">
                <VIcon start>mdi-music-note</VIcon>
                Do central (C4)
              </VBtn>
            </VCol>
            <VCol md="8" cols="12">
              <VRow density="compact">
                <VCol v-for="v in vowels" :key="v" sm="2" cols="4">
                  <VCard variant="outlined" style="cursor:pointer;" class="pa-2 text-center" @click="burstVowel(v)">
                    <div class="text-h4 font-weight-bold text-primary">{{ v }}</div>
                    <div class="text-caption text-grey-darken-2">dispara</div>
                  </VCard>
                </VCol>
              </VRow>
            </VCol>
          </VRow>

          <VAlert type="info" class="mb-2" density="compact" variant="outlined">
            Canta "A-A-A-A-A" (5 golpes cortos), luego "E-E-E…", etc. El golpe sale del abdomen
            (apoyo), nunca de la garganta.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Simulador de staccato/legato -->
        <CoursesSection title="Modos de Articulación" icon="mdi-music-note-half-dotted">
          <div class="text-center my-3">
            <VBtnToggle v-model="mode" mandatory color="primary" variant="outlined" density="comfortable">
              <VBtn id="btn-singp5-mode-staccato" value="staccato" :prepend-icon="mode === 'staccato' ? 'mdi-check' : ''">
                Staccato
              </VBtn>
              <VBtn id="btn-singp5-mode-legato" value="legato" :prepend-icon="mode === 'legato' ? 'mdi-check' : ''">
                Legato
              </VBtn>
              <VBtn id="btn-singp5-mode-marcato" value="marcato" :prepend-icon="mode === 'marcato' ? 'mdi-check' : ''">
                Marcato
              </VBtn>
            </VBtnToggle>
          </div>

          <VCard variant="outlined" class="pa-4 bg-grey-lighten-5 mb-3">
            <div class="text-center text-h5 font-weight-bold text-primary font-mono mb-2">
              {{ articulationNotation }}
            </div>
            <p class="text-body-2 text-center text-grey-darken-2 mb-0">
              {{ modeDescription }}
            </p>
          </VCard>

          <div class="text-center">
            <VBtn id="btn-singp5-demo" size="large" :color="isDemoPlaying ? 'red-darken-2' : 'primary'"
              @click="playDemo">
              <VIcon start>{{ isDemoPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isDemoPlaying ? 'Detener demo' : 'Escuchar demo' }}
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 3: Quiz ataque -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: El Ataque">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp5-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp5-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-sword-cross</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Ataques dominados!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp5-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay5",
  data() {
    return {
      showContent: true,
      vowels: ["A", "E", "I", "O", "U"],
      mode: "staccato",
      isDemoPlaying: false,
      audioCtx: null,
      volume: 0.4,
      demoTimeout: null,

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "El ataque de nota ideal (equilibrado) ocurre cuando…",
          options: ["Golpeas la garganta", "El aire y la vibración llegan al mismo tiempo", "Suelta mucha 'h' antes", "Esperas a estar sin aire"],
          answerIndex: 1,
          explanation: "El ataque equilibrado une aire y cierre de cuerdas: nota limpia desde el primer instante.",
        },
        {
          question: "¿Qué tipo de ataque es perjudicial si se usa habitualmente?",
          options: ["Equilibrado", "Aspirado (h)", "Duro / glotal ('clac')", "Ninguno"],
          answerIndex: 2,
          explanation: "El ataque glotal golpea las cuerdas y fatiga la voz. Se usa solo por efecto puntual.",
        },
        {
          question: "Las notas 'staccato' se caracterizan por…",
          options: ["Ser largas y ligadas", "Ser cortas y separadas", "Ser muy graves", "No tener ataque"],
          answerIndex: 1,
          explanation: "Staccato = notas cortas y separadas, ideales para entrenar el ataque preciso.",
        },
        {
          question: "El golpe del ataque en el canto sale de…",
          options: ["La garganta", "El apoyo abdominal", "La lengua", "Los hombros"],
          answerIndex: 1,
          explanation: "El impulso del ataque viene del apoyo del diafragma, nunca de la garganta.",
        },
        {
          question: "¿Cuál es la mejor herramienta para entrenar el ataque con vocales?",
          options: ["Cantar con las vocales A-E-I-O-U en staccato", "Gritar", "Bostezar", "Susurrar"],
          answerIndex: 0,
          explanation: "Las vocales cortas en staccato entrenan el ataque limpio de forma segura y controlada.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    articulationNotation() {
      if (this.mode === 'staccato') return "◌ ▍ ◌ ▍ ◌ ▍ ◌ ▍ ◌"
      if (this.mode === 'legato') return "◌ " + "–".repeat(6) + " ◌"
      return "◌ ‣ ◌ ‣ ◌ ‣ ◌ ‣ ◌"
    },

    modeDescription() {
      if (this.mode === 'staccato') return "Notas cortas y separadas: entrena ataque preciso y agilidad."
      if (this.mode === 'legato') return "Notas ligadas y continuas: entrena flujo de aire y fraseo."
      return "Notas acentuadas con peso: entrena control del apoyo y dinámica."
    },
  },

  beforeUnmount() {
    if (this.demoTimeout) clearTimeout(this.demoTimeout)
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    burstVowel(vowel) {
      this.playTone(261.63, 0.35)
    },

    async playDemo() {
      if (this.isDemoPlaying) {
        this.isDemoPlaying = false
        return
      }
      this.isDemoPlaying = true
      const freqs = [261.63, 293.66, 329.63]
      const durations = this.mode === 'staccato' ? [0.2, 0.2, 0.2] : this.mode === 'legato' ? [0.9, 0.9, 0.9] : [0.45, 0.45, 0.45]
      const gap = this.mode === 'staccato' ? 250 : this.mode === 'legato' ? 1000 : 550
      for (let i = 0; i < freqs.length; i++) {
        if (!this.isDemoPlaying) break
        this.playTone(freqs[i], durations[i])
        await new Promise((r) => setTimeout(r, gap))
      }
      this.isDemoPlaying = false
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
        gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.02)
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