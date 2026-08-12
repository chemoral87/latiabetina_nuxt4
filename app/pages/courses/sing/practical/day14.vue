<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 14 · Acordes en tu Voz" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Arpegios de acordes -->
        <CoursesSection icon="mdi-music-accidental-flat" title="Arpegios Mayores y Menores">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Un <strong>arpegio</strong> es cantar las notas del acorde <em>una a una</em> (Do-Mi-Sol).
            Es la mejor forma de entrenar tu voz con acordes. Reproduce y canta:
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 text-center mb-2">
                <VChip class="mb-2" size="small" color="orange" variant="elevated">C Mayor</VChip>
                <div class="font-mono text-h6 font-weight-bold">Do–Mi–Sol–Do</div>
                <VBtn id="btn-singp14-cmaj" class="mt-2" size="small" color="orange" variant="tonal" @click="playArpeggio('major')">
                  <VIcon start size="small">mdi-play</VIcon> Escuchar
                </VBtn>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 text-center mb-2">
                <VChip class="mb-2" size="small" variant="elevated" color="deep-purple">C Menor</VChip>
                <div class="font-mono text-h6 font-weight-bold">Do–Mib–Sol–Do</div>
                <VBtn id="btn-singp14-cmin" class="mt-2" size="small" variant="tonal" color="deep-purple" @click="playArpeggio('minor')">
                  <VIcon start size="small">mdi-play</VIcon> Escuchar
                </VBtn>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 text-center mb-2">
                <VChip class="mb-2" color="blue" size="small" variant="elevated">G Mayor</VChip>
                <div class="font-mono text-h6 font-weight-bold">Sol–Si–Re–Sol</div>
                <VBtn id="btn-singp14-gmaj" class="mt-2" color="blue" size="small" variant="tonal" @click="playArpeggio('gmajor')">
                  <VIcon start size="small">mdi-play</VIcon> Escuchar
                </VBtn>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="success" density="compact" variant="outlined">
            Cantar un arpegio mayor y luego el menor sobre las mismas notas te entrena el
            <strong>color</strong>: la única diferencia es la 3ª nota, y tu voz debe saber resaltarla.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Constructor de acordes -->
        <CoursesSection icon="mdi-puzzle-edit-outline" title="Constructor de Triadas">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Elige una raíz y el tipo, y escucha el acorde completo sonando a la vez. Luego canta
            cada nota por separado.
          </p>
          <div class="text-center mb-3">
            <VBtnToggle v-model="selectedRoot" mandatory class="mb-2" color="primary" variant="outlined"
              density="comfortable">
              <VBtn v-for="root in roots" id="btn-singp14-root" :key="root" :value="root">
                {{ root }}
              </VBtn>
            </VBtnToggle>
            <div>
              <VBtnToggle v-model="selectedType" mandatory class="mb-2" color="primary" variant="outlined"
                density="comfortable">
                <VBtn id="btn-singp14-type-maj" value="major">
                  <span class="font-weight-bold">Mayor</span>
                </VBtn>
                <VBtn id="btn-singp14-type-min" value="minor">
                  <span class="font-weight-bold">Menor</span>
                </VBtn>
              </VBtnToggle>
            </div>
            <VBtn id="btn-singp14-build" class="mt-2" size="large" color="primary" @click="playChord">
              <VIcon start>mdi-play-circle</VIcon>
              Escuchar {{ selectedRoot }} {{ selectedType === 'major' ? 'Mayor' : 'Menor' }}
            </VBtn>
          </div>

          <VCard variant="outlined" class="pa-3 bg-grey-lighten-5 mb-2">
            <div class="text-body-1 text-center font-mono font-weight-bold text-primary">
              {{ chordNotesText }}
            </div>
            <p class="text-body-2 text-center text-grey-darken-2 mt-2 mb-0">
              Canta cada nota del arpegio y luego las tres juntas mentalmente: así "escuchas" el acorde.
            </p>
          </VCard>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Acordes">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp14-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp14-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-music-accidental-natural</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Acordes y voz unidos!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp14-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay14",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.4,
      selectedRoot: "C",
      selectedType: "major",
      roots: ["C", "D", "E", "F", "G", "A"],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "Un acorde es…",
          options: ["Una sola nota", "Un grupo de notas que suenan juntas", "Un silencio", "Un ritmo"],
          answerIndex: 1,
          explanation: "El acorde (especialmente la triada) son 3 notas que suenan simultáneamente.",
        },
        {
          question: "El acorde de Do Mayor (C) está formado por las notas…",
          options: ["Do–Mi–Sol (C-E-G)", "Do–Fa–La", "Mi–Sol–Si", "Re–Fa–La"],
          answerIndex: 0,
          explanation: "Do Mayor = tónica + 3ª mayor + 5ª justa = C–E–G.",
        },
        {
          question: "La única nota que cambia entre un acorde mayor y su menor es…",
          options: ["La raíz", "La 3ª", "La 5ª", "Ninguna"],
          answerIndex: 1,
          explanation: "Mayor usa 3ª mayor; menor la baja a 3ª menor (b3). Cambia el color por completo.",
        },
        {
          question: "Cantar las notas de un acorde una a una se llama…",
          options: ["Arpegio", "Glisando", "Falsete", "Embogue"],
          answerIndex: 0,
          explanation: "El arpegio toca/canta las notas del acorde de forma sucesiva.",
        },
        {
          question: "Un acorde menor transmite un carácter…",
          options: ["Más alegre", "Más melancólico u oscuro", "Más fuerte", "Sin color"],
          answerIndex: 1,
          explanation: "La 3ª menor da ese matiz triste/suave característico del modo menor.",
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    chordNotesText() {
      const freq = this.buildChord()
      if (!freq) return ""
      const names = freq.map((_, i) => ["1ª (Tónica)", "3ª", "5ª", "8ª"][i] || `Nota ${i + 1}`)
      return names.join("  ·  ")
    },
  },

  beforeUnmount() {
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    buildChord() {
      const rootIndex = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9 }[this.selectedRoot]
      if (rootIndex === undefined) return null
      const c4 = 261.63
      const sem = Math.pow(2, 1 / 12)
      const rootFreq = c4 * Math.pow(sem, rootIndex)
      const third = this.selectedType === 'major' ? 4 : 3
      return [rootFreq, rootFreq * Math.pow(sem, third), rootFreq * Math.pow(sem, 7), rootFreq * 2]
    },

    async playArpeggio(type) {
      let freqs
      if (type === 'major') freqs = [261.63, 329.63, 392.00, 523.25]
      else if (type === 'minor') freqs = [261.63, 311.13, 392.00, 523.25]
      else freqs = [392.00, 493.88, 587.33, 783.99]
      for (const f of freqs) {
        this.playTone(f, 0.7)
        await new Promise((r) => setTimeout(r, 800))
      }
      // final sustained chord
      this.playChordTones(freqs, 1.6)
    },

    async playChord() {
      const freqs = this.buildChord()
      if (!freqs) return
      for (const f of freqs) {
        this.playTone(f, 0.6)
        await new Promise((r) => setTimeout(r, 700))
      }
      this.playChordTones(freqs, 1.8)
    },

    playChordTones(freqs, duration) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return
        if (!this.audioCtx || this.audioCtx.state === 'closed') this.audioCtx = new AudioCtxClass()
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume()

        const ctx = this.audioCtx
        for (const f of freqs) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(f, ctx.currentTime)
          gain.gain.setValueAtTime(0, ctx.currentTime)
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1)
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + duration)
        }
      } catch (e) {
         
        console.error("Audio error:", e)
      }
    },

    playTone(frequency, duration = 0.7) {
      try {
        this.playChordTones([frequency], duration)
      } catch (e) {
        /* noop */
      }
    },

    stopTone() {
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