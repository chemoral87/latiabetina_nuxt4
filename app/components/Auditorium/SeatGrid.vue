<template>
  <v-group :config="{ x: 0, y: 0, id: 'cmp-auditorium-seat-grid' }">
    <v-rect :config="rectConfig" />
    <v-text v-if="showStats" :config="statsCountConfig" />
    <v-text v-if="showStats" :config="statsPercentConfig" />
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
              onMouseenter: e => emit('seat-hover', e),
              onMouseleave: e => emit('seat-leave', e),
              onClick: e => emit('seat-click', { seat, event: e }),
              onTap: e => emit('seat-click', { seat, event: e }),
            })
          "
        />
        <v-path v-if="getIconPathConfig(seat)" :config="getIconPathConfig(seat)" />
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
  import {
    CLASS_STROKE_MAP,
    COLORS,
    getPercentageColor,
    FLOATING_SECTION_BOX,
    SECTION_BOX,
    STATUS_COLORS,
    STATUS_CONFIG,
    STATUS_ICONS,
    type StageCategory,
  } from '~/constants/auditorium'

  interface Seat {
    id: string
    row: number
    col: number
    state?: string
    status?: string | null
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
      borderColor?: string
      borderWidth?: number
      showStats?: boolean
      /**
       * Draw the section/subsection box (v1 SeatsStageSubsection style): a black
       * rect larger than the grid, giving the stats line a top band, the row
       * numbers a left band and the column letters a bottom band. Off by default
       * so the editor canvas (Editor2Canvas.vue) keeps its tight grey box.
       */
      boxed?: boolean
      /** Seat ids picked by the user; rendered blinking until they are assigned. */
      selectedSeatIds?: (number | string)[]
      /** Toggled every ~330 ms by the parent to make selected seats blink. */
      blinkState?: boolean
      compact?: boolean
    }>(),
    {
      categories: () => [],
      title: undefined,
      showLabels: true,
      borderColor: 'green',
      borderWidth: 2,
      showStats: false,
      boxed: false,
      selectedSeatIds: () => [],
      blinkState: false,
      compact: false,
    }
  )

  const emit = defineEmits<{
    (e: 'seat-click', payload: { seat: Seat; event?: unknown }): void
    (e: 'seat-hover', event: unknown): void
    (e: 'seat-leave', event: unknown): void
  }>()

  const seatSpacing = computed(() => props.seatSize + props.seatsDistance)

  const rowCount = computed(() => props.seats?.length ?? 0)

  const maxColumns = computed(() => {
    if (!props.seats || props.seats.length === 0) return 0
    return Math.max(...props.seats.map(row => (row ? row.length : 0)))
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

  // Box geometry (see SECTION_BOX): only applied in `boxed` mode, so the default
  // rendering stays the tight grid-sized rect the editor expects.
  const boxW = computed(
    () => gridWidth.value + (props.boxed ? FLOATING_SECTION_BOX.EXTRA_WIDTH : 0)
  )
  const boxH = computed(
    () => gridHeight.value + (props.boxed ? FLOATING_SECTION_BOX.EXTRA_HEIGHT : 0)
  )
  const seatInsetX = computed(() => (props.boxed ? SECTION_BOX.SEAT_INSET_X : 0))
  const seatInsetY = computed(() => (props.boxed ? FLOATING_SECTION_BOX.SEAT_INSET_Y : 0))

  const rectConfig = computed(() => ({
    x: 0,
    y: props.boxed ? FLOATING_SECTION_BOX.RECT_Y : 0,
    width: boxW.value,
    height: boxH.value,
    fill: props.boxed ? SECTION_BOX.FILL : COLORS.SUBSECTION_BG,
    stroke: props.borderColor,
    strokeWidth: props.borderWidth,
  }))

  const stats = computed(() => {
    const seats = flatSeats.value
    const total = seats.length
    const withStatus = seats.filter(seat => seat.status).length
    return { withStatus, total, percent: total ? Math.round((withStatus / total) * 100) : 0 }
  })

  const statsCountConfig = computed(() => ({
    x: props.boxed ? 0 : FLOATING_SECTION_BOX.STATS_X,
    y: props.boxed ? -8 : FLOATING_SECTION_BOX.STATS_Y,
    width: props.boxed ? 54 : undefined,
    align: props.boxed ? 'left' : undefined,
    text: `${stats.value.withStatus}/${stats.value.total}`,
    fontSize: props.compact ? 7 : 10,
    fill: 'white',
    fontStyle: 'bold',
    fontFamily: 'Arial',
  }))

  const statsPercentConfig = computed(() => ({
    x: props.boxed ? 45 : FLOATING_SECTION_BOX.STATS_PERCENT_X,
    y: props.boxed ? -8 : FLOATING_SECTION_BOX.STATS_Y,
    width: props.boxed ? 54 : undefined,
    align: props.boxed ? 'left' : undefined,
    text: `${stats.value.percent}%`,
    fontSize: props.compact ? 7 : 10,
    fill: getPercentageColor(stats.value.percent),
    fontStyle: 'bold',
    fontFamily: 'Arial',
  }))

  // In `boxed` mode the name sits inside the box, in the free space between the
  // stats line (FLOATING_SECTION_BOX.STATS_Y = 5) and the seat block (which starts at
  // SECTION_BOX.SEAT_INSET_Y = 35) — same position as v1's subsection title.
  const titleConfig = computed(() => ({
    x: props.boxed ? FLOATING_SECTION_BOX.TITLE_X : 0,
    y: props.boxed ? FLOATING_SECTION_BOX.RECT_Y + 3 : -15,
    text: props.title ?? '',
    fontSize: props.compact ? 9 : 11,
    fill: '#fff',
    fontFamily: 'Arial',
    align: 'left',
    width: props.boxed ? gridWidth.value + FLOATING_SECTION_BOX.TITLE_EXTRA_WIDTH : gridWidth.value,
  }))

  function getRowLabelConfig(rowIdx: number) {
    return {
      x: props.boxed ? 0 : -12,
      y: rowIdx * seatSpacing.value + props.seatSize / 2 + seatInsetY.value,
      width: props.boxed ? FLOATING_SECTION_BOX.ROW_LABEL_WIDTH : undefined,
      text: (rowIdx + 1).toString(),
      fontSize: 8,
      fill: 'yellow',
      fontFamily: 'Arial',
      align: 'right',
      verticalAlign: 'middle',
      offsetY: 3,
    }
  }

  function getColLabelConfig(colIdx: number) {
    return {
      x:
        colIdx * seatSpacing.value +
        props.seatSize / 2 +
        (props.boxed ? FLOATING_SECTION_BOX.COL_LABEL_X_OFFSET : 0),
      y: props.boxed
        ? gridHeight.value + SECTION_BOX.EXTRA_HEIGHT - FLOATING_SECTION_BOX.COL_LABEL_BOTTOM_GAP
        : gridHeight.value + 5,
      text: String.fromCharCode(65 + colIdx),
      fontSize: 8,
      fill: 'yellow',
      fontFamily: 'Arial',
      align: 'center',
      offsetX: props.boxed ? 0 : 3,
    }
  }

  const flatSeats = computed<Seat[]>(() => {
    const allSeats: Seat[] = []
    props.seats?.forEach((row, rowIdx) => {
      row.forEach((seat, colIdx) => {
        if (seat && seat.state !== 'invisible') {
          allSeats.push({
            ...seat,
            x: colIdx * seatSpacing.value + props.seatSize / 2 + seatInsetX.value,
            y: rowIdx * seatSpacing.value + props.seatSize / 2 + seatInsetY.value,
          })
        }
      })
    })
    return allSeats
  })

  function getIconPathConfig(seat: Seat) {
    const status = seat.status ? String(seat.status).toLowerCase() : null
    const path = status ? STATUS_ICONS[status] : ''
    if (!path) return null

    const radius = props.seatSize / 2
    const iconScale = STATUS_CONFIG[status]?.icon_scale || 1.8
    const scale = (radius * iconScale) / 24
    const offset = (24 * scale) / 2
    return {
      data: path,
      fill: '#fff',
      scaleX: scale,
      scaleY: scale,
      x: -offset,
      y: -offset,
      listening: false,
    }
  }

  function getSeatConfig(seat: Seat) {
    const isReserved = seat.state === 'reserved'
    const isSelected = seat.state === 'selected'
    const category = seat.category ? String(seat.category).toLowerCase() : null

    let stroke = isSelected ? COLORS.SEAT_SELECTED : '#757575'
    let strokeWidth = 1

    if (category) {
      try {
        const def = props.categories?.find(
          c =>
            String(c.label).toLowerCase() === category || String(c.value).toLowerCase() === category
        )
        // Do NOT apply a border when the matched category represents "Ninguno" (value === null)
        if (def && typeof def.value !== 'undefined' && def.value !== null && def.fill) {
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

    let fill = isSelected
      ? COLORS.SEAT_SELECTED
      : isReserved
        ? COLORS.SEAT_RESERVED
        : COLORS.SEAT_FREE

    // Picked seats blink between their status colour and grey (same as the v1
    // mark page), so the user can see what is about to be assigned.
    if ((props.selectedSeatIds ?? []).includes(seat.id)) {
      const baseColor =
        seat.status && STATUS_COLORS[seat.status] ? STATUS_COLORS[seat.status] : COLORS.SEAT_FREE
      fill = props.blinkState ? baseColor : '#808080'
      strokeWidth = 0
    } else if (seat.status && STATUS_COLORS[seat.status]) {
      fill = STATUS_COLORS[seat.status]
    }

    return {
      x: seat.x,
      y: seat.y,
      radius: props.seatSize / 2,
      fill,
      stroke,
      strokeWidth,
      opacity: isReserved ? 0.6 : 1,
    }
  }
</script>
