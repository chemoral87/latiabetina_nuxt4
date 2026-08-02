export interface UAParserLike {
  isMobile(): boolean
  isIOS(): boolean
  isAndroid(): boolean
}

/**
 * Minimal UA parser used by the auditorium Konva components.
 * Detects the platform from the client `navigator.userAgent` (safe for SSR).
 */
export function useUAParser(): UAParserLike {
  if (import.meta.server) {
    return {
      isMobile: () => false,
      isIOS: () => false,
      isAndroid: () => false,
    }
  }

  const ua = navigator.userAgent

  return {
    isMobile: () => /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua),
    isIOS: () => /iPhone|iPad|iPod/i.test(ua),
    isAndroid: () => /Android/i.test(ua),
  }
}
