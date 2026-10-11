// Detección de acordes por picos del espectro (FFT del AnalyserNode del mic).
// Es un picker de picos con filtrado de armónicos, no un afinador polifónico:
// sirve para iluminar las notas de un acorde en notaciones/histograma.
export function detectChordFrequencies(analyser: AnalyserNode, maxNotes = 3): number[] {
  const bins = analyser.frequencyBinCount
  const data = new Float32Array(bins)
  analyser.getFloatFrequencyData(data)
  const binHz = analyser.context.sampleRate / 2 / bins

  let maxDb = -Infinity
  for (let i = 0; i < bins; i++) {
    if (data[i]! > maxDb) maxDb = data[i]!
  }
  if (maxDb < -80) return [] // silencio

  const threshold = maxDb - 40
  const raw: { freq: number; db: number }[] = []
  for (let i = 2; i < bins - 2; i++) {
    const v = data[i]!
    if (v < threshold) continue
    if (v > data[i - 1]! && v >= data[i + 1]! && v > data[i - 2]! && v >= data[i + 2]!) {
      const y1 = data[i - 1]!
      const y2 = v
      const y3 = data[i + 1]!
      const denom = y1 - 2 * y2 + y3
      const delta = denom !== 0 ? (0.5 * (y1 - y3)) / denom : 0
      const freq = (i + delta) * binHz
      if (freq >= 70 && freq <= 2200) raw.push({ freq, db: v })
    }
  }
  // Consolida picos cercanos (ripple/beatido FFT): deja el más fuerte si están a <8%.
  raw.sort((a, b) => a.freq - b.freq)
  const peaks: typeof raw = []
  for (const p of raw) {
    const last = peaks[peaks.length - 1]
    if (last && p.freq / last.freq < 1.08) {
      if (p.db > last.db) peaks[peaks.length - 1] = p
    } else {
      peaks.push(p)
    }
  }

  // Acepta el pico más grave como fundamental; descarta los que son múltiplos
  // enteros (×2..×6) de uno ya aceptado. Una nota solita → solo el fundamental.
  // No se infieren subarmónicos (C4+G4 no implica C3: el quinto real colisiona).
  const kept: typeof peaks = []
  for (const p of peaks) {
    if (kept.length >= maxNotes) break
    const isHarmonic = kept.some(k => {
      const ratio = p.freq / k.freq
      for (let n = 2; n <= 6; n++) {
        if (Math.abs(ratio - n) < 0.06) return true
      }
      return false
    })
    if (!isHarmonic) kept.push(p)
  }
  return kept.map(p => p.freq)
}
