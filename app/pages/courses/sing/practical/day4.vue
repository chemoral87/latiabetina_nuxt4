<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 4 · Cantando Escalas" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Escala interactiva -->
        <CoursesSection icon="mdi-music-note" title="Explorador de Escalas">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Haz clic en cada nota para escucharla y cantarla, o reproduce la escala completa.
            Empieza siempre en <strong>Do central</strong> y sube por la escala de Do Mayor.
          </p>

          <div class="d-flex align-center justify-space-between flex-wrap mb-3 py-2 px-1 rounded bg-grey-lighten-4">
            <template v-for="(note, index) in scaleNotes" :key="`${note.english}-${index}`">
              <div class="d-flex align-center justify-center flex-grow-1 my-1">
                <VBtn id="btn-singp4-scale-note" icon size="small" rounded="circle"
                  style="width: 38px; height: 38px;"
                  class="elevation-2 font-weight-black text-subtitle-1"
                  :color="selectedNoteIndex === index ? 'primary' : 'grey-lighten-2'"
                  :class="selectedNoteIndex === index ? 'text-white' : 'text-grey-darken-3'" @click="selectNote(index)">
                  {{ note.latin }}
                </VBtn>
                <div v-if="index < scaleNotes.length - 1" class="text-caption font-weight-bold font-mono mx-1"
                  :style="selectedNoteIndex === index ? 'color: var(--v-primary-base, #1976d2)' : 'color:#888'">
                  {{ note.interval }}
                </div>
              </div>
            </template>
          </div>

          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-4 bg-grey-lighten-5 mb-3">
                <div class="d-flex align-center mb-2">
                  <span class="text-h5 font-weight-black text-primary mr-2">{{ selectedNote.latin }}</span>
                  <span class="text-subtitle-2 text-grey">({{ selectedNote.english }})</span>
                </div>
                <div class="text-body-2 text-grey-darken-2 mb-1">
                  Frecuencia: <strong>{{ selectedNote.frequency }} Hz</strong>
                </div>
                <div class="text-body-2 text-grey-darken-2 mb-2">
                  Intervalo previo: <span class="font-weight-bold text-amber-darken-3">{{ selectedNote.intervalDesc }}</span>
                </div>
                <VChip size="small" color="primary" variant="outlined">{{ selectedNote.role }}</VChip>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <div class="d-flex flex-wrap gap-2 mt-1">
                <VBtn id="btn-singp4-scale-play" class="mb-2 mr-2 text-white"
                  :color="isPlayingScale ? 'red-darken-2' : 'primary'" @click="playScaleSequence">
                  <VIcon start>{{ isPlayingScale ? 'mdi-stop' : 'mdi-play-circle' }}</VIcon>
                  {{ isPlayingScale ? 'Detener' : 'Reproducir escala' }}
                </VBtn>
                <VBtn id="btn-singp4-scale-sound" class="mb-2" variant="outlined" color="grey-darken-2"
                  @click="playTone(selectedNote.frequency, 1.2)">
                  <VIcon start>mdi-music-note</VIcon>
                  Sonar nota actual
                </VBtn>
              </div>
              <VAlert type="info" class="mb-2" density="compact" variant="outlined">
                Práctica: canta cada nota junto con el tono. Repite la secuencia arriba y abajo 3 veces.
              </VAlert>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Quiz escalas -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Escalas">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp4-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp4-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-school-outline</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Escalas en camino!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp4-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay4",
  data() {
    return {
      showContent: true,
      selectedNoteIndex: 0,
      isPlayingScale: false,
      audioCtx: null,
      volume: 0.4,

      scaleNotes: [
        { latin: "Do", english: "C4", frequency: 261.63, interval: "T", intervalDesc: "Inicio", role: "Tónica" },
        { latin: "Re", english: "D4", frequency: 293.66, interval: "T", intervalDesc: "+1 Tono", role: "II" },
        { latin: "Mi", english: "E4", frequency: 329.63, interval: "S", intervalDesc: "+1 Tono", role: "III" },
        { latin: "Fa", english: "F4", frequency: 349.23, interval: "T", intervalDesc: "+1/2 Tono", role: "IV" },
        { latin: "Sol", english: "G4", frequency: 392.00, interval: "T", intervalDesc: "+1 Tono", role: "V (Dominante)" },
        { latin: "La", english: "A4", frequency: 440.00, interval: "T", intervalDesc: "+1 Tono", role: "VI" },
        { latin: "Si", english: "B4", frequency: 493.88, interval: "S", intervalDesc: "+1 Tono", role: "VII (Sensible)" },
        { latin: "Do", english: "C5", frequency: 523.25, interval: "", intervalDesc: "+1/2 Tono", role: "Octava" },
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La fórmula de la escala mayor natural es…",
          options: ["T-S-T-T-S-T-T", "T-T-S-T-T-T-S", "S-S-T-S-S-S-T", "T-T-T-S-S-T-T"],
          answerIndex: 1,
          explanation: "Tono-Tono-Semitone-Tono-Tono-Tono-Semitone (T-T-S-T-T-T-S).",
        },
        {
          question: "¿Cuál es el grado que genera la 'tensión' que pide volver a la tónica?",
          options: ["IV (Subdominante)", "V (Dominante)", "III (Mediante)", "VI (Superdominante)"],
          answerIndex: 1,
          explanation: "La dominante (V) crea la tensión que resuelve de forma natural en la tónica (I).",
        },
        {
          question: "La escala menor natural suena distinta a la mayor principalmente porque…",
          options: ["Tiene menos notas", "La tercera está bemol", "Empieza en Re", "No tiene semitonos"],
          answerIndex: 1,
          explanation: "La tercera menor (b3) da ese carácter melancólico característico del modo menor.",
        },
        {
          question: "La diferencia fundamental entre un tono y un semitono es…",
          options: ["El tono son más fuerte", "El tono equivale a dos semitonos", "El semitono es más largo", "No hay diferencia"],
          answerIndex: 1,
          explanation: "1 Tono = 2 semitonos. Es la unidad básica de medida de los intervalos.",
        },
        {
          question: "¿Dónde suelen estar los semitonos naturales en una escala de Do Mayor?",
          options: ["Entre Do-Re y Fa-Sol", "Entre Mi-Fa y Si-Do", "Entre Re-Mi y Sol-La", "En los extremos"],
          answerIndex: 1,
          explanation: "En Do Mayor los semitonos están entre Mi-Fa (3-4) y Si-Do (7-8).",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    selectedNote() {
      return this.scaleNotes[this.selectedNoteIndex]
    },
  },

  beforeUnmount() {
    this.isPlayingScale = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    selectNote(index) {
      this.selectedNoteIndex = index
      this.playTone(this.scaleNotes[index].frequency, 1.2)
    },

    async playScaleSequence() {
      if (this.isPlayingScale) {
        this.isPlayingScale = false
        return
      }
      this.isPlayingScale = true
      for (let i = 0; i < this.scaleNotes.length; i++) {
        if (!this.isPlayingScale) break
        this.selectedNoteIndex = i
        this.playTone(this.scaleNotes[i].frequency, 0.9)
        await new Promise((r) => setTimeout(r, 1000))
      }
      for (let i = this.scaleNotes.length - 2; i >= 0; i--) {
        if (!this.isPlayingScale) break
        this.selectedNoteIndex = i
        this.playTone(this.scaleNotes[i].frequency, 0.9)
        await new Promise((r) => setTimeout(r, 1000))
      }
      this.isPlayingScale = false
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
        if (this.audioCtx && typeof this.audioCtx.close === 'function') {
          this.audioCtx.close()
        }
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