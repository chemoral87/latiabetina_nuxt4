import { describe, it, expect } from 'vitest'
import { safeInternalRedirect } from '~/utils/safeRedirect'

describe('safeInternalRedirect', () => {
  it('returns valid internal relative paths', () => {
    expect(safeInternalRedirect('/dashboard')).toBe('/dashboard')
    expect(safeInternalRedirect('/users/123')).toBe('/users/123')
    expect(safeInternalRedirect('/settings?tab=profile')).toBe('/settings?tab=profile')
  })

  it('falls back when target is empty, null, or not a string', () => {
    expect(safeInternalRedirect('')).toBe('/dashboard')
    expect(safeInternalRedirect(null)).toBe('/dashboard')
    expect(safeInternalRedirect(undefined)).toBe('/dashboard')
    expect(safeInternalRedirect(123)).toBe('/dashboard')
    expect(safeInternalRedirect({}, '/fallback')).toBe('/fallback')
  })

  it('rejects external URLs and protocol-relative URLs', () => {
    expect(safeInternalRedirect('https://evil.com')).toBe('/dashboard')
    expect(safeInternalRedirect('http://evil.com')).toBe('/dashboard')
    expect(safeInternalRedirect('//evil.com')).toBe('/dashboard')
    expect(safeInternalRedirect('/\\evil.com')).toBe('/dashboard')
  })

  it('rejects encoded URL exploits', () => {
    expect(safeInternalRedirect('/%2f%2fevil.com')).toBe('/dashboard')
    expect(safeInternalRedirect('/%5c%5cevil.com')).toBe('/dashboard')
    expect(safeInternalRedirect('javascript:alert(1)')).toBe('/dashboard')
  })
})
