/** Minimal SMF encoder for unit tests. */

function u16(n: number): number[] {
  return [(n >> 8) & 0xff, n & 0xff]
}

function u32(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]
}

export function vlq(n: number): number[] {
  const bytes = [n & 0x7f]
  let value = n >>> 7
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80)
    value >>>= 7
  }
  return bytes
}

export type TestMidiEvent =
  | { delta: number; type: 'on'; ch?: number; note: number; vel?: number }
  | { delta: number; type: 'off'; ch?: number; note: number; vel?: number }
  | { delta: number; type: 'tempo'; us: number }
  | { delta: number; type: 'name'; text: string }
  | { delta: number; type: 'key'; sf: number; mi: number }
  | { delta: number; type: 'time'; nn: number; dd: number }

function ascii(text: string): number[] {
  return [...text].map(c => c.charCodeAt(0))
}

function encodeEvent(ev: TestMidiEvent): number[] {
  const d = vlq(ev.delta)
  if (ev.type === 'on') return [...d, 0x90 | (ev.ch ?? 0), ev.note, ev.vel ?? 80]
  if (ev.type === 'off') return [...d, 0x80 | (ev.ch ?? 0), ev.note, ev.vel ?? 64]
  if (ev.type === 'tempo') {
    return [...d, 0xff, 0x51, 0x03, (ev.us >> 16) & 0xff, (ev.us >> 8) & 0xff, ev.us & 0xff]
  }
  if (ev.type === 'name') {
    const bytes = ascii(ev.text)
    return [...d, 0xff, 0x03, ...vlq(bytes.length), ...bytes]
  }
  if (ev.type === 'key') {
    const sf = ev.sf < 0 ? 256 + ev.sf : ev.sf
    return [...d, 0xff, 0x59, 0x02, sf, ev.mi]
  }
  return [...d, 0xff, 0x58, 0x04, ev.nn, ev.dd, 24, 8]
}

export function buildSmf(opts: { format?: number; ticks?: number; tracks: TestMidiEvent[][] }): Uint8Array {
  const format = opts.format ?? 1
  const ticks = opts.ticks ?? 480
  const header = [...ascii('MThd'), ...u32(6), ...u16(format), ...u16(opts.tracks.length), ...u16(ticks)]
  const chunks: number[] = [...header]
  for (const events of opts.tracks) {
    const body: number[] = []
    for (const ev of events) body.push(...encodeEvent(ev))
    body.push(...vlq(0), 0xff, 0x2f, 0x00)
    chunks.push(...ascii('MTrk'), ...u32(body.length), ...body)
  }
  return new Uint8Array(chunks)
}
