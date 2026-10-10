import { newLine, newSection, newSyllable, type Song, type SongContent, type SongSyllable } from '~/types/song'
import { firstTempoBpm, MIDI_MAX_BYTES, MidiParseError, parseMidi, type MidiFile, type MidiNoteOn } from '~/utils/midiParser'
import { midiToNoteName } from '~/utils/noteNames'

export const PERCUSSION_CHANNEL = 9
export const DEFAULT_GAP_BEATS = 1
export const CHORD_WINDOW_TICKS = 15
export const CHORD_WINDOW_MS = 30
export const PREVIEW_NOTE_COUNT = 8

export type MidiImportMode = 'replace' | 'append' | 'apply'

export interface MidiTrackChoice {
  id: string
  trackIndex: number
  channel: number | null
  name: string
  noteCount: number
  preview: string[]
}

export interface NoteGroup {
  tick: number
  notes: string[]
}

export class MidiImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MidiImportError'
  }
}

export function validateMidiFileMeta(name: string, mime: string, size: number): void {
  if (size > MIDI_MAX_BYTES) {
    throw new MidiImportError('El archivo MIDI es demasiado grande (máximo 2 MB).')
  }
  const lower = name.toLowerCase()
  const extOk = lower.endsWith('.mid') || lower.endsWith('.midi')
  const mimeOk = /midi/i.test(mime || '')
  if (!extOk && !mimeOk) {
    throw new MidiImportError('No es un archivo MIDI válido')
  }
}

export function parseMidiSongFile(data: ArrayBuffer | Uint8Array): MidiFile {
  try {
    return parseMidi(data)
  } catch (err) {
    if (err instanceof MidiParseError || err instanceof MidiImportError) throw err
    throw new MidiImportError('No es un archivo MIDI válido')
  }
}

function isPercussion(note: MidiNoteOn): boolean {
  return note.channel === PERCUSSION_CHANNEL
}

export function listMidiTracks(file: MidiFile, includePercussion = false): MidiTrackChoice[] {
  const choices: MidiTrackChoice[] = []
  for (const track of file.tracks) {
    const notes = includePercussion ? track.notes : track.notes.filter(n => !isPercussion(n))
    if (!notes.length) continue
    const byChannel = new Map<number, MidiNoteOn[]>()
    for (const n of notes) {
      const list = byChannel.get(n.channel) ?? []
      list.push(n)
      byChannel.set(n.channel, list)
    }
    const channels = [...byChannel.keys()].sort((a, b) => a - b)
    const split = channels.length > 1
    for (const ch of channels) {
      const chNotes = byChannel.get(ch)!
      const groups = groupNotes(chNotes, file.ticksPerQuarter, file.tempoMap)
      const preview = groups.slice(0, PREVIEW_NOTE_COUNT).map(g => g.notes.join('+'))
      const baseName = track.name || `Pista ${track.index + 1}`
      choices.push({
        id: `${track.index}:${ch}`,
        trackIndex: track.index,
        channel: split ? ch : ch,
        name: split ? `${baseName} (canal ${ch + 1})` : baseName,
        noteCount: groups.length,
        preview,
      })
    }
  }
  return choices
}

function tempoAtTick(tempoMap: MidiFile['tempoMap'], tick: number): number {
  let us = 500_000
  for (const p of tempoMap) {
    if (p.tick > tick) break
    us = p.microsecondsPerQuarter
  }
  return us
}

function ticksToMs(deltaTicks: number, tick: number, ticksPerQuarter: number, tempoMap: MidiFile['tempoMap']): number {
  const us = tempoAtTick(tempoMap, tick)
  return (deltaTicks / ticksPerQuarter) * (us / 1000)
}

export function groupNotes(
  notes: MidiNoteOn[],
  ticksPerQuarter: number,
  tempoMap: MidiFile['tempoMap'],
  chordWindowTicks = CHORD_WINDOW_TICKS,
  chordWindowMs = CHORD_WINDOW_MS
): NoteGroup[] {
  const sorted = [...notes].sort((a, b) => a.tick - b.tick || a.midi - b.midi)
  const groups: NoteGroup[] = []
  for (const note of sorted) {
    const last = groups[groups.length - 1]
    if (last) {
      const dt = note.tick - last.tick
      const ms = ticksToMs(dt, last.tick, ticksPerQuarter, tempoMap)
      if (dt <= chordWindowTicks || ms <= chordWindowMs) {
        const name = midiToNoteName(note.midi)
        if (!last.notes.includes(name)) last.notes.push(name)
        continue
      }
    }
    groups.push({ tick: note.tick, notes: [midiToNoteName(note.midi)] })
  }
  return groups
}

export function groupsToLines(groups: NoteGroup[], ticksPerQuarter: number, gapBeats = DEFAULT_GAP_BEATS): SongContent['sections'][0]['lines'] {
  const lines: ReturnType<typeof newLine>[] = []
  let current = newLine()
  let lastTick: number | null = null
  for (const g of groups) {
    if (lastTick !== null) {
      const beats = (g.tick - lastTick) / ticksPerQuarter
      if (beats > gapBeats) {
        if (current.syllables.length) lines.push(current)
        current = newLine()
      }
    }
    current.syllables.push(newSyllable(''))
    current.syllables[current.syllables.length - 1]!.notes = [...g.notes]
    lastTick = g.tick
  }
  if (current.syllables.length) lines.push(current)
  return lines
}

