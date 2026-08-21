<template>
  <div
    id="subsectionPanel"
    :style="{
      backgroundColor: '#f5f5f5',
      flex: 1,
      height: containerOuterHeight,
      overflow: 'hidden',
    }"
  >
    <VStage
      ref="konvaStage"
      :config="adjustedStageConfig"
      :style="{
        backgroundColor: selectedSubsection ? '#f0f0f0' : '#ffffff',
      }"
      @wheel="handleWheel"
      @dragend="handleDragEnd"
      @touchend="handleTouchEnd"
      @dragstart="handleDragStart"
      @touchmove="handleTouchMove"
      @touchstart="handleTouchStart"
    >
      <VLayer
        :config="{
          x: contentOffsetX,
          scaleX: zoomLevel,
          scaleY: zoomLevel,
        }"
      >
        <template v-if="selectedSubsection">
          <AuditoriumSeatsStageSubsection
            :categories="categories"
            :blink-state="blinkState"
            :loading-seats="loadingSeats"
            :subsection="selectedSubsection"
            :selected-seats-array="selectedSeatsArray"
            :border-color="getSubsectionBorderColorForSub(selectedSubsection)"
            :border-width="SUBSECTION_BORDER_WIDTH"
            @seat-click="handleSeatClick"
          />
        </template>

        <template v-else>
          <VGroup
            v-for="(section, sIdx) in sections"
            :key="`section-${sIdx}`"
            :config="getSectionConfig(sIdx)"
          >
            <VRect :config="getSectionBgConfig(section)" />
            <VText :config="getSectionTitleConfig(section)" />

            <template v-if="!(section.l || section.isLabel)">
              <VGroup
                v-for="(sub, subIdx) in section.ss || section.subsections"
                :key="`sub-${sIdx}-${subIdx}`"
                :config="{
                  ...getSubsectionPosition(section, subIdx),
                  onClick: () => emit('subsection-click', sub),
                  onTap: () => emit('subsection-click', sub),
                  onMouseenter: handleSeatHover,
                  onMouseleave: handleSeatLeave,
                }"
              >
                <template v-if="sub.l || sub.isLabel">
                  <AuditoriumSeatsStageSubsectionLabel
                    :subsection="sub"
                    :section-height="getSectionHeight(section)"
                  />
                </template>

                <template v-else>
                  <AuditoriumSeatsStageSubsection
                    :subsection="sub"
                    :categories="categories"
                    :blink-state="blinkState"
                    :loading-seats="loadingSeats"
                    :selected-seats-array="selectedSeatsArray"
                    :border-color="getSubsectionBorderColor(sIdx, subIdx)"
                    :border-width="SUBSECTION_BORDER_WIDTH"
                    @seat-click="handleSeatClick"
                  />
                </template>
              </VGroup>
            </template>
          </VGroup>
        </template>
      </VLayer>
    </VStage>
  </div>
</template>

<script setup lang="ts">
import {
  DEFAULT_SETTINGS,
  SUBSECTION_BORDER_COLORS,
  SUBSECTION_BORDER_WIDTH,
} from "~/constants/auditorium"
import { useUAParser } from "~/utils/userAgent"
import type { Seat, Section, Subsection } from "~/types/auditorium"

const props = defineProps<{
  sections: Section[]
  selectedSubsection: Subsection | null
  categories?: unknown[]
  selectedSeatsArray?: (number | string)[]
  blinkState?: boolean
  loadingSeats?: unknown[]
  containerWidth: number
  containerHeightPx: number
  containerOuterHeight: string
}>()

const emit = defineEmits<{
  (e: 'seat-click', payload: { seat: Seat; event?: unknown }): void
  (e: 'subsection-click', sub: Subsection): void
}>()

const uaParser = useUAParser()

const konvaStage = ref<any>(null)

const zoomLevel = ref(1)
const minZoom = 0.3
const maxZoom = 8.0
const fitstate = ref<string | null>(null)
const dragMode = ref<string | null>(null)
const lastDist = ref(0)
const lastCenter = ref<{ x: number; y: number } | null>(null)
const isTwoFingerGesture = ref(false)
const isDraggingStage = ref(false)
const dragStartPos = ref<{ x: number; y: number } | null>(null)

const seatSpacing = computed(() => {
  return DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
})

const adjustedStageConfig = computed(() => {
  return {
    width: props.containerWidth,
    height: props.containerHeightPx,
    x: 0,
    draggable: !isTwoFingerGesture.value,
    dragDistance: uaParser.isMobile() ? 12 : 5,
    dragBoundFunc:
      props.selectedSubsection && dragMode.value
        ? getDragBoundFunc()
        : undefined,
  }
})

const contentOffsetX = computed(() => {
  if (props.selectedSubsection) return 0
  if (!props.sections || props.sections.length === 0) return 0
  const maxSectionWidth = Math.max(
    ...props.sections.map((section) => getSectionWidth(section)),
  )
  const scaledWidth = maxSectionWidth * zoomLevel.value
  const containerWidthVal = adjustedStageConfig.value.width as number
  return Math.max(0, (containerWidthVal - scaledWidth) / 2)
})

/**
 * Cycle through the border palette so each subsection gets a distinct border
 * color. The index is global across all sections (counting every subsection,
 * labels included, to keep positions stable), so colors repeat only after the
 * palette is exhausted, then wrap back to index 0.
 */
function getSubsectionGlobalIndex(sIdx: number, subIdx: number) {
  let global = subIdx
  for (let i = 0; i < sIdx; i++) {
    const rawSubs = props.sections[i]?.ss || props.sections[i]?.subsections
    if (!props.sections[i]?.l && !props.sections[i]?.isLabel && rawSubs) {
      global += rawSubs.length
    }
  }
  return global
}

function getSubsectionBorderColor(sIdx: number, subIdx: number) {
  const global = getSubsectionGlobalIndex(sIdx, subIdx)
  return SUBSECTION_BORDER_COLORS[global % SUBSECTION_BORDER_COLORS.length]
}

function getSubsectionBorderColorForSub(target: Subsection) {
  for (let sIdx = 0; sIdx < props.sections.length; sIdx++) {
    const section = props.sections[sIdx]
    if (section.l || section.isLabel) continue
    const rawSubs = section.ss || section.subsections
    if (!rawSubs) continue
    for (let subIdx = 0; subIdx < rawSubs.length; subIdx++) {
      const sub = rawSubs[subIdx]
      if (sub === target || (sub.i || sub.id) === (target.i || target.id)) {
        return getSubsectionBorderColor(sIdx, subIdx)
      }
    }
  }
  return SUBSECTION_BORDER_COLORS[0]
}

function getSectionConfig(sIdx: number) {
  const section = props.sections[sIdx]
  let y = 0
  for (let i = 0; i < sIdx; i++) {
    y += getSectionHeight(props.sections[i])
  }
  if (sIdx > 0) {
    y += sIdx * DEFAULT_SETTINGS.SECTION_TOP_MARGIN
  }
  const maxSectionWidth = Math.max(
    ...props.sections.map((s) => getSectionWidth(s)),
  )
  return { x: (maxSectionWidth - getSectionWidth(section)) / 2, y }
}

function getSectionBgConfig(section: Section) {
  return {
    width: getSectionWidth(section),
    height: getSectionHeight(section),
    fill: "black",
    strokeWidth: 0,
    stroke: "transparent",
    cornerRadius: 5,
  }
}

function getSectionTitleConfig(section: Section) {
  const name = section.n || section.name
  const isLabel = section.l || section.isLabel
  return {
    x: 0,
    y: 4,
    text: name,
    fontSize: 22,
    fill: isLabel ? "#1976d2" : "#fff",
    fontStyle: "bold",
    fontFamily: "Arial",
    align: "center",
    width: getSectionWidth(section),
  }
}

function getSubsectionPosition(section: Section, subIdx: number) {
  let x = DEFAULT_SETTINGS.SECTION_SIDE_PADDING
  const rawSubs = section.ss || section.subsections

  for (let i = 0; i < subIdx; i++) {
    const s = rawSubs![i]
    const isLabel = s.l || s.isLabel
    const width = isLabel ? (s.w || s.width || 40) - 20 : getSubsectionWidth(s)
    x += width
    x += DEFAULT_SETTINGS.SUBSECTION_SPACING
  }

  return { x, y: DEFAULT_SETTINGS.SECTION_TOP_PADDING }
}

function getSubsectionWidth(sub: Subsection) {
  const isLabel = sub.l || sub.isLabel
  if (isLabel) return sub.w || sub.width || 40
  const seatsSource = sub.s || sub.seats
  if (!seatsSource?.length) return 0
  const maxCols = Math.max(...seatsSource.map((row) => row.length))
  return maxCols * seatSpacing.value - DEFAULT_SETTINGS.SEATS_DISTANCE
}

function getSubsectionHeight(sub: Subsection) {
  const isLabel = sub.l || sub.isLabel
  if (isLabel) return 0
  const seatsSource = sub.s || sub.seats
  if (!seatsSource?.length) return 40
  return (
    seatsSource.length * seatSpacing.value - DEFAULT_SETTINGS.SEATS_DISTANCE
  )
}

