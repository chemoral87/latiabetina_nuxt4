<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 7 · Trills y Fry" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Trainer de lip trill -->
        <CoursesSection icon="mdi-lips" title="Lip Trill con Referencia">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Reproduce cada línea melódica y haz el <strong>lip trill</strong> (brrr) por encima.
            Aumenta el nivel conforme tu labio aguante la vibración con melodías más largas.
          </p>

          <VRow class="mb-2" density="comfortable">
            <VCol v-for="(line, index) in trillLines" :key="line.name" md="4" sm="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined" style="cursor:pointer;"
                :color="line.completed ? 'light-green-lighten-5' : 'transparent'" @click="playTrillLine(index)">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-subtitle-2 font-weight-bold">{{ line.name }}</div>
                    <div class="font-mono text-body-2 text-primary">{{ line.melody }}</div>
                  </div>
                  <VIcon v-if="line.completed" color="success">mdi-check-circle</VIcon>
                  <VIcon v-else color="grey-lighten-1">mdi-play-circle</VIcon>
                </div>
              </VCard>
            </VCol>
          </VRow>

          <VAlert type="info" density="compact" variant="outlined">
            Consejo: pon una mano en el abdomen para sentir cómo el brrr fluye del apoyo. Si el labio
            se detiene, no aprietes: respira y aporta un poco más de aire.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Trainer de vocal fry -->
        <CoursesSection icon="mdi-crack" title="Vocal Fry Guiado">
          <div class="text-center py-3">
            <VBtn id="btn-singp7-fry-demo" class="mb-3" size="x-large"
              :color="isFryDemo ? 'red-darken-2' : 'deep-purple'" @click="playFryDemo">
              <VIcon start>{{ isFryDemo ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isFryDemo ? 'Detener' : 'Escuchar demo de creaky voice' }}
            </VBtn>
            <div class="text-subtitle-2 text-grey-darken-2 mb-3">Demo de vocal fry (sonido rasposo grave)</div>
          </div>

          <VStepper v-model="fryStep" flat density="compact" class="mb-3 elevation-0">
            <VStepperHeader>
              <VStepperItem v-for="n in 4" :key="n" readonly :value="n" :complete="fryStep > n">
                <template #title>
                  <span class="text-body-2">Paso {{ n }}</span>
                </template>
              </VStepperItem>
            </VStepperHeader>
            <VStepperWindow>
              <VStepperWindowItem v-for="(step, i) in frySteps" :key="i" :value="i + 1">
                <div class="py-4">
                  <p class="text-body-1 font-weight-medium mb-3">{{ step.title }}</p>
                  <p class="text-body-2 text-grey-darken-2 mb-2">{{ step.description }}</p>
                  <VAlert v-if="step.tip" type="info" class="pa-1" variant="text" density="compact">
                    <span class="text-caption">{{ step.tip }}</span>
                  </VAlert>
                </div>
              </VStepperWindowItem>
            </VStepperWindow>
          </VStepper>

          <div class="d-flex justify-center mb-2">
            <VBtn id="btn-singp7-fry-next" color="primary" @click="fryStep = fryStep >= 4 ? 1 : fryStep + 1">
              {{ fryStep >= 4 ? 'Repetir guía' : 'Siguiente paso' }}
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Trills y Fry">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp7-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp7-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-lips</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Técnica sólida!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp7-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay7",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.4,
      isFryDemo: false,
      fryStep: 1,

      trillLines: [
        { name: "Nivel 1 · Una nota", melody: "C4 (sostén brrr)", completed: false },
        { name: "Nivel 2 · Escalera", melody: "C4–D4–E4 ▲ y baja", completed: false },
        { name: "Nivel 3 · Arpegio", melody: "C4–E4–G4 ▲ y baja", completed: false },
      ],

      frySteps: [
        {
          title: "Paso 1 · Suelta la tensión",
          description: "Emite un 'ah' muy relajado y déjalo caer al fondo de tu registro hasta que el sonido se vuelva rasposo y crujiente.",
          tip: "No fuerces: el crepitar debe nacer solo, sin presión.",
        },
        {
          title: "Paso 2 · Agrega aire suave",
          description: "Mantén el sonido rasposo mientras soplas un poquito de aire de tu apoyo, sin apretar la garganta.",
        },
        {
          title: "Paso 3 · Súbelo un grado",
          description: "Desde el fry, desliza hacia arriba hasta una nota suave y clara. El fry se convierte en voz normal sin saltar.",
          tip: "Sentirás cómo la voz 'entra' desde la relajación.",
        },
        {
          title: "Paso 4 · Bájalo y repite",
          description: "Vuelve del sonido claro al fry, y repite el ciclo 4-5 veces para soltar todo el cuello.",
        },
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "El lip trill es principalmente un ejercicio de…",
          options: ["Relajación de cuerdas", "Fuerza y coordinación sin tensión", "Memorización", "Volumen máximo"],
          answerIndex: 1,
          explanation: "El lip trill une apoyo y voz con fuerza y coordinación, pero sin tensión porque el labio no vibra si aprietas.",
        },
        {
          question: "Si tus labios se 'apagan' al hacer el lip trill, lo correcto es…",
          options: ["Apretar más fuerte", "No respirar", "Aportar más aire suave del apoyo", "Cambiar de nota"],
          answerIndex: 2,
          explanation: "El labio detiene su vibración por falta de flujo: suma más aire del abdomen de forma suave.",
        },
        {
          question: "El vocal fry es un ejercicio de…",
          options: ["Fuerza", "Relajación y liberación de tensión", "Ritmo", "Agudos extremos"],
          answerIndex: 1,
          explanation: "El vocal fry relaja las cuerdas y libera tensión del cuello; es un registro muy grave y suelto.",
        },
        {
          question: "¿Por qué el lip trill es ideal para calentar?",
          options: ["Porque hace vibrar los labios sin tensión", "Porque es ruidoso", "Porque gasta aire", "No sirve para calentar"],
          answerIndex: 0,
          explanation: "Los labios no vibran si hay tensión: el trill obliga a una emisión libre y apoyada desde el inicio.",
        },
        {
          question: "El vocal fry debe evitarse como…",
          options: ["Herramienta de calentamiento", "Ejercicio de relajación", "Voz cotidiana", "Todas las anteriores"],
          answerIndex: 2,
          explanation: "El fry se usa para relajar y calentar, no como voz diaria: usarlo continuamente irrita las cuerdas.",
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
    this.isFryDemo = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    async playTrillLine(index) {
      this.trillLines[index].completed = true
      const freqs = [
        [261.63],
        [261.63, 293.66, 329.63, 293.66, 261.63],
        [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63],
      ]
      const pattern = freqs[index] || freqs[0]
      for (const f of pattern) {
        this.playTone(f, 0.5)
        await new Promise((r) => setTimeout(r, 600))
      }
    },

    async playFryDemo() {
      if (this.isFryDemo) {
        this.isFryDemo = false
        return
      }
      this.isFryDemo = true
      for (let i = 0; i < 3; i++) {
        if (!this.isFryDemo) break
        this.playTone(82.41, 0.9)
        await new Promise((r) => setTimeout(r, 1000))
      }
      this.isFryDemo = false
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