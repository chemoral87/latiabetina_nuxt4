<template>
  <VContainer fluid class="pa-0">
    <div v-if="eventAuditorium && eventAuditorium.id">
      <div class="pa-2 grey lighten-4 d-flex align-center" style="position: relative">
        <span class="text-subtitle-2">{{ eventAuditorium.auditorium_name }}</span>
        |<span class="text-subtitle-2">{{ formatShortDate(eventAuditorium.event_date) }}</span>

        <VSpacer />
        <span class="text-subtitle-2">{{ totalSeatsWithStatus }}/{{ totalSeats }}</span>
        <span class="text-subtitle-2 ml-1" :style="{ color: percentageColor }">{{ percentajeTotalSeats }}%</span>

        <VBtn id="btn-auevent-stats" size="x-small" icon color="success" class="ml-1"
          title="Ver desglose por estatus" @click="statsPanel = !statsPanel">
          <VIcon size="small" color="yellow">mdi-chart-bar</VIcon>
        </VBtn>

        <MyDragPanel v-model="statsPanel" title="Desglose de asientos">
          <div class="stats-panel-body">
            <div v-for="(cfg, key) in activeStatusCfg" :key="key" class="stats-row">
              <span class="stats-dot" :style="{ background: cfg.color }"></span>
              <span class="stats-label">{{ cfg.label }}</span>
              <span class="stats-count">
                {{ statusBreakdown[key] || 0 }}
                <span class="grey-text mx-1 font-weight-thin">|</span>
                <span class="stats-percent">{{ getStatusPercentage(key) }}%</span>
              </span>
            </div>
            <div class="stats-row stats-total">
              <span class="stats-dot" style="background: transparent"></span>
              <span class="stats-label font-weight-bold">Total</span>
              <span class="stats-count font-weight-bold">
                {{ totalSeats }}
                <span class="grey-text mx-1 font-weight-thin">|</span>
                <span class="stats-percent">100%</span>
              </span>
            </div>
          </div>
        </MyDragPanel>
      </div>

      <div>
        <AuditoriumSeatsStageOp :sections="sections" :stage-config="stageConfig"
          :auditorium-event-id="eventAuditorium.id" :categories="stageCategories" :loading-seats="loadingSeats"
          @setEventSeat="handleSetEventSeat" />
      </div>
    </div>

    <VAlert v-else type="error" variant="outlined" class="ma-2">Evento no encontrado.</VAlert>
  </VContainer>
</template>

<script setup lang="ts">
import { DEFAULT_SETTINGS, STAGE_CATEGORIES, STATUS_CONFIG } from "~/constants/auditorium"
import { createRealtimeListeners } from "~/utils/realtime"
import { formatShortDate } from "~/utils/date"
import { useUAParser } from "~/utils/userAgent"

definePageMeta({
  title: "Evento Auditorio",
  icon: "mdi-theater",
  middleware: "authenticated",
})

interface Seat {
  id?: number | string
  i?: number | string
  row?: number | string
  col?: number | string
  category?: string | null
  status?: string | null
}

interface Subsection {
  id?: number | string
  i?: number | string
  name?: string
  n?: string
  isLabel?: boolean
  l?: boolean
  w?: number
  width?: number
  seats?: (Seat | null)[][]
  s?: (Seat | null)[][]
  [key: string]: unknown
}

interface Section {
  id?: number | string
  i?: number | string
  name?: string
  n?: string
  isLabel?: boolean
  l?: boolean
  subsections?: Subsection[]
  ss?: Subsection[]
  [key: string]: unknown
}

interface AuditoriumEvent {
  id?: number | string
  auditorium_name?: string
  event_date?: string | null
  config?: string | Record<string, unknown>
  seats?: Record<string, string[]> | string[]
  [key: string]: unknown
}

const route = useRoute()
const { AuditoriumEvent, AuditoriumEventSeat } = useRepository()
const { $echo } = useNuxtApp()
const uaParser = useUAParser()

let _realtimeCleanup: (() => void) | null = null

const eventAuditorium = ref<AuditoriumEvent>({})
const last_timestamp = ref<string | number | null>(null)
const sections = ref<Section[]>([])
const settings = ref<Record<string, unknown>>({ ...DEFAULT_SETTINGS })
const stageCategories = STAGE_CATEGORIES
const loading = ref(false)
const loadingSeats = ref<(number | string)[]>([])
const statsPanel = ref(false)

