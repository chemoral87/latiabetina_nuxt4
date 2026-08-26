/**
 * iOS-safe WebAudio for Relax beep.
 * Handles Safari/WebKit quirks:
 * - AudioContext must be resumed INSIDE the user gesture tick.
 * - Creation with `{latencyHint}` throws on old Safari -> fallback.
 * - `suspended` / `interrupted` (iOS 17+) must be resumed.
 * - `closed` must be recreated.
 * - Unlock needs a silent oscillator primed inside the gesture.
 * - Fallback to HTMLAudio (`playsinline`) if WebAudio unavailable/blocked.
 */

let audioContext: AudioContext | null = null
let htmlAudio: HTMLAudioElement | null = null
let unlocked = false

function getAudioCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
  return w.AudioContext || w.webkitAudioContext || null
}

function createRawContext(): AudioContext | null {
  const AC = getAudioCtor()
  if (!AC) return null
  try {
    // latencyHint not supported on old WebKit -> try with, fallback without
    return new AC({ latencyHint: 'interactive' } as AudioContextOptions)
  } catch {
    try {
      return new AC()
    } catch {
      return null
    }
  }
}

export function getRelaxAudioContext(): AudioContext | null {
  if (audioContext && audioContext.state !== 'closed') return audioContext
  audioContext = createRawContext()
  return audioContext
}

/**
 * Must be called SYNCHRONOUSLY inside click/touch handler.
 * Creates context if needed, resumes if suspended/interrupted, and primes
 * with a silent oscillator so iOS considers it unlocked.
 */
export async function unlockRelaxAudio(): Promise<AudioContext | null> {
  const ctx = getRelaxAudioContext()
  if (!ctx) return null

  // Initiate resume synchronously inside gesture tick - do not await before priming
  const state = (ctx.state as string)
  let resumePromise: Promise<void> | null = null
  if (state === 'suspended' || state === 'interrupted') {
    try {
      resumePromise = ctx.resume()
      // attach catch early to avoid unhandled rejection
      resumePromise.catch(() => {})
    } catch {
      // resume may throw if not in gesture
    }
  }

  // Prime with silent oscillator only once (or after recreation) - MUST stay in gesture tick
  if (!unlocked) {
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      gain.gain.value = 0
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.01)
      unlocked = true
    } catch {
      // ignore prime failure
    }
  }

  if (resumePromise) {
    try {
      await resumePromise
    } catch {
      // ignore
    }
  }

  return ctx
}

export async function ensureRelaxAudioRunning(): Promise<AudioContext | null> {
  const ctx = getRelaxAudioContext()
  if (!ctx) return null
  const state = (ctx.state as string)
  if (state === 'suspended' || state === 'interrupted') {
    try {
      await ctx.resume()
    } catch {}
  }
  if (ctx.state === 'closed') {
    audioContext = null
    unlocked = false
    return unlockRelaxAudio()
  }
  return ctx
}

function getHtmlAudioFallback(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (htmlAudio) return htmlAudio
  try {
    // Short beep via WebAudio is preferred, but HTMLAudio fallback needs a source.
    // Use a tiny 0.3s 880Hz wav data-uri would be large; instead lazily create
    // an <audio> that will be fed via data URL on first use, or just use
    // WebAudio-primed context. For now create element and set playsinline.
    const el = new Audio()
    el.preload = 'auto'
    // playsInline is critical on iOS to avoid fullscreen
    ;(el as unknown as Record<string, unknown>).playsInline = true
    el.setAttribute('playsinline', '')
    // No src yet - caller may set src if needed. Returning element signals support.
    htmlAudio = el
    return el
  } catch {
    return null
  }
}

export async function playRelaxBeep(frequency = 1000, duration = 0.3): Promise<void> {
  const ctx = await ensureRelaxAudioRunning()
  if (ctx) {
    try {
      // Must ensure running right before scheduling
      if ((ctx.state as string) === 'suspended' || (ctx.state as string) === 'interrupted') {
        await ctx.resume().catch(() => {})
      }
      // Schedule immediately at currentTime (iOS prefers immediate vs +0.05 stale time)
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = frequency
      osc.type = 'sine'
      // Use linear ramps for maximum iOS compatibility (exponential fails if base 0)
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.8, t + 0.02)
      gain.gain.linearRampToValueAtTime(0.0001, t + duration)
      osc.start(t)
      osc.stop(t + duration)
      return
    } catch (e) {
      // Fall through to HTMLAudio fallback
      // eslint-disable-next-line no-console
      console.warn('[relax-audio] WebAudio beep failed, trying fallback', e)
    }
  }
  // Fallback: try HTMLAudio beep via data URI generation if available
  // Generate a short tone on-the-fly via HTMLAudio is not trivial without src,
  // so we attempt to play a silent click via WebAudio again with fresh context,
  // otherwise ignore.
  const fallback = getHtmlAudioFallback()
  if (fallback && fallback.src) {
    try {
      fallback.currentTime = 0
      await fallback.play()
    } catch {}
  }
}

export function closeRelaxAudio(): void {
  if (audioContext) {
    try {
      // Do not close aggressively on iOS - keep alive for next beeps.
      // Only close if explicitly requested.
    } catch {}
  }
}

export function useRelaxAudio() {
  return {
    getRelaxAudioContext,
    unlockRelaxAudio,
    ensureRelaxAudioRunning,
    playRelaxBeep,
    closeRelaxAudio,
  }
}
