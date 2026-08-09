// audioProcessors/ap_deepseek.ts
// Detector de tono optimizado para VOZ CANTADA (rango 80 Hz – 1100 Hz).
//
// Mejoras frente a ap_gemini10 / ap_claude9 (autocorrelación clásica):
//   1. Algoritmo YIN (diferencia normalizada acumulada) — la referencia
//      estándar para detección de tono en voz. Elimina el error de octava
//      y el "jitter" de la autocorrelación simple.
//   2. Rango acotado a voz (80–1100 Hz): bajo profundo → soprano agudo.
//   3. Highpass a 60 Hz: corta el retumbar subsónico sin tocar el grave vocal.
//   4. Puerta de ruido con tolerancia a "misses" (no congela en respiros).
//   5. Suavizado adaptativo: mediana ligera en notas estables, pase directo
//      en glissandos (sin lag).
//
// Nota: YIN no aplica ventana a la señal — su normalización acumulada asume
// señal sin ventana; aplicar Hann sesgaría el período estimado.
import { A4_FREQ, A4_MIDI } from "~/constants/pitcher"
import type { AnalysisResult, PitcherAudioProcessor } from "~/services/pitcher/audioProcessor"

type FloatBuffer = Float32Array<ArrayBuffer>

interface YinResult {
  freq: number
  clarity: number
}

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
  MIN_DB = 10 // Captura voces suaves
  sensitivity = 0.005
  MISS_TOLERANCE = 4 // Frames de bajo volumen antes de resetear

  // Parámetros YIN
  YIN_THRESHOLD = 0.12 // Cruce de la función normalizada (típico 0.1–0.15)

  // Suavizado adaptativo (en cents)
  STRICT_THRESHOLD = 15 // Nota estable por debajo de esto
  GLIDE_THRESHOLD = 400 // Glissando vocal por encima de esto

  // Estado de seguimiento
  missCount = 0
  lastFreq = -1
  isTracking = false
  recentFreqs: number[] = []
  MEDIAN_WINDOW = 3

  // Calibración de ruido
  noiseSamples: number[] = []
  noiseCalibrating = false

  // Buffers reutilizables de YIN
  diff: FloatBuffer | null = null
  cmnd: FloatBuffer | null = null

  async initializeMicrophone(): Promise<boolean> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.audioContext = new Ctor()
    this.sampleRate = this.audioContext.sampleRate

    this.analyser = this.audioContext.createAnalyser()
    // 4096 muestras: resolución suficiente para 80 Hz y CPU baja
    this.analyser.fftSize = 4096
    this.buffer = new Float32Array(this.analyser.fftSize)

    const source = this.audioContext.createMediaStreamSource(this.mediaStream)

    // Refuerza la señal suave (voz lejos del micrófono)
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = 4

    // Highpass a 60 Hz: elimina el retumbar subsónico sin atenuar el grave vocal (80 Hz+)
    const filter = this.audioContext.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.value = 60
    filter.Q.value = 0.7

    source.connect(gainNode)
    gainNode.connect(filter)
    filter.connect(this.analyser)
    this.isMicActive = true
    return true
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

    // Puerta de ruido: solo resetea tras varios frames bajos (respiros no congelan)
    if (dB < this.MIN_DB || rms < this.sensitivity) {
      this.missCount++
      if (this.missCount > this.MISS_TOLERANCE) {
        this.resetTracking()
      }
      return { freq: -1, dB }
    }
    this.missCount = 0

    const yin = this.yinPitch(this.buffer)
    if (yin.freq <= 0) {
      // Señal no periódica (ruido, soplido) → tratar como silencio
      this.missCount++
      if (this.missCount > this.MISS_TOLERANCE) {
        this.resetTracking()
      }
      return { freq: -1, dB }
    }

    return { freq: yin.freq, dB, rms }
  }

  /**
   * Detección de tono YIN sobre la señal en dominio temporal.
   * Devuelve -1 si no hay un período claro.
   */
  yinPitch(buf: FloatBuffer): YinResult {
    const SIZE = buf.length
    const tauMin = Math.floor(this.sampleRate / this.MAX_FREQ)
    const tauMax = Math.min(Math.floor(this.sampleRate / this.MIN_FREQ), Math.floor(SIZE / 2) - 1)
    if (tauMax <= tauMin) return { freq: -1, clarity: 0 }

    if (!this.diff || this.diff.length !== SIZE) {
      this.diff = new Float32Array(SIZE)
      this.cmnd = new Float32Array(SIZE)
    }
    const diff = this.diff!
    const cmnd = this.cmnd!

    // 1. Función de diferencia d(τ) = Σ (x[i] − x[i+τ])²
    for (let tau = tauMin; tau <= tauMax; tau++) {
      let sum = 0
      for (let i = 0; i < SIZE - tau; i++) {
        const delta = buf[i]! - buf[i + tau]!
        sum += delta * delta
      }
      diff[tau] = sum
    }

    // 2. Diferencia normalizada acumulada d'(τ) = d(τ) · τ / Σₖ d(k)
    let runningSum = 0
    let tau0 = -1
    let bestTau = -1
    let bestValue = Infinity
    for (let tau = tauMin; tau <= tauMax; tau++) {
      runningSum += diff[tau]!
      const value = runningSum === 0 ? 1 : (diff[tau]! * (tau - tauMin + 1)) / runningSum
      cmnd[tau] = value

      if (tau0 < 0 && value < this.YIN_THRESHOLD) {
        // Primer cruce bajo el umbral → estimación del período fundamental
        tau0 = tau
        bestTau = tau
        bestValue = value
      } else if (tau0 >= 0 && tau <= tau0 * 2 && value < bestValue) {
        // Mínimo local en [τ₀, 2τ₀] — la ventana evita elegir un submúltiplo
        bestValue = value
        bestTau = tau
      }
    }

    // Sin cruce bajo el umbral → señal no periódica
    if (tau0 < 0) return { freq: -1, clarity: 0 }

    // 3. Interpolación parabólica para precisión sub-muestral
    let refinedTau = bestTau
    if (bestTau > tauMin && bestTau < tauMax) {
      const y0 = cmnd[bestTau - 1]!
      const y1 = cmnd[bestTau]!
      const y2 = cmnd[bestTau + 1]!
      const denom = y0 - 2 * y1 + y2
      if (Math.abs(denom) > 1e-12) {
        const delta = (y0 - y2) / (2 * denom)
        if (Math.abs(delta) < 1) refinedTau = bestTau + delta
      }
    }

    const freq = this.sampleRate / refinedTau
    if (freq < this.MIN_FREQ || freq > this.MAX_FREQ) {
      return { freq: -1, clarity: 0 }
    }

    // Claridad: 1 − d'(τ). Cerca de 1 = señal muy periódica (tono vocal claro)
    return { freq, clarity: 1 - bestValue }
  }

  smoothFrequency(currentFreq: number): number {
    // Primer frame: inicio inmediato
    if (this.lastFreq === -1) {
      this.lastFreq = currentFreq
      this.isTracking = true
      this.recentFreqs = [currentFreq]
      return currentFreq
    }

    const diffCents = Math.abs(1200 * Math.log2(currentFreq / this.lastFreq))

    if (diffCents < this.GLIDE_THRESHOLD) {
      this.isTracking = true

      // Glissando rápido: pase directo (la mediana añadiría lag)
      if (diffCents > this.STRICT_THRESHOLD) {
        this.lastFreq = currentFreq
        this.recentFreqs = [currentFreq]
        return currentFreq
      }

      // Nota estable: mediana ligera para limpiar el jitter de la voz
      this.recentFreqs.push(currentFreq)
      if (this.recentFreqs.length > this.MEDIAN_WINDOW) this.recentFreqs.shift()

      const sorted = [...this.recentFreqs].sort((a, b) => a - b)
      const medianFreq = sorted[Math.floor(sorted.length / 2)]!
      this.lastFreq = medianFreq
      return medianFreq
    } else {
      // Salto brusco: nueva nota (cambio de registro) — aceptar al instante
      this.lastFreq = currentFreq
      this.recentFreqs = [currentFreq]
      return currentFreq
    }
  }

  calibrateNoise(): Promise<void> {
    this.noiseCalibrating = true
    this.noiseSamples = []
    return new Promise((resolve) => {
      const capture = () => {
        if (this.noiseSamples.length < 30) {
          this.analyser?.getFloatTimeDomainData(this.buffer!)
          let s = 0
          for (let i = 0; i < this.buffer!.length; i++) {
            const sample = this.buffer![i]!
            s += sample * sample
          }
          this.noiseSamples.push(Math.sqrt(s / this.buffer!.length))
          setTimeout(capture, 20)
        } else {
          // Calibración con recorte de outliers (10% superior e inferior)
          const sorted = [...this.noiseSamples].sort((a, b) => a - b)
          const trimCount = Math.floor(sorted.length * 0.1)
          const trimmed = sorted.slice(trimCount, -trimCount)
          const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length

          // Umbral = 1.8x el ruido de fondo, con piso para voces suaves
          this.sensitivity = Math.max(0.002, avg * 1.8)
          this.noiseCalibrating = false
          resolve()
        }
      }
      capture()
    })
  }

  resetTracking(): void {
    this.lastFreq = -1
    this.isTracking = false
    this.recentFreqs = []
    this.missCount = 0
  }

  async cleanupMicrophone(): Promise<void> {
    if (this.mediaStream) this.mediaStream.getTracks().forEach((t) => t.stop())
    if (this.audioContext) await this.audioContext.close()
    this.isMicActive = false
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
