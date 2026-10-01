// utils/pitcherSine.ts
// Helpers puros para la onda sinusoidal de referencia del histograma del Pitcher
// (campos "Onda (notas)" y "Ciclo (seg)").
import { HISTORY_DT_MS, LATIN_ROOTS, SHORT_ROOTS } from '~/constants/pitcher'

export interface SineSegment {
  /** MIDI de la nota de abajo (donde nace la línea). */
  lo: number
  /** MIDI de la siguiente nota por encima (hasta donde sube la línea). */
  hi: number
}

const mod12 = (n: number): number => ((n % 12) + 12) % 12

/**
 * Notas separadas por coma ("A,C", también "La,Do", con o sin octava "A4", "A#")
 * → clases de altura (0 = C … 11 = B). Devuelve [] si hay menos de 2 notas o
 * alguna no se reconoce.
 */
export function parseSinePitchClasses(text: string): number[] {
  const tokens = text
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length < 2) return []

  const out: number[] = []
  for (const token of tokens) {
    const name = token.replace(/#/g, '♯').replace(/\d/g, '')
    let pc = SHORT_ROOTS.findIndex(n => n.toLowerCase() === name)
    if (pc < 0) pc = LATIN_ROOTS.findIndex(n => n.toLowerCase() === name)
    if (pc < 0) return []
    out.push(pc)
  }
  return out
}

/**
 * Una línea por nota (lista cíclica): cada línea nace abajo en su nota y sube hasta
 * la siguiente nota de la lista que está por encima ("A,C" → C3→A3 y A3→C4).
 * La octava de abajo es la más grave dentro de [minMidi, maxMidi] donde la línea
 * completa cabe; si no cabe en ninguna octava, esa línea se omite.
 */
export function buildSineSegments(pitchClasses: number[], minMidi: number, maxMidi: number): SineSegment[] {
  const n = pitchClasses.length
  if (n < 2) return []

  const segments: SineSegment[] = []
  for (let i = 0; i < n; i++) {
    const bottomPc = pitchClasses[i]!
    const topPc = pitchClasses[(i + 1) % n]!
    for (let lo = minMidi; lo <= maxMidi; lo++) {
      if (mod12(lo) !== bottomPc) continue
      let hi = lo + 1
      while (mod12(hi) !== topPc) hi++
      if (hi <= maxMidi) {
        segments.push({ lo, hi })
        break
      }
    }
  }
  return segments
}

/**
 * Fase (radianes) de la onda en una columna del histograma.
 * `tick`: ticks transcurridos desde el inicio; `column`: 0 = columna más nueva.
 * Con tick = 0 y column = 0 la fase es 0 (la línea está abajo en "ahora").
 */
export function sinePhase(tick: number, column: number, cycleSeconds: number): number {
  return (2 * Math.PI * (tick - column) * (HISTORY_DT_MS / 1000)) / cycleSeconds
}