{
  const res = await AuditoriumEvent.show<AuditoriumEvent>(String(route.params.id)).catch(() => null)
  eventAuditorium.value = res || {}
  last_timestamp.value = (res as any)?.timestamp ?? null
}

const activeStatusCfg = computed(() => {
  return Object.keys(STATUS_CONFIG)
    .filter((k) => STATUS_CONFIG[k].active !== false)
    .reduce((acc, k) => {
      acc[k] = STATUS_CONFIG[k]
      return acc
    }, {} as Record<string, (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]>)
})

const statusBreakdown = computed(() => {
  const counts: Record<string, number> = {}
  const validKeys = Object.keys(STATUS_CONFIG)
  validKeys.forEach((k) => {
    counts[k] = 0
  })

  sections.value.forEach((section) => {
    const rawSubs = section.ss || section.subsections
    if (!rawSubs) return
    rawSubs.forEach((sub) => {
      const seatsSource = sub.s || sub.seats
      if (!seatsSource) return
      seatsSource.forEach((row) => {
        row.forEach((seat) => {
          if (!seat) return
          const s = seat.status
          const key = s && validKeys.includes(s) ? s : 'e'
          counts[key]++
        })
      })
    })
  })
  return counts
})

const stageConfig = computed(() => {
  if (!sections.value || sections.value.length === 0) {
    return { width: 900, height: 700 }
  }

  const maxSectionWidth = Math.max(...sections.value.map((section) => getSectionWidth(section)))

  const totalHeight =
    sections.value.reduce((acc, section, idx) => {
      return acc + getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
    }, DEFAULT_SETTINGS.SECTION_TOP_PADDING) + 100

  const width = maxSectionWidth + 10
  const height = Math.max(700, totalHeight)

  return { width, height }
})

const totalSeats = computed(() => {
  let count = 0
  sections.value.forEach((section) => {
    const rawSubs = section.ss || section.subsections
    if (rawSubs) {
      rawSubs.forEach((subsection) => {
        const seatsSource = subsection.s || subsection.seats
        if (seatsSource) {
          seatsSource.forEach((row) => {
            row.forEach((seat) => {
              if (seat) count++
            })
          })
        }
      })
    }
  })
  return count
})

const totalSeatsWithStatus = computed(() => {
  let count = 0
  sections.value.forEach((section) => {
    const rawSubs = section.ss || section.subsections
    if (rawSubs) {
      rawSubs.forEach((subsection) => {
        const seatsSource = subsection.s || subsection.seats
        if (seatsSource) {
          seatsSource.forEach((row) => {
            row.forEach((seat) => {
              if (seat && seat.status) {
                count++
              }
            })
          })
        }
      })
    }
  })
  return count
})

const percentajeTotalSeats = computed(() => {
  if (totalSeats.value === 0) return 0
  return ((totalSeatsWithStatus.value / totalSeats.value) * 100).toFixed(1)
})

const percentageColor = computed(() => {
  const percentage = parseFloat(String(percentajeTotalSeats.value))
  if (percentage >= 0 && percentage <= 60) {
    return "#4CAF50"
  } else if (percentage >= 61 && percentage <= 90) {
    return "#FF9800"
  } else if (percentage >= 91) {
    return "#F44336"
  }
  return "#000000"
})

