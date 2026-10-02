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
 * Notas separadas por coma ("A,C", también "La,Do", con o sin octava "A4") → clases
 * de altura (0 = C … 11 = B). Acepta sostenidos ("D#", "D♯", "Re#") y bemoles
 * ("Eb", "E♭", "Mib"): "F,D#" y "F,Eb" son equivalentes. Devuelve [] si hay menos de
 * 2 notas o alguna no se reconoce.
 */
export function parseSinePitchClasses(text: string): number[] {
  const tokens = text
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  if (tokens.length < 2) return []

  const out: number[] = []
  for (const token of tokens) {
    const pc = tokenToPitchClass(token)
    if (pc < 0) return []
    out.push(pc)
  }
  return out
}

/** Nota natural o con sostenido ("c", "d♯", "re♯") → clase de altura, o -1. */
function rootToPitchClass(name: string): number {
  const pc = SHORT_ROOTS.findIndex(n => n.toLowerCase() === name)
  return pc >= 0 ? pc : LATIN_ROOTS.findIndex(n => n.toLowerCase() === name)
}

/** Un token (minúsculas, p. ej. "eb", "d#", "sib", "a4") → clase de altura, o -1. */
function tokenToPitchClass(token: string): number {
  const name = token.replace(/#/g, '♯').replace(/♭/g, 'b').replace(/\d/g, '')

  // Directo: natural o sostenido. Va primero para que "b" sea Si (no un bemol vacío).
  const direct = rootToPitchClass(name)
  if (direct >= 0) return direct

  // Bemol: nota natural + "b" ("eb" = D♯, "sib" = A♯, "bb" = A♯). Solo sobre naturales.
  if (name.length > 1 && name.endsWith('b')) {
    const base = name.slice(0, -1)
    if (!base.includes('♯')) {
      const basePc = rootToPitchClass(base)
      if (basePc >= 0) return mod12(basePc - 1)
    }
  }
  return -1
}

/**
 * Una línea por nota (lista cíclica): cada línea nace abajo en su nota y sube hasta
 * la siguiente nota de la lista que está por encima ("A,C" → C3→A3 y A3→C4).
 * La octava de abajo es la más grave dentro de [minMidi, maxMidi] donde la línea
 * completa cabe. Si no cabe en ninguna octava (p. ej. "F,G": G→F de la octava
 * siguiente), se conserva la octava más grave y la línea desborda por arriba
 * (hi > maxMidi); quien dibuja agrega una copia 12 semitonos más abajo para que
 * continúe desde abajo del gráfico.
 */
export function buildSineSegments(pitchClasses: number[], minMidi: number, maxMidi: number): SineSegment[] {
  const n = pitchClasses.length
  if (n < 2) return []

  const segments: SineSegment[] = []
  for (let i = 0; i < n; i++) {
    const bottomPc = pitchClasses[i]!
    const topPc = pitchClasses[(i + 1) % n]!
    let placed = false
    let overflow: SineSegment | null = null
    for (let lo = minMidi; lo <= maxMidi; lo++) {
      if (mod12(lo) !== bottomPc) continue
      let hi = lo + 1
      while (mod12(hi) !== topPc) hi++
      if (hi <= maxMidi) {
        segments.push({ lo, hi })
        placed = true
        break
      }
      // La primera coincidencia (la más grave) es la que se usa si desborda
      if (!overflow) overflow = { lo, hi }
    }
    if (!placed && overflow) segments.push(overflow)
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
