// services/pitcher/audioProcessor.ts
// Handles microphone access, noise calibration, and audio processing.
// Ported from aui pages/pitcher/audioProcessor.js — the reference processor
// implementation. The tuner page dynamically loads the variants under
// app/pages/pitcher/audioProcessors/ instead, but all of them share this shape.
import { A4_FREQ, A4_MIDI } from "~/constants/pitcher"

export interface AnalysisResult {
  freq: number
  dB: number
  rms?: number
}

/**
 * Common contract implemented by every pitcher audio processor
 * (ap_claude9 / ap_gemini10). Lets the page hold a typed instance
 * regardless of which variant was loaded dynamically.
 */
export interface PitcherAudioProcessor {
  initializeMicrophone(): Promise<boolean>
  cleanupMicrophone(): Promise<void>
  calibrateNoise(): Promise<void>
  analyzeFrequency(): AnalysisResult
  smoothFrequency(freq: number): number
  setSensitivity(s: number): void
  getSensitivity(): number
  reset(): void
}

type FloatBuffer = Float32Array<ArrayBuffer>

export class AudioProcessor implements PitcherAudioProcessor {
  mediaStream: MediaStream | null = null
  audioContext: AudioContext | null = null
  analyser: AnalyserNode | null = null
  buffer: FloatBuffer | null = null
  isMicActive = false
  sampleRate = 44100

  // Noise calibration properties
  noiseProfile: number | null = null
  noiseSamples: number[] = []
  noiseCalibrating = false

  // Frequency analysis properties
  correlationArray: FloatBuffer | null = null
  lastFreq: number | null = null
  sensitivity = 0.005

  // Constants for audio processing
  MIN_DB = 28
  MIN_SAMPLE_THRESHOLD = 0.008
  PEAK_THRESHOLD_FACTOR = 0.2
  WINDOW_PADDING = 10
  OCTAVE_THRESHOLD_LOW = 1.8
  OCTAVE_THRESHOLD_HIGH = 2.2
  HALF_OCTAVE_THRESHOLD_LOW = 0.45
  HALF_OCTAVE_THRESHOLD_HIGH = 0.55
  SMOOTHING_FACTOR = 0.3

  // ==================== MICROPHONE METHODS ====================

  async initializeMicrophone(): Promise<boolean> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      // Create audio context and analyser
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioContext = new Ctor()
      this.sampleRate = this.audioContext.sampleRate

      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.3

      this.buffer = new Float32Array(this.analyser.fftSize)

      // Connect microphone to analyser
      const source = this.audioContext.createMediaStreamSource(this.mediaStream)
      source.connect(this.analyser)