onMounted(() => {
  loadConfiguration()

  setupRealtimeListeners()

  document.addEventListener("visibilitychange", handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (_realtimeCleanup) _realtimeCleanup()

  document.removeEventListener("visibilitychange", handleVisibilityChange)
})

function getStatusPercentage(key: string) {
  if (!totalSeats.value) return 0
  const count = statusBreakdown.value[key] || 0
  return ((count / totalSeats.value) * 100).toFixed(1)
}

function _isCsvConfig(raw: unknown): boolean {
  if (typeof raw !== 'string') return false
  const trimmed = raw.trimStart()
  return trimmed.startsWith('csv_format') || trimmed.startsWith('type,id,name,')
}

function _parseCsvConfig(csvString: string): Section[] {
  const lines = csvString
    .split('|')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []

  const parseCsvLine = (line: string): string[] => {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current)
        current = ''
      } else {
        current += ch
      }
    }
    fields.push(current)
    return fields
  }

  const isNewFormat = lines[0].trim() === 'csv_format'

  if (!isNewFormat) {
    const header = lines[0].split(',')
    const idx: Record<string, number> = {}
    header.forEach((h, i) => { idx[h.trim()] = i })

    const sectionsOut: Section[] = []
    let currentSection: Section | null = null
    let currentSub: Subsection | null = null

    for (let li = 1; li < lines.length; li++) {
      const f = parseCsvLine(lines[li])
      const type = f[idx.type] || ''
      const id = f[idx.id] || ''
      const name = f[idx.name] || ''
      const level = parseInt(f[idx.level] || '0', 10)
      const tr = f[idx.tr] !== '' && f[idx.tr] !== undefined ? parseInt(f[idx.tr], 10) : undefined
      const tc = f[idx.tc] !== '' && f[idx.tc] !== undefined ? parseInt(f[idx.tc], 10) : undefined
      const r = f[idx.r] !== '' && f[idx.r] !== undefined ? parseInt(f[idx.r], 10) : undefined
      const c = f[idx.c] !== '' && f[idx.c] !== undefined ? parseInt(f[idx.c], 10) : undefined
      const k = (f[idx.k] || '').trim()

      if (type === 's') {
        currentSection = { id, name, isLabel: level === 1, subsections: [] }
        currentSub = null
        sectionsOut.push(currentSection)
      } else if (type === 'ss' && currentSection) {
        currentSub = { id, name, isLabel: level === 1 }
        if (currentSub.isLabel) { currentSub.width = 100 } else { currentSub.seats = [] }
        currentSection.subsections!.push(currentSub)
      } else if (type === 'seat' && currentSub && !currentSub.isLabel) {
        const seats = currentSub.seats || []
        while (seats.length <= r!) { seats.push([]) }
        const seat: Seat = { id, row: r, col: c }
        if (k) seat.category = k
        seats[r!].push(seat)
        currentSub.seats = seats
      }
    }
    return sectionsOut
  }

  const sectionsOut: Section[] = []
  let currentSection: Section | null = null
  let currentSub: Subsection | null = null
  let sectionCounter = 0
  let subCounter = 0

  for (let li = 1; li < lines.length; li++) {
    const f = parseCsvLine(lines[li])
    const type = f[0] || ''

    if (type === 's') {
      sectionCounter++
      subCounter = 0
      const name = f[1] || ''
      const isLabel = f[2] === '1'
      currentSection = { id: String(sectionCounter), name, isLabel, subsections: [] }
      currentSub = null
      sectionsOut.push(currentSection)
    } else if (type === 'ss' && currentSection) {
      subCounter++
      const name = f[1] || ''
      const isLabel = f[4] === '1'
      const subId = `${currentSection.id}-${subCounter}`
      currentSub = { id: subId, name, isLabel }
      if (isLabel) {
        currentSub.width = 100
      } else {
        currentSub.seats = []
      }
      currentSection.subsections!.push(currentSub)
    } else if (type === 'z' && currentSub && !currentSub.isLabel) {
      const id = f[1] || ''
      const r = f[2] !== '' && f[2] !== undefined ? parseInt(f[2], 10) : 0
      const c = f[3] !== '' && f[3] !== undefined ? parseInt(f[3], 10) : 0
      const k = (f[4] || '').trim()
      const seats = currentSub.seats || []
      while (seats.length <= r) { seats.push([]) }
      const seat: Seat = { id, row: r, col: c }
      if (k) seat.category = k
      seats[r].push(seat)
      currentSub.seats = seats
    }
  }

  return sectionsOut
}

