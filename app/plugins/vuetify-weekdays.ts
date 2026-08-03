import { VuetifyDateAdapter } from "vuetify/date/adapters/vuetify"

const WEEKDAY_LABELS_ES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]

// Captured once at module scope so SSR plugin re-runs re-assign the same
// wrapper idempotently instead of nesting a new one per request.
const originalGetWeekdays = VuetifyDateAdapter.prototype.getWeekdays

export default defineNuxtPlugin(() => {
  VuetifyDateAdapter.prototype.getWeekdays = function (
    this: VuetifyDateAdapter,
    firstDayOfWeek?: string | number,
    weekdayFormat?: "long" | "short" | "narrow",
  ): string[] {
    // For Spanish locales render the classic 2-letter headers (Lu, Ma, Mi…)
    // instead of Intl's accented short forms (lun, mar, mié…).
    // Only intercepts valid Intl values, so nothing invalid ever reaches Intl.
    if (
      (weekdayFormat === "short" || weekdayFormat === "narrow") &&
      this.locale.toLowerCase().startsWith("es")
    ) {
      const first = parseInt(String(firstDayOfWeek ?? 1), 10) || 0
      return Array.from({ length: 7 }, (_, i) => WEEKDAY_LABELS_ES[(i + first) % 7])
    }
    return originalGetWeekdays.call(this, firstDayOfWeek, weekdayFormat)
  }
})
