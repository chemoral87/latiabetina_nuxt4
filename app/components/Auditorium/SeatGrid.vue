<template>
  <v-group :config="{ x: 0, y: 0, id: 'cmp-auditorium-seat-grid' }">
    <v-rect :config="rectConfig" />
    <v-text v-if="title" :config="titleConfig" />

    <template v-if="showLabels">
      <v-text
        v-for="rowIdx in rowCount"
        :key="`row-label-${rowIdx}`"
        :config="getRowLabelConfig(rowIdx - 1)"
      />
      <v-text
        v-for="colIdx in maxColumns"
        :key="`col-label-${colIdx}`"
        :config="getColLabelConfig(colIdx - 1)"
      />
    </template>

    <template v-for="seat in flatSeats" :key="seat.id">
      <v-group :config="{ x: seat.x, y: seat.y }">
        <v-circle
          :config="
            Object.assign({}, getSeatConfig(seat), {
              x: 0,
              y: 0,
              onMouseenter: (e) => emit('seat-hover', e),
              onMouseleave: (e) => emit('seat-leave', e),
              onClick: (e) => emit('seat-click', { seat, event: e }),
              onTap: (e) => emit('seat-click', { seat, event: e }),
            })
          "
        />
      </v-group>
    </template>
  </v-group>
</template>

<script setup lang="ts">
/**
 * Shared Konva rendering for a single rows x cols seat grid: background
 * rect, row/column labels, and seat circles colored by category.
 *
 * Extracted from Auditorium/Seats.vue (v1 design editor) so both the v1
 * editor and the v2 floating-layout canvas (AuditoriumEditor2Canvas.vue)
 * render seats identically instead of duplicating this logic. This
 * component is purely presentational — it has no idea whether it lives
 * inside a v1 subsection or a v2 flat section; the parent positions this
 * component's root group and interprets the emitted seat ids/coordinates
 * for its own purposes (e.g. v1's tooltip absolute positioning).
 *
 * seat.x / seat.y on the emitted seat are the seat's center, relative to
 * this component's own origin (matches the shape Auditorium/Seats.vue
 * already produced via getSubsectionSeats, so existing consumers of that
 * shape — e.g. Seats.vue's parseSeatId + getSectionConfig/getSubsectionPosition
 * tooltip math — keep working unchanged).
 */
import { CLASS_STROKE_MAP, COLORS, type StageCategory } from "~/constants/auditorium"

interface Seat {
  id: string
  row: number
  col: number
  state?: string
  category?: string | null
  x?: number
  y?: number
}

const props = withDefaults(
  defineProps<{
    seats: (Seat | null)[][]
    seatSize: number
    seatsDistance: number
    categories?: StageCategory[]
    title?: string
    showLabels?: boolean
  }>(),
  {
    categories: () => [],
    title: undefined,
    showLabels: true,
  },
)

const emit = defineEmits<{
  (e: "seat-click", payload: { seat: Seat; event?: unknown }): void
  (e: "seat-hover", event: unknown): void
  (e: "seat-leave", event: unknown): void
}>()

const seatSpacing = computed(() => props.seatSize + props.seatsDistance)

const rowCount = computed(() => props.seats?.length ?? 0)

const maxColumns = computed(() => {
  if (!props.seats || props.seats.length === 0) return 0
  return Math.max(...props.seats.map((row) => (row ? row.length : 0)))
})

// Same formula as v1's getSubsectionWidth/Height (Seats.vue) and v2's
// getFloatingSectionWidth/Height (utils/auditoriumFloating.ts).
const gridWidth = computed(() => {
  if (maxColumns.value === 0) return 0
  return maxColumns.value * seatSpacing.value - props.seatsDistance
})

const gridHeight = computed(() => {
  if (rowCount.value === 0) return 40
  return rowCount.value * seatSpacing.value - props.seatsDistance
})

defineExpose({ gridWidth, gridHeight })

const rectConfig = computed(() => ({
  width: gridWidth.value,
  height: gridHeight.value,
  fill: COLORS.SUBSECTION_BG,
  stroke: "green",
  strokeWidth: 2,
}))

const titleConfig = computed(() => ({
  x: 0,
  y: -15,
  text: props.title ?? "",
  fontSize: 11,
  fill: "#fff",
  fontFamily: "Arial",
  align: "left",
  width: gridWidth.value,
}))

function getRowLabelConfig(rowIdx: number) {
  return {
    x: -12,
    y: rowIdx * seatSpacing.value + props.seatSize / 2,
    text: (rowIdx + 1).toString(),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "right",
    verticalAlign: "middle",
    offsetY: 3,
  }
}

function getColLabelConfig(colIdx: number) {
  return {
    x: colIdx * seatSpacing.value + props.seatSize / 2,
    y: gridHeight.value + 5,
    text: String.fromCharCode(65 + colIdx),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "center",
    offsetX: 3,
  }
}

const flatSeats = computed<Seat[]>(() => {
  const allSeats: Seat[] = []
  props.seats?.forEach((row, rowIdx) => {
    row.forEach((seat, colIdx) => {
      if (seat && seat.state !== "invisible") {
        allSeats.push({
          ...seat,
          x: colIdx * seatSpacing.value + props.seatSize / 2,
          y: rowIdx * seatSpacing.value + props.seatSize / 2,
        })
      }
    })
  })
  return allSeats
})

function getSeatConfig(seat: Seat) {
  const isReserved = seat.state === "reserved"
  const isSelected = seat.state === "selected"
  const category = seat.category ? String(seat.category).toLowerCase() : null

  let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
  let strokeWidth = 1

  if (category) {
    try {
      const def = props.categories?.find(
        (c) =>
          String(c.label).toLowerCase() === category ||
          String(c.value).toLowerCase() === category,
      )
      // Do NOT apply a border when the matched category represents "Ninguno" (value === null)
      if (def && typeof def.value !== "undefined" && def.value !== null && def.fill) {
        stroke = def.fill
        strokeWidth = 4
      } else if (CLASS_STROKE_MAP[category]) {
        stroke = CLASS_STROKE_MAP[category]
        strokeWidth = 4
      }
    } catch (err) {
      if (CLASS_STROKE_MAP[category]) {
        stroke = CLASS_STROKE_MAP[category]
        strokeWidth = 4
      }
    }
  }

  return {
    x: seat.x,
    y: seat.y,
    radius: props.seatSize / 2,
    fill: isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE,
    stroke,
    strokeWidth,
    opacity: isReserved ? 0.6 : 1,
  }
}
</script>
