/** Standard MIDI File (SMF 0/1) parser. No playback; note-ons, tempo, key, names. */

export const MIDI_MAGIC = 'MThd'
export const MIDI_MAX_BYTES = 2 * 1024 * 1024

export class MidiParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MidiParseError'
  }
}

export interface MidiTempoPoint {
  tick: number
  microsecondsPerQuarter: number
  bpm: number
}

export interface MidiNoteOn {
  tick: number
  midi: number
  channel: number
  velocity: number
  durationTicks: number
}

export interface MidiTrack {
  index: number
  name: string
  notes: MidiNoteOn[]
}

export interface MidiFile {
  format: number
  ticksPerQuarter: number
  tracks: MidiTrack[]
  tempoMap: MidiTempoPoint[]
  key: string | null
  timeSignature: { numerator: number; denominator: number } | null
  sequenceName: string | null
}

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#']
const MAJOR_FLAT_KEYS = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb']
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m']
const MINOR_FLAT_KEYS = ['Am', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm']

export function keySignatureToString(sf: number, mi: number): string | null {
  const sharps = Math.round(sf)
  if (sharps < -7 || sharps > 7) return null
  const minor = mi === 1
  if (sharps >= 0) {
    const table = minor ? MINOR_KEYS : MAJOR_KEYS
    return table[sharps] ?? null
  }
  const table = minor ? MINOR_FLAT_KEYS : MAJOR_FLAT_KEYS
  return table[-sharps] ?? null
}

export function microsecondsToBpm(us: number): number {
  if (!us || us <= 0) return 120
  return 60_000_000 / us
}

class ByteReader {
  private offset = 0
  constructor(private readonly bytes: Uint8Array) {}

  get pos(): number {
    return this.offset
  }

  remaining(): number {
    return this.bytes.length - this.offset
  }

  seek(pos: number) {
    this.offset = pos
  }

  require(n: number) {
    if (this.offset + n > this.bytes.length) {
      throw new MidiParseError('No es un archivo MIDI válido')
    }
  }

  readBytes(n: number): Uint8Array {
    this.require(n)
    const slice = this.bytes.subarray(this.offset, this.offset + n)
    this.offset += n
    return slice
  }

  readU8(): number {
    this.require(1)
    return this.bytes[this.offset++]!
  }

  readU16(): number {
    this.require(2)
    const v = (this.bytes[this.offset]! << 8) | this.bytes[this.offset + 1]!
    this.offset += 2
    return v
  }

  readU32(): number {
    this.require(4)
    const v = ((this.bytes[this.offset]! << 24) | (this.bytes[this.offset + 1]! << 16) | (this.bytes[this.offset + 2]! << 8) | this.bytes[this.offset + 3]!) >>> 0
    this.offset += 4
    return v
  }

  readAscii(n: number): string {
    const bytes = this.readBytes(n)
    let s = ''
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!)
    return s
  }

  readVarLen(): number {
    let value = 0
    for (let i = 0; i < 4; i++) {
      const b = this.readU8()
      value = (value << 7) | (b & 0x7f)
      if ((b & 0x80) === 0) return value >>> 0
    }
    throw new MidiParseError('No es un archivo MIDI válido')
  }
}

function decodeText(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/\0/g, '').trim()
  } catch {
    let s = ''
    for (let i = 0; i < bytes.length; i++) {
      const c = bytes[i]!
      if (c >= 32 && c < 127) s += String.fromCharCode(c)
    }
    return s.trim()
  }
}

function signedByte(n: number): number {
  return n > 127 ? n - 256 : n
}

