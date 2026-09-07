// constants/pitcher.ts
// All constants for the pitcher (tuner) pages, ported from aui pages/pitcher/constants.js

export const COLORS: string[] = [
  // C (Do) - Rojo #FF0000
  "#FF0000", // C
  "#FF2300", // C+
  "#FF4600", // C♯
  "#FF6900", // C♯+
  // D (Re) - Naranja #FF8C00
  "#FF8C00", // D
  "#FFA900", // D+
  "#FFC600", // D♯
  "#FFE300", // D♯+
  // E (Mi) - Amarillo #FFFF00
  "#FFFF00", // E
  "#98E619", // E+
  // F (Fa) - Verde claro #32CD32
  "#32CD32", // F
  "#25BA46", // F+
  "#19A759", // F♯
  "#0C936D", // F♯+
  // G (Sol) - Aguamarina #008080
  "#008080", // G
  "#136080", // G+
  "#264081", // G♯
  "#392082", // G♯+
  // A (La) - Índigo #4B0082
  "#4B0082", // A
  "#7800A1", // A+
  "#A500C0", // A♯
  "#D200DF", // A♯+
  // B (Si) - Magenta #FF00FF
  "#FF00FF", // B
  "#FF00AA", // B+
  "#FF0055", // Cycle back toward red
]

// Define qué colores necesitan texto blanco para mejor legibilidad
// true = texto blanco, false = texto gris (#666)
export const COLOR_NEEDS_WHITE_TEXT: boolean[] = [
  // C (Do) - rojos oscuros → blanco
  true,  // C  (#FF0000, lum=76)
  true,  // C+ (#FF2300, lum=97)
  true,  // C♯ (#FF4600, lum=117)
  false, // C♯+ (#FF6900, lum=138)
  // D (Re) - naranjas/amarillos → gris
  false, // D  (#FF8C00, lum=158)
  false, // D+ (#FFA900, lum=175)
  false, // D♯ (#FFC600, lum=192)
  false, // D♯+ (#FFE300, lum=209)
  // E (Mi) - amarillo/verde claro → gris
  false, // E  (#FFFF00, lum=226)
  false, // E+ (#98E619, lum=183)
  // F (Fa) - verdes → gris
  false, // F  (#32CD32, lum=141)
  false, // F+ (#25BA46, lum=128)
  // F♯ - verdes oscuros → blanco
  true,  // F♯ (#19A759, lum=116)
  true,  // F♯+ (#0C936D, lum=103)
  // G (Sol) - aguamarina/azul oscuro → blanco
  true,  // G  (#008080, lum=90)
  true,  // G+ (#136080, lum=77)
  true,  // G♯ (#264081, lum=64)
  true,  // G♯+ (#392082, lum=51)
  // A (La) - índigo/紫色 muy oscuro → blanco
  true,  // A  (#4B0082, lum=37)
  true,  // A+ (#7800A1, lum=54)
  true,  // A♯ (#A500C0, lum=71)
  true,  // A♯+ (#D200DF, lum=88)
  // B (Si) - magenta/rosa → blanco
  true,  // B  (#FF00FF, lum=105)
  true,  // B+ (#FF00AA, lum=96)
  true,  // Cycle (#FF0055, lum=86)
]

export const NOTE_SHORT_STRINGS: string[] = ["C", "C+", "C♯", "C♯+", "D", "D+", "D♯", "D♯+", "E", "E+", "F", "F+", "F♯", "F♯+", "G", "G+", "G♯", "G♯+", "A", "A+", "A♯", "A♯+", "B", "B+"]

export const NOTE_LATIN_STRINGS: string[] = ["Do", "Do+", "Do♯", "Do♯+", "Re", "Re+", "Re♯", "Re♯+", "Mi", "Mi+", "Fa", "Fa+", "Fa♯", "Fa♯+", "Sol", "Sol+", "Sol♯", "Sol♯+", "La", "La+", "La♯", "La♯+", "Si", "Si+"]

