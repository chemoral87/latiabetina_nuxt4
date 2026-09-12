export function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad === 2) base64 += '=='
  else if (pad === 3) base64 += '='
  else if (pad === 1) throw new Error('Invalid base64url string')
  return atob(base64)
}

export function getJwtExp(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const decoded = JSON.parse(base64UrlDecode(payload))
    return typeof decoded.exp === 'number' ? decoded.exp : null
  } catch {
    return null
  }
}

export function isTokenExpired(token: string, marginMs = 30000): boolean {
  const exp = getJwtExp(token)
  if (!exp) return true
  return Date.now() >= exp * 1000 - marginMs
}
