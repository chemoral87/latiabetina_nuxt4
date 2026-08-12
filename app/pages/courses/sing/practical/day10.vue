<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 10 · Colocación y Proyección" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Humming + nasales -->
        <CoursesSection icon="mdi-account-voice" title="Humming y Nasales para la Máscara">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La "M" ("mmm"), la "N" ("nnn") y la "NG" colocan la voz adelante. Empieza tarareando
            cerrado y luego abre a una vocal manteniendo la posición.
          </p>

          <VRow density="comfortable">
            <VCol v-for="hum in hums" :key="hum.sound" md="3" sm="6" cols="12">
              <VCard variant="outlined" style="cursor:pointer;" class="pa-3 text-center mb-2"
                :color="hum.active ? 'grey-lighten-4' : 'transparent'" @click="playHum(hum)">
                <div :style="`background:${hum.bg}; width:48px; height:48px; border-radius:50%; margin: 0 auto 10px; font-weight:900; color:${hum.color}; display:flex; align-items:center; justify-content:center; font-size:1.4rem;`">
                  {{ hum.sound }}
                </div>
                <div class="text-subtitle-2 font-weight-bold">{{ hum.name }}</div>
                <div class="text-caption text-grey-darken-2">{{ hum.tip }}</div>
                <VBtn id="btn-singp10-hum" class="mt-2" size="small" color="primary" variant="tonal">
                  <VIcon start size="small">mdi-play</VIcon> Guía
                </VBtn>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="info" density="compact" variant="outlined">
            Ejercicio clave: tararea "MMM" y siente el cosquilleo nasal; luego abre a "MAAA" sin
            perder la vibración frontal. La vocal debe "nacer" en la máscara.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Proyección escalonada -->
        <CoursesSection icon="mdi-stairs-up" title="Escalera de Proyección">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Practica la proyección en intensidades progresivas sobre una misma nota (C4). Como en el
            piano <strong>piano → mezzoforte → forte</strong>, sin gritar.
          </p>
          <div class="d-flex align-center justify-center gap-2 mb-3 flex-wrap">
            <template v-for="(p, i) in projectionSteps" :key="p.label">
              <VCard variant="outlined" style="cursor:pointer;" class="pa-2 px-3 text-center"
                :color="activeStep === i ? 'grey-lighten-4' : 'transparent'" @click="playStep(i)">
                <div class="text-subtitle-1 font-weight-bold">{{ p.symbol }}</div>
                <div class="text-caption text-grey-darken-2">{{ p.label }}</div>
              </VCard>
              <VIcon v-if="i < projectionSteps.length - 1" size="small" color="grey-lighten-1">mdi-chevron-right</VIcon>
            </template>
          </div>
          <VAlert type="success" density="compact" variant="outlined">
            Empezar suave y crecer: la proyección sana nace del control, no del grito. Si en el
            "forte" sientes la garganta, vuelve a suave y refuerza el apoyo.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Quiz -->
        <CoursesSection icon="mdi-help-circle-outline" title="Ponte a Prueba: Colocación">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Pregunta {{ qIndex + 1 }} de {{ quiz.length }}</span>
              <span class="font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>
            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp10-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp10-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">mdi-headphones</VIcon>
            <h3 class="text-h5 font-weight-bold mt-3">¡Colocación lista!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">Puntos: {{ score }} / {{ quiz.length }}</p>
            <VBtn id="btn-singp10-quiz-retry" color="primary" @click="resetQuiz">
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
  name: "SingPracticalDay10",
  data() {
    return {
      showContent: true,
      audioCtx: null,
      volume: 0.4,
      activeStep: null,

      hums: [
        { sound: "M", name: "Mmm", tip: "Labios juntos, cosquilleo nasal", freq: 196, bg: "#e3f2fd", color: "#1565c0", active: false },
        { sound: "N", name: "Nnn", tip: "Lengua en el paladar, resonancia alta", freq: 220, bg: "#fce4ec", color: "#c2185b", active: false },
        { sound: "NG", name: "Ng", tip: "Como 'hang', garganta suave", freq: 262, bg: "#e8f5e9", color: "#2e7d32", active: false },
        { sound: "V?", name: "Vnn", tip: "Vocal abierta sobre la 'n'", freq: 330, bg: "#fff3e0", color: "#e65100", active: false },
      ],

      projectionSteps: [
        { symbol: "p", label: "Piano (suave)" },
        { symbol: "mp", label: "Mezzopiano" },
        { symbol: "mf", label: "Mezzoforte" },
        { symbol: "f", label: "Forte (fuerte)" },
      ],

      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "La colocación 'en la máscara' se refiere a…",
          options: ["Vibrar en nariz, labios y mejillas", "Cantar con la boca cerrada", "Vibrar en los pies", "Ninguna"],
          answerIndex: 0,
          explanation: "La máscara es la zona facial donde la resonancia frontal da brillo y agudos fáciles.",
        },
        {
          question: "El humming ('mmm') sirve para…",
          options: ["Encontrar y entrenar la colocación adelante", "Cantar más grave", "Calentar el estómago", "Nada"],
          answerIndex: 0,
          explanation: "La 'M' vibra en la nariz y labios: el punto exacto de la máscara.",
        },
        {
          question: "La proyección (= volumen) eficiente proviene de…",
          options: ["Gritar muy fuerte", "Resonancias superpuestas + apoyo", "Toser", "Subir los hombros"],
          answerIndex: 0,
          explanation: "Proyectar bien es unir resonancias frontales con apoyo del abdomen, no forzar la garganta.",
        },
        {
          question: "Al proyectar 'forte', si sientes la garganta…",
          options: ["Sigue gritando", "Baja a suave y refuerza el apoyo", "Cambia de canción", "No hagas nada"],
          answerIndex: 1,
          explanation: "El dolor es señal de fuerza: se corrige bajando la intensidad y re-apoyando con el abdomen.",
        },
        {
          question: "¿Cuál NO es un resonador de la voz?",
          options: ["Nariz / senos", "Boca / paladar duro", "El hígado", "Pecho"],
          answerIndex: 2,
          explanation: "Nariz, boca, garganta y pecho son resonadores. El hígado no participa en la voz.",
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
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    playHum(hum) {
      hum.active = !hum.active
      this.hums = this.hums.map((h) => ({ ...h, active: h.sound === hum.sound }))
      this.playTone(hum.freq, 1.4)
    },

    playStep(i) {
      this.activeStep = i
      const gains = [0.15, 0.3, 0.5, 0.75]
      this.playToneWithGain(293.66, gains[i], 1.4)
    },

    playTone(frequency, duration) {
      this.playToneWithGain(frequency, 0.4, duration)
    },

    playToneWithGain(frequency, volume, duration = 1.2) {
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
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
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