// ── Tricrotonos: 2 líneas intermedias por semitono (tercios, 36 entradas) ────
const SHORT_ROOTS = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"]
const LATIN_ROOTS = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"]

export const NOTE_SHORT_STRINGS_THIRDS: string[] = SHORT_ROOTS.flatMap((r) => [r, `${r}⅓`, `${r}⅔`])

export const NOTE_LATIN_STRINGS_THIRDS: string[] = LATIN_ROOTS.flatMap((r) => [r, `${r}⅓`, `${r}⅔`])

// Colores raíz (12 notas reales = índices pares de COLORS; se excluye el color
// extra de cierre de ciclo que COLORS trae al final)
const ROOT_COLORS: string[] = COLORS.filter((_, idx) => idx % 2 === 0).slice(0, 12)

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360 / 360
  if (s === 0) {
    const v = Math.round(l * 255).toString(16).padStart(2, "0")
    return `#${v}${v}${v}`.toUpperCase()
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const to = (t: number): string => Math.round(f(t) * 255).toString(16).padStart(2, "0")
  return `#${to(h + 1 / 3)}${to(h)}${to(h - 1 / 3)}`.toUpperCase()
}

/** Interpola en HSL entre cada nota raíz y la siguiente (camino corto de tono).
 *  Devuelve 12 * subdivisions colores. */
export function buildSubdividedPalette(rootColors: string[], subdivisions: number): string[] {
  const out: string[] = []
  const n = rootColors.length
  for (let s = 0; s < n; s++) {
    const [h1, s1, l1] = hexToHsl(rootColors[s]!)
    const [h2raw, s2, l2] = hexToHsl(rootColors[(s + 1) % n]!)
    let dh = h2raw - h1
    if (dh > 180) dh -= 360
    if (dh < -180) dh += 360
    for (let k = 0; k < subdivisions; k++) {
      const t = k / subdivisions
      out.push(hslToHex(h1 + dh * t, s1 + (s2 - s1) * t, l1 + (l2 - l1) * t))
    }
  }
  return out
}

export const COLORS_THIRDS: string[] = buildSubdividedPalette(ROOT_COLORS, 3)

export const MAJOR_STEPS: number[] = [0, 2, 4, 5, 7, 9, 11]
export const MIN_MIDI = 47
export const TOLERANCE_HZ = 1.95
export const A4_FREQ = 440
export const A4_MIDI = 69
export const TEXT_WIDTH = 40

// Add these missing constants that were defined inline in other files
export const NATURAL_POSITIONS: number[] = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
export const BASE_LINE_SPACING = 16
export const STAFF_TOP_OFFSET = 60
export const STEM_LENGTH = 40
export const NOTE_X_OFFSET = 65
export const NOTE_X_B_OFFSET = 45 // Changed from noteXbOffset to camelCase
export const SHORT_LINE_HALF_WIDTH = 15
export const CANVAS_BG_COLOR = "#f5f5f5"
export const SIMBOL_MARGIN = 23
export const MARGIN_LINE = 0
export const LINE_BASE = 130

// ── Default export for auto-import compatibility ──────────────────────────────
export default {
  COLORS,
  COLORS_THIRDS,
  buildSubdividedPalette,
  COLOR_NEEDS_WHITE_TEXT,
  NOTE_SHORT_STRINGS,
  NOTE_SHORT_STRINGS_THIRDS,
  NOTE_LATIN_STRINGS,
  NOTE_LATIN_STRINGS_THIRDS,
  MAJOR_STEPS,
  MIN_MIDI,
  TOLERANCE_HZ,
  A4_FREQ,
  A4_MIDI,
  TEXT_WIDTH,
  NATURAL_POSITIONS,
  BASE_LINE_SPACING,
  STAFF_TOP_OFFSET,
  STEM_LENGTH,
  NOTE_X_OFFSET,
  NOTE_X_B_OFFSET,
  SHORT_LINE_HALF_WIDTH,
  CANVAS_BG_COLOR,
  SIMBOL_MARGIN,
  MARGIN_LINE,
  LINE_BASE,
}
