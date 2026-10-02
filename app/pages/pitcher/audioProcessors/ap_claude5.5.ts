// audioProcessors/ap_claude5.5.ts
// Detector de tono para VOZ CANTADA (80 Hz – 1100 Hz). Evolución de ap_deepseek (YIN).
//
// Cambios frente a ap_deepseek:
//   Algoritmo
//   1. Ventana de integración FIJA (W = N − τmax) para todos los lags. En deepseek la
//      suma usaba (SIZE − τ) términos, lo que sesgaba d(τ) hacia lags grandes (octava baja).
//   2. Tras el primer cruce bajo el umbral se desciende al mínimo LOCAL (YIN original),
//      no al mínimo global en [τ0, 2τ0], que podía elegir 2τ0 (error de octava).
//   3. d(τ) se calcula desde τ = 1 → normalización acumulada estándar (deepseek la
//      truncaba en τmin y cruzaba el umbral con demasiada facilidad con ruido).
//   4. Fallback para voz suave/aireada: si nada cruza el umbral, se acepta el mínimo
//      global si cmnd < 0.30 (con claridad baja). La claridad se usa en el suavizado.
//   5. fftSize 2048 (≈46 ms de latencia vs ≈93 ms) y d(τ) = E0 + Eτ − 2·r(τ) con
//      energías por suma prefija: menos de la mitad del costo por frame.
//   Cadena de señal
//   6. echoCancellation / noiseSuppression / autoGainControl DESACTIVADOS (AGC y NS
//      distorsionan un afinador). Sin ganancia ×4: los dB quedan ~12 dB por debajo de
//      ap_deepseek (misma escala que ap_claude9 / ap_gemini10).
//   7. Pasa-bajos (1800 Hz) además del pasa-altos (60 Hz): quita siseos y fricativas.
//   8. AudioContext.resume() si está suspendido (Safari/iOS) y limpieza si falla el init.
//   Puerta y suavizado
//   9. Puerta con histéresis (abre en `sensitivity`, cierra en 0.6×) + tolerancia a respiros.
//  10. Un salto > GLIDE_THRESHOLD necesita JUMP_CONFIRM_FRAMES frames consistentes
//      (±JUMP_AGREE_CENTS) antes de aceptarse; mientras tanto devuelve -1. Elimina los
//      glitches de octava; un cambio real de registro cuesta ~50 ms.
//  11. Frames con claridad < MIN_CLARITY no inician nota ni actualizan la mediana
//      (solo mantienen la nota vigente). Mediana de 5 en notas estables; pase directo
//      en glissandos (15–400 ¢) para no añadir lag.
//   Calibración
//  12. Cancelable: si se apaga el mic durante la calibración NO se modifica la
//      sensibilidad (deepseek la pisaba con el piso 0.002). Usa la mediana (robusta si
//      el usuario canta durante la calibración) y limita el resultado.
//
// Nota: YIN no aplica ventana a la señal — su normalización asume señal sin ventana.
import { A4_FREQ, A4_MIDI } from '~/constants/pitcher'
import type { AnalysisResult, PitcherAudioProcessor } from '~/services/pitcher/audioProcessor'

type FloatBuffer = Float32Array<ArrayBuffer>

interface YinResult {
  freq: number
  clarity: number
}

const NO_PITCH: YinResult = Object.freeze({ freq: -1, clarity: 0 })

export class AudioProcessor implements PitcherAudioProcessor {
  mediaStream: MediaStream | null = null
  audioContext: AudioContext | null = null
  analyser: AnalyserNode | null = null
  buffer: FloatBuffer | null = null
  isMicActive = false
  sampleRate = 44100

  // Rango vocal objetivo (grave profundo → soprano agudo)
  MIN_FREQ = 80
  MAX_FREQ = 1100

  // Puerta de ruido
  MIN_DB = 10 // Red de seguridad: casi nunca limita (rms < sensitivity manda)
  sensitivity = 0.005
  GATE_CLOSE_RATIO = 0.6 // Histéresis: cierra en sensitivity × 0.6
  MISS_TOLERANCE = 4 // Frames sin voz antes de resetear (respiros no congelan)

