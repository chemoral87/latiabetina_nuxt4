import { describe, it, expect } from 'vitest'
import {
  formatShortDate,
  formatShortDateSlash,
  formatShortDateDash,
  capitalizeFirst,
  formatShortDateTime,
  formatShortDateTime12h,
  formatHourTime,
  formatHumanDate,
  localDateTimeString,
} from '~/utils/date'

describe('date utils', () => {
  describe('formatShortDate', () => {
    it('formats ISO date strings as DD MMM YYYY', () => {
      expect(formatShortDate('2026-08-01')).toBe('01 Ago 2026')
      expect(formatShortDate('2026-01-15')).toBe('15 Ene 2026')
      expect(formatShortDate('2026-12-31')).toBe('31 Dic 2026')
    })

    it('handles empty / invalid values', () => {
      expect(formatShortDate('')).toBe('')
      expect(formatShortDate(null)).toBe('')
      expect(formatShortDate(undefined)).toBe('')
      expect(formatShortDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatShortDateSlash', () => {
    it('formats ISO date string with slashes', () => {
      expect(formatShortDateSlash('2026-08-01')).toBe('01/Ago/2026')
      expect(formatShortDateSlash('')).toBe('')
      expect(formatShortDateSlash(null)).toBe('')
    })
  })

  describe('formatShortDateDash', () => {
    it('formats ISO date string with dashes', () => {
      expect(formatShortDateDash('2026-08-01')).toBe('01-Ago-2026')
      expect(formatShortDateDash('')).toBe('')
      expect(formatShortDateDash(null)).toBe('')
    })
  })

  describe('capitalizeFirst', () => {
    it('capitalizes first letter', () => {
      expect(capitalizeFirst('agosto de 2026')).toBe('Agosto de 2026')
      expect(capitalizeFirst('')).toBe('')
    })
  })

  describe('formatShortDateTime', () => {
    it('formats ISO datetime string to 24h format', () => {
      expect(formatShortDateTime('2026-08-12T14:30:00')).toBe('12 Ago 2026 14:30')
      expect(formatShortDateTime('2026-08-12 09:05:00')).toBe('12 Ago 2026 09:05')
      expect(formatShortDateTime('')).toBe('')
    })
  })

  describe('formatShortDateTime12h', () => {
    it('formats ISO datetime string to 12h format', () => {
      expect(formatShortDateTime12h('2026-08-24 13:05:00')).toBe('24 Ago 2026 1:05 pm')
      expect(formatShortDateTime12h('2026-08-24 09:30:00')).toBe('24 Ago 2026 9:30 am')
      expect(formatShortDateTime12h('')).toBe('')
    })
  })

  describe('formatHourTime', () => {
    it('formats 24h time to 12h am/pm format', () => {
      expect(formatHourTime('14:30')).toBe('2:30 pm')
      expect(formatHourTime('00:15')).toBe('12:15 am')
      expect(formatHourTime('12:00')).toBe('12:00 pm')
      expect(formatHourTime('09:05')).toBe('9:05 am')
      expect(formatHourTime('')).toBe('-')
      expect(formatHourTime(null)).toBe('-')
    })
  })

  describe('formatHumanDate', () => {
    const now = new Date(2026, 9, 17, 1, 36, 0) // 17 Oct 2026 01:36

    it('appends a humanized relative time', () => {
      expect(formatHumanDate('2026-10-16 01:36:00', now)).toBe('16 Oct - hace 1 día')
      expect(formatHumanDate('2026-10-17 00:36:00', now)).toBe('17 Oct - hace 1 hora')
      expect(formatHumanDate('2026-10-17 01:30:00', now)).toBe('17 Oct - hace 6 minutos')
      expect(formatHumanDate('2026-10-17 01:36:20', now)).toBe('17 Oct - en unos segundos')
    })

    it('adds the year only when it differs from the current year', () => {
      expect(formatHumanDate('2025-10-16 01:36:00', now)).toBe('16 Oct 2025 - hace 1 año')
    })

    it('handles empty / invalid values', () => {
      expect(formatHumanDate('')).toBe('')
      expect(formatHumanDate(null)).toBe('')
      expect(formatHumanDate('invalid-date')).toBe('invalid-date')
    })
  })

  describe('localDateTimeString', () => {
    it('formats a Date into YYYY-MM-DD HH:mm:ss', () => {
      const d = new Date(2026, 7, 15, 10, 30, 45) // month 7 is August (0-indexed)
      expect(localDateTimeString(d)).toBe('2026-08-15 10:30:45')
    })
  })
})
