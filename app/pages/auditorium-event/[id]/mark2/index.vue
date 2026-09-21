<template>
  <VContainer :fluid="true">
    <div v-if="eventAuditorium.id">
      <div
        ref="headerBar"
        class="pa-2 bg-grey-lighten-4 d-flex align-center"
        :style="{
          position: 'fixed',
          top: headerTop,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 20,
        }"
      >
        <span class="text-subtitle-2">{{ eventAuditorium.auditorium_name }}</span>
        <template v-if="selectedSectionId">
          |<span class="text-subtitle-2">{{ selectedSection?.name }}</span>
        </template>
        <template v-else>
          |<span class="text-subtitle-2">{{ formatShortDate(eventAuditorium.event_date) }}</span>
        </template>

        <VSpacer />
        <span class="text-subtitle-2">{{ totalSeatsWithStatus }}/{{ totalSeats }}</span>
        <span class="text-subtitle-2 ml-1" :style="{ color: percentageColor }">{{ percentageTotalSeats }}%</span>
        <AuditoriumEventMarkStatsPanel :sections="statsSections" />

        <!-- Icon only: the header must stay on one line on phones. -->
        <VBtn
          v-if="selectedSectionId"
          id="auev-mark2-main-btn"
          icon
          class="ml-1"
          size="small"
          color="primary"
          title="Volver a todas las secciones"
          @click="exitSection"
        >
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>
        <VBtn
          id="auev-mark2-fit-width-btn"
          class="ml-2"
          size="small"
          color="secondary"
          title="Fit Width"
          @click="canvasRef?.fitToWidth()"
        >
          <VIcon>mdi-arrow-expand-horizontal</VIcon>
          Fit
        </VBtn>
        <VBtn
          id="auev-mark2-fit-height-btn"
          class="ml-1"
          size="small"
          color="secondary"
          title="Fit Height"
          @click="canvasRef?.fitToHeight()"
        >
          <VIcon>mdi-arrow-expand-vertical</VIcon>
          Fit
        </VBtn>
      </div>

      <div :style="{ height: `${headerHeight}px` }" />

      <ClientOnly>
        <AuditoriumFloatingMarkCanvas
          ref="canvasRef"
          :config="config"
          :blink-state="blinkState"
          :stage-config="stageConfig"
          :selected-seat-ids="selectedSeatIds"
          :selected-section-id="selectedSectionId"
          @seat-click="onSeatClick"
          @section-click="onSectionClick"
        />
      </ClientOnly>

      <AuditoriumSeatsStageMarkPanel
        v-model="showMarkPanel"
        :panel-top="null"
        panel-bottom="20px"
        :count="selectedSeatIds.length"
        :status-config="activeStatusConfig"
        @set-status="setSeatsStatus"
      />
    </div>
  </VContainer>
</template>

<script setup lang="ts">
import { STATUS_CONFIG } from "~/constants/auditorium"
import { formatShortDate } from "~/utils/date"
import { useLayout } from "vuetify"
import {
  applyFloatingSeatStatuses,
  findFloatingSeatById,
  parseFloatingConfig,
} from "~/utils/auditoriumFloating"
import type { FloatingLayoutConfig, FloatingSeat, Section } from "~/types/auditorium"
import { createRealtimeListeners } from "~/utils/realtime"
import { useUAParser } from "~/utils/userAgent"

definePageMeta({
  title: "Evento Auditorio",
  icon: "mdi-theater",
  middleware: ["authenticated", "permission"],
  permission: "auditorium-event-mark",
})

const route = useRoute()
const { AuditoriumEvent, AuditoriumEventSeat } = useRepository()
const { mainRect } = useLayout()
const { $echo } = useNuxtApp()

const canvasRef = ref<{ fitToWidth: () => void; fitToHeight: () => void } | null>(null)
const uaParser = useUAParser()

// Section currently drilled into (null = overview of every section).
const selectedSectionId = ref<string | null>(null)
// Seats picked inside that section, waiting to be assigned a status.
const selectedSeatIds = ref<(number | string)[]>([])
const blinkState = ref(false)
let blinkInterval: ReturnType<typeof setInterval> | null = null

