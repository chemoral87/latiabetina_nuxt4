// constants/pitcher.ts
// All constants for the pitcher (tuner) pages, ported from aui pages/pitcher/constants.js

export const COLORS: string[] = [
  // C (Do) and intermediates
  "#FF0000", // C (bright red)
  "#FF4000", // C+
  "#FF8000", // C♯ (orange)
  "#FFB000", // C♯+
  // D (Re)
  "#FFD700", // D (gold)
  "#FFE880", // D+
  "#FFFF00", // D♯ (yellow)
  "#FFFF60", // D♯+
  // E (Mi)
  "#E0FF80", // E
  "#A0FF00", // E+
  // F (Fa)
  "#80FF00", // F (lime)
  "#40FF00", // F+
  "#00FF00", // F♯ (green)
  "#00FF80", // F♯+
  // G (Sol)
  "#00FFC0", // G (aqua)
  "#00FFFF", // G+ (cyan)
  "#00BFFF", // G♯ (sky blue)
  "#0080FF", // G♯+
  // A (La) - Now much brighter!
  "#0060FF", // A (bright blue)
  "#0040FF", // A+
  "#7F5AFF", // A♯ (lighter violet-blue)
  "#A066FF", // A♯+
  // B (Si)
  "#CC00FF", // B (electric purple)
  "#FF00FF", // B+ (magenta)
  "#FF20FF", // Cycle back to red (optional)
]

// Define qué colores necesitan texto blanco para mejor legibilidad
// true = texto blanco, false = texto gris (#666)
export const COLOR_NEEDS_WHITE_TEXT: boolean[] = [
  // C (Do) - rojos/naranjas oscuros necesitan blanco
  true, // C (bright red)
  true, // C+
  true, // C♯ (orange)
  false, // C♯+
  // D (Re) - amarillos/dorados pueden usar gris
  false, // D (gold)
  false, // D+
  false, // D♯ (yellow)
  false, // D♯+
  // E (Mi) - verdes claros pueden usar gris
  false, // E
  false, // E+
  // F (Fa) - verdes pueden usar gris
  false, // F (lime)
  false, // F+
  false, // F♯ (green)
  false, // F♯+
  // G (Sol) - aguamarinas/cianos pueden usar gris
  false, // G (aqua)
  false, // G+ (cyan)
  true, // G♯ (sky blue)
  true, // G♯+ (azul más oscuro)
  // A (La) - azules oscuros necesitan blanco
  true, // A (bright blue)
  true, // A+
  true, // A♯ (lighter violet-blue)
  true, // A♯+
  // B (Si) - púrpuras/magentas oscuros necesitan blanco
  true, // B (electric purple)
  true, // B+ (magenta)
  true, // Cycle back to red
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
