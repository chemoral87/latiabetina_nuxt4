import { describe, it, expect } from 'vitest'
import { saleStatusLabel, saleStatusColor, salePaymentLabel, salePaymentColor } from '~/utils/sale'

describe('sale utils', () => {
  describe('saleStatusLabel', () => {
    it('returns corresponding Spanish label for known codes and keys', () => {
      expect(saleStatusLabel('completed')).toBe('Completada')
      expect(saleStatusLabel('COM')).toBe('Completada')
      expect(saleStatusLabel('PEN')).toBe('Pendiente')
      expect(saleStatusLabel('PRE')).toBe('Preparando')
      expect(saleStatusLabel('CAN')).toBe('Cancelada')
      expect(saleStatusLabel('REF')).toBe('Reembolsada')
      expect(saleStatusLabel('REA')).toBe('Listo')
    })

    it('returns dash for falsy values and original string for unknown statuses', () => {
      expect(saleStatusLabel('')).toBe('—')
      expect(saleStatusLabel(null)).toBe('—')
      expect(saleStatusLabel('custom_status')).toBe('custom_status')
    })
  })

  describe('saleStatusColor', () => {
    it('returns Vuetify color names for status', () => {
      expect(saleStatusColor('completed')).toBe('success')
      expect(saleStatusColor('COM')).toBe('success')
      expect(saleStatusColor('pending')).toBe('orange')
      expect(saleStatusColor('cancelled')).toBe('error')
      expect(saleStatusColor('unknown')).toBe('grey')
      expect(saleStatusColor(null)).toBe('grey')
    })
  })

  describe('salePaymentLabel and salePaymentColor', () => {
    it('handles payment methods correctly', () => {
      expect(salePaymentLabel('cash')).toBe('Efectivo')
      expect(salePaymentColor('cash')).toBe('success')
      expect(salePaymentLabel('card')).toBe('Tarjeta')
      expect(salePaymentColor('card')).toBe('primary')
      expect(salePaymentLabel('transfer')).toBe('Transferencia')
      expect(salePaymentColor('transfer')).toBe('info')
      expect(salePaymentLabel('')).toBe('—')
      expect(salePaymentColor('')).toBe('grey')
    })
  })
})
