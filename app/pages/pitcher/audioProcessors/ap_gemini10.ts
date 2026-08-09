// audioProcessors/ap_gemini10.ts
// audioProcessor.js - Optimización "Ultra-Fast" para Glissandos Cortos
import { A4_FREQ, A4_MIDI } from "~/constants/pitcher"
import type { AnalysisResult, PitcherAudioProcessor } from "~/services/pitcher/audioProcessor"

type FloatBuffer = Float32Array<ArrayBuffer>

export class AudioProcessor implements PitcherAudioProcessor {
  mediaStream: MediaStream | null = null
  audioContext: AudioContext | null = null
  analyser: AnalyserNode | null = null
  buffer: FloatBuffer | null = null
  isMicActive = false
  sampleRate = 44100

  noiseSamples: number[] = []
  noiseCalibrating = false

  correlationArray: FloatBuffer | null = null
  lastFreq = -1
  consecutiveCount = 0
  isTracking = false

  // Miss tolerance: how many consecutive low-volume frames before truly resetting
  missCount = 0
  MISS_TOLERANCE = 4

  // Filtro de Mediana reducido al mínimo para no añadir lag
  recentFreqs: number[] = []
  MEDIAN_WINDOW = 2

  // Sensibilidad para no perder puntos en movimientos rápidos
  MIN_DB = 10 // Lowered to capture soft/quiet notes
  sensitivity = 0.005

  // CONFIGURACIÓN PARA GLISSANDOS ULTRA-CORTOS:
  STRICT_THRESHOLD = 20 // Más laxo al inicio para enganchar rápido
  GLIDE_THRESHOLD = 300 // 300 cents: permite rastrear cambios extremos
  CONSECUTIVE_THRESHOLD = 1 // DIBUJO INSTANTÁNEO (Máxima densidad de puntos)

  MIN_FREQ = 40
  MAX_FREQ = 2000

  async initializeMicrophone(): Promise<boolean> {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    })
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.audioContext = new Ctor()
    this.sampleRate = this.audioContext.sampleRate
    this.analyser = this.audioContext.createAnalyser()

    // Mantenemos 4096 para precisión, pero el análisis será más frecuente
    this.analyser.fftSize = 4096
    this.buffer = new Float32Array(this.analyser.fftSize)

    const source = this.audioContext.createMediaStreamSource(this.mediaStream)

    // Boost soft input signals so low-volume notes reach the analyser
    const gainNode = this.audioContext.createGain()
    gainNode.gain.value = 4

    // Highpass filter to remove subsonic rumble; avoids the narrow 440 Hz bandpass
    // that was attenuating notes far from A4
    const filter = this.audioContext.createBiquadFilter()
    filter.type = "highpass"
    filter.frequency.value = 40
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

    // Only reset after MISS_TOLERANCE consecutive low-volume frames so brief
    // dips (breath, soft passage) don't freeze the histogram
    if (dB < this.MIN_DB || rms < this.sensitivity) {
      this.missCount++
      if (this.missCount > this.MISS_TOLERANCE) {
        this.resetTracking()
      }
      return { freq: -1, dB }
    }
    this.missCount = 0 // reset miss counter on good frame

    return this.autoCorrelate(this.buffer, dB, rms)
  }

  autoCorrelate(buf: FloatBuffer, dB: number, rms: number): AnalysisResult {
    const SIZE = buf.length
    if (!this.correlationArray) this.correlationArray = new Float32Array(SIZE)
    const corr = this.correlationArray!

    const winBuf = new Float32Array(buf)
    for (let i = 0; i < SIZE; i++) {
      winBuf[i] = winBuf[i]! * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (SIZE - 1)))
    }

    let maxCorr = -1
    let bestLag = -1
    const minLag = Math.floor(this.sampleRate / this.MAX_FREQ)
    const maxLag = Math.floor(this.sampleRate / this.MIN_FREQ)

    for (let lag = minLag; lag < maxLag; lag++) {
      let corrSum = 0
      for (let i = 0; i < SIZE - lag; i++) {
        corrSum += winBuf[i]! * winBuf[i + lag]!
      }
      corr[lag] = corrSum
      if (corrSum > maxCorr) {
        maxCorr = corrSum
        bestLag = lag
      }
    }

    // Lowered confidence gate so quiet (low RMS) signals are not discarded
    if (maxCorr < 0.02) return { freq: -1, dB }

    let refinedLag = bestLag
    if (bestLag > 0 && bestLag < SIZE - 1) {
      const y1 = corr[bestLag - 1]!
      const y2 = corr[bestLag]!
      const y3 = corr[bestLag + 1]!
      const delta = (y3 - y1) / (2 * (2 * y2 - y1 - y3))
      refinedLag = bestLag + delta
    }

    const freq = this.sampleRate / refinedLag
    return { freq, dB, rms }
  }

  smoothFrequency(currentFreq: number): number {
    if (this.lastFreq === -1) {
      this.lastFreq = currentFreq
      this.consecutiveCount = 1
      this.isTracking = true // Inicio inmediato
      return currentFreq
    }

    const diffCents = Math.abs(1200 * Math.log2(currentFreq / this.lastFreq))
    const currentThreshold = this.isTracking ? this.GLIDE_THRESHOLD : this.STRICT_THRESHOLD

    if (diffCents < currentThreshold) {
      this.consecutiveCount++
      this.isTracking = true

      // Si detectamos movimiento rápido (típico de glissando), saltamos el filtro de mediana
      if (diffCents > 30) {
        this.lastFreq = currentFreq
        return currentFreq
      }

      // Para notas estables, mantenemos el suavizado de Claude8
      this.recentFreqs.push(currentFreq)
      if (this.recentFreqs.length > this.MEDIAN_WINDOW) this.recentFreqs.shift()

      const sorted = [...this.recentFreqs].sort((a, b) => a - b)
      const medianFreq = sorted[Math.floor(sorted.length / 2)]!

      this.lastFreq = medianFreq
      return medianFreq
    } else {
      if (this.isTracking) {
        // While tracking, a big jump is more likely a new note than noise.
        // Accept it immediately so the histogram never freezes mid-singing.
        this.lastFreq = currentFreq
        this.recentFreqs = [currentFreq]
        return currentFreq
      }
      // Not yet tracking: discard this frame, wait for stability
      this.lastFreq = currentFreq
      return -1
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
          // Calibración con recorte de outliers (estilo ap_claude8)
          const sorted = [...this.noiseSamples].sort((a, b) => a - b)
          const trimCount = Math.floor(sorted.length * 0.1)
          const trimmed = sorted.slice(trimCount, -trimCount)
          const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length

          // Use 1.8x multiplier (was 2.5x) so the threshold doesn't cut soft notes
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
    this.consecutiveCount = 0
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