export function parseMidi(data: ArrayBuffer | Uint8Array): MidiFile {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  if (bytes.length < 14) throw new MidiParseError('No es un archivo MIDI válido')
  const r = new ByteReader(bytes)

  if (r.readAscii(4) !== MIDI_MAGIC) throw new MidiParseError('No es un archivo MIDI válido')
  const headerLen = r.readU32()
  if (headerLen < 6) throw new MidiParseError('No es un archivo MIDI válido')
  const format = r.readU16()
  const ntrks = r.readU16()
  const division = r.readU16()
  if (headerLen > 6) r.readBytes(headerLen - 6)

  if (format > 1) throw new MidiParseError('No es un archivo MIDI válido')
  if (division & 0x8000) {
    throw new MidiParseError('No es un archivo MIDI válido')
  }
  const ticksPerQuarter = division || 96
  if (ntrks < 1 || ntrks > 256) throw new MidiParseError('No es un archivo MIDI válido')

  const tracks: MidiTrack[] = []
  const tempoMap: MidiTempoPoint[] = []
  let key: string | null = null
  let timeSignature: MidiFile['timeSignature'] = null
  let sequenceName: string | null = null

  for (let t = 0; t < ntrks; t++) {
    if (r.remaining() < 8) throw new MidiParseError('No es un archivo MIDI válido')
    const chunkType = r.readAscii(4)
    const chunkLen = r.readU32()
    if (chunkType !== 'MTrk') {
      r.readBytes(Math.min(chunkLen, r.remaining()))
      continue
    }
    const end = r.pos + chunkLen
    if (end > bytes.length) throw new MidiParseError('No es un archivo MIDI válido')

    const notes: MidiNoteOn[] = []
    const sounding = new Map<string, MidiNoteOn>()
    let name = ''
    let tick = 0
    let runningStatus = 0
    let ended = false

    while (r.pos < end && !ended) {
      const delta = r.readVarLen()
      tick += delta
      if (r.pos >= end) break
      let status = r.readU8()
      if (status < 0x80) {
        if (!runningStatus) throw new MidiParseError('No es un archivo MIDI válido')
        r.seek(r.pos - 1)
        status = runningStatus
      } else if (status < 0xf0) {
        runningStatus = status
      }

      if (status === 0xff) {
        const metaType = r.readU8()
        const len = r.readVarLen()
        const payload = r.readBytes(len)
        if (metaType === 0x2f) {
          ended = true
        } else if (metaType === 0x51 && payload.length >= 3) {
          const us = (payload[0]! << 16) | (payload[1]! << 8) | payload[2]!
          tempoMap.push({ tick, microsecondsPerQuarter: us, bpm: microsecondsToBpm(us) })
        } else if (metaType === 0x58 && payload.length >= 2 && !timeSignature) {
          const den = 2 ** payload[1]!
          timeSignature = { numerator: payload[0]!, denominator: den || 4 }
        } else if (metaType === 0x59 && payload.length >= 2 && !key) {
          key = keySignatureToString(signedByte(payload[0]!), payload[1]!)
        } else if ((metaType === 0x03 || metaType === 0x01) && payload.length) {
          const text = decodeText(payload)
          if (text) {
            if (!name) name = text
            if (!sequenceName) sequenceName = text
          }
        }
      } else if (status === 0xf0 || status === 0xf7) {
        const len = r.readVarLen()
        r.readBytes(len)
        runningStatus = 0
      } else if (status >= 0x80 && status <= 0xef) {
        const type = status & 0xf0
        const channel = status & 0x0f
        const dataLen = type === 0xc0 || type === 0xd0 ? 1 : 2
        const d0 = r.readU8()
        const d1 = dataLen === 2 ? r.readU8() : 0
        if (type === 0x90 && d1 > 0) {
          const note: MidiNoteOn = { tick, midi: d0, channel, velocity: d1, durationTicks: ticksPerQuarter }
          sounding.set(`${channel}:${d0}`, note)
          notes.push(note)
        } else if (type === 0x80 || (type === 0x90 && d1 === 0)) {
          const open = sounding.get(`${channel}:${d0}`)
          if (open) {
            open.durationTicks = Math.max(1, tick - open.tick)
            sounding.delete(`${channel}:${d0}`)
          }
        }
      } else {
        throw new MidiParseError('No es un archivo MIDI válido')
      }
    }

    r.seek(end)
    tracks.push({ index: t, name, notes })
  }

  tempoMap.sort((a, b) => a.tick - b.tick)

  return {
    format,
    ticksPerQuarter,
    tracks,
    tempoMap,
    key,
    timeSignature,
    sequenceName,
  }
}

export function firstTempoBpm(file: MidiFile): number | null {
  const first = file.tempoMap[0]
  if (!first) return null
  return Math.round(first.bpm)
}
