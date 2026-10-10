import { describe, expect, it } from 'vitest'
import { defaultSong, newLine, newSection, newSyllable } from '~/types/song'
import { midiToNoteName, noteNameToMidi } from '~/utils/noteNames'
import { parseMidi } from '~/utils/midiParser'
import { applyNoteGroupsToLyrics, flattenSyllables, groupNotes, groupsToLines, importSongFromMidi, listMidiTracks, validateMidiFileMeta } from '~/utils/midiSongImport'
import { buildSmf } from './midiBuilder'

describe('noteNames', () => {
  it('uses scientific pitch with sharps (60 → C4)', () => {
    expect(midiToNoteName(60)).toBe('C4')
    expect(midiToNoteName(61)).toBe('C#4')
    expect(midiToNoteName(69)).toBe('A4')
    expect(noteNameToMidi('C4')).toBe(60)
    expect(noteNameToMidi('G#3')).toBe(56)
  })
})

describe('midiSongImport', () => {
  it('rejects non-midi names and oversized files', () => {
    expect(() => validateMidiFileMeta('song.json', 'application/json', 10)).toThrow('No es un archivo MIDI válido')
    expect(() => validateMidiFileMeta('song.mid', 'audio/midi', 3 * 1024 * 1024)).toThrow('demasiado grande')
  })

  it('maps a melody to one section of empty-text syllables', () => {
    const bytes = buildSmf({
      ticks: 480,
      tracks: [
        [
          { delta: 0, type: 'name', text: 'Melodía' },
          { delta: 0, type: 'tempo', us: 500000 },
          { delta: 0, type: 'on', note: 60 },
          { delta: 240, type: 'off', note: 60 },
          { delta: 0, type: 'on', note: 62 },
          { delta: 240, type: 'off', note: 62 },
          { delta: 0, type: 'on', note: 64 },
          { delta: 240, type: 'off', note: 64 },
        ],
      ],
    })
    const file = parseMidi(bytes)
    const tracks = listMidiTracks(file)
    expect(tracks).toHaveLength(1)
    const song = defaultSong()
    const result = importSongFromMidi(file, song, {
      track: tracks[0]!,
      mode: 'replace',
      overwriteTempo: true,
    })
    const sec = result.song.content!.sections[0]!
    expect(sec.name).toBe('Melodía')
    expect(sec.lines).toHaveLength(1)
    expect(sec.lines[0]!.syllables.map(s => s.notes)).toEqual([['C4'], ['D4'], ['E4']])
    expect(sec.lines[0]!.syllables.every(s => s.text === '')).toBe(true)
    expect(result.song.tempo).toBe('120 bpm')
  })

  it('groups overlapping note-ons as a chord on one syllable', () => {
    const notes = [
      { tick: 0, midi: 60, channel: 0, velocity: 80 },
      { tick: 10, midi: 64, channel: 0, velocity: 80 },
      { tick: 12, midi: 67, channel: 0, velocity: 80 },
    ]
    const groups = groupNotes(notes, 480, [])
    expect(groups).toHaveLength(1)
    expect(groups[0]!.notes).toEqual(['C4', 'E4', 'G4'])
  })

  it('starts a new line when the gap is greater than one beat', () => {
    const groups = [
      { tick: 0, notes: ['C4'] },
      { tick: 240, notes: ['D4'] },
      { tick: 240 + 481, notes: ['E4'] },
    ]
    const lines = groupsToLines(groups, 480, 1)
    expect(lines).toHaveLength(2)
    expect(lines[0]!.syllables.map(s => s.notes[0])).toEqual(['C4', 'D4'])
    expect(lines[1]!.syllables.map(s => s.notes[0])).toEqual(['E4'])
  })

  it('skips channel 10 percussion by default', () => {
    const bytes = buildSmf({
      format: 0,
      tracks: [
        [
          { delta: 0, type: 'on', ch: 0, note: 60 },
          { delta: 0, type: 'on', ch: 9, note: 36 },
          { delta: 480, type: 'off', ch: 0, note: 60 },
        ],
      ],
    })
    const file = parseMidi(bytes)
    const tracks = listMidiTracks(file)
    expect(tracks).toHaveLength(1)
    expect(tracks[0]!.noteCount).toBe(1)
    expect(tracks[0]!.preview).toEqual(['C4'])
  })

  it('fills lyrics in order when applying notes', () => {
    const content = {
      sections: [newSection('Verso', [newLine([newSyllable('Ho'), newSyllable('la'), newSyllable('mundo')])])],
      tabs: [],
    }
    content.sections[0]!.lines[0]!.syllables[0]!.chords = ['G']
    const apply = applyNoteGroupsToLyrics(content, [
      { tick: 0, notes: ['C4'] },
      { tick: 1, notes: ['E4'] },
    ])
    const syl = flattenSyllables(content)
    expect(apply.applied).toBe(2)
    expect(apply.unfilled).toBe(1)
    expect(syl[0]!.text).toBe('Ho')
    expect(syl[0]!.chords).toEqual(['G'])
    expect(syl.map(s => s.notes)).toEqual([['C4'], ['E4'], []])
  })

  it('does not create extra syllables when MIDI is longer in apply mode', () => {
    const song = defaultSong()
    song.title = 'Keep'
    song.content = {
      sections: [newSection('Verso', [newLine([newSyllable('Hey'), newSyllable('ya')])])],
      tabs: [],
    }
    const bytes = buildSmf({
      tracks: [
        [
          { delta: 0, type: 'name', text: 'Lead' },
          { delta: 0, type: 'on', note: 60 },
          { delta: 240, type: 'on', note: 62 },
          { delta: 240, type: 'on', note: 64 },
        ],
      ],
    })
    const file = parseMidi(bytes)
    const track = listMidiTracks(file)[0]!
    const result = importSongFromMidi(file, song, { track, mode: 'apply' })
    expect(flattenSyllables(result.song.content!).map(s => s.notes)).toEqual([['C4'], ['D4']])
    expect(result.apply?.leftover).toHaveLength(1)
    expect(result.warning).toMatch(/notas de más/)
    expect(result.song.title).toBe('Keep')
  })

  it('appends leftover MIDI as a new section when requested', () => {
    const song = defaultSong()
    song.content = {
      sections: [newSection('Verso', [newLine([newSyllable('Hey')])])],
      tabs: [],
    }
    const bytes = buildSmf({
      tracks: [
        [
          { delta: 0, type: 'name', text: 'Lead' },
          { delta: 0, type: 'on', note: 60 },
          { delta: 240, type: 'on', note: 62 },
        ],
      ],
    })
    const file = parseMidi(bytes)
    const track = listMidiTracks(file)[0]!
    const result = importSongFromMidi(file, song, { track, mode: 'apply', appendLeftover: true })
    expect(result.song.content!.sections).toHaveLength(2)
    expect(result.song.content!.sections[0]!.lines[0]!.syllables[0]!.notes).toEqual(['C4'])
    expect(result.song.content!.sections[1]!.lines[0]!.syllables[0]!.notes).toEqual(['D4'])
  })

  it('sets title from sequence name only when empty', () => {
    const song = defaultSong()
    const bytes = buildSmf({
      tracks: [
        [
          { delta: 0, type: 'name', text: 'Desde MIDI' },
          { delta: 0, type: 'on', note: 60 },
        ],
      ],
    })
    const file = parseMidi(bytes)
    const track = listMidiTracks(file)[0]!
    const result = importSongFromMidi(file, song, { track, mode: 'replace' })
    expect(result.song.title).toBe('Desde MIDI')
  })
})
