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
  COLOR_NEEDS_WHITE_TEXT,
  NOTE_SHORT_STRINGS,
  NOTE_LATIN_STRINGS,
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
