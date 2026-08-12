<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 1 · Autoevaluación de tu Voz" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Referencia de notas -->
        <CoursesSection icon="mdi-music-note" title="Tono de Referencia (La4 = 440 Hz)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Antes de evaluar tu voz, afina tu oído a la nota internacional de referencia:
            <strong>La4 = 440 Hz</strong>. Pulsa el botón y tararea o canta la nota imitando el sonido.
            Esta es la nota que usamos para afinar instrumentos, y el punto de partida de tu
            entonación.
          </p>

          <div class="text-center py-4">
            <VBtn id="btn-singp1-play-440" class="mb-3" size="x-large"
              :color="isPlaying ? 'red-darken-2' : 'primary'" @click="playReference">
              <VIcon start>{{ isPlaying ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isPlaying ? 'Detener La4' : 'Escuchar La4 (440 Hz)' }}
            </VBtn>

            <div class="mt-2">
              <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-1 px-8">
                <span>Volumen</span>
                <span>{{ Math.round(volume * 100) }}%</span>
              </div>
              <VSlider v-model="volume" max="1" min="0" step="0.05" class="px-8" hide-details
                color="primary" density="compact" track-color="grey-lighten-2" />
            </div>
          </div>
        </CoursesSection>

        <!-- SECCION 2: Cuestionario de atributos -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Atributos de la Voz">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-2 text-grey-darken-2">Pregunta {{ currentQuestionIndex + 1 }} de {{
                quizQuestions.length }}</span>
              <span class="text-subtitle-2 font-weight-bold text-primary">Puntuación: {{ score }}</span>
            </div>

            <VProgressLinear rounded height="6"
              class="mb-4" color="primary" bg-color="grey-lighten-3" :model-value="(currentQuestionIndex / quizQuestions.length) * 100" />

            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">
              {{ currentQuestion.question }}
            </p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp1-quiz-option" block variant="outlined" :disabled="isAnswered"
                  :color="getOptionColor(idx)" class="quiz-option-btn py-5 text-left justify-start"
                  @click="checkAnswer(idx)">
                  <VIcon start class="mr-2" :color="getOptionIconColor(idx)">
                    {{ getOptionIcon(idx) }}
                  </VIcon>
                  <span style="color: inherit;" class="text-truncate text-body-2 font-weight-medium">{{ option
                  }}</span>
                </VBtn>
              </VCol>
            </VRow>

            <VExpandTransition>
              <div v-if="isAnswered" class="mt-4">
                <VAlert class="mb-4"
                  density="compact" variant="outlined" :type="selectedAnswer === currentQuestion.answerIndex ? 'success' : 'error'">
                  <div class="font-weight-bold mb-1">
                    {{ selectedAnswer === currentQuestion.answerIndex ? '¡Correcto!' : 'Incorrecto' }}
                  </div>
                  <div class="text-body-2">{{ currentQuestion.explanation }}</div>
                </VAlert>

                <div class="d-flex justify-end">
                  <VBtn id="btn-singp1-quiz-next" color="primary" @click="nextQuestion">
                    {{ currentQuestionIndex + 1 === quizQuestions.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">
              {{ score >= 4 ? 'mdi-trophy-outline' : 'mdi-school-outline' }}
            </VIcon>
            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mt-3">¡Cuestionario Completado!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold mt-1">
              Tu puntuación: {{ score }} / {{ quizQuestions.length }}
            </p>
            <VCard max-width="500" variant="outlined" class="pa-4 my-4 mx-auto bg-grey-lighten-5">
              <p class="text-body-1 mb-0 text-grey-darken-3">{{ quizFeedbackMessage }}</p>
            </VCard>
            <VBtn id="btn-singp1-quiz-retry" class="mt-2" size="large" color="primary" @click="resetQuiz">
              <VIcon start>mdi-refresh</VIcon>
              Intentar de nuevo
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 3: Juego: las tres partes -->
        <CoursesSection icon="mdi-puzzle" title="Juego: ¿Dónde está cada parte?">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Relaciona cada parte del modelo <strong>productor · vibrador · amplificador</strong> con
            su equivalente en la voz. Toca sobre la parte correcta.
          </p>

          <VRow density="comfortable">
            <VCol v-for="item in partsGame" :key="item.key" md="4" sm="6" cols="12">
              <VCard variant="outlined" class="pa-4 fill-height">
                <div class="text-body-2 font-weight-bold text-grey-darken-4 mb-3">{{ item.question }}</div>
                <div v-for="(choice, cIdx) in item.options" :key="cIdx" class="mb-2">
                  <VBtn id="btn-singp1-parts-option" block size="small" variant="outlined"
                    :disabled="item.done" :color="getPartsOptionColor(item, choice)"
                    @click="answerParts(item, choice)">
                    <VIcon start :class="getPartsIconClass(item, choice)">{{ getPartsIcon(item,
                    choice) }}</VIcon>
                    {{ choice }}
                  </VBtn>
                </div>
              </VCard>
            </VCol>
          </VRow>

          <VAlert v-if="partsGame.every((item) => item.done)" class="mt-4" type="success"
            density="compact" variant="outlined">
            ¡Lo lograste! Toda la mecánica del ukelele, del piano y de tu voz usa las mismas tres
            piezas. Ahora sigue: cada parte se entrena por separado en este curso.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 4: Ejercicio de color -->
        <CoursesSection icon="mdi-palette-swatch" title="Ejercicio de Color con Vocales">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Canta la vocal <strong>AH</strong> en una nota cómoda y luego cambia lentamente a
            <strong>OH</strong> y <strong>OO</strong>. Notarás cómo cambia la <strong>forma</strong> de tu
            boca y el <strong>color</strong> del sonido (de brillante a más oscuro). Practica
            exagerando ligeramente cada forma.
          </p>
          <VRow class="mb-2" density="comfortable">
            <VCol v-for="v in vowels" :key="v.vowel" cols="4">
              <VCard variant="outlined" class="pa-3 text-center fill-height" :style="`cursor:pointer; border-color:${v.selected ? '#1976d2' : 'rgba(0,0,0,0.15)'} !important;`"
                @click="selectVowel(v.vowel)">
                <div class="text-h3 font-weight-bold text-primary">{{ v.vowel }}</div>
                <div class="text-caption text-grey-darken-2 mt-1">{{ v.color }}</div>
                <div class="text-caption text-grey-darken-1">{{ v.shape }}</div>
                <VBtn id="btn-singp1-vowel-play" class="mt-2" size="small" variant="text" color="grey-darken-2"
                  @click.stop="playVowel(v.vowel)">
                  <VIcon start size="small">mdi-play</VIcon>
                  Escuchar
                </VBtn>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="info" class="mt-3" density="compact" variant="outlined">
            Usa el botón <strong>Escuchar</strong> para oír la nota de referencia y canta la vocal sobre
            ella. Repite la secuencia AH → OH → OO varias veces.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingPracticalDay1",
  data() {
    return {
      showContent: true,
      isPlaying: false,
      volume: 0.4,
      audioCtx: null,
      osc: null,
      gain: null,
      vowelBaseFreq: 261.63,

      vowels: [
        { vowel: "AH", color: "Brillante / abierto", shape: "Boca abierta, lengua baja" },
        { vowel: "OH", color: "Medio / redondeado", shape: "Labios redondeados, boca media" },
        { vowel: "OO", color: "Oscuro / cerrado", shape: "Labios en 'u', cavidad amplia" },
      ],

      quizCompleted: false,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      score: 0,

      quizQuestions: [
        {
          question: "En el modelo de tres partes de todo instrumento, el PRODUCTOR de la voz es…",
          options: ["Las cuerdas vocales", "El aire que viene del diafragma", "La boca", "Los labios"],
          answerIndex: 1,
          explanation: "El productor es la energía que hace sonar el instrumento. En tu voz es el flujo de aire sostenido por el diafragma."
        },
        {
          question: "El VIBRADOR de tu voz es…",
          options: ["Las cavidades de la nariz", "El pecho", "Las cuerdas vocales", "La lengua"],
          answerIndex: 2,
          explanation: "Las cuerdas vocales vibran con el aire y transforman la energía en tono: son el corazón sonoro del instrumento."
        },
        {
          question: "El AMPLIFICADOR de tu voz está formado por…",
          options: ["Los pulmones", "Las cavidades de resonancia (pecho, boca, nariz)", "Los dientes", "El diafragma"],
          answerIndex: 1,
          explanation: "Las cavidades resonantes amplifican el sonido y le dan volumen y color, como la caja de un ukelele."
        },
        {
          question: "¿Qué atributo de la voz describe la 'firma sonora' única de cada persona?",
          options: ["Proyección", "Color (Timbre)", "Afinación", "Apoyo"],
          answerIndex: 1,
          explanation: "El color o timbre es lo que hace que dos voces suenen distintas sobre la misma nota y volumen."
        },
        {
          question: "La proyección (volumen) saludable viene principalmente de…",
          options: ["Forzar la garganta", "Gritar más fuerte", "Apoyo respiratorio y resonancia", "Cantar más agudo"],
          answerIndex: 2,
          explanation: "La proyección se logra con apoyo del diafragma y resonancia eficiente, nunca forzando la garganta."
        },
        {
          question: "El cosquilleo en labios y nariz al tararear indica una colocación…",
          options: ["De pecho", "Frontal (máscara)", "Ninguna", "Gutural"],
          answerIndex: 1,
          explanation: "La vibración frontal en labios y nariz es el punto de colocación llamado 'máscara', ideal para brillo y agudos."
        },
        {
          question: "Cantar 'un poco más arriba' mentalmente corrige con frecuencia…",
          options: ["Los graves demasiado altos", "Los agudos gritados", "Los bajos (notas demasiado graves)", "La respiración"],
          answerIndex: 2,
          explanation: "Las notas quedadas por debajo del tono suelen corregirse pensando la nota 'arriba', sin tensar."
        },
        {
          question: "¿Cuál es la nota internacional de referencia equivalente a 440 Hz?",
          options: ["Do central (C4)", "La central (A4)", "Sol (G4)", "Mi (E4)"],
          answerIndex: 1,
          explanation: "El La4 (A4) se afina universalmente a 440 Hz. Es el estándar para afinar instrumentos y voces."
        },
      ],

      partsGame: [
        {
          key: "productor",
          question: "El ukelele suena cuando la mano pulsa la cuerda. ¿Cuál es el productor de la voz?",
          answer: "El aire del diafragma",
          options: ["El aire del diafragma", "Las cuerdas vocales", "La caja de resonancia"],
          done: false,
        },
        {
          key: "vibrador",
          question: "En el ukelele vibra la cuerda. ¿Qué vibra en tu voz?",
          answer: "Las cuerdas vocales",
          options: ["El pecho", "Las cuerdas vocales", "La lengua"],
          done: false,
        },
        {
          key: "amplificador",
          question: "El ukelele suena fuerte gracias a su caja. ¿Qué amplifica tu voz?",
          answer: "Las cavidades del pecho, boca y nariz",
          options: ["Los pulmones", "Los hombros", "Las cavidades del pecho, boca y nariz"],
          done: false,
        },
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quizQuestions[this.currentQuestionIndex]
    },

    quizFeedbackMessage() {
      if (this.score === this.quizQuestions.length) {
        return `¡Perfecto! ${this.score}/${this.quizQuestions.length} — Dominas los conceptos fundamentales de la voz. ¡Excelente inicio!`
      } else if (this.score >= this.quizQuestions.length - 2) {
        return "¡Muy bien! Tienes la base clara. Repasa en la teoría del Día 1 los conceptos que fallaste."
      } else if (this.score >= this.quizQuestions.length * 0.6) {
        return "¡Buen esfuerzo! Vuelve a la parte teórica del Día 1 y refuerza los atributos de la voz."
      } else {
        return "No te desanimes: la voz es un instrumento nuevo. Repasa la teoría y vuelve a intentarlo."
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

    playVowel(vowel) {
      const freqMap = { AH: 261.63, OH: 196.00, OO: 164.81 }
      this.playReferenceFreq(freqMap[vowel] || this.vowelBaseFreq)
    },

    playReference() {
      if (this.isPlaying) {
        this.stopTone()
        this.isPlaying = false
        return
      }
      this.playReferenceFreq(440)
      this.isPlaying = true
    },

    playReferenceFreq(frequency, duration = 1.6) {
      if (typeof window === 'undefined') return
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext
        if (!AudioCtxClass) return

        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioCtxClass()
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume()
        }

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

        this.osc.onended = () => {
          if (!this.isLooping) {
            this.isPlaying = false
            this.osc = null
            this.gain = null
          }
        }
      } catch (e) {
         
        console.error("No se pudo generar sonido:", e)
      }
    },

    stopTone() {
      try {
        if (this.osc) {
          this.osc.stop()
          this.osc.disconnect()
          this.osc = null
        }
        if (this.gain) {
          this.gain.disconnect()
          this.gain = null
        }
      } catch (e) {
        /* noop */
      }
    },

    selectVowel(vowel) {
      this.vowels = this.vowels.map((v) => ({ ...v, selected: v.vowel === vowel }))
    },

    checkAnswer(optionIdx) {
      this.selectedAnswer = optionIdx
      this.isAnswered = true
      if (optionIdx === this.currentQuestion.answerIndex) {
        this.score++
      }
    },

    getOptionColor(idx) {
      if (!this.isAnswered) return "grey darken-2"
      if (idx === this.currentQuestion.answerIndex) return "success"
      if (idx === this.selectedAnswer) return "error"
      return "bg-grey-lighten-2"
    },

    getOptionIcon(idx) {
      if (!this.isAnswered) return "mdi-radiobox-blank"
      if (idx === this.currentQuestion.answerIndex) return "mdi-check-circle"
      if (idx === this.selectedAnswer) return "mdi-close-circle"
      return "mdi-minus-circle-outline"
    },

    getOptionIconColor(idx) {
      if (!this.isAnswered) return "grey darken-1"
      if (idx === this.currentQuestion.answerIndex) return "success"
      if (idx === this.selectedAnswer) return "error"
      return "bg-grey-lighten-1"
    },

    nextQuestion() {
      this.isAnswered = false
      this.selectedAnswer = null
      if (this.currentQuestionIndex + 1 < this.quizQuestions.length) {
        this.currentQuestionIndex++
      } else {
        this.quizCompleted = true
      }
    },

    resetQuiz() {
      this.currentQuestionIndex = 0
      this.score = 0
      this.selectedAnswer = null
      this.isAnswered = false
      this.quizCompleted = false
    },

    getPartsOptionColor(item, choice) {
      if (!item.done) return "grey-darken-2"
      return choice === item.answer ? "success" : "error"
    },

    getPartsIcon(item, choice) {
      if (!item.done) return "mdi-radiobox-blank"
      return choice === item.answer ? "mdi-check-circle" : "mdi-close-circle"
    },

    getPartsIconClass(item, choice) {
      if (!item.done) return "text-grey-darken-1"
      return "" 
    },

    answerParts(item, choice) {
      if (item.done) return
      item.done = true
      item.selected = choice
    },
  },
}
</script>