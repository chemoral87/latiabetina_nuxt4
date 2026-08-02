const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

const pad = (n: number) => String(n).padStart(2, "0")

/**
 * Formats an ISO date string (e.g. "2026-08-01") as "DD MMM YYYY" (es).
 * Mirrors the old `moment("DD MMM YYYY")` filter.
 */
export function formatShortDate(value?: string | null): string {
  if (!value) return ""
  const d = new Date(value)
  if (isNaN(d.getTime())) return String(value)
  return `${pad(d.getDate())} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
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
