import type { Seat, Section, Subsection } from "~/types/auditorium"

/**
 * True when the raw auditorium config is the legacy CSV-string format
 * (either a header line "csv_format" or an old-style "type,id,name,...").
 */
export function isCsvConfig(raw: unknown): boolean {
  if (typeof raw !== "string") return false
  const trimmed = raw.trimStart()
  return (
    trimmed.startsWith("csv_format") || trimmed.startsWith("type,id,name,")
  )
}

/**
 * Parse the legacy CSV config (pipe-separated lines) into sections.
 * Supports both the old header format and the "csv_format" variant.
 */
export function parseAuditoriumConfig(csvString: string): Section[] {
  const lines = csvString
    .split("|")
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []

  const parseCsvLine = (line: string): string[] => {
    const fields: string[] = []
    let current = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current)
        current = ""
      } else {
        current += ch
      }
    }
    fields.push(current)
    return fields
  }

  const isNewFormat = lines[0].trim() === "csv_format"

  if (!isNewFormat) {
    const header = lines[0].split(",")
    const idx: Record<string, number> = {}
    header.forEach((h, i) => {
      idx[h.trim()] = i
    })

    const sectionsOut: Section[] = []
    let currentSection: Section | null = null
    let currentSub: Subsection | null = null

    for (let li = 1; li < lines.length; li++) {
      const f = parseCsvLine(lines[li])
      const type = f[idx.type] || ""
      const id = f[idx.id] || ""
      const name = f[idx.name] || ""
      const level = parseInt(f[idx.level] || "0", 10)
      const tr =
        f[idx.tr] !== "" && f[idx.tr] !== undefined
          ? parseInt(f[idx.tr], 10)
          : undefined
      const tc =
        f[idx.tc] !== "" && f[idx.tc] !== undefined
          ? parseInt(f[idx.tc], 10)
          : undefined
      const r =
        f[idx.r] !== "" && f[idx.r] !== undefined
          ? parseInt(f[idx.r], 10)
          : undefined
      const c =
        f[idx.c] !== "" && f[idx.c] !== undefined
          ? parseInt(f[idx.c], 10)
          : undefined
      const k = (f[idx.k] || "").trim()

      if (type === "s") {
        currentSection = { id, name, isLabel: level === 1, subsections: [] }
        currentSub = null
        sectionsOut.push(currentSection)
      } else if (type === "ss" && currentSection) {
        currentSub = { id, name, isLabel: level === 1 }
        if (currentSub.isLabel) {
          currentSub.width = 100
        } else {
          currentSub.seats = []
        }
        currentSection.subsections!.push(currentSub)
      } else if (type === "seat" && currentSub && !currentSub.isLabel) {
        const seats = currentSub.seats || []
        while (seats.length <= r!) {
          seats.push([])
        }
        const seat: Seat = { id, row: r, col: c }
        if (k) seat.category = k
        seats[r!].push(seat)
        currentSub.seats = seats
      }
    }
    return sectionsOut
  }

  const sectionsOut: Section[] = []
  let currentSection: Section | null = null
  let currentSub: Subsection | null = null
  let sectionCounter = 0
  let subCounter = 0

  for (let li = 1; li < lines.length; li++) {
    const f = parseCsvLine(lines[li])
    const type = f[0] || ""

    if (type === "s") {
      sectionCounter++
      subCounter = 0
      const name = f[1] || ""
      const isLabel = f[2] === "1"
      currentSection = {
        id: String(sectionCounter),
        name,
        isLabel,
        subsections: [],
      }
      currentSub = null
      sectionsOut.push(currentSection)
    } else if (type === "ss" && currentSection) {
      subCounter++
      const name = f[1] || ""
      const isLabel = f[4] === "1"
      const subId = `${currentSection.id}-${subCounter}`
      currentSub = { id: subId, name, isLabel }
      if (isLabel) {
        currentSub.width = 100
      } else {
        currentSub.seats = []
      }
      currentSection.subsections!.push(currentSub)
    } else if (type === "z" && currentSub && !currentSub.isLabel) {
      const id = f[1] || ""
      const r = f[2] !== "" && f[2] !== undefined ? parseInt(f[2], 10) : 0
      const c = f[3] !== "" && f[3] !== undefined ? parseInt(f[3], 10) : 0
      const k = (f[4] || "").trim()
      const seats = currentSub.seats || []
      while (seats.length <= r) {
        seats.push([])
      }
      const seat: Seat = { id, row: r, col: c }
      if (k) seat.category = k
      seats[r].push(seat)
      currentSub.seats = seats
    }
  }

  return sectionsOut
}