function loadConfiguration() {
  if (!eventAuditorium.value?.config) {
    return
  }

  const raw = eventAuditorium.value.config

  if (_isCsvConfig(raw)) {
    sections.value = _parseCsvConfig(raw as string)
    _applyInitialSeatStatuses()
    return
  }

  let config = raw
  if (typeof config === "string") {
    try {
      config = JSON.parse(config)
    } catch (e) {
      return
    }
  }

  const cfg = config as { s?: unknown; sections?: unknown; settings?: Record<string, unknown> }
  if (cfg.s || cfg.sections) {
    if (cfg.settings) {
      Object.assign(settings.value, DEFAULT_SETTINGS, cfg.settings)
    }

    const rawSections = (cfg.s || cfg.sections) as Record<string, unknown>[]
    const cleanSections: Section[] = rawSections.map((section, sIdx) => {
      const s: Section = {
        id: (section.i as number | string) || (section.id as number | string) || `${sIdx + 1}`,
        name: (section.n as string) || (section.name as string),
        isLabel: !!(section.l || section.isLabel),
        subsections: [],
      }

      if (section.ss || section.subsections) {
        const rawSubs = (section.ss || section.subsections) as Record<string, unknown>[]
        s.subsections = rawSubs.map((sub, subIdx) => {
          const ss: Subsection = {
            id: (sub.i as number | string) || (sub.id as number | string) || `${s.id}-${subIdx + 1}`,
            name: (sub.n as string) || (sub.name as string),
            isLabel: !!(sub.l || sub.isLabel),
          }
          if (ss.isLabel) {
            ss.width = (sub.w as number) || (sub.width as number)
          } else {
            const rawSeats = (sub.s || sub.seats) as (Record<string, unknown> | null)[][]
            if (rawSeats) {
              ss.seats = rawSeats.map((row, rowIdx) => {
                return row.map((seat, colIdx) => {
                  if (!seat) return null
                  return {
                    id: (seat.i as number | string) || (seat.id as number | string) || `${ss.id}-${rowIdx + 1}-${colIdx + 1}`,
                    row: seat.r !== undefined ? (seat.r as number | string) : (seat.row as number | string),
                    col: seat.c !== undefined ? (seat.c as number | string) : (seat.col as number | string),
                    category: (seat.k as string) || (seat.category as string),
                  } as Seat
                })
              })
            }
          }
          return ss
        })
      }
      return s
    })

    sections.value = cleanSections
    _applyInitialSeatStatuses()
  }
}

function _applyInitialSeatStatuses() {
  const seatsData = eventAuditorium.value.seats
  if (seatsData && !Array.isArray(seatsData)) {
    Object.entries(seatsData).forEach(([status, seatIds]) => {
      if (Array.isArray(seatIds)) {
        seatIds.forEach((seatId) => {
          const seat = findSeatById(seatId)
          if (seat) {
            seat.status = status
          }
        })
      }
    })
  }
}

