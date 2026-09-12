import { describe, it, expect, vi } from 'vitest'
import { base64UrlDecode, getJwtExp, isTokenExpired } from './jwt'

describe('base64UrlDecode', () => {
  it('decodes regular base64 string', () => {
    // btoa('{"sub":"123","name":"Sergio"}') => "eyJzdWIiOiIxMjMiLCJuYW1lIjoiU2VyZ2lvIn0="
    const decoded = base64UrlDecode('eyJzdWIiOiIxMjMiLCJuYW1lIjoiU2VyZ2lvIn0=')
    expect(decoded).toBe('{"sub":"123","name":"Sergio"}')
  })

  it("decodes base64url string with '-' and '_' and omitted padding", () => {
    // binary data or utf-8 text with characters producing - and _
    const jsonStr = JSON.stringify({ exp: 1735689600, data: '???>>>' })
    const base64Standard = btoa(jsonStr)
    const base64Url = base64Standard.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const decoded = base64UrlDecode(base64Url)
    expect(decoded).toBe(jsonStr)
  })

  it('throws error for invalid length (pad === 1)', () => {
    expect(() => base64UrlDecode('a')).toThrow('Invalid base64url string')
  })
})

describe('getJwtExp', () => {
  function makeToken(payload: Record<string, unknown>): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const signature = 'dummy-signature'
    return `${header}.${body}.${signature}`
  }

  it('extracts exp from standard payload', () => {
    const token = makeToken({ exp: 1735689600, sub: 1 })
    expect(getJwtExp(token)).toBe(1735689600)
  })

  it("extracts exp from base64url payload containing '-' or '_'", () => {
    const token = makeToken({ exp: 1800000000, extra: 'sub_test-values~123/456+789' })
    expect(getJwtExp(token)).toBe(1800000000)
  })

  it('returns null for malformed token', () => {
    expect(getJwtExp('invalid-token')).toBeNull()
    expect(getJwtExp('')).toBeNull()
    expect(getJwtExp('a.not-json.b')).toBeNull()
  })

  it('returns null when exp claim is missing', () => {
    const token = makeToken({ sub: 1 })
    expect(getJwtExp(token)).toBeNull()
  })
})

describe('isTokenExpired', () => {
  function makeTokenWithExp(exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    const body = btoa(JSON.stringify({ exp }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    return `${header}.${body}.sig`
  }

  it('returns true for invalid or missing token', () => {
    expect(isTokenExpired('invalid')).toBe(true)
  })

  it('returns false for token expiring in 10 minutes', () => {
    const now = 1700000000 * 1000
    vi.setSystemTime(new Date(now))
    const token = makeTokenWithExp(1700000000 + 600) // 10 min later
    expect(isTokenExpired(token)).toBe(false)
    vi.useRealTimers()
  })

  it('returns true when within 30s grace margin', () => {
    const now = 1700000000 * 1000
    vi.setSystemTime(new Date(now))
    const token = makeTokenWithExp(1700000000 + 20) // 20s left (< 30s margin)
    expect(isTokenExpired(token)).toBe(true)
    vi.useRealTimers()
  })

  it('returns true for expired token', () => {
    const now = 1700000000 * 1000
    vi.setSystemTime(new Date(now))
    const token = makeTokenWithExp(1700000000 - 10)
    expect(isTokenExpired(token)).toBe(true)
    vi.useRealTimers()
  })
})