/**
 * Normalize a JSON config ({ s|sections }) into the shared Section[] shape
 * used by the stage components. Returns [] when there is nothing to render.
 */
export function normalizeSections(raw: unknown): Section[] {
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw)
    } catch (e) {
      return []
    }
  }

  const cfg = raw as {
    s?: unknown
    sections?: unknown
  }
  const rawSections = (cfg.s || cfg.sections) as Record<string, unknown>[]
  if (!Array.isArray(rawSections)) return []

  return rawSections.map((section, sIdx) => {
    const s: Section = {
      id:
        (section.i as number | string) ||
        (section.id as number | string) ||
        `${sIdx + 1}`,
      name: (section.n as string) || (section.name as string),
      isLabel: !!(section.l || section.isLabel),
      subsections: [],
    }

    if (section.ss || section.subsections) {
      const rawSubs = (section.ss || section.subsections) as Record<
        string,
        unknown
      >[]
      s.subsections = rawSubs.map((sub, subIdx) => {
        const ss: Subsection = {
          id:
            (sub.i as number | string) ||
            (sub.id as number | string) ||
            `${s.id}-${subIdx + 1}`,
          name: (sub.n as string) || (sub.name as string),
          isLabel: !!(sub.l || sub.isLabel),
        }
        if (ss.isLabel) {
          ss.width = (sub.w as number) || (sub.width as number)
        } else {
          const rawSeats = (sub.s || sub.seats) as (Record<
            string,
            unknown
          > | null)[][]
          if (rawSeats) {
            ss.seats = rawSeats.map((row, rowIdx) => {
              return row.map((seat, colIdx) => {
                if (!seat) return null
                return {
                  id:
                    (seat.i as number | string) ||
                    (seat.id as number | string) ||
                    `${ss.id}-${rowIdx + 1}-${colIdx + 1}`,
                  row:
                    seat.r !== undefined
                      ? (seat.r as number | string)
                      : (seat.row as number | string),
                  col:
                    seat.c !== undefined
                      ? (seat.c as number | string)
                      : (seat.col as number | string),
                  category:
                    (seat.k as string) || (seat.category as string),
                } as Seat
              })
            })
          }
        }
        return ss
      })
    }
    return s
  })
}

/**
 * Find a seat by its id across every section/subsection in the config.
 */
export function findSeatById(
  sections: Section[],
  seatId: number | string,
): Seat | null {
  for (const section of sections) {
    const rawSubs = section.ss || section.subsections
    if (!rawSubs) continue
    for (const subsection of rawSubs) {
      const seatsSource = subsection.s || subsection.seats
      if (!seatsSource) continue
      for (const row of seatsSource) {
        for (const seat of row) {
          const id = seat?.i || seat?.id
          if (id === seatId) return seat
        }
      }
    }
  }
  return null
}

/**
 * Apply the event's initial `seats` map ({ status: [seatIds] }) onto the
 * parsed sections, in place.
 */
export function applySeatStatuses(
  sections: Section[],
  seatsData: unknown,
): void {
  if (!seatsData || Array.isArray(seatsData)) return
  Object.entries(seatsData as Record<string, string[]>).forEach(
    ([status, seatIds]) => {
      if (!Array.isArray(seatIds)) return
      seatIds.forEach((seatId) => {
        const seat = findSeatById(sections, seatId)
        if (seat) seat.status = status
      })
    },
  )
}