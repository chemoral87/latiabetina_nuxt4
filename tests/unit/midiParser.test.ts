import { describe, expect, it } from 'vitest'
import { firstTempoBpm, keySignatureToString, parseMidi } from '~/utils/midiParser'
import { buildSmf } from './midiBuilder'

describe('midiParser', () => {
  it('rejects files without MThd', () => {
    expect(() => parseMidi(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]))).toThrow('No es un archivo MIDI válido')
  })

  it('parses SMF 1 note-ons, tempo, key, and track name', () => {
    const bytes = buildSmf({
      ticks: 480,
      tracks: [
        [
          { delta: 0, type: 'name', text: 'Mi canción' },
          { delta: 0, type: 'tempo', us: 666667 },
          { delta: 0, type: 'key', sf: 1, mi: 0 },
        ],
        [
          { delta: 0, type: 'name', text: 'Melodía' },
          { delta: 0, type: 'on', note: 60, vel: 90 },
          { delta: 480, type: 'off', note: 60 },
          { delta: 0, type: 'on', note: 64 },
          { delta: 480, type: 'off', note: 64 },
        ],
      ],
    })
    const midi = parseMidi(bytes)
    expect(midi.format).toBe(1)
    expect(midi.ticksPerQuarter).toBe(480)
    expect(midi.sequenceName).toBe('Mi canción')
    expect(midi.key).toBe('G')
    expect(firstTempoBpm(midi)).toBe(90)
    const melody = midi.tracks.find(t => t.name === 'Melodía')
    expect(melody?.notes.map(n => n.midi)).toEqual([60, 64])
    expect(melody?.notes[0]?.tick).toBe(0)
    expect(melody?.notes[1]?.tick).toBe(480)
  })

  it('treats note-on with velocity 0 as note-off', () => {
    const bytes = buildSmf({
      format: 0,
      tracks: [[{ delta: 0, type: 'on', note: 60, vel: 0 }]],
    })
    const midi = parseMidi(bytes)
    expect(midi.tracks[0]?.notes).toEqual([])
  })

  it('parses running status note-ons', () => {
    const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 1, 0xe0]
    const events = [0, 0x90, 60, 80, 0x81, 0x70, 64, 80, 0, 0xff, 0x2f, 0]
    const bodyLen = events.length
    const bytes = new Uint8Array([...header, 0x4d, 0x54, 0x72, 0x6b, 0, 0, 0, bodyLen, ...events])
    const midi = parseMidi(bytes)
    expect(midi.tracks[0]?.notes.map(n => n.midi)).toEqual([60, 64])
    expect(midi.tracks[0]?.notes[1]?.tick).toBe(240)
  })

  it('maps key signatures', () => {
    expect(keySignatureToString(0, 0)).toBe('C')
    expect(keySignatureToString(-2, 0)).toBe('Bb')
    expect(keySignatureToString(0, 1)).toBe('Am')
    expect(keySignatureToString(1, 1)).toBe('Em')
  })
})
