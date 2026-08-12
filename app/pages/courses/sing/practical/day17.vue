<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 17 · Control de Aire Avanzado" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Cronómetro largo -->
        <CoursesSection icon="mdi-timer-sand" title="Meta de 40 Segundos">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Igual que el Día 2 pero con metas más exigentes. Busca superar tu marca. Exhala con
            Tsss o Chsss a un flujo parejo:
          </p>
          <div class="text-center py-3">
            <div class="text-h2 font-weight-black text-primary my-2 font-mono">{{ timerDisplay }}</div>
            <div class="text-caption text-grey-darken-2 mb-3">Meta actual: {{ metaSeconds }} s</div>

            <VBtn id="btn-singp17-toggle" class="mb-2" size="x-large" :color="running ? 'red-darken-2' : 'primary'"
              @click="toggle">
              <VIcon start>{{ running ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ running ? 'Detener' : 'Comenzar' }}
            </VBtn>
            <div>
              <VBtn id="btn-singp17-reset" class="mt-1 mr-2" variant="outlined" @click="reset">
                <VIcon start>mdi-refresh</VIcon> Reiniciar
              </VBtn>
              <VBtn id="btn-singp17-mark" class="mt-1" color="success" variant="tonal" @click="saveMark">
                <VIcon start>mdi-trophy</VIcon> Guardar marca ({{ lastMark || '—' }}s)
              </VBtn>
            </div>
            <VBtnToggle v-model="mode" mandatory class="mt-3" color="primary" variant="outlined">
              <VBtn id="btn-singp17-mode-tsss" value="tsss">Tsss</VBtn>
              <VBtn id="btn-singp17-mode-chsss" value="chsss">Chsss</VBtn>
            </VBtnToggle>
          </div>
          <VAlert density="compact" variant="outlined" :type="bestMark >= metaSeconds ? 'success' : 'info'">
            Tu mejor marca: <strong>{{ bestMark }} s</strong>.
            {{ bestMark >= metaSeconds ? '¡Has superado la meta de 40 s!' : `Vas por la meta de ${metaSeconds} s.` }}
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Frase de compases -->
        <CoursesSection icon="mdi-music-note" title="Sostén la Frase (Compases)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Simula una frase de 8 compases. Marca el compás para sostener la vocal "Ah" en C4 hasta
            el final del compás 8, respirando solo entre compases si es necesario.
          </p>
          <div class="d-flex align-center justify-center flex-wrap mb-3">
            <template v-for="(beat, i) in 8" :key="beat">
              <VBtn id="btn-singp17-beat" icon size="small" rounded="circle"
                style="width: 42px; height: 42px;"
                class="elevation-2 font-weight-black"
                :color="activeBeat === i ? 'primary' : 'grey-lighten-2'"
                :class="activeBeat === i ? 'text-white' : 'text-grey-darken-3'" @click="playBeat(i)">
                {{ beat }}
              </VBtn>
              <VIcon v-if="i < 7" class="mx-1" size="small" color="grey-lighten-1">mdi-minus</VIcon>
            </template>
          </div>
          <div class="text-center">
            <VBtn id="btn-singp17-phrase" size="large" :color="isPhrase ? 'red-darken-2' : 'primary'"
              @click="playPhrase">
              <VIcon start>{{ isPhrase ? 'mdi-stop' : 'mdi-play' }}</VIcon>
              {{ isPhrase ? 'Detener frase' : 'Reproducir frase completa' }}
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 3: Autoevaluación -->
        <CoursesSection icon="mdi-clipboard-check" title="¿Cómo te va con el aire?">
          <VRadioGroup v-model="airSelfCheck" :disabled="airSelfDone">
            <VRadio v-for="option in airLevels" :key="option" :label="option" :value="option" />
          </VRadioGroup>
          <VBtn id="btn-singp17-self" class="mb-2" color="primary" :disabled="!airSelfCheck || airSelfDone"
            @click="airSelfDone = true">
            Confirmar mi nivel
          </VBtn>
          <VAlert v-if="airSelfDone" type="success" density="compact" variant="outlined">
            {{ airLevels.indexOf(airSelfCheck) + 1 }} de 4: "{{ airSelfCheck }}". Regresa a este
            ejercicio cada semana para superarte.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingPracticalDay17",
  data() {
    return {
      showContent: true,
      mode: "tsss",
      running: false,
      elapsed: 0,
      timerInterval: null,
      bestMark: 0,

      activeBeat: -1,
      isPhrase: false,
      audioCtx: null,
      volume: 0.4,

      airSelfCheck: "",
      airSelfDone: false,
      airLevels: [
        "Menos de 15 segundos con Tsss",
        "Entre 15 y 25 segundos",
        "Entre 25 y 40 segundos",
        "Más de 40 segundos con control",
      ],
    }
  },

  computed: {
    timerDisplay() {
      const s = Math.floor(this.elapsed)
      return `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`
    },

    metaSeconds() {
      return 40
    },

    lastMark() {
      return this.bestMark > 0 ? `${this.bestMark}s` : null
    },
  },

  beforeUnmount() {
    if (this.timerInterval) clearInterval(this.timerInterval)
    this.isPhrase = false
    this.stopTone()
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },

    toggle() {
      if (this.running) {
        clearInterval(this.timerInterval)
        this.timerInterval = null
        this.running = false
        this.saveMark()
        return
      }
      this.elapsed = 0
      this.running = true
      this.timerInterval = setInterval(() => { this.elapsed += 1 }, 1000)
    },

    reset() {
      clearInterval(this.timerInterval)
      this.timerInterval = null
      this.running = false
      this.elapsed = 0
    },

    saveMark() {
      if (this.elapsed > this.bestMark) this.bestMark = this.elapsed
    },

    playBeat(i) {
      this.activeBeat = i
      this.playTone(261.63, 0.6)
    },

    async playPhrase() {
      if (this.isPhrase) {
        this.isPhrase = false
        return
      }
      this.isPhrase = true
      for (let i = 0; i < 8; i++) {
        if (!this.isPhrase) break
        this.activeBeat = i
        this.playTone(261.63, 1.1)
        await new Promise((r) => setTimeout(r, 1200))
      }
      this.isPhrase = false
      this.activeBeat = -1
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
        if (this.audioCtx && typeof this.audioCtx.close === 'function') this.audioCtx.close()
      } catch (e) { /* noop */ }
    },
  },
}
</script>