function getSectionWidth(section: Section) {
  const isLabel = section.l || section.isLabel
  if (isLabel) return 0
  const rawSubs = section.ss || section.subsections
  if (!rawSubs || rawSubs.length === 0) return 0
  return (
    rawSubs.reduce((acc, s) => {
      const isSubLabel = s.l || s.isLabel
      return acc + (isSubLabel ? s.w || s.width || 100 : getSubsectionWidth(s))
    }, 0) +
    (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
    DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2
  )
}

function getSectionHeight(section: Section) {
  const isLabel = section.l || section.isLabel
  if (isLabel) return 30
  const rawSubs = section.ss || section.subsections
  if (!rawSubs || rawSubs.length === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
  const maxRows = Math.max(...rawSubs.map((sub) => {
    const isSubLabel = sub.l || sub.isLabel
    const seatsSource = sub.s || sub.seats
    return (isSubLabel ? 0 : seatsSource?.length || 0)
  }))
  if (maxRows === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + 40
  const seatSpacing = DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
  return maxRows * seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE + DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
}

function getSubsectionWidth(sub: Subsection) {
  const isLabel = sub.l || sub.isLabel
  if (isLabel) return sub.w || sub.width || 100
  const seatsSource = sub.s || sub.seats
  if (!seatsSource || seatsSource.length === 0) return 0
  const maxCols = Math.max(...seatsSource.map((row) => row.length))
  const seatSpacing = DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
  return maxCols * seatSpacing - DEFAULT_SETTINGS.SEATS_DISTANCE
}

async function handleSetEventSeat(payload: { seatIds: (number | string)[]; status: string | null }) {
  const { seatIds, status } = payload

  if (!seatIds || seatIds.length === 0) {
    return
  }

  loading.value = true
  loadingSeats.value = [...loadingSeats.value, ...seatIds]

  try {
    const updatePayload = {
      i: eventAuditorium.value.id,
      z: seatIds,
      s: status,
    }
    const result = await AuditoriumEventSeat.create<{ z?: (number | string)[]; t?: string | number; s?: string | null }>(updatePayload)

    const timestamp = result?.t
    if (timestamp && (!last_timestamp.value || timestamp > last_timestamp.value)) {
      last_timestamp.value = timestamp
    }

    if (Array.isArray(result?.z)) {
      result.z.forEach((seatId) => {
        const seat = findSeatById(seatId)
        if (seat) {
          seat.status = result.s ?? status
        }
      })
    }
  } catch (error) {
    /* ignore */
  } finally {
    loading.value = false
    loadingSeats.value = loadingSeats.value.filter((id) => !seatIds.includes(id))
  }
}

function findSeatById(seatId: number | string): Seat | null {
  for (const section of sections.value) {
    const rawSubs = section.ss || section.subsections
    if (rawSubs) {
      for (const subsection of rawSubs) {
        const seatsSource = subsection.s || subsection.seats
        if (seatsSource) {
          for (const row of seatsSource) {
            for (const seat of row) {
              const id = seat?.i || seat?.id
              if (id === seatId) {
                return seat
              }
            }
          }
        }
      }
    }
  }
  return null
}

async function handleVisibilityChange() {
  if (!uaParser.isMobile()) return

  if (!document.hidden && eventAuditorium.value?.id) {
    try {
      const response = await AuditoriumEventSeat.index<{ timestamp?: string | number; seats_log?: { seat_ids?: (number | string)[]; status?: string | null }[] }>({
        auditorium_event_id: eventAuditorium.value.id,
        last_timestamp: last_timestamp.value,
      })

      if (response?.timestamp) {
        if (!last_timestamp.value || response.timestamp > last_timestamp.value) {
          last_timestamp.value = response.timestamp
        }
      }

      if (response?.seats_log && Array.isArray(response.seats_log)) {
        response.seats_log.forEach((logEntry) => {
          if (logEntry.seat_ids && Array.isArray(logEntry.seat_ids)) {
            logEntry.seat_ids.forEach((seatId) => {
              const seat = findSeatById(seatId)
              if (seat) {
                seat.status = logEntry.status
              }
            })
          }
        })
      }
    } catch (error) {
      /* ignore */
    }
  }
}

function setupRealtimeListeners() {
  if (!eventAuditorium.value?.id) return

  const handleSeatUpdate = (data: any) => {
    const timestamp = data.t || data.timestamp
    const seatIds = data.z || data.seats || data.seat_ids
    const status = data.s || data.status

    if (timestamp && (!last_timestamp.value || timestamp > last_timestamp.value)) {
      last_timestamp.value = timestamp
    }

    if (seatIds && Array.isArray(seatIds)) {
      seatIds.forEach((item: any) => {
        const id = typeof item === "string" ? item : item.z || item.seat_id
        const seatStatus = typeof item === "object" && item !== null ? (item.s || item.status || status) : status

        const seat = findSeatById(id)
        if (seat) {
          seat.status = seatStatus
        }
      })
    }
  }

  _realtimeCleanup = createRealtimeListeners($echo, [{
    name: `auditorium-event.${eventAuditorium.value.id}`,
    events: {
      '.seat.updated': handleSeatUpdate,
    },
  }], {}, _realtimeCleanup)
}
</script>

<style scoped>
.stats-panel-body {
  padding: 6px 0 4px;
}

.stats-row {
  display: flex;
  align-items: center;
  padding: 3px 12px;
  gap: 8px;
  transition: background 0.15s;
}

.stats-row:hover {
  background: #f5f5f5;
}

.stats-total {
  border-top: 1px solid #e0e0e0;
  margin-top: 4px;
  padding-top: 6px;
}

.stats-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.stats-label {
  flex: 1;
  font-size: 12px;
  color: #333;
}

.stats-count {
  font-size: 12px;
  font-weight: 600;
  color: #111;
  text-align: right;
  white-space: nowrap;
}

.stats-percent {
  display: inline-block;
  min-width: 42px;
  font-weight: 400;
  color: #666;
}
</style>