      this.isMicActive = true
      return true
    } catch (error) {
      this.isMicActive = false
      throw error
    }
  }

  getAudioData(): Float32Array | null {
    if (!this.analyser || !this.isMicActive || !this.buffer) {
      return null
    }

    this.analyser.getFloatTimeDomainData(this.buffer)
    return new Float32Array(this.buffer) // Return a copy
  }

  getRMS(): number {
    const data = this.getAudioData()
    if (!data) return 0

    let sumSquares = 0
    for (let i = 0; i < data.length; i++) {
      const sample = data[i]!
      sumSquares += sample * sample
    }
    return Math.sqrt(sumSquares / data.length)
  }

  getdBSPL(): number {
    const rms = this.getRMS()
    return 20 * Math.log10(rms / 0.00002)
  }

  async cleanupMicrophone(): Promise<void> {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close()
      this.audioContext = null
    }

    this.analyser = null
    this.buffer = null
    this.isMicActive = false
  }

  // ==================== NOISE CALIBRATION METHODS ====================

  calibrateNoise(): Promise<void> {
    if (!this.analyser || !this.isMicActive) {
      throw new Error("Microphone not active")
    }

    this.noiseCalibrating = true
    this.noiseSamples = []

    return new Promise((resolve) => {
      const captureNoise = () => {
        if (this.noiseSamples.length < 180 && this.analyser && this.noiseCalibrating && this.buffer) {
          this.analyser.getFloatTimeDomainData(this.buffer)

          let sumSquares = 0
          for (let i = 0; i < this.buffer.length; i++) {
            const sample = this.buffer[i]!
            sumSquares += sample * sample
          }
          const rms = Math.sqrt(sumSquares / this.buffer.length)
          this.noiseSamples.push(rms)

          setTimeout(captureNoise, 16)
        } else if (this.noiseSamples.length > 0) {
          this.calculateNoiseProfile()
          resolve()
        } else {
          this.noiseCalibrating = false
          resolve()
        }
      }

      captureNoise()
    })
  }

  calculateNoiseProfile(): void {
    const sortedSamples = [...this.noiseSamples].sort((a, b) => a - b)

    const p10Index = Math.floor(sortedSamples.length * 0.1)
    const p90Index = Math.floor(sortedSamples.length * 0.9)
    const filteredSamples = sortedSamples.slice(p10Index, p90Index)

    const avgNoise = filteredSamples.reduce((a, b) => a + b, 0) / filteredSamples.length
    const medianIndex = Math.floor(filteredSamples.length / 2)
    const medianNoise = filteredSamples[medianIndex]!

    this.noiseProfile = (avgNoise + medianNoise) / 2

    const recommendedSensitivity = Math.max(0.003, Math.min(0.12, this.noiseProfile * 3.5))
    this.sensitivity = recommendedSensitivity

    this.noiseCalibrating = false
  }

  cancelNoiseCalibration(): void {
    this.noiseCalibrating = false
  }

  // ==================== FREQUENCY ANALYSIS METHODS ====================

  analyzeFrequency(): AnalysisResult {
    if (!this.analyser || !this.isMicActive || !this.buffer) {
      return { freq: -1, dB: 0, rms: 0 }
    }

    this.analyser.getFloatTimeDomainData(this.buffer)
    return this.autoCorrelate(this.buffer, this.sampleRate)
  }

  autoCorrelate(buf: FloatBuffer, sampleRate: number): AnalysisResult {
    const SIZE = buf.length

    let sumSquares = 0
    let maxSample = 0

    for (let i = 0; i < SIZE; i++) {
      const sample = buf[i]!
      sumSquares += sample * sample
      if (Math.abs(sample) > maxSample) maxSample = Math.abs(sample)
    }

    const rms = Math.sqrt(sumSquares / SIZE)
    const dBSPL = 20 * Math.log10(rms / 0.00002)

    if (dBSPL < this.MIN_DB || rms < this.sensitivity || maxSample < this.MIN_SAMPLE_THRESHOLD) {
      return { freq: -1, dB: dBSPL, rms }
    }

    const threshold = maxSample * this.PEAK_THRESHOLD_FACTOR
    let start = 0
    let end = SIZE - 1

    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buf[i]!) > threshold) {
        start = Math.max(0, i - this.WINDOW_PADDING)
        break
      }
    }

    for (let i = SIZE - 1; i > SIZE / 2; i--) {
      if (Math.abs(buf[i]!) > threshold) {
        end = Math.min(SIZE - 1, i + this.WINDOW_PADDING)
        break
      }
    }

    const windowSize = end - start
    if (windowSize <= 0) return { freq: -1, dB: dBSPL, rms }

    if (!this.correlationArray || this.correlationArray.length < windowSize) {
      this.correlationArray = new Float32Array(windowSize)
    }
    const corr = this.correlationArray!

    for (let lag = 0; lag < windowSize; lag++) {
      let sum = 0
      for (let i = 0; i < windowSize - lag; i++) {
        sum += buf[start + i]! * buf[start + i + lag]!
      }
      corr[lag] = sum
    }

    let dipIndex = 0
    while (dipIndex < windowSize - 1 && corr[dipIndex]! > corr[dipIndex + 1]!) {
      dipIndex++
    }

    let maxVal = -Infinity
    let peakIndex = -1
    for (let i = dipIndex; i < windowSize; i++) {
      const c = corr[i]!
      if (c > maxVal) {
        maxVal = c
        peakIndex = i
      }
    }

    if (peakIndex <= 0) return { freq: -1, dB: dBSPL, rms }

    let betterPeak = peakIndex
    if (peakIndex > 0 && peakIndex < windowSize - 1) {
      const y1 = corr[peakIndex - 1]!
      const y2 = corr[peakIndex]!
      const y3 = corr[peakIndex + 1]!
      const delta = (y1 - y3) / (2 * (y1 - 2 * y2 + y3))
      if (!isNaN(delta) && Math.abs(delta) < 1) {
        betterPeak = peakIndex + delta
      }
    }

    let freq = sampleRate / betterPeak

    const checkHarmonic = (divisor: number, thresholdRatio: number): number => {
      const subIndex = Math.floor(peakIndex / divisor)
      if (subIndex > 0 && subIndex < windowSize) {
        const subVal = corr[subIndex]!
        if (subVal > thresholdRatio * maxVal) {
          return sampleRate / subIndex
        }
      }
      return freq
    }

    if (freq > 0 && freq < 2000) {
      if (freq > 160 && freq < 800) {
        freq = checkHarmonic(2, 0.8)
      } else if (freq > 240 && freq < 1200) {
        freq = checkHarmonic(3, 0.7)
      }
    }

    return {
      freq: freq > 20 && freq < 2000 ? freq : -1,
      dB: dBSPL,
      rms,
    }
  }

  smoothFrequency(currentFreq: number): number {
    if (!this.lastFreq) {
      this.lastFreq = currentFreq
      return currentFreq
    }

    const ratio = currentFreq / this.lastFreq

    if (ratio > this.OCTAVE_THRESHOLD_LOW && ratio < this.OCTAVE_THRESHOLD_HIGH) {
      currentFreq = (currentFreq + this.lastFreq * 2) * 0.5
    } else if (ratio > this.HALF_OCTAVE_THRESHOLD_LOW && ratio < this.HALF_OCTAVE_THRESHOLD_HIGH) {
      currentFreq = (currentFreq + this.lastFreq * 0.5) * 0.5
    }

    this.lastFreq = this.lastFreq * (1 - this.SMOOTHING_FACTOR) + currentFreq * this.SMOOTHING_FACTOR

    return this.lastFreq
  }

  // ==================== UTILITY METHODS ====================

  setSensitivity(sensitivity: number): void {
    this.sensitivity = sensitivity
  }

  getSensitivity(): number {
    return this.sensitivity
  }

  getStatus() {
    return {
      isMicActive: this.isMicActive,
      isCalibrating: this.noiseCalibrating,
      noiseProfile: this.noiseProfile,
      sensitivity: this.sensitivity,
      sampleRate: this.sampleRate,
    }
  }

  reset(): void {
    this.lastFreq = null
    this.correlationArray = null
  }

  // Helper methods for frequency conversion
  midiToFreq(midi: number): number {
    return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12)
  }

  freqToMidi(freq: number): number {
    if (freq <= 0) return 0
    return 69 + 12 * Math.log2(freq / A4_FREQ)
  }
}
