<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 18 · Examen Final" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Examen final -->
        <CoursesSection icon="mdi-trophy" title="Examen Integral (18 marcas)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Repasamos las tres temporadas con <strong>18 preguntas</strong>. Si sacas 15 o más,
            ¡dominas el curso básico de canto completo!
          </p>

          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-2 text-grey-darken-2">Pregunta {{ qIndex + 1 }} / {{ quiz.length }}</span>
              <span class="text-subtitle-2 font-weight-bold text-primary">Puntos: {{ score }}</span>
            </div>

            <VProgressLinear rounded height="6" class="mb-4"
              color="primary" bg-color="grey-lighten-3" :model-value="(qIndex / quiz.length) * 100" />

            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">{{ currentQuestion.question }}</p>

            <VRow class="mb-4" density="comfortable">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" sm="6" cols="12">
                <VBtn id="btn-singp18-quiz-option" block variant="outlined" :disabled="answered"
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
                  <VBtn id="btn-singp18-quiz-next" color="primary" @click="nextQuestion">
                    {{ qIndex + 1 === quiz.length ? 'Ver resultado' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <!-- RESULTADO -->
          <div v-else class="text-center py-6">
            <VIcon size="72" :color="finalGrade.color">{{ finalGrade.icon }}</VIcon>
            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mt-3">{{ finalGrade.title }}</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold">
              {{ score }} / {{ quiz.length }} puntos
            </p>
            <VCard max-width="500" variant="outlined" class="pa-4 my-4 mx-auto bg-grey-lighten-5">
              <p class="text-body-1 mb-0 text-grey-darken-3">{{ finalGrade.message }}</p>
            </VCard>
            <VBtn id="btn-singp18-quiz-retry" class="mt-2" size="large" color="primary" @click="resetQuiz">
              <VIcon start>mdi-refresh</VIcon> Repetir examen
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 2: Después del curso -->
        <CoursesSection title="¿Y ahora qué?" icon="mdi-rocket-launch">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Terminar no significa parar: el canto es un músculo que se mantiene. Aquí tienes tu plan
            de continuación:
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-4 mb-3 fill-height">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="primary">mdi-calendar-month-outline</VIcon>
                  <span class="text-subtitle-1 font-weight-bold">Mantén tu rutina</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="item in nextSteps" :key="item">
                    <template #prepend>
                      <VIcon class="mr-2" size="small" color="green">mdi-check</VIcon>
                    </template>
                    <span class="text-body-2">{{ item }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-4 mb-3 fill-height">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="amber">mdi-lightbulb-on-outline</VIcon>
                  <span class="text-subtitle-1 font-weight-bold">Consejos finales</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="tip in finalTips" :key="tip">
                    <template #prepend>
                      <VIcon class="mr-2" size="small" color="amber">mdi-star</VIcon>
                    </template>
                    <span class="text-body-2">{{ tip }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingPracticalDay18",
  data() {
    return {
      showContent: true,
      qIndex: 0,
      answered: false,
      selected: null,
      score: 0,
      quizCompleted: false,

      quiz: [
        {
          question: "(T1) La respiración correcta al cantar es…",
          options: ["Clavicular", "Costodiafragmática (baja y ancha)", "Solo por la boca", "Rápida"],
          answerIndex: 1,
          explanation: "Día 2: bajar el diafragma y abrir las costillas da aire largo y controlado.",
        },
        {
          question: "(T1) En notación anglosajona, la nota 'C' se llama en latín…",
          options: ["La", "Do", "Re", "Sol"],
          answerIndex: 1,
          explanation: "Día 3: Do = C.",
        },
        {
          question: "(T1) La fórmula de la escala mayor natural es…",
          options: ["T-T-S-T-T-T-S", "T-S-T-S-T-S-T", "S-S-T-S-S-T-", "T-T-T-T-T-T"],
          answerIndex: 0,
          explanation: "Día 4: Tono-Tono-Semitone-Tono-Tono-Tono-Semitone.",
        },
        {
          question: "(T1) El ataque equilibrado de una nota combina…",
          options: ["Fuerza y grito", "Aire y vibración de cuerdas al mismo tiempo", "Solo respiración", "Silencio"],
          answerIndex: 1,
          explanation: "Día 5: el aire y el cierre de las cuerdas llegan juntos = nota limpia.",
        },
        {
          question: "(T1) El glisando es…",
          options: ["Una escala nota a nota", "Un deslizamiento continuo entre notas", "Un acorde", "Un ritmo"],
          answerIndex: 1,
          explanation: "Día 6: se desliza por todas las alturas intermedias sin escalones.",
        },
        {
          question: "(T2) El lip trill es principalmente un ejercicio de…",
          options: ["Relajación sola", "Fuerza y coordinación sin tensión", "Memoria", "Volumen"],
          answerIndex: 1,
          explanation: "Día 7: une apoyo y voz sin tensión, porque el labio no vibra si aprietas.",
        },
        {
          question: "(T2) El vocal fry es un ejercicio de…",
          options: ["Fuerza", "Relajación de las cuerdas", "Ritmo", "Agudos"],
          answerIndex: 1,
          explanation: "Día 7: sonido rasposo muy grave que libera tensión.",
        },
        {
          question: "(T2) Al cantar notas altas, la cara y el cuello deben…",
          options: ["Hacer mucha tensión", "Quedar relajados (disociación)", "Subir los hombros", "Cerrar los ojos"],
          answerIndex: 1,
          explanation: "Día 8: la disociación evita tensión innecesaria en cuello y cara.",
        },
        {
          question: "(T2) El pasaje vocal (passaggio) es…",
          options: ["El punto de cambio de registro", "Una nota grave", "Un ejercicio de respiración", "Un acorde"],
          answerIndex: 0,
          explanation: "Día 9: la zona donde la voz transita entre registros; se entrena para que sea invisible.",
        },
        {
          question: "(T2) La colocación 'en la máscara' significa…",
          options: ["Vibrar en la zona facial (nariz-labios)", "Cantar con la boca cerrada", "Vibrar en el pecho", "Ninguna"],
          answerIndex: 0,
          explanation: "Día 10: la máscara da brillo y proyección a los agudos.",
        },
        {
          question: "(T2) La diferencia entre rango y tesitura es…",
          options: ["Son lo mismo", "Rango = todas las notas; tesitura = la zona cómoda", "Tesitura es más amplia", "Rango solo agudos"],
          answerIndex: 1,
          explanation: "Día 11: el rango son tus límites; la tesitura, tu zona de confort.",
        },
        {
          question: "(T2) Para cantar agudos cómodos conviene…",
          options: ["Bajar la laringe siempre", "Elevar el paladar blando y relajar la lengua", "Apretar la lengua", "Cerrar la garganta"],
          answerIndex: 1,
          explanation: "Día 12: paladar alto y lengua suelta amplían la cavidad y liberan el agudo.",
        },
        {
          question: "(T3) La frecuencia se mide en…",
          options: ["Decibelios", "Hercios (Hz)", "Voltios", "Lumens"],
          answerIndex: 1,
          explanation: "Día 13: Hz = vibraciones por segundo.",
        },
        {
          question: "(T3) El La central de referencia estándar es…",
          options: ["260 Hz", "440 Hz", "432 Hz", "1000 Hz"],
          answerIndex: 1,
          explanation: "Día 13: A4 = 440 Hz, norma ISO internacional.",
        },
        {
          question: "(T3) El acorde de Do Mayor (C) está formado por…",
          options: ["Do-Mi-Sol", "Do-Fa-La", "Mi-Sol-Si", "Re-Fa-La"],
          answerIndex: 0,
          explanation: "Día 14: C = tónica + 3ª + 5ª = C-E-G.",
        },
        {
          question: "(T3) La escala cromática contiene…",
          options: ["5 notas", "7 notas", "Los 12 semitonos", "24 notas"],
          answerIndex: 2,
          explanation: "Día 15: pasa por los 12 semitonos de la octava sin saltar ninguno.",
        },
        {
          question: "(T3) 'Crescendo' significa…",
          options: ["Bajar de volumen", "Subir gradualmente", "Mantener", "Detenerse"],
          answerIndex: 1,
          explanation: "Día 16: la dinámica planifica el volumen durante la frase.",
        },
        {
          question: "(T3) Si te quedas sin aire al final de una frase, lo correcto es…",
          options: ["Aguantar la garganta", "Respirar rápido y silencioso en el silencio", "Cantar sin respirar", "Gritar"],
          answerIndex: 1,
          explanation: "Día 17: la respiración rápida y silenciosa es tu 'cargador' entre frases.",
        },
      ],

      nextSteps: [
        "Repite la rutina de 20 minutos del Día 18 todas las semanas.",
        "Graba una canción cada quince días y compárala con la anterior.",
        "Elige canciones dentro de tu tesitura para crecer cómodo.",
        "Escucha y canta con backings de las tonalidades que aprendiste.",
      ],
      finalTips: [
        "La voz es un músculo: solamente crece con constancia.",
        "Si te duele, descansa: el cuidado vale más que la intensidad.",
        "Canta con la emoción HUMANA: la técnica al servicio de la frase.",
        "Tu voz es tuya: no la compares, ámala y edúcala.",
      ],
    }
  },

  computed: {
    currentQuestion() {
      return this.quiz[this.qIndex]
    },

    finalGrade() {
      const pct = this.score / this.quiz.length
      if (pct >= 0.9) {
        return {
          icon: "mdi-trophy",
          color: "amber",
          title: "¡Excelente! Curso dominado",
          message: "Eres un cantante sólido con base completa. ¡Sigue practicando y expandiendo tu rango!",
        }
      } else if (pct >= 0.75) {
        return {
          icon: "mdi-medal-outline",
          color: "blue",
          title: "¡Muy bien! Casi perfecto",
          message: "Tienes los fundamentos claros. Repasa los días de los temas que fallaste.",
        }
      } else if (pct >= 0.5) {
        return {
          icon: "mdi-school-outline",
          color: "green",
          title: "¡Buen avance!",
          message: "Repasa temporada por temporada y vuelve a intentarlo. La perserverancia rinde.",
        }
      } else {
        return {
          icon: "mdi-sign-direction",
          color: "grey",
          title: "Empieza el repaso",
          message: "No te rindas: vuelve a las temporadas 1 y 2 y toma nota de cada lección.",
        }
      }
    },
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
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