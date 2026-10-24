import { VuetifyDateAdapter } from 'vuetify/date/adapters/vuetify'

const WEEKDAY_LABELS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS_LABELS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const originalGetWeekdays = VuetifyDateAdapter.prototype.getWeekdays
const originalGetMonth = VuetifyDateAdapter.prototype.getMonth

// These overrides intentionally return localized labels (string) instead of
// the base adapter's numbers, so the prototype slots are cast to the real
// signatures used here.
const proto = VuetifyDateAdapter.prototype as unknown as {
  getWeekdays(this: VuetifyDateAdapter, firstDayOfWeek?: string | number, weekdayFormat?: 'long' | 'short' | 'narrow'): string[]
  getMonth(this: VuetifyDateAdapter, date: Date, format?: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit'): string
}

export default defineNuxtPlugin(() => {
  proto.getWeekdays = function (firstDayOfWeek, weekdayFormat): string[] {
    if ((weekdayFormat === 'short' || weekdayFormat === 'narrow') && this.locale.toLowerCase().startsWith('es')) {
      const first = parseInt(String(firstDayOfWeek ?? 1), 10) || 0
      return Array.from({ length: 7 }, (_, i) => WEEKDAY_LABELS_ES[(i + first) % 7]!)
    }
    return (originalGetWeekdays as unknown as (...args: unknown[]) => string[]).call(this, firstDayOfWeek, weekdayFormat)
  }

  proto.getMonth = function (date, format): string {
    if (format === 'short' && this.locale.toLowerCase().startsWith('es')) {
      return MONTHS_LABELS_ES[date.getMonth()]!
    }
    return (originalGetMonth as unknown as (...args: unknown[]) => string).call(this, date, format)
  }
})