route.meta.showDrawer = false
route.meta.back = "/auditorium-event"

const headerTop = computed(() => `${mainRect.value?.top ?? 0}px`)

const eventAuditorium = ref<Record<string, unknown>>({})
const config = ref<FloatingLayoutConfig>({ v: 2, sections: [], tags: [] })
const stageConfig = ref({ width: 900, height: 700 })
const last_timestamp = ref<string | number | null>(null)

let _realtimeCleanup: (() => void) | null = null

const totalSeats = computed(() => {
  let count = 0
  for (const s of config.value.sections) {
    for (const row of s.seats) {
      for (const seat of row) {
        if (seat) count++
      }
    }
  }
  return count
})

const totalSeatsWithStatus = computed(() => {
  let count = 0
  for (const s of config.value.sections) {
    for (const row of s.seats) {
      for (const seat of row) {
        if (seat?.status) count++
      }
    }
  }
  return count
})

const percentageTotalSeats = computed(() => {
  if (totalSeats.value === 0) return 0
  return ((totalSeatsWithStatus.value / totalSeats.value) * 100).toFixed(1)
})

const percentageColor = computed(() => {
  const pct = parseFloat(String(percentageTotalSeats.value))
  if (pct >= 91) return "#F44336"
  if (pct >= 61) return "#FF9800"
  return "#4CAF50"
})

const selectedSection = computed(
  () => config.value.sections.find((s) => s.id === selectedSectionId.value) ?? null,
)

const showMarkPanel = computed({
  get: () => selectedSeatIds.value.length > 0,
  set: (val: boolean) => {
    if (!val) selectedSeatIds.value = []
  },
})

// Same order/keys as the v1 mark page: e · h · i · t · spacer · m · n · c
const activeStatusConfig = computed(() => {
  const order = ["e", "h", "i", "t", "_", "m", "n", "c"]
  return order
    .filter(
      (key) =>
        key === "_" ||
        (STATUS_CONFIG[key] && STATUS_CONFIG[key].active !== false),
    )
    .reduce(
      (acc, key) => {
        acc[key] = key === "_" ? null : STATUS_CONFIG[key]
        return acc
      },
      {} as Record<
        string,
        (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG] | null
      >,
    )
})

const statsSections = computed<Section[]>(() =>
  config.value.sections.map((section) => ({
    id: section.id,
    name: section.name,
    subsections: [{ id: section.id, name: section.name, seats: section.seats }],
  })) as Section[],
)

const id = route.params.id as string
const loaded = (await AuditoriumEvent.show<Record<string, unknown>>(id).catch(() => ({}))) as Record<string, unknown>
eventAuditorium.value = loaded

if (eventAuditorium.value.config) {
  config.value = parseFloatingConfig(eventAuditorium.value.config)
  applyFloatingSeatStatuses(config.value.sections, eventAuditorium.value.seats)
}

if (eventAuditorium.value.auditorium_name) {
  route.meta.title = `Marca: ${eventAuditorium.value.auditorium_name}`
  route.meta.icon = "mdi-theater"
  route.meta.back = "/auditorium-event"
  route.meta.showDrawer = false
}

onMounted(() => {
  updateStageSize()
  window.addEventListener("resize", updateStageSize)
  setupRealtimeListeners()
  blinkInterval = setInterval(() => {
    blinkState.value = !blinkState.value
  }, 330)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateStageSize)
  if (_realtimeCleanup) _realtimeCleanup()
  _realtimeCleanup = null
  if (blinkInterval) clearInterval(blinkInterval)
  blinkInterval = null
})

// Chrome around the Konva stage: VContainer padding (16 each side) + the VSheet
// pa-2 (8 each side) horizontally; the same 16 vertically plus a small bottom
// breathing space. Sizing the stage from the real viewport minus this chrome is
// what keeps the content inside the screen — the old fixed 900x700 desktop
// stage was narrower than the window, so Fit Height zoomed the content past the
// stage edge and cropped the outer sections.
const CANVAS_CHROME_X = 48
const CANVAS_CHROME_Y = 28

