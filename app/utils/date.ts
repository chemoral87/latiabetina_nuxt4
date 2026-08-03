const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Formats an ISO date string (e.g. "2026-08-01") as "DD MMM YYYY" (es).
 * Mirrors the old `moment("DD MMM YYYY")` filter.
 */
export function formatShortDate(value?: string | null): string {
  if (!value) return ""
  const [year, month, day] = String(value).split("-")
  if (!year || !month || !day) {
    const d = new Date(value)
    if (isNaN(d.getTime())) return String(value)
    return `${pad(d.getDate())} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
  }
  const m = parseInt(month, 10)
  if (isNaN(m) || m < 1 || m > 12) return String(value)
  return `${pad(parseInt(day, 10))} ${MONTHS_SHORT[m - 1]} ${year}`
}

/**
 * Formats an ISO date string (e.g. "2026-08-01") as "DD/MMM/YYYY" (es), e.g. "01/Ago/2026".
 * Uses the raw string parts so there are no timezone shifts.
 */
export function formatShortDateSlash(value?: string | null): string {
  if (!value) return ""
  const [year, month, day] = String(value).split("-")
  if (!year || !month || !day) return String(value)
  const m = parseInt(month, 10)
  if (isNaN(m) || m < 1 || m > 12) return String(value)
  return `${day}/${MONTHS_SHORT[m - 1]}/${year}`
}

/**
 * Formats an ISO date string (e.g. "2026-08-01") as "DD-MMM-YYYY" (es), e.g. "01-Ago-2026".
 * Uses the raw string parts so there are no timezone shifts.
 */
export function formatShortDateDash(value?: string | null): string {
  if (!value) return ""
  const [year, month, day] = String(value).split("-")
  if (!year || !month || !day) return String(value)
  const m = parseInt(month, 10)
  if (isNaN(m) || m < 1 || m > 12) return String(value)
  return `${day}-${MONTHS_SHORT[m - 1]}-${year}`
}

/**
 * Capitalizes the first letter of a string (e.g. "agosto de 2026" -> "Agosto de 2026").
 */
export function capitalizeFirst(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

/**
 * Formats an ISO datetime (e.g. "2026-08-12T14:30:00" or "2026-08-12 14:30:00")
 * as "DD MMM YYYY HH:mm" (es), e.g. "12 Ago 2026 14:30". String-based, no timezone shifts.
 */
export function formatShortDateTime(value?: string | null): string {
  if (!value) return ""
  const datePart = formatShortDate(value)
  if (!datePart) return String(value)
  const timeMatch = String(value).match(/(?:T|\s)(\d{1,2}):(\d{2})/)
  return timeMatch ? `${datePart} ${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : datePart
}

/**
 * Formats a "HH:mm" (24h) time string as "hh:mm am/pm".
 * Mirrors the old `$moment(time, 'HH:mm').format("hh:mm a")`.
 */
export function formatHourTime(time?: string | null): string {
  if (!time) return "-"
  const [h, m] = time.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return "-"
  const h12 = h % 12 || 12
  const ampm = h < 12 ? "am" : "pm"
  return `${h12}:${pad(m)} ${ampm}`
}
