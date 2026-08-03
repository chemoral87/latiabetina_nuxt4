import { VuetifyDateAdapter } from "vuetify/date/adapters/vuetify"

const WEEKDAY_LABELS_ES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
const MONTHS_LABELS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

const originalGetWeekdays = VuetifyDateAdapter.prototype.getWeekdays
const originalGetMonth = VuetifyDateAdapter.prototype.getMonth

export default defineNuxtPlugin(() => {
  VuetifyDateAdapter.prototype.getWeekdays = function (
    this: VuetifyDateAdapter,
    firstDayOfWeek?: string | number,
    weekdayFormat?: "long" | "short" | "narrow",
  ): string[] {
    if (
      (weekdayFormat === "short" || weekdayFormat === "narrow") &&
      this.locale.toLowerCase().startsWith("es")
    ) {
      const first = parseInt(String(firstDayOfWeek ?? 1), 10) || 0
      return Array.from({ length: 7 }, (_, i) => WEEKDAY_LABELS_ES[(i + first) % 7])
    }
    return originalGetWeekdays.call(this, firstDayOfWeek, weekdayFormat)
  }

  VuetifyDateAdapter.prototype.getMonth = function (
    this: VuetifyDateAdapter,
    date: Date,
    format?: "long" | "short" | "narrow" | "numeric" | "2-digit",
  ): string {
    if (format === "short" && this.locale.toLowerCase().startsWith("es")) {
      return MONTHS_LABELS_ES[date.getMonth()]
    }
    return originalGetMonth.call(this, date, format)
  }
})
