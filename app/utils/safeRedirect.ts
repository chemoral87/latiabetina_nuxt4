/**
 * Only allow same-app relative paths as redirect targets.
 * Rejects absolute URLs, protocol-relative URLs (//evil.com),
 * and anything that decodes to a scheme or protocol-relative form
 * (e.g. "/%2f%2fevil.com" decodes to "///evil.com").
 */
export function safeInternalRedirect(target: unknown, fallback = "/dashboard"): string {
  if (typeof target !== "string" || !target) return fallback
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback
  }
  try {
    const decoded = decodeURIComponent(target)
    if (
      decoded.startsWith("//") ||
      decoded.startsWith("/\\") ||
      /^[a-z][a-z0-9+.-]*:/i.test(decoded)
    ) {
      return fallback
    }
  } catch {
    return fallback
  }
  return target
}