function updateStageSize() {
  const appBarHeight = mainRect.value?.top ?? 0
  const availableWidth = window.innerWidth - CANVAS_CHROME_X
  const availableHeight =
    window.innerHeight - appBarHeight - headerHeight.value - CANVAS_CHROME_Y

  stageConfig.value.width = Math.max(Math.round(availableWidth), 280)
  stageConfig.value.height = Math.max(Math.round(availableHeight), 240)
}

const headerBar = ref<HTMLElement | null>(null)
const headerHeight = ref(44)
function measureHeaderHeight() {
  if (headerBar.value?.offsetHeight) {
    headerHeight.value = headerBar.value.offsetHeight
  }
}
watch(
  () => eventAuditorium.value?.auditorium_name,
  () => nextTick(measureHeaderHeight),
)
onMounted(() => { nextTick(measureHeaderHeight) })

// The header's real height is measured a tick after mount and changes with the
// viewport width (button wrapping), so the stage has to be re-measured too.
watch(headerHeight, () => updateStageSize())

/** Drill into a section. Tapping the same section again is a no-op. */
function onSectionClick(section: { id: string }) {
  if (selectedSectionId.value === section.id) return
  selectedSectionId.value = section.id
  selectedSeatIds.value = []
}

/** Back to the overview of every section. */
function exitSection() {
  selectedSectionId.value = null
  selectedSeatIds.value = []
}

function onSeatClick(payload: {
  seat: { id: string; row: number; col: number }
  event: unknown
}) {
  // In the overview a tap on a seat only drills into its section (the click
  // bubbles up to the section group), so seats are selectable inside a
  // section, exactly like the v1 mark page.
  if (!selectedSectionId.value) return

  const seatId = payload.seat.id
  selectedSeatIds.value = selectedSeatIds.value.includes(seatId)
    ? selectedSeatIds.value.filter((id) => id !== seatId)
    : [...selectedSeatIds.value, seatId]
}

/** Assign a status (null = clear) to every picked seat, in one request. */
async function setSeatsStatus(status: string | null) {
  const ids = selectedSeatIds.value.slice()
  selectedSeatIds.value = []
  if (ids.length === 0) return

  // Seats already at the target status are skipped (same as v1).
  const targets: { id: number | string; seat: FloatingSeat }[] = []
  for (const id of ids) {
    const seat = findFloatingSeatById(config.value.sections, id)
    if (seat && (seat.status ?? null) !== status) targets.push({ id, seat })
  }
  if (targets.length === 0) return

  const previous = targets.map((t) => t.seat.status ?? null)
  targets.forEach((t) => {
    t.seat.status = status
  })

  try {
    const result = await AuditoriumEventSeat.create<{
      z?: (number | string)[]
      t?: string | number
      s?: string | null
    }>({
      i: eventAuditorium.value.id,
      z: targets.map((t) => t.id),
      s: status,
    })

    const timestamp = result?.t
    if (timestamp && (!last_timestamp.value || timestamp > last_timestamp.value)) {
      last_timestamp.value = timestamp
    }

    if (Array.isArray(result?.z)) {
      result.z.forEach((id) => {
        const s = findFloatingSeatById(config.value.sections, id)
        if (s) s.status = result.s ?? status
      })
    }
  } catch {
    targets.forEach((t, i) => {
      t.seat.status = previous[i]
    })
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
        const sid = typeof item === "string" ? item : item.z || item.seat_id
        const seatStatus = typeof item === "object" && item !== null
          ? item.s || item.status || status
          : status
        const s = findFloatingSeatById(config.value.sections, sid)
        if (s) s.status = seatStatus
      })
    }
  }

  _realtimeCleanup = createRealtimeListeners(
    $echo,
    [
      {
        name: `auditorium-event.${eventAuditorium.value.id}`,
        events: { ".seat.updated": handleSeatUpdate },
      },
    ],
    {},
    _realtimeCleanup,
  )
}
</script>