export function notesForTrack(file: MidiFile, choice: MidiTrackChoice, includePercussion = false): MidiNoteOn[] {
  const track = file.tracks[choice.trackIndex]
  if (!track) return []
  return track.notes.filter(n => {
    if (!includePercussion && isPercussion(n)) return false
    if (choice.channel !== null && n.channel !== choice.channel) return false
    return true
  })
}

export function midiTrackToContent(file: MidiFile, choice: MidiTrackChoice, options?: { includePercussion?: boolean; gapBeats?: number }): SongContent {
  const notes = notesForTrack(file, choice, options?.includePercussion)
  const groups = groupNotes(notes, file.ticksPerQuarter, file.tempoMap)
  if (!groups.length) throw new MidiImportError('El archivo no tiene notas')
  const lines = groupsToLines(groups, file.ticksPerQuarter, options?.gapBeats ?? DEFAULT_GAP_BEATS)
  const section = newSection(choice.name || 'MIDI', lines)
  return { sections: [section], tabs: [] }
}

export function flattenSyllables(content: SongContent): SongSyllable[] {
  const out: SongSyllable[] = []
  for (const sec of content.sections) {
    for (const line of sec.lines) {
      for (const syl of line.syllables) out.push(syl)
    }
  }
  return out
}

export function songHasLyrics(content: SongContent): boolean {
  return flattenSyllables(content).some(s => (s.text || '').trim().length > 0)
}

export interface ApplyNotesResult {
  applied: number
  unfilled: number
  leftover: NoteGroup[]
}

/** Writes MIDI note groups onto existing syllables in document order. Never changes text or chords. */
export function applyNoteGroupsToLyrics(content: SongContent, groups: NoteGroup[]): ApplyNotesResult {
  const syllables = flattenSyllables(content)
  const n = Math.min(syllables.length, groups.length)
  for (let i = 0; i < n; i++) {
    syllables[i]!.notes = [...groups[i]!.notes]
  }
  return {
    applied: n,
    unfilled: Math.max(0, syllables.length - groups.length),
    leftover: groups.slice(syllables.length),
  }
}

export function leftoverToContent(leftover: NoteGroup[], ticksPerQuarter: number, name = 'MIDI (resto)', gapBeats = DEFAULT_GAP_BEATS): SongContent {
  const lines = groupsToLines(leftover, ticksPerQuarter, gapBeats)
  if (!lines.length) return { sections: [], tabs: [] }
  return { sections: [newSection(name, lines)], tabs: [] }
}

export interface MidiImportApplyOptions {
  track: MidiTrackChoice
  mode: MidiImportMode
  overwriteTempo?: boolean
  overwriteKey?: boolean
  includePercussion?: boolean
  appendLeftover?: boolean
}

export interface MidiImportResult {
  song: Partial<Song>
  apply?: ApplyNotesResult
  warning?: string
}

export function buildMidiMetadata(
  file: MidiFile,
  current: Pick<Song, 'title' | 'key' | 'tempo'>,
  overwrite: { tempo?: boolean; key?: boolean } = {}
): Pick<Song, 'title' | 'key' | 'tempo'> {
  const bpm = firstTempoBpm(file)
  const tempoFromMidi = bpm != null ? `${bpm} bpm` : ''
  const title = current.title?.trim() ? current.title : file.sequenceName || ''
  const key = overwrite.key || !current.key?.trim() ? file.key || current.key : current.key
  const tempo = overwrite.tempo || !current.tempo?.trim() ? tempoFromMidi || current.tempo : current.tempo
  return { title, key, tempo }
}

export function importSongFromMidi(file: MidiFile, current: Song, options: MidiImportApplyOptions): MidiImportResult {
  const tracks = listMidiTracks(file, options.includePercussion)
  if (!tracks.length) throw new MidiImportError('El archivo no tiene notas')
  const choice = tracks.find(t => t.id === options.track.id) ?? options.track
  const notes = notesForTrack(file, choice, options.includePercussion)
  const groups = groupNotes(notes, file.ticksPerQuarter, file.tempoMap)
  if (!groups.length) throw new MidiImportError('El archivo no tiene notas')

  const meta = buildMidiMetadata(file, current, {
    tempo: options.overwriteTempo,
    key: options.overwriteKey,
  })
  const midiContent = midiTrackToContent(file, choice, { includePercussion: options.includePercussion })

  if (options.mode === 'append') {
    return {
      song: {
        ...meta,
        content: {
          sections: [...current.content.sections, ...midiContent.sections],
          tabs: current.content.tabs,
        },
      },
    }
  }

  if (options.mode === 'apply') {
    const next: SongContent = JSON.parse(JSON.stringify(current.content)) as SongContent
    const apply = applyNoteGroupsToLyrics(next, groups)
    if (options.appendLeftover && apply.leftover.length) {
      const extra = leftoverToContent(apply.leftover, file.ticksPerQuarter, `${choice.name} (resto)`)
      next.sections.push(...extra.sections)
    }
    let warning: string | undefined
    if (apply.unfilled > 0) {
      warning = `Se aplicaron ${apply.applied} notas. ${apply.unfilled} sílabas quedaron sin notas.`
    } else if (apply.leftover.length && !options.appendLeftover) {
      warning = `Hay ${apply.leftover.length} notas de más. No se crearon sílabas extra. Usa Agregar sección para el resto.`
    }
    return { song: { ...meta, content: next }, apply, warning }
  }

  return {
    song: {
      ...meta,
      content: {
        sections: midiContent.sections,
        tabs: current.content.tabs,
      },
    },
  }
}
