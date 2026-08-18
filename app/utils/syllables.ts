const VOWELS = "aeiouáéíóúü"
const STRONG = "aeoáéó"
const WEAK = "iuüy"
const WEAK_ACCENTED = "íú"
const INSEPARABLE_PAIRS = [
  "ch",
  "ll",
  "rr",
  "pr",
  "br",
  "tr",
  "dr",
  "cr",
  "gr",
  "fr",
  "kr",
  "pl",
  "bl",
  "cl",
  "gl",
  "fl",
  "tl",
]
const LETTER_RE = /[a-záéíóúüñ]/

function isVowel(c: string): boolean {
  return VOWELS.includes(c)
}

function vowelClass(c: string): "strong" | "weak" | null {
  if (STRONG.includes(c)) return "strong"
  if (WEAK.includes(c) || WEAK_ACCENTED.includes(c)) return "weak"
  return null
}

// True when two adjacent vowels stay in the same syllable (diphthong).
function canFormDiphthong(a: string, b: string): boolean {
  const ca = vowelClass(a)
  const cb = vowelClass(b)
  if (!ca || !cb) return false
  if (ca === "weak" && cb === "weak") return true
  if (ca !== cb) {
    // weak + strong / strong + weak combine unless the weak vowel is accented
    if (WEAK_ACCENTED.includes(a) || WEAK_ACCENTED.includes(b)) return false
    return true
  }
  // strong + strong always form a hiatus
  return false
}

/**
 * Splits a single Spanish word into syllables (e.g. "corazón" -> ["co","ra","zón"]).
 * Non-letter tokens (numbers, punctuation only) are returned as a single item.
 */
export function syllabifyWord(word: string): string[] {
  if (!word) return []
  const w = word.toLowerCase()
  if (!LETTER_RE.test(w)) return [word]

  const chars = Array.from(w)
  const n = chars.length

  // "y" is a consonant normally, but acts as a weak vowel when it ends a word
  // right after a vowel (ley, hoy, Uruguay).
  const isV = (c: string, idx: number): boolean => {
    if (isVowel(c)) return true
    if (c === "y" && idx === n - 1 && idx > 0 && isVowel(chars[idx - 1])) return true
    return false
  }

  const runs: { v: boolean; chars: string[] }[] = []
  let i = 0
  while (i < n) {
    const v = isV(chars[i], i)
    let j = i
    while (j < n && isV(chars[j], j) === v) j++
    runs.push({ v, chars: chars.slice(i, j) })
    i = j
  }

  const syllables: string[] = []
  let cur = ""
  const flush = () => {
    if (cur) {
      syllables.push(cur)
      cur = ""
    }
  }

  for (let r = 0; r < runs.length; r++) {
    const run = runs[r]
    if (run.v) {
      const vs = run.chars
      cur += vs[0]
      for (let k = 1; k < vs.length; k++) {
        if (canFormDiphthong(vs[k - 1], vs[k])) {
          cur += vs[k]
        } else {
          flush()
          cur = vs[k]
        }
      }
    } else {
      const cs = run.chars.join("")
      const k = cs.length
      const first = r === 0
      const last = r === runs.length - 1
      if (first || last) {
        // onset / coda consonants belong to their adjacent syllable
        cur += cs
      } else {
        // cluster between two vowel runs: keep the leading consonants with the
        // previous syllable, start the next one with the trailing group.
        let take = 1
        if (k >= 2 && INSEPARABLE_PAIRS.includes(cs.slice(k - 2))) take = 2
        const keep = k - take
        cur += cs.slice(0, keep)
        flush()
        cur = cs.slice(keep)
      }
    }
  }
  flush()
  return syllables
}

const LEADING_PUNCT_RE = /^[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ]+/
const TRAILING_PUNCT_RE = /[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ]+$/

/**
 * Splits a lyric line into syllables, keeping punctuation attached to its word
 * (e.g. "es la certeza" -> ["es","la","cer","te","za"]).
 */
export function splitLine(line: string): string[] {
  const tokens = line.trim().split(/\s+/).filter(Boolean)
  const syllables: string[] = []
  for (const token of tokens) {
    const leadMatch = token.match(LEADING_PUNCT_RE)
    const lead = leadMatch ? leadMatch[0] : ""
    let core = token.slice(lead.length)
    const trailMatch = core.match(TRAILING_PUNCT_RE)
    const trail = trailMatch ? trailMatch[0] : ""
    core = core.slice(0, core.length - trail.length)

    const parts = syllabifyWord(core)
    if (parts.length === 0) {
      if (lead || trail) syllables.push(lead + trail)
      continue
    }
    parts[0] = lead + parts[0]
    parts[parts.length - 1] += trail
    syllables.push(...parts)
  }
  return syllables
}

let uidCounter = 0

/** Short unique id for editor nodes (sections, lines, syllables, tabs). */
export function uid(prefix = ""): string {
  uidCounter += 1
  const rnd = Math.random().toString(36).slice(2, 8)
  return prefix ? `${prefix}-${rnd}${uidCounter}` : `${rnd}${uidCounter}`
}

const CHORD_RE = /^[A-G](#|b)?[a-zA-Z0-9#b+\-()]*$/

// Short Spanish words that start with an uppercase note letter and would
// otherwise look like chord symbols (Fe, Dios, La, El, De...). When a token
// is in this list it is treated as lyric text, not a chord.
const CHORD_BLACKLIST = new Set([
  "de",
  "el",
  "en",
  "es",
  "se",
  "fe",
  "la",
  "mi",
  "do",
  "re",
  "fa",
  "sol",
  "da",
  "ve",
  "va",
  "le",
  "te",
  "mas",
  "don",
  "del",
  "al",
  "ala",
  "dia",
  "dios",
  "fue",
  "dio",
  "me",
  "des",
])

/** True when a token looks like a chord symbol (G, Am, C7, Em7(b5), D/F#...). */
export function isChordToken(token: string): boolean {
  if (!CHORD_RE.test(token)) return false
  return !CHORD_BLACKLIST.has(token.toLowerCase())
}

/** True when every token on the line looks like a chord symbol (G, C D, Am7...). */
export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return false
  return tokens.every((t) => isChordToken(t))
}