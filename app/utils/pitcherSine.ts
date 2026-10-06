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

/** Formas de onda soportadas por la guía del histograma. */
export type SineWaveType = 'sine' | 'triangle' | 'square'

export const SINE_WAVE_TYPES: SineWaveType[] = ['sine', 'triangle', 'square']

/**
 * Factor 0..1 del avance dentro de un tramo (t ∈ [0, 1]) según la forma de onda:
 * senoidal = coseno (plana en las notas), triangular = lineal, cuadrada = salto
 * inmediato a la nota destino (escalonada).
 */
export function sineStepFactor(t: number, type: SineWaveType): number {
  if (type === 'triangle') return t
  if (type === 'square') return t > 0 ? 1 : 0
  return (1 - Math.cos(Math.PI * t)) / 2
}

/**
 * MIDI de una línea lo↔hi (una nota, modo de 2 notas) en la fase dada.
 * Fase 0..π sube, π..2π baja; la cuadrada se mantiene en cada extremo medio ciclo.
 */
export function sineSegmentMidi(lo: number, hi: number, phase: number, type: SineWaveType): number {
  const TWO_PI = Math.PI * 2
  const p = ((phase % TWO_PI) + TWO_PI) % TWO_PI
  if (type === 'square') return p < Math.PI ? hi : lo
  const u = p / Math.PI
  const t = u <= 1 ? u : 2 - u
  return lo + (hi - lo) * sineStepFactor(t, type)
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
 * Onda única que recorre la lista en orden (para listas de más de 2 notas).
 *
 * Los pasos alternan SUBIR / BAJAR: el 1.º sube a la siguiente nota (a su primera
 * aparición por encima), el 2.º baja a la siguiente (primera aparición por debajo), y
 * así sucesivamente. Una misma nota consecutiva salta una octava completa.
 *   "F#,G#,F#,A" → F#→G# (+2), G#→F# (−2), F#→A (+3), A→F# (−3): F# sube a G#, vuelve a F#,
 *                  sube a A, vuelve a F#.
 *   rotación 1 ("G#,F#,A,F#") → G#→F# alto (+10), F#→A bajo (−9), A→F# alto (+9),
 *                  F#→G# bajo (−10).
 *
 * `rotation` mueve los primeros `rotation` elementos al final antes de construir la onda
 * (rotation = 1: "F#,G#,F#,A" → "G#,F#,A,F#"); cada rotación empieza subiendo.
 *
 * Para que la onda cierre el ciclo (la última nota regresa exactamente a la primera) el
 * desplazamiento total debe ser 0: si no lo es (p. ej. "A,C,E,G"), el salto más grande en
 * el sentido sobrante se invierte (±12) hasta cerrar.
 *
 * Devuelve el MIDI absoluto de cada nodo (misma longitud que la lista); la octava es la
 * más grave que deja toda la onda dentro de [minMidi, …]. Si por arriba excede el
 * rango, quien dibuja agrega la copia 12 semitonos más abajo.
 */
export function buildSineSequence(pitchClasses: number[], minMidi: number, rotation = 0): number[] | null {
  const n = pitchClasses.length
  if (n < 2) return null

  const r = ((rotation % n) + n) % n
  const pcs = [...pitchClasses.slice(r), ...pitchClasses.slice(0, r)]

  const steps: number[] = []
  for (let i = 0; i < n; i++) {
    const from = pcs[i]!
    const to = pcs[(i + 1) % n]!
    if (i % 2 === 0) {
      // Sube: primera aparición de `to` por encima de `from` (1..12 semitonos)
      steps.push(mod12(to - from) || 12)
    } else {
      // Baja: primera aparición de `to` por debajo de `from` (−1..−12 semitonos)
      steps.push(-(mod12(from - to) || 12))
    }
  }

  let total = steps.reduce((a, b) => a + b, 0) // múltiplo de 12
  while (total !== 0) {
    const idx = total > 0 ? steps.indexOf(Math.max(...steps)) : steps.indexOf(Math.min(...steps))
    const fix = total > 0 ? -12 : 12
    steps[idx] = steps[idx]! + fix
    total += fix
  }

  const rel: number[] = [0]
  for (let i = 0; i < n - 1; i++) rel.push(rel[i]! + steps[i]!)

  const base0 = minMidi - Math.min(...rel)
  const base = base0 + mod12(pcs[0]! - base0)
  return rel.map(v => base + v)
}

/**
 * MIDI (fraccionario) de la onda de `buildSineSequence` para una fase en radianes.
 * Cada paso dura media vuelta de fase (π): con "Ciclo (seg)" = una subida y bajada,
 * la lista completa dura (n / 2) ciclos. Fase 0 = primera nota. Cada paso interpola
 * según `type` (coseno por defecto), así que en cada nota la curva queda plana.
 */
export function sineSequenceMidi(points: number[], phase: number, type: SineWaveType = 'sine'): number {
  const n = points.length
  const u = phase / Math.PI
  const s = ((u % n) + n) % n
  const j = Math.floor(s)
  const t = s - j
  const a = points[j]!
  const b = points[(j + 1) % n]!
  return a + (b - a) * sineStepFactor(t, type)
}

/**
 * Fase (radianes) de la onda en una columna del histograma.
 * `tick`: ticks transcurridos desde el inicio; `column`: 0 = columna más nueva.
 * Con tick = 0 y column = 0 la fase es 0 (la línea está abajo en "ahora").
 */
export function sinePhase(tick: number, column: number, cycleSeconds: number): number {
  return (2 * Math.PI * (tick - column) * (HISTORY_DT_MS / 1000)) / cycleSeconds
}
