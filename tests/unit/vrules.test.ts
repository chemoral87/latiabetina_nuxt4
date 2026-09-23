import { describe, it, expect } from 'vitest'
import { vrules } from '~/utils/vrules'

describe('vrules', () => {
  describe('required', () => {
    it('validates required values', () => {
      expect(vrules.required('test')).toBe(true)
      expect(vrules.required(123)).toBe(true)
      expect(vrules.required([1])).toBe(true)
      expect(vrules.required('')).toBe('El campo es obligatorio.')
      expect(vrules.required('   ')).toBe('El campo es obligatorio.')
      expect(vrules.required(null)).toBe('El campo es obligatorio.')
      expect(vrules.required(undefined)).toBe('El campo es obligatorio.')
      expect(vrules.required([])).toBe('El campo es obligatorio.')
    })
  })

  describe('requiredField', () => {
    it('formats custom field name on required failure', () => {
      const validator = vrules.requiredField('Nombre')
      expect(validator('')).toBe('El campo Nombre es obligatorio.')
      expect(validator('John')).toBe(true)
    })
  })

  describe('email', () => {
    it('validates email addresses', () => {
      expect(vrules.email('test@example.com')).toBe(true)
      expect(vrules.email('')).toBe(true)
      expect(vrules.email('invalid-email')).toBe('El campo debe ser una dirección de correo válida.')
      expect(vrules.email('test@domain')).toBe('El campo debe ser una dirección de correo válida.')
    })
  })

  describe('minLength and maxLength', () => {
    it('validates string lengths', () => {
      expect(vrules.minLength(3)('abc')).toBe(true)
      expect(vrules.minLength(3)('ab')).toBe('El campo debe tener al menos 3 caracteres.')
      expect(vrules.maxLength(3)('abc')).toBe(true)
      expect(vrules.maxLength(3)('abcd')).toBe('El campo no debe tener más de 3 caracteres.')
    })
  })

  describe('numeric and integer', () => {
    it('validates numbers', () => {
      expect(vrules.numeric('123.45')).toBe(true)
      expect(vrules.numeric(123)).toBe(true)
      expect(vrules.numeric('abc')).toBe('El campo debe ser un número.')
      expect(vrules.integer('123')).toBe(true)
      expect(vrules.integer('123.45')).toBe('El campo debe ser un número entero.')
    })
  })

  describe('confirmed', () => {
    it('validates matching values', () => {
      expect(vrules.confirmed('pass123')('pass123')).toBe(true)
      expect(vrules.confirmed('pass123')('pass456')).toBe('La confirmación no coincide.')
    })
  })

  describe('phone', () => {
    it('validates telephone numbers', () => {
      expect(vrules.phone('+1234567890')).toBe(true)
      expect(vrules.phone('123-456-7890')).toBe(true)
      expect(vrules.phone('123')).toBe('El campo debe ser un número de teléfono válido.')
    })
  })
})