  // Parámetros YIN
  YIN_THRESHOLD = 0.12 // Cruce de la función normalizada (típico 0.1–0.15)
  YIN_FALLBACK = 0.3 // Sin cruce: se acepta el mínimo global si es menor a esto
  FALLBACK_LOCAL_MIN_MARGIN = 0.05 // Prefiere el mínimo local más corto cerca del global

  // Suavizado adaptativo (en cents)
  STRICT_THRESHOLD = 15 // Nota estable por debajo de esto
  GLIDE_THRESHOLD = 400 // Por encima: posible cambio de registro (hay que confirmarlo)
  JUMP_CONFIRM_FRAMES = 3
  JUMP_AGREE_CENTS = 50
  MIN_CLARITY = 0.75 // Claridad mínima para iniciar nota / actualizar la mediana
  MEDIAN_WINDOW = 5

  // Calibración de ruido
  NOISE_SAMPLES = 30
  NOISE_INTERVAL_MS = 20
  NOISE_FACTOR = 2.0 // sensibilidad = mediana del ruido × factor
  MIN_SENSITIVITY = 0.002
  MAX_SENSITIVITY = 0.05
  noiseCalibrating = false
  private calibrationToken = 0

  // Estado de seguimiento
  private gateOpen = false
  private missCount = 0
  private lastFreq = -1
  private lastClarity = 0
  private recentFreqs: number[] = []
  private pendingFreq = -1
  private pendingCount = 0

  // Buffers reutilizables de YIN
  private cmnd: FloatBuffer | null = null
  private energy: Float64Array | null = null