function getSectionWidth(section: Section) {
  const isLabel = section.l || section.isLabel
  if (isLabel) {
    const maxSectionWidth = Math.max(
      ...props.sections
        .filter((s) => !(s.l || s.isLabel))
        .map((s) => {
          const rawSubs = s.ss || s.subsections
          if (!rawSubs || !rawSubs.length) return 0
          return (
            rawSubs.reduce((acc, sub) => {
              const isSubLabel = sub.l || sub.isLabel
              return (
                acc +
                (isSubLabel
                  ? (sub.w || sub.width || 40) - 20
                  : getSubsectionWidth(sub))
              )
            }, 0) +
            (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
            DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
            20
          )
        }),
    )
    return maxSectionWidth || 800
  }
  const rawSubs = section.ss || section.subsections
  if (!rawSubs || !rawSubs.length) return 0
  const extraWidthPadding = 20
  return (
    rawSubs.reduce((acc, s) => {
      const isSubLabel = s.l || s.isLabel
      return (
        acc + (isSubLabel ? (s.w || s.width || 40) - 20 : getSubsectionWidth(s))
      )
    }, 0) +
    (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
    DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
    extraWidthPadding
  )
}

function getSectionHeight(section: Section) {
  const isLabel = section.l || section.isLabel
  if (isLabel) return 30
  const rawSubs = section.ss || section.subsections
  if (!rawSubs || !rawSubs.length)
    return (
      DEFAULT_SETTINGS.SECTION_TOP_PADDING +
      DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
    )
  const maxRows = Math.max(
    ...rawSubs.map((sub) => {
      const isSubLabel = sub.l || sub.isLabel
      const seatsSource = sub.s || sub.seats
      return isSubLabel ? 0 : seatsSource?.length || 0
    }),
  )
  if (maxRows === 0)
    return (
      DEFAULT_SETTINGS.SECTION_TOP_PADDING +
      DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING +
      40
    )
  // rect at y=3 with height subsectionHeight+SUBSECTION_RECT_EXTRA,
  // column labels at subsectionHeight+SUBSECTION_RECT_EXTRA-6, fontSize ≈10px
  const extraHeightPadding = DEFAULT_SETTINGS.SUBSECTION_RECT_EXTRA + 4
  return (
    maxRows * seatSpacing.value -
    DEFAULT_SETTINGS.SEATS_DISTANCE +
    DEFAULT_SETTINGS.SECTION_TOP_PADDING +
    DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING +
    extraHeightPadding
  )
}

function enterSubsection() {
  if (fitstate.value === null) {
    fitstate.value = "width"
  }
  applyCurrentFit()
}

function applyCurrentFit() {
  if (fitstate.value === "height") {
    fitToHeight()
  } else {
    fitToWidth()
  }
}

function fitToWidth() {
  fitstate.value = "width"
  if (!props.sections || props.sections.length === 0) {
    zoomLevel.value = 0.7
    return
  }

  setTimeout(() => {
    try {
      const actualWidth = props.containerWidth

      let maxContentWidth
      if (props.selectedSubsection) {
        const subsectionContentWidth = getSubsectionWidth(
          props.selectedSubsection,
        )
        maxContentWidth = subsectionContentWidth + 20
      } else {
        maxContentWidth =
          Math.max(
            ...props.sections.map((section) => getSectionWidth(section)),
          ) + 25
      }

      if (maxContentWidth > 0 && actualWidth > 0) {
        const optimalZoom = actualWidth / maxContentWidth
        zoomLevel.value = Math.max(
          minZoom,
          Math.min(maxZoom, Math.round(optimalZoom * 10) / 10),
        )
      } else {
        zoomLevel.value = 0.7
      }

      dragMode.value = null

      nextTick(() => {
        const stage = konvaStage.value?.getStage()
        if (stage) {
          stage.position({ x: 0, y: 0 })
          stage.batchDraw()
        }
      })
    } catch (error) {
      zoomLevel.value = 0.7
    }
  }, 50)
}

function fitToHeight() {
  fitstate.value = "height"
  if (!props.sections || props.sections.length === 0) {
    zoomLevel.value = 0.7
    return
  }

  setTimeout(() => {
    try {
      const availableHeight = props.containerHeightPx

      let totalContentHeight
      if (props.selectedSubsection) {
        const subsectionContentHeight = getSubsectionHeight(
          props.selectedSubsection,
        )
        totalContentHeight = subsectionContentHeight + 35
      } else {
        totalContentHeight =
          props.sections.reduce((acc, section, idx) => {
            return (
              acc +
              getSectionHeight(section) +
              (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
            )
          }, 0) + 40
      }

      if (totalContentHeight > 0 && availableHeight > 0) {
        const optimalZoom = availableHeight / totalContentHeight
        zoomLevel.value = Math.max(
          minZoom,
          Math.min(maxZoom, Math.round(optimalZoom * 10) / 10),
        )
      } else {
        zoomLevel.value = 0.7
      }

      dragMode.value = null

      nextTick(() => {
        const stage = konvaStage.value?.getStage()
        if (stage) {
          stage.position({ x: 0, y: 0 })
          stage.batchDraw()
        }
      })
    } catch (error) {
      zoomLevel.value = 0.7
    }
  }, 50)
}

function getDragBoundFunc() {
  const mode = dragMode.value
  return function (pos: { x: number; y: number }) {
    if (mode === "y") {
      return { x: pos.x, y: 0 }
    } else if (mode === "x") {
      return { x: 0, y: pos.y }
    }
    return pos
  }
}

function handleSeatHover(e: any) {
  const container = e.target.getStage().container()
  container.style.cursor =
    e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
}

function handleSeatLeave(e: any) {
  e.target.getStage().container().style.cursor = "default"
}

function handleSeatClick(payload: { seat: Seat; event?: unknown }) {
  if (isDraggingStage.value) return
  const stage = konvaStage.value?.getStage()
  if (stage && dragStartPos.value) {
    const currentPos = stage.position()
    const dragDistance = Math.sqrt(
      Math.pow(currentPos.x - dragStartPos.value.x, 2) +
        Math.pow(currentPos.y - dragStartPos.value.y, 2),
    )
    if (dragDistance > DEFAULT_SETTINGS.DRAG_THRESHOLD) {
      return
    }
  }
  emit('seat-click', payload)
}

function handleWheel(e: any) {
  e.evt.preventDefault()

  const stage = konvaStage.value?.getStage()
  if (!stage) return

  const oldScale = zoomLevel.value
  const pointer = stage.getPointerPosition()

  const scaleBy = 1.05
  const direction = e.evt.deltaY > 0 ? -1 : 1

  let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
  newScale = Math.max(minZoom, Math.min(maxZoom, newScale))
  newScale = Math.round(newScale * 100) / 100

  if (newScale === oldScale) return

  const mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
  }

  const newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
  }

  zoomLevel.value = newScale

  nextTick(() => {
    stage.position(newPos)
    stage.batchDraw()
  })

  fitstate.value = null
}

function handleTouchStart(e: any) {
  const touch1 = e.evt.touches[0]
  const touch2 = e.evt.touches[1]

  if (touch1 && touch2) {
    isTwoFingerGesture.value = true
    lastDist.value = getDistance(touch1, touch2)
    lastCenter.value = getCenter(touch1, touch2)
  } else {
    isTwoFingerGesture.value = false
  }
}

function handleTouchMove(e: any) {
  const touch1 = e.evt.touches[0]
  const touch2 = e.evt.touches[1]

  if (touch1 && touch2) {
    e.evt.preventDefault()

    const stage = konvaStage.value?.getStage()
    if (!stage) return

    const dist = getDistance(touch1, touch2)
    const center = getCenter(touch1, touch2)

    if (!lastDist.value) {
      lastDist.value = dist
    }

    const oldScale = zoomLevel.value
    const pointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    }

    const scale = dist / lastDist.value
    let newScale = oldScale * scale
    newScale = Math.max(minZoom, Math.min(maxZoom, newScale))
    newScale = Math.round(newScale * 100) / 100

    zoomLevel.value = newScale

    const newPos = {
      x: center.x - pointTo.x * newScale,
      y: center.y - pointTo.y * newScale,
    }

    stage.position(newPos)
    stage.batchDraw()

    lastDist.value = dist
    lastCenter.value = center

    fitstate.value = null
  }
}

function handleTouchEnd() {
  lastDist.value = 0
  lastCenter.value = null
  isTwoFingerGesture.value = false
}

function getDistance(touch1: Touch, touch2: Touch) {
  const dx = touch1.clientX - touch2.clientX
  const dy = touch1.clientY - touch2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function getCenter(touch1: Touch, touch2: Touch) {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  }
}

function handleDragStart() {
  const stage = konvaStage.value?.getStage()
  if (stage) {
    dragStartPos.value = { ...stage.position() }
    isDraggingStage.value = true
  }
}

function handleDragEnd() {
  isDraggingStage.value = false
  setTimeout(() => {
    dragStartPos.value = null
  }, 100)
}

function getStage() {
  return konvaStage.value?.getStage()
}

defineExpose({
  enterSubsection,
  applyCurrentFit,
  fitToWidth,
  fitToHeight,
  getStage,
})
</script>

<style scoped>
.stage-container {
  position: relative;
}

@media (max-width: 600px) {
  .stage-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>