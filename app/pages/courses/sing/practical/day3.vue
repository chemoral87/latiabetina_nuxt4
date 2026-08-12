<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 3 · Afinando el Oído" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Escuchar notas -->
        <CoursesSection icon="mdi-music-note" title="Navegador de Notas de Referencia">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Toca cada nota de referencia (notación latina e inglesa) y canta imitando. Empieza por
            la <strong>C4</strong> (Do central, la más cómoda en medio de tu voz), luego sube y baja.
            El objetivo del día: <strong>identificar y cantar las 7 notas básicas</strong> en su
            octava central.
          </p>

          <VRow class="mb-2" density="comfortable">
            <VCol v-for="(note, index) in referenceNotes" :key="note.english" sm="3" cols="6">
              <VCard variant="outlined" style="cursor: pointer;"
                :color="activeNoteIndex === index ? 'grey-lighten-4' : 'transparent'"
                class="pa-3 text-center fill-height d-flex flex-column justify-space-between align-center" @click="playNote(index)">
                <div>
                  <VChip size="x-small" variant="elevated" :color="note.color" class="mb-2 font-weight-bold">
                    {{ note.octave }}
                  </VChip>
                  <div class="text-h4 font-weight-bold text-primary">{{ note.english }}</div>
                  <div class="text-subtitle-2 text-grey-darken-2">{{ note.latin }}</div>
                  <div class="text-caption text-grey-darken-1">{{ note.frequency }} Hz</div>
                </div>
                <VBtn id="btn-singp3-note-play" icon size="small"
                  class="elevation-1 mt-2" :color="activeNoteIndex === index ? 'primary' : 'grey'">
                  <VIcon>{{ activeNoteIndex === index ? 'mdi-volume-high' : 'mdi-play-circle-outline' }}</VIcon>
                </VBtn>
              </VCard>
            </VCol>
          </VRow>

          <div class="text-center mt-3">
            <VBtn id="btn-singp3-sequence" class="mb-2" :color="isSequencePlaying ? 'red-darken-2' : 'primary'"
              @click="playSequence">
              <VIcon start>{{ isSequencePlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isSequencePlaying ? 'Detener' : 'Escuchar escala Do Mayor (ascendente)' }}
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 2: Atrápame / imitación -->
        <CoursesSection icon="mdi-account-voice" title="Eco Vocal (Imitación)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Pulsa un tono, escúchalo, y en el silencio <strong>cántalo de regreso</strong>. Después
            vuelve a pulsarlo para comparar. Repítelo 4 veces por nota.
          </p>
          <div class="d-flex flex-wrap gap-2 justify-center mb-3">
            <VBtn v-for="(n, i) in ecoNotes" id="btn-singp3-eco" :key="n.english" class="mb-2" variant="outlined"
              color="grey-darken-2" @click="playNote(i)">
              <VIcon start size="small">mdi-volume-medium</VIcon>
              {{ n.latin }} ({{ n.english }})
            </VBtn>
          </div>

          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-2" variant="outlined">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-1">Pasos del eco</div>
                <VList density="compact">
                  <VListItem v-for="(step, i) in ecoSteps" :key="i">
                    <template #prepend>
                      <VChip class="mr-2" size="x-small" color="primary">{{ i + 1 }}</VChip>
                    </template>
                    <span class="text-body-2">{{ step }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-3 bg-grey-lighten-5 mb-2">
                <div class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-1">Pista de audio</div>
                <p class="text-body-2 mb-2">
                  Graba tu voz con el celular y compárala nota por nota. La grabación te ayuda a
                  escucharte como te oyen los demás (no como te oyes por los huesos).
                </p>
                <VIcon size="40" color="grey-darken-2">mdi-cellphone-sound</VIcon>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: Quiz do/C -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Do y C">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp3-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp3-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-trophy-outline</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Notas dominadas!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp3-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay3",
  data() {
    return {
      showContent: true,
      activeNoteIndex: null,
      isSequencePlaying: false,
      audioCtx: null,
      osc: null,
      gain: null,
      volume: 0.4,
      noteTimeout: null,

      referenceNotes: [
        { latin: "Do", english: "C4", octave: "Do central", frequency: 261.63, color: "blue-darken-1" },
        { latin: "Re", english: "D4", octave: "Re", frequency: 293.66, color: "cyan-darken-1" },
        { latin: "Mi", english: "E4", octave: "Mi", frequency: 329.63, color: "teal-darken-1" },
        { latin: "Fa", english: "F4", octave: "Fa", frequency: 349.23, color: "green-darken-1" },
        { latin: "Sol", english: "G4", octave: "Sol", frequency: 392.00, color: "light-green-darken-2" },
        { latin: "La", english: "A4", octave: "La", frequency: 440.00, color: "amber-darken-1" },
        { latin: "Si", english: "B4", octave: "Si", frequency: 493.88, color: "orange-darken-1" },
        { latin: "Do", english: "C5", octave: "Do alto", frequency: 523.25, color: "red-darken-1" },
      ],

      ecoNotes: [
        { latin: "Do", english: "C4", frequency: 261.63 },
        { latin: "Mi", english: "E4", frequency: 329.63 },
        { latin: "Sol", english: "G4", frequency: 392.00 },
        { latin: "La", english: "A4", frequency: 440.00 },
      ],

      ecoSteps: [
        "Pulsa el tono y escúchalo con atención.",
        "En silencio, canta la nota de regreso.",
        "Compara mentalmente: ¿sube, baja o coincide?",
        "Repite hasta que sientas que coincide.",
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "En notación latina, el nombre de la nota 'C' es…",
          options: ["La", "Re", "Do", "Sol"],
          answerIndex: 2,
          explanation: "Do = C. La nomenclatura latina llama Do a la nota que en inglés es C.",
        },
        {
          question: "¿Qué significa el número en 'C4'?",
          options: ["El volumen", "La octava en la que está la nota", "La duración", "El dedo que se usa"],
          answerIndex: 1,
          explanation: "C4 significa nota Do en la cuarta octava (el Do central del piano).",
        },
        {
          question: "La frecuencia de referencia universal (La central) es…",
          options: ["C4 = 261.63 Hz", "A4 = 440 Hz", "G4 = 392 Hz", "B4 = 493.88 Hz"],
          answerIndex: 1,
          explanation: "El La central (A4) se afina a 440 Hz y es la referencia mundial de afinación.",
        },
        {
          question: "Entre Mi (E) y Fa (F) existe…",
          options: ["Un tono completo", "Un semitono natural sin nota intermedia", "Un sostenido Mi#", "Una octava"],
          answerIndex: 1,
          explanation: "Mi-Fa y Si-Do son semitonos naturales: no hay nota negra entre ellos.",
        },
        {
          question: "¿Qué nota es el 'Do central' del piano en nomenclatura científica?",
          options: ["C3", "C4", "C5", "A4"],
          answerIndex: 1,
          explanation: "El Do central (middle C) es C4, a 261.63 Hz.",
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
    if (this.noteTimeout) clearTimeout(this.noteTimeout)
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    playNote(index) {
      const note = this.referenceNotes[index] || this.ecoNotes[index]
      if (!note) return
      this.activeNoteIndex = index
      this.playReferenceFreq(note.frequency, 1.4)
      if (this.noteTimeout) clearTimeout(this.noteTimeout)
      this.noteTimeout = setTimeout(() => {
        if (this.activeNoteIndex === index) this.activeNoteIndex = null
      }, 1500)
    },

    async playSequence() {
      if (this.isSequencePlaying) {
        this.isSequencePlaying = false
        return
      }
      this.isSequencePlaying = true
      for (let i = 0; i < this.referenceNotes.length; i++) {
        if (!this.isSequencePlaying) break
        this.activeNoteIndex = i
        this.playReferenceFreq(this.referenceNotes[i].frequency, 0.8)
        await new Promise((r) => setTimeout(r, 900))
      }
      this.isSequencePlaying = false
      this.activeNoteIndex = null
    },

    playReferenceFreq(frequency, duration = 1.4) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
        this.stopTone()

        const ctx = this.audioCtx
        this.osc = ctx.createOscillator()
        this.gain = ctx.createGain()
        this.osc.type = 'sine'
        this.osc.frequency.setValueAtTime(frequency, ctx.currentTime)
        this.gain.gain.setValueAtTime(0, ctx.currentTime)
        this.gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.05)
        this.gain.gain.setValueAtTime(this.volume, ctx.currentTime + duration - 0.3)
        this.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
        this.osc.connect(this.gain)
        this.gain.connect(ctx.destination)
        this.osc.start()
        this.osc.stop(ctx.currentTime + duration)
      } catch (e) {
         
        console.error("Audio error:", e)
      }
    },

    stopTone() {
      try {
        if (this.osc) { this.osc.stop(); this.osc.disconnect(); this.osc = null }
        if (this.gain) { this.gain.disconnect(); this.gain = null }
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