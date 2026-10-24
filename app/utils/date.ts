export const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Formats an ISO date string (e.g. "2026-08-01") as "DD MMM YYYY" (es).
 * Mirrors the old `moment("DD MMM YYYY")` filter.
 */
export function formatShortDate(value?: string | null): string {
  if (!value) return ''
  const [year, month, day] = String(value).split('-')
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
  if (!value) return ''
  const [year, month, day] = String(value).split('-')
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
  if (!value) return ''
  const [year, month, day] = String(value).split('-')
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
  if (!value) return ''
  const datePart = formatShortDate(value)
  if (!datePart) return String(value)
  const timeMatch = String(value).match(/(?:T|\s)(\d{1,2}):(\d{2})/)
  const hh = timeMatch?.[1]
  const mm = timeMatch?.[2]
  return hh && mm ? `${datePart} ${hh.padStart(2, '0')}:${mm}` : datePart
}

/**
 * Formats an ISO datetime (e.g. "2026-08-24 13:05:00" or "2026-08-24T13:05:00")
 * as "DD MMM YYYY h:mm am/pm" (es), e.g. "24 Ago 2026 1:05 pm".
 * String-based, no timezone shifts. Uses formatShortDate + formatHourTime.
 */
export function formatShortDateTime12h(value?: string | null): string {
  if (!value) return ''
  const datePart = formatShortDate(String(value))
  if (!datePart) return String(value)
  const m = String(value).match(/(?:T|\s)(\d{1,2}):(\d{2})/)
  if (!m) return datePart
  return `${datePart} ${formatHourTime(`${m[1]}:${m[2]}`)}`
}

/**
 * Formats a "HH:mm" (24h) time string as "hh:mm am/pm".
 * Mirrors the old `$moment(time, 'HH:mm').format("hh:mm a")`.
 */
export function formatHourTime(time?: string | null): string {
  if (!time) return '-'
  const [h, m] = time.split(':').map(Number)
  if (h === undefined || m === undefined || isNaN(h) || isNaN(m)) return '-'
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'am' : 'pm'
  return `${h12}:${pad(m)} ${ampm}`
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function relativeFromNow(target: Date, now: Date): string {
  const diff = now.getTime() - target.getTime()
  const future = diff < 0
  const abs = Math.abs(diff)
  const unit = (n: number, sing: string, plur: string) => (future ? `en ${n} ${n === 1 ? sing : plur}` : `hace ${n} ${n === 1 ? sing : plur}`)
  if (abs < MINUTE) return future ? 'en unos segundos' : 'hace unos segundos'
  if (abs < HOUR) return unit(Math.round(abs / MINUTE), 'minuto', 'minutos')
  if (abs < DAY) return unit(Math.round(abs / HOUR), 'hora', 'horas')
  const days = Math.round(abs / DAY)
  if (days < 30) return unit(days, 'día', 'días')
  const months = Math.round(days / 30)
  if (months < 12) return unit(months, 'mes', 'meses')
  return unit(Math.round(days / 365), 'año', 'años')
}

/**
 * Formats an ISO datetime (e.g. "2026-10-16 01:36:00") as "16 Oct - hace 1 día".
 * Day/month come from the raw string (no timezone shift); the year is appended
 * only when it differs from the current year.
 */
export function formatHumanDate(value?: string | null, now = new Date()): string {
  if (!value) return ''
  const [year, month, day] = String(value).split(/[-T ]/)
  if (!year || !month) return String(value)
  const m = parseInt(month, 10)
  if (isNaN(m) || m < 1 || m > 12) return String(value)
  const label = `${day} ${MONTHS_SHORT[m - 1]}`
  const d = new Date(String(value).replace(' ', 'T'))
  if (isNaN(d.getTime())) return label
  const withYear = year === String(now.getFullYear()) ? label : `${label} ${year}`
  return `${withYear} - ${relativeFromNow(d, now)}`
}

export function localDateTimeString(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
