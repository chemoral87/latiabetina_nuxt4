<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 9 · Registros y Pasajes" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Explorador de registros -->
        <CoursesSection icon="mdi-rhombus-split" title="Explorador de Registros 1ª y 2ª">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Reproduce cada franja de notas y canta encima:
          </p>
          <VRow class="mb-2" density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VChip class="mb-2" size="small" variant="elevated" color="deep-purple">Registro de pecho</VChip>
                <div class="font-mono text-h6 font-weight-bold">C3 – A3</div>
                <VBtn id="btn-singp9-chest" class="mt-2" variant="tonal" color="deep-purple" @click="playChest">
                  <VIcon start size="small">mdi-play</VIcon> Escuchar
                </VBtn>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VChip class="mb-2" size="small" color="light-blue" variant="elevated">Registro mixto</VChip>
                <div class="font-mono text-h6 font-weight-bold">C4 – E4</div>
                <VBtn id="btn-singp9-mixed" class="mt-2" variant="tonal" color="light-blue" @click="playMixed">
                  <VIcon start size="small">mdi-play</VIcon> Escuchar
                </VBtn>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VChip class="mb-2" color="teal" size="small" variant="elevated">Registro de cabeza</VChip>
                <div class="font-mono text-h6 font-weight-bold">F4 – C5</div>
                <VBtn id="btn-singp9-head" class="mt-2" color="teal" variant="tonal" @click="playHead">
                  <VIcon start size="small">mdi-play</VIcon> Escuchar
                </VBtn>
              </VCard>
            </VCol>
          </VRow>

          <VAlert type="info" density="compact" variant="outlined">
            Canta "Ah" en cada zona y CONSCIENTEMENTE siente dónde vibra: pecho (1ª), máscara/nariz
            (2ª). La clave es que empieces a <strong>identificar tus propios registros</strong>.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Cruzando el pasaje -->
        <CoursesSection icon="mdi-bridge" title="Cruzando el Pasaje sin Romper">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Ejercicio "escalera sin quiebre": reproduce y canta la escala de C4 a G4 y vuelve,
            manteniendo el mismo flujo de aire y sin "cortes" en el pasaje (Mi-Fa).
          </p>
          <div class="d-flex align-center justify-space-between flex-wrap mb-3 py-2 px-1 rounded bg-grey-lighten-4">
            <template v-for="(note, index) in passNotes" :key="note">
              <div class="d-flex align-center justify-center flex-grow-1">
                <VBtn id="btn-singp9-pass-note" icon size="small" rounded="circle"
                  style="width: 36px; height: 36px;"
                  class="elevation-2 font-weight-black text-subtitle-1"
                  :color="activePassIndex === index ? 'deep-purple' : 'grey-lighten-2'"
                  :class="activePassIndex === index ? 'text-white' : 'text-grey-darken-3'" @click="playPassNote(index)">
                  {{ note }}
                </VBtn>
              </div>
            </template>
          </div>
          <div class="text-center">
            <VBtn id="btn-singp9-pass-play" size="large" :color="isPassPlaying ? 'red-darken-2' : 'deep-purple'"
              @click="playPassage">
              <VIcon start>{{ isPassPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isPassPlaying ? 'Detener' : 'Reproducir pasaje completo' }}
            </VBtn>
          </div>
          <VAlert class="mt-3" type="success" density="compact" variant="outlined">
            Reto: canta la escala entera de una sola pasada, sintiendo el paso pecho→cabeza como una
            "subida de ascensor" suave, no como un "tambaleo".
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Registros">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp9-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp9-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-rhombus-split</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Registros conectados!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp9-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay9",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.4,
      activePassIndex: -1,
      isPassPlaying: false,

      passNotes: ["C4", "D4", "E4", "F4", "G4", "F4", "E4", "D4", "C4"],
      passFreqs: [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 261.63],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La vibración del registro de pecho se siente…",
          options: ["En la cabeza", "En el pecho y zona grave", "En las manos", "En las piernas"],
          answerIndex: 1,
          explanation: "El registro 1º (pecho) resuena en el pecho; el registro 2º (cabeza/mixta) resuena en la máscara.",
        },
        {
          question: "La 'segunda voz' en el registro vocal se refiere al registro de…",
          options: ["Pecho", "Cabeza / mixta", "Falsete solamente", "Susurro"],
          answerIndex: 1,
          explanation: "Aunque el término también se usa para armonías, en registro 'segunda voz' indica el mecanismo de cabeza.",
        },
        {
          question: "El punto donde la voz cambia de un registro a otro se llama…",
          options: ["Pasaje (passaggio)", "Tono", "Tempo", "Modulación"],
          answerIndex: 0,
          explanation: "El pasaje es la zona de transición; entrenarlo lo hace invisible.",
        },
        {
          question: "Si la voz 'quiebra' en el pasaje, lo mejor es…",
          options: ["Gritar", "Reducir el aire y usar vocal OE/I suave con más apoyo", "Cantar más grave siempre", "Aguantar la respiración"],
          answerIndex: 1,
          explanation: "Vocales suaves (OE/I) y aumento del apoyo cruzan el pasaje sin romper.",
        },
        {
          question: "Para suavizar el pasaje conviene usar…",
          options: ["El glisando (sirena) que une los dos registros", "Saltos bruscos", "Gritos", "Cantar en falsete siempre"],
          answerIndex: 0,
          explanation: "El glisando desliza sin escalones y conecta pecho y cabeza progresivamente.",
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
    this.isPassPlaying = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    async playChest() {
      this.playTone(196.00, 1.2)
    },
    async playMixed() {
      this.playTone(293.66, 1.2)
    },
    async playHead() {
      this.playTone(392.00, 1.2)
    },

    playPassNote(index) {
      this.activePassIndex = index
      this.playTone(this.passFreqs[index], 0.8)
    },

    async playPassage() {
      if (this.isPassPlaying) {
        this.isPassPlaying = false
        return
      }
      this.isPassPlaying = true
      for (let i = 0; i < this.passFreqs.length; i++) {
        if (!this.isPassPlaying) break
        this.activePassIndex = i
        this.playTone(this.passFreqs[i], 0.8)
        await new Promise((r) => setTimeout(r, 850))
      }
      this.isPassPlaying = false
      this.activePassIndex = -1
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