<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 12 · Lengua y Paladar Blando" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Ejercicios de lengua -->
        <CoursesSection icon="mdi-tongue" title="Gimnasia de la Lengua">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Sigue cada ejercicio al ritmo de los botones. La lengua debe quedar suelta y flexible,
            nunca tensa.
          </p>
          <VRow density="comfortable">
            <VCol v-for="(ex, i) in tongueExercises" :key="ex.name" md="4" sm="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined" :color="ex.done ? 'light-green-lighten-5' : 'transparent'">
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-subtitle-2 font-weight-bold">{{ i + 1 }}. {{ ex.name }}</span>
                  <VIcon v-if="ex.done" size="small" color="success">mdi-check-circle</VIcon>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-2">{{ ex.detail }}</p>
                <VBtn id="btn-singp12-tongue" size="small" color="primary" variant="tonal" @click="markDone(ex)">
                  <VIcon start size="small">mdi-hand-okay</VIcon>
                  {{ ex.done ? 'Practicado' : 'Hecho' }}
                </VBtn>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Paladar blando -->
        <CoursesSection icon="mdi-tent" title="Eleva el Paladar Blando">
          <div class="text-center py-3 mb-2">
            <VBtnToggle v-model="palateMode" mandatory class="mb-3" color="primary" variant="outlined"
              density="comfortable">
              <VBtn id="btn-singp12-palate-half" value="half" :prepend-icon="palateMode === 'half' ? 'mdi-check' : ''">
                Medio bostezo
              </VBtn>
              <VBtn id="btn-singp12-palate-full" value="full" :prepend-icon="palateMode === 'full' ? 'mdi-check' : ''">
                Bostezo completo
              </VBtn>
            </VBtnToggle>

            <p class="text-body-2 text-grey-darken-2 mb-3 max-width-sm mx-auto">
              {{ palateMode === 'half' ? 'Levanta suavemente el paladar como si empezaras a bostezar y canta una vocal "A".' : 'Bosteza amplio, sosten 2 segundos y canta "AH" manteniendo esa elevación.' }}
            </p>

            <VBtn id="btn-singp12-palate-tone" color="primary" variant="tonal" @click="playPalateTone">
              <VIcon start>mdi-music-note</VIcon>
              Referencia para cantar "AH" con paladar alto
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 3: Frenillo -->
        <CoursesSection icon="mdi-ruler-square" title="Estiramiento del Frenillo">
          <VRow class="mb-2" density="comfortable">
            <VCol v-for="(ex, i) in frenulumPra" :key="ex.name" md="4" sm="6" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="32" class="mb-1" color="deep-purple">{{ ex.icon }}</VIcon>
                <div class="text-subtitle-2 font-weight-bold mb-1">{{ ex.name }}</div>
                <p class="text-body-2 text-grey-darken-1 mb-1">{{ ex.detail }}</p>
                <div class="text-caption text-grey-darken-2">{{ ex.reps }}</div>
                <VBtn id="btn-singp12-fren" class="mt-2" size="small" variant="outlined"
                  color="deep-purple" :disabled="ex.done" @click="ex.done = true">
                  <VIcon start size="small">mdi-check</VIcon>
                  {{ ex.done ? 'Listo' : 'Marcar' }}
                </VBtn>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="warning" density="compact" variant="outlined">
            Ve con calma: los estiramientos <strong>progresivos y constantes</strong> ganan longitud,
            las tirones bruscos lesionan. Si sientes dolor agudo, para.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingPracticalDay12",
  data() {
    return {
      showContent: true,
      palateMode: "half",
      audioCtx: null,
      volume: 0.4,

      tongueExercises: [
        { name: "Rodeo dental", detail: "Pasa la punta de la lengua por todos los dientes, 3 círculos por lado.", done: false },
        { name: "Toque nariz-mentón", detail: "Toca con la lengua la nariz y luego la barbilla, 8 veces alternando.", done: false },
        { name: "La-la-la rápido", detail: "Repite 'la-la-la' cada vez más rápido, 3 series.", done: false },
        { name: "Trabalenguas", detail: "'Tra, tra, tra' y 'tri, tri, tri' articulando la punta.", done: false },
        { name: "Espejo de lengua", detail: "Frente al espejo: lengua plana y ancha, luego fina como una línea, 5 veces.", done: false },
        { name: "Relajación final", detail: "Deja la lengua suelta apoyada, boca entreabierta, respira 5 veces.", done: false },
      ],

      frenulumPra: [
        { name: "Rodeo dental", detail: "Dar movilidad a la punta", reps: "5 vueltas por lado", icon: "mdi-rotate-orbit", done: false },
        { name: "Punta arriba", detail: "Estirar gentilmente hacia el paladar", reps: "10 repeticiones lentas", icon: "mdi-arrow-up", done: false },
        { name: "La-la-la / tra-tra", detail: "Lanzar la punta con agilidad", reps: "3 series cortas", icon: "mdi-text-box", done: false },
      ],
    }
  },

  beforeUnmount() {
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    markDone(ex) {
      ex.done = !ex.done
    },

    playPalateTone() {
      this.playTone(293.66, 1.4)
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
  },
}
</script>