import { describe, it, expect } from 'vitest'
import { syllabifyWord, splitLine, isChordToken, isChordLine, uid } from '~/utils/syllables'

describe('syllables utils', () => {
  describe('syllabifyWord', () => {
    it('splits basic Spanish words into syllables', () => {
      expect(syllabifyWord('corazon')).toEqual(['co', 'ra', 'zon'])
      expect(syllabifyWord('casa')).toEqual(['ca', 'sa'])
      expect(syllabifyWord('sol')).toEqual(['sol'])
    })

    it('handles empty strings', () => {
      expect(syllabifyWord('')).toEqual([])
    })
  })

  describe('splitLine', () => {
    it('splits a line into syllables while preserving word order', () => {
      const parts = splitLine('es la certeza')
      expect(parts.join('')).toBe('eslacerteza')
      expect(parts).toEqual(['es', 'la', 'cer', 'te', 'za'])
    })
  })

  describe('isChordToken and isChordLine', () => {
    it('identifies musical chord tokens correctly', () => {
      expect(isChordToken('G')).toBe(true)
      expect(isChordToken('Am7')).toBe(true)
      expect(isChordToken('C#m')).toBe(true)
      expect(isChordToken('Fmaj7')).toBe(true)
      expect(isChordToken('Bb')).toBe(true)
    })

    it('rejects blacklisted Spanish words that resemble chords', () => {
      expect(isChordToken('Dios')).toBe(false)
      expect(isChordToken('Fe')).toBe(false)
      expect(isChordToken('La')).toBe(false)
      expect(isChordToken('El')).toBe(false)
    })

    it('identifies chord lines', () => {
      expect(isChordLine('G  C  D  Em')).toBe(true)
      expect(isChordLine('En su presencia')).toBe(false)
      expect(isChordLine('')).toBe(false)
    })
  })

  describe('uid', () => {
    it('generates unique ids with optional prefix', () => {
      const id1 = uid('sec')
      const id2 = uid('sec')
      expect(id1).toMatch(/^sec-/)
      expect(id1).not.toBe(id2)
    })
  })
})