  async initializeMicrophone(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioContext = new Ctor()
      // Safari/iOS y políticas de autoplay pueden dejar el contexto suspendido
      if (this.audioContext.state === 'suspended') await this.audioContext.resume()
      this.sampleRate = this.audioContext.sampleRate

      this.analyser = this.audioContext.createAnalyser()
      // 2048 muestras: ventana de integración ≥ 2 períodos de 80 Hz y latencia baja
      this.analyser.fftSize = 2048
      this.buffer = new Float32Array(this.analyser.fftSize)

      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // Pasa-altos 60 Hz: elimina el retumbar subsónico sin atenuar el grave vocal (80 Hz+)
      const highpass = this.audioContext.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 60
      highpass.Q.value = 0.7

      // Pasa-bajos 1800 Hz: quita siseos/fricativas que vuelven errática la función YIN
      const lowpass = this.audioContext.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 1800
      lowpass.Q.value = 0.7

      source.connect(highpass)
      highpass.connect(lowpass)
      lowpass.connect(this.analyser)

      this.resetTracking()
      this.isMicActive = true
      return true
    } catch (error) {
      // No dejar el stream / contexto abiertos si algo falló a mitad del init
      await this.cleanupMicrophone()
      throw error
    }
  }

  analyzeFrequency(): AnalysisResult {
    if (!this.analyser || !this.isMicActive || !this.buffer) return { freq: -1, dB: -100 }

    this.analyser.getFloatTimeDomainData(this.buffer)

    let sumSquares = 0
    for (let i = 0; i < this.buffer.length; i++) {
      const sample = this.buffer[i]!
      sumSquares += sample * sample
    }
    const rms = Math.sqrt(sumSquares / this.buffer.length)
    const dB = 20 * Math.log10(rms / 0.00002)

    // Puerta con histéresis: una vez abierta, tolera caer hasta 0.6× la sensibilidad
    const threshold = this.gateOpen ? this.sensitivity * this.GATE_CLOSE_RATIO : this.sensitivity
    if (dB < this.MIN_DB || rms < threshold) {
      this.registerMiss()
      return { freq: -1, dB, rms }
    }
    this.gateOpen = true

    const yin = this.yinPitch(this.buffer)
    if (yin.freq <= 0) {
      // Señal no periódica (ruido, soplido) → tratar como silencio
      this.registerMiss()
      return { freq: -1, dB, rms }
    }

    this.missCount = 0
    this.lastClarity = yin.clarity
    return { freq: yin.freq, dB, rms }
  }

  private registerMiss(): void {
    this.missCount++
    if (this.missCount > this.MISS_TOLERANCE) this.resetTracking()
  }

  /**
   * Detección de tono YIN en el dominio temporal.
   * Devuelve freq = -1 si no hay un período claro.
   */
  yinPitch(buf: FloatBuffer): YinResult {
    const N = buf.length
    const tauMin = Math.max(2, Math.floor(this.sampleRate / this.MAX_FREQ))
    const tauMax = Math.min(Math.floor(this.sampleRate / this.MIN_FREQ), Math.floor(N / 2))
    if (tauMax <= tauMin + 1) return NO_PITCH

    // Ventana de integración fija para todos los lags
    const W = N - tauMax

    if (!this.cmnd || this.cmnd.length < tauMax + 2) this.cmnd = new Float32Array(tauMax + 2)
    if (!this.energy || this.energy.length !== N + 1) this.energy = new Float64Array(N + 1)
    const cmnd = this.cmnd
    const energy = this.energy

    // Energía acumulada: E(a..b) = energy[b] − energy[a]
    energy[0] = 0
    for (let i = 0; i < N; i++) {
      const s = buf[i]!
      energy[i + 1] = energy[i]! + s * s
    }
    const e0 = energy[W]!

    // 1–2. d(τ) = E0 + Eτ − 2·r(τ), y diferencia normalizada acumulada desde τ = 1
    cmnd[0] = 1
    let runningSum = 0
    for (let tau = 1; tau <= tauMax; tau++) {
      let r = 0
      for (let i = 0; i < W; i++) r += buf[i]! * buf[i + tau]!
      let d = e0 + (energy[tau + W]! - energy[tau]!) - 2 * r
      if (d < 0) d = 0 // errores de redondeo
      runningSum += d
      cmnd[tau] = runningSum > 0 ? (d * tau) / runningSum : 1
    }

    // 3. Umbral absoluto: primer cruce → descender al mínimo LOCAL
    let best = -1
    let minVal = Infinity
    let minTau = -1
    for (let tau = tauMin; tau <= tauMax; tau++) {
      const v = cmnd[tau]!
      if (v < minVal) {
        minVal = v
        minTau = tau
      }
      if (v < this.YIN_THRESHOLD) {
        while (tau + 1 <= tauMax && cmnd[tau + 1]! < cmnd[tau]!) tau++
        best = tau
        break
      }
    }

    // 4. Sin cruce: voz suave/aireada → mínimo global si es suficientemente periódico
    if (best < 0) {
      if (minVal >= this.YIN_FALLBACK) return NO_PITCH
      best = minTau
      // Prefiere el mínimo local más corto cerca del global (evita subarmónicos)
      for (let tau = tauMin; tau < tauMax; tau++) {
        const v = cmnd[tau]!
        if (v <= cmnd[tau - 1]! && v < cmnd[tau + 1]! && v < minVal + this.FALLBACK_LOCAL_MIN_MARGIN) {
          best = tau
          break
        }
      }
    }

    // 5. Interpolación parabólica para precisión sub-muestral
    let refinedTau = best
    if (best > 1 && best < tauMax) {
      const y0 = cmnd[best - 1]!
      const y1 = cmnd[best]!
      const y2 = cmnd[best + 1]!
      const denom = y0 - 2 * y1 + y2
      if (Math.abs(denom) > 1e-12) {
        const delta = (y0 - y2) / (2 * denom)
        if (Math.abs(delta) < 1) refinedTau = best + delta
      }
    }

    const freq = this.sampleRate / refinedTau
    if (freq < this.MIN_FREQ || freq > this.MAX_FREQ) return NO_PITCH

    // Claridad: 1 − d'(τ). Cerca de 1 = señal muy periódica (tono vocal claro)
    return { freq, clarity: 1 - cmnd[best]! }
  }

  /**
   * Devuelve la frecuencia estabilizada o -1 si todavía no se puede dibujar
   * (inicio con poca claridad, o salto grande pendiente de confirmación).
   */
  smoothFrequency(currentFreq: number): number {
    const clarity = this.lastClarity

    // Sin nota vigente: iniciar solo con claridad suficiente
    if (this.lastFreq === -1) {
      if (clarity < this.MIN_CLARITY) return -1
      return this.startNote(currentFreq)
    }

    // Frame dudoso durante una nota: mantener la nota vigente sin tocar el estado
    if (clarity < this.MIN_CLARITY) return this.lastFreq

    const diffCents = Math.abs(1200 * Math.log2(currentFreq / this.lastFreq))

    // Salto grande (cambio de registro u error de octava): exigir confirmación
    if (diffCents >= this.GLIDE_THRESHOLD) {
      const agrees = this.pendingFreq > 0 && Math.abs(1200 * Math.log2(currentFreq / this.pendingFreq)) <= this.JUMP_AGREE_CENTS
      if (agrees) {
        this.pendingCount++
      } else {
        this.pendingFreq = currentFreq
        this.pendingCount = 1
      }
      if (this.pendingCount >= this.JUMP_CONFIRM_FRAMES) return this.startNote(currentFreq)
      return -1
    }
    this.pendingFreq = -1
    this.pendingCount = 0

    // Glissando: pase directo (la mediana añadiría lag)
    if (diffCents > this.STRICT_THRESHOLD) {
      this.lastFreq = currentFreq
      this.recentFreqs = [currentFreq]
      return currentFreq
    }

    // Nota estable: mediana para limpiar el jitter de la voz
    this.recentFreqs.push(currentFreq)
    if (this.recentFreqs.length > this.MEDIAN_WINDOW) this.recentFreqs.shift()
    const sorted = [...this.recentFreqs].sort((a, b) => a - b)
    const medianFreq = sorted[Math.floor(sorted.length / 2)]!
    this.lastFreq = medianFreq
    return medianFreq
  }

  private startNote(freq: number): number {
    this.lastFreq = freq
    this.recentFreqs = [freq]
    this.pendingFreq = -1
    this.pendingCount = 0
    return freq
  }

  calibrateNoise(): Promise<void> {
    if (!this.analyser || !this.buffer || !this.isMicActive) return Promise.resolve()

    // Cada llamada invalida la calibración anterior (y cleanupMicrophone también)
    const token = ++this.calibrationToken
    const samples: number[] = []
    this.noiseCalibrating = true

    return new Promise(resolve => {
      const capture = () => {
        // Cancelada (mic apagado / nueva calibración): NO tocar la sensibilidad
        if (token !== this.calibrationToken || !this.analyser || !this.buffer || !this.isMicActive) {
          if (token === this.calibrationToken) this.noiseCalibrating = false
          resolve()
          return
        }

        this.analyser.getFloatTimeDomainData(this.buffer)
        let s = 0
        for (let i = 0; i < this.buffer.length; i++) {
          const sample = this.buffer[i]!
          s += sample * sample
        }
        samples.push(Math.sqrt(s / this.buffer.length))

        if (samples.length < this.NOISE_SAMPLES) {
          setTimeout(capture, this.NOISE_INTERVAL_MS)
          return
        }

        // Mediana: robusta si el usuario canta o hace ruido durante la calibración
        const sorted = [...samples].sort((a, b) => a - b)
        const median = sorted[Math.floor(sorted.length / 2)]!
        this.sensitivity = Math.min(this.MAX_SENSITIVITY, Math.max(this.MIN_SENSITIVITY, median * this.NOISE_FACTOR))
        this.noiseCalibrating = false
        resolve()
      }
      capture()
    })
  }

  resetTracking(): void {
    this.gateOpen = false
    this.missCount = 0
    this.lastFreq = -1
    this.lastClarity = 0
    this.recentFreqs = []
    this.pendingFreq = -1
    this.pendingCount = 0
  }

  async cleanupMicrophone(): Promise<void> {
    this.calibrationToken++ // cancela cualquier calibración en curso
    this.noiseCalibrating = false
    this.isMicActive = false

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop())
      this.mediaStream = null
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close()
    }
    this.audioContext = null
    this.analyser = null
    this.buffer = null
    this.resetTracking()
  }

  setSensitivity(s: number): void {
    this.sensitivity = s
  }

  getSensitivity(): number {
    return this.sensitivity
  }

  reset(): void {
    this.resetTracking()
  }

  midiToFreq(midi: number): number {
    return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
  }

  freqToMidi(freq: number): number {
    if (freq <= 0) return 0
    return 69 + 12 * Math.log2(freq / A4_FREQ)
  }
}
