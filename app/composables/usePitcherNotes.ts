import { storeToRefs } from 'pinia'
import { usePitcherStore } from '~/composables/usePitcherStore'

export const PITCH_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const LATIN_PITCH_NOTES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si']

/**
 * Resolves the notes the pitcher should highlight, supporting several notes at
 * once (chords heard through the mic or played back from a score).
 *
 * `frequencies` wins when it has values; otherwise it falls back to the single
 * `frequency` used by the monophonic input path.
 */
export function usePitcherNotes(frequency: () => number | null | undefined, frequencies?: () => number[] | null | undefined) {
  const store = usePitcherStore()
  const { ghostQuarterNote, latinNotation } = storeToRefs(store)

  const targetMidis = computed(() => {
    const list = frequencies?.()?.length ? frequencies()! : frequency() != null ? [frequency()!] : []
    const midis = list.filter(freq => typeof freq === 'number' && freq > 0).map(freq => Math.round(69 + 12 * Math.log2(freq / 440)))
    return [...new Set(midis)]
  })

  const targetMidiSet = computed(() => new Set(targetMidis.value))

  const targetLabels = computed(() =>
    targetMidis.value.map(midi => {
      const pitchClass = ((midi % 12) + 12) % 12
      const name = (latinNotation.value ? LATIN_PITCH_NOTES : PITCH_NOTES)[pitchClass]
      return `${name}${Math.floor(midi / 12) - 1}`
    })
  )

  function isExactMidi(midi: number): boolean {
    return targetMidiSet.value.has(midi)
  }

  function isAdjacentMidi(midi: number): boolean {
    if (!ghostQuarterNote.value) return false
    return targetMidis.value.some(target => Math.abs(midi - target) === 12)
  }

  return { targetMidis, targetMidiSet, targetLabels, isExactMidi, isAdjacentMidi }
}
