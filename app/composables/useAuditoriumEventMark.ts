import { createRealtimeListeners } from "~/utils/realtime"
import { useUAParser } from "~/utils/userAgent"
import {
  applySeatStatuses,
  findSeatById,
  isCsvConfig,
  normalizeSections,
  parseAuditoriumConfig,
} from "~/utils/auditoriumConfig"
import type { Section } from "~/types/auditorium"

export interface AuditoriumEvent {
  id?: number | string
  auditorium_name?: string
  event_date?: string | null
  config?: string | Record<string, unknown>
  seats?: Record<string, string[]> | string[]
  [key: string]: unknown
}

export interface SetEventSeatPayload {
  seatIds: (number | string)[]
  status: string | null
}

/**
 * State and behavior for the mark page: loads the auditorium event, parses its
 * stage config (CSV or JSON), applies initial seat statuses, persists seat
 * status changes, and keeps seats in sync via Echo realtime + visibility
 * refetch on mobile.
 */
export function useAuditoriumEventMark(eventId: string | number) {
  const { AuditoriumEvent, AuditoriumEventSeat } = useRepository()
  const { $echo } = useNuxtApp()
  const uaParser = useUAParser()

  const eventAuditorium = ref<AuditoriumEvent>({})
  const last_timestamp = ref<string | number | null>(null)
  const sections = ref<Section[]>([])
  const loadingSeats = ref<(number | string)[]>([])

  let _realtimeCleanup: (() => void) | null = null

  async function initEvent() {
    const res = await AuditoriumEvent.show<AuditoriumEvent>(
      String(eventId),
    ).catch(() => null)
    eventAuditorium.value = res || {}
    last_timestamp.value = (res as any)?.timestamp ?? null

    loadConfiguration()
    setupRealtimeListeners()
  }

  function loadConfiguration() {
    const raw = eventAuditorium.value?.config
    if (!raw) return

    let parsed: Section[] = []
    if (isCsvConfig(raw)) {
      parsed = parseAuditoriumConfig(raw as string)
    } else {
      parsed = normalizeSections(raw)
    }

    if (parsed.length > 0) {
      sections.value = parsed
      applySeatStatuses(sections.value, eventAuditorium.value.seats)
    }
  }

  async function handleSetEventSeat(payload: SetEventSeatPayload) {
    const { seatIds, status } = payload

    if (!seatIds || seatIds.length === 0) return

    loadingSeats.value = [...loadingSeats.value, ...seatIds]

    try {
      const updatePayload = {
        i: eventAuditorium.value.id,
        z: seatIds,
        s: status,
      }
      const result = await AuditoriumEventSeat.create<{
        z?: (number | string)[]
        t?: string | number
        s?: string | null
      }>(updatePayload)

      const timestamp = result?.t
      if (
        timestamp &&
        (!last_timestamp.value || timestamp > last_timestamp.value)
      ) {
        last_timestamp.value = timestamp
      }

      if (Array.isArray(result?.z)) {
        result.z.forEach((seatId) => {
          const seat = findSeatById(sections.value, seatId)
          if (seat) seat.status = result.s ?? status
        })
      }
    } catch (error) {
      /* ignore */
    } finally {
      loadingSeats.value = loadingSeats.value.filter(
        (id) => !seatIds.includes(id),
      )
    }
  }

  async function handleVisibilityChange() {
    if (!uaParser.isMobile()) return

    if (!document.hidden && eventAuditorium.value?.id) {
      try {
        const response = await AuditoriumEventSeat.index<{
          timestamp?: string | number
          seats_log?: {
            seat_ids?: (number | string)[]
            status?: string | null
          }[]
        }>({
          auditorium_event_id: eventAuditorium.value.id,
          last_timestamp: last_timestamp.value,
        })

        if (response?.timestamp) {
          if (
            !last_timestamp.value ||
            response.timestamp > last_timestamp.value
          ) {
            last_timestamp.value = response.timestamp
          }
        }

        if (response?.seats_log && Array.isArray(response.seats_log)) {
          response.seats_log.forEach((logEntry) => {
            if (logEntry.seat_ids && Array.isArray(logEntry.seat_ids)) {
              logEntry.seat_ids.forEach((seatId) => {
                const seat = findSeatById(sections.value, seatId)
                if (seat) seat.status = logEntry.status
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

      if (
        timestamp &&
        (!last_timestamp.value || timestamp > last_timestamp.value)
      ) {
        last_timestamp.value = timestamp
      }

      if (seatIds && Array.isArray(seatIds)) {
        seatIds.forEach((item: any) => {
          const id = typeof item === "string" ? item : item.z || item.seat_id
          const seatStatus =
            typeof item === "object" && item !== null
              ? item.s || item.status || status
              : status

          const seat = findSeatById(sections.value, id)
          if (seat) seat.status = seatStatus
        })
      }
    }

    _realtimeCleanup = createRealtimeListeners(
      $echo,
      [
        {
          name: `auditorium-event.${eventAuditorium.value.id}`,
          events: {
            ".seat.updated": handleSeatUpdate,
          },
        },
      ],
      {},
      _realtimeCleanup,
    )
  }

  onMounted(() => {
    initEvent()
    document.addEventListener("visibilitychange", handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    if (_realtimeCleanup) _realtimeCleanup()
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  })

  return {
    eventAuditorium,
    sections,
    loadingSeats,
    last_timestamp,
    handleSetEventSeat,
  }
}