import type { Ref } from 'vue'
import type { Score } from '~/types/score'
import { encodeWav, schedulePianoNote } from '~/utils/pianoAudio'
import { scoreTimeline } from '~/utils/score'

// Length of the pre-rendered piano sample (seconds) and the scheduling lead (ms).
const SAMPLE_SECONDS = 5
const TIMER_LEAD_MS = 25

interface PlaybackEvent {
  pitch: string
  octave: number
  time: number
  duration: number
  velocity?: number
}

export interface ScorePlayback {
  /** True while notes are sounding. */
  playing: Ref<boolean>
  /** True while the piano samples are being rendered offline. */
  preparing: Ref<boolean>
  /** Playhead position in beats, or null when stopped/idle. */
  playbackTime: Ref<number | null>
  /** Play / pause depending on the current state. */
  toggle: () => Promise<void>
  /** Start (or resume) playback. */
  play: () => Promise<void>
  /** Pause, keeping the current position. */
  pause: () => void
  /** Stop and rewind to the beginning. */
  stop: () => void
}

/**
 * Plays a reactive `Score` as piano audio.
 *
 * Each distinct pitch is rendered once with `schedulePianoNote` into an offline
 * audio buffer, encoded as a WAV blob and replayed through HTMLAudio. Rendering
 * up-front (instead of scheduling live oscillators) keeps playback reliable
 * regardless of the browser's AudioContext autoplay policy.
 */
export function useScorePlayback(score: Ref<Score | null | undefined>): ScorePlayback {
  const playing = ref(false)
  const preparing = ref(false)
  const playbackTime = ref<number | null>(null)

  const sampleUrls = new Map<string, string>()
  let startTimers = new Set<number>()
  let activeNotes: HTMLAudioElement[] = []
  let host: HTMLElement | null = null
  let raf = 0
  let baseBeat = 0
  let startedAt = 0
  let playTempo = 100
  let maxBeat = 1
  let blockedNotified = false

  function events(): PlaybackEvent[] {
    return score.value ? scoreTimeline(score.value) : []
  }

  function pitchKey(ev: PlaybackEvent): string {
    return `${ev.pitch}${ev.octave}`
  }

  function audioHost(): HTMLElement {
    if (!host) {
      host = document.createElement('div')
      host.style.display = 'none'
      document.body.appendChild(host)
    }
    return host
  }

  async function prepareSamples(): Promise<void> {
    const missing = [...new Set(events().map(pitchKey))].filter(key => !sampleUrls.has(key))
    if (!missing.length) return
    preparing.value = true
    try {
      await Promise.all(
        missing.map(async key => {
          const parsed = /^([A-G][#b♯♭]?)(\d+)$/.exec(key)
          if (!parsed) return
          const ctx = new OfflineAudioContext(1, Math.ceil(SAMPLE_SECONDS * 44100), 44100)
          schedulePianoNote(ctx, ctx.destination, { pitch: parsed[1]!, octave: Number(parsed[2]), start: 0, duration: SAMPLE_SECONDS - 0.5, velocity: 1 })
          const buffer = await ctx.startRendering()
          sampleUrls.set(key, URL.createObjectURL(encodeWav(buffer)))
        })
      )
    } finally {
      preparing.value = false
    }
  }

  function schedule(fromBeat: number): void {
    const list = events()
    maxBeat = Math.max(1, ...list.map(ev => ev.time + ev.duration))
    for (const ev of list) {
      if (fromBeat > 0 && ev.time <= fromBeat) continue
      const delay = Math.max(0, (((ev.time - fromBeat) * 60) / playTempo) * 1000 - TIMER_LEAD_MS)
      const timer = window.setTimeout(() => {
        startTimers.delete(timer)
        startNote(ev)
      }, delay)
      startTimers.add(timer)
    }
  }

  function startNote(ev: PlaybackEvent): void {
    const url = sampleUrls.get(pitchKey(ev))
    if (!url || !playing.value) return
    const el = new Audio(url)
    el.volume = Math.min(1, ev.velocity || 0.8)
    audioHost().appendChild(el)
    activeNotes.push(el)
    el.addEventListener('ended', () => {
      el.remove()
      activeNotes = activeNotes.filter(note => note !== el)
    })
    const started = el.play()
    if (started)
      started.catch(() => {
        if (blockedNotified) return
        blockedNotified = true
        useNotifyStore().notify({ warning: 'El navegador bloqueó el audio. Haz clic en Reproducir de nuevo.' })
      })
  }

  function tick(): void {
    if (!playing.value) return
    const beat = baseBeat + ((performance.now() - startedAt) / 1000) * (playTempo / 60)
    playbackTime.value = Math.min(beat, maxBeat)
    if (beat >= maxBeat && activeNotes.length === 0 && startTimers.size === 0) {
      stop()
      return
    }
    raf = requestAnimationFrame(tick)
  }

  function clearTimers(): void {
    startTimers.forEach(window.clearTimeout)
    startTimers = new Set()
  }

  function resume(): void {
    playing.value = true
    startedAt = performance.now()
    schedule(baseBeat)
    for (const el of activeNotes) void el.play()
    tick()
  }

  async function play(): Promise<void> {
    const current = score.value
    if (!import.meta.client || !current || playing.value) return
    if (playbackTime.value !== null && playbackTime.value > 0) {
      resume()
      return
    }
    await prepareSamples()
    playTempo = current.tempo
    baseBeat = 0
    startedAt = performance.now()
    playbackTime.value = 0
    playing.value = true
    schedule(0)
    tick()
  }

  function pause(): void {
    playing.value = false
    cancelAnimationFrame(raf)
    clearTimers()
    for (const el of activeNotes) el.pause()
    baseBeat = playbackTime.value ?? 0
  }

  function stop(): void {
    playing.value = false
    cancelAnimationFrame(raf)
    clearTimers()
    for (const el of activeNotes) {
      el.pause()
      el.remove()
    }
    activeNotes = []
    playbackTime.value = null
    baseBeat = 0
  }

  async function toggle(): Promise<void> {
    if (playing.value) pause()
    else await play()
  }

  onScopeDispose(() => {
    stop()
    sampleUrls.forEach(url => URL.revokeObjectURL(url))
    sampleUrls.clear()
  })

  return { playing, preparing, playbackTime, toggle, play, pause, stop }
}
