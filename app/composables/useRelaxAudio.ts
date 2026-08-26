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
let wavUrl: string | null = null

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
  // Also prime HTMLAudio inside gesture - critical for iOS
  let htmlPrimed = false
  try {
    const el = getHtmlAudioFallback()
    if (el) {
      // Must call play() synchronously inside gesture tick to unlock media element
      // Use muted prime then unmute for actual beep
      el.muted = true
      const p = el.play()
      if (p && typeof p.then === 'function') {
        p.then(() => {
          el.pause()
          el.muted = false
          el.currentTime = 0
        }).catch(() => {
          el.muted = false
        })
      } else {
        el.muted = false
      }
      htmlPrimed = true
    }
  } catch {}

  if (!ctx) return null

  // Initiate resume synchronously inside gesture tick - do not await before priming
  const state = (ctx.state as string)
  let resumePromise: Promise<void> | null = null
  if (state === 'suspended' || state === 'interrupted') {
    try {
      resumePromise = ctx.resume()
      resumePromise.catch(() => {})
    } catch {}
  }

  // Prime WebAudio with audible-able buffer (not zero-gain) - MUST stay in gesture tick
  if (!unlocked) {
    try {
      // Classic iOS unlock: 1-sample buffer source
      const buffer = ctx.createBuffer(1, 1, 22050)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0)
    } catch {}
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      // Very low but non-zero gain so WebKit counts it as audible unlock
      gain.gain.value = 0.01
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 1
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.01)
    } catch {}
    unlocked = true
  }

  if (resumePromise) {
    try {
      await resumePromise
    } catch {}
  }

  // If HTMLAudio was primed, ensure WebAudio also marked unlocked even if ctx was null earlier
  if (htmlPrimed) unlocked = true

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

function createBeepWavUrl(freq = 1000, duration = 0.3, sampleRate = 44100): string {
  const numSamples = Math.floor(sampleRate * duration)
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + numSamples * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, numSamples * 2, true)
  let offset = 44
  for (let i = 0; i < numSamples; i++) {
    let env = 1
    if (i < sampleRate * 0.02) env = i / (sampleRate * 0.02)
    else if (i > numSamples - sampleRate * 0.05) env = (numSamples - i) / (sampleRate * 0.05)
    const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.6 * env
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    offset += 2
  }
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  // btoa is available in browser
  return 'data:audio/wav;base64,' + btoa(binary)
}

function getHtmlAudioFallback(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null
  if (htmlAudio) return htmlAudio
  try {
    const el = new Audio()
    el.preload = 'auto'
    // playsInline is critical on iOS to avoid fullscreen
    ;(el as unknown as Record<string, unknown>).playsInline = true
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', '')
    // Assign beep wav synchronously so first play is inside gesture
    if (!wavUrl) wavUrl = createBeepWavUrl(1000, 0.3)
    el.src = wavUrl
    el.load()
    htmlAudio = el
    return el
  } catch {
    return null
  }
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && (navigator as unknown as { maxTouchPoints?: number }).maxTouchPoints! > 1)
}

export async function playRelaxBeep(frequency = 1000, duration = 0.3): Promise<void> {
  // On iOS, HTMLAudio is more reliable than WebAudio after unlock - try both
  const tryHtml = async () => {
    try {
      const el = getHtmlAudioFallback()
      if (!el || !el.src) return false
      // Recreate wav if frequency differs from default 1000
      if (frequency !== 1000 || duration !== 0.3) {
        el.src = createBeepWavUrl(frequency, duration)
        el.load()
      }
      el.currentTime = 0
      // For iOS, play must be allowed - if context was unlocked, this succeeds even outside gesture
      await el.play()
      return true
    } catch {
      return false
    }
  }

  // Prefer HTMLAudio on iOS, WebAudio elsewhere
  if (isIOS()) {
    const ok = await tryHtml()
    if (ok) return
  }

  const ctx = await ensureRelaxAudioRunning()
  if (ctx) {
    try {
      if ((ctx.state as string) === 'suspended' || (ctx.state as string) === 'interrupted') {
        await ctx.resume().catch(() => {})
      }
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = frequency
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.linearRampToValueAtTime(0.8, t + 0.02)
      gain.gain.linearRampToValueAtTime(0.0001, t + duration)
      osc.start(t)
      osc.stop(t + duration)
      // Also fire HTMLAudio as backup (in case Ringer silent mutes WebAudio)
      void tryHtml()
      return
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[relax-audio] WebAudio beep failed, trying fallback', e)
    }
  }
  await tryHtml()
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
