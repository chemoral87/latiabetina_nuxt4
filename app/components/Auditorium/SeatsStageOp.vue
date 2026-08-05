<template>
  <div id="cmp-auditorium-seats-stage-op">
    <div ref="controlRow">
      <div class="d-flex flex-wrap align-center py-1" style="gap: 6px">
        <template v-if="selectedSubsection">
          <VBtn id="aud-stageop-main-btn" color="primary" size="small" prepend-icon="mdi-arrow-left"
            @click="goBackToFullView">Main</VBtn>
          <VBtn id="aud-stageop-prev-sub-btn" color="primary" size="x-small" icon class="ml-1"
            @click="previousSubsection">
            <VIcon>mdi-arrow-left</VIcon>
          </VBtn>
          <VBtn id="aud-stageop-next-sub-btn" color="primary" size="x-small" icon class="ml-1"
            @click="nextSubsection">
            <VIcon>mdi-arrow-right</VIcon>
          </VBtn>
        </template>

        <VBtn id="aud-stageop-fit-width-btn" title="Fit Width" color="secondary" size="small"
          @click="fitToWidth">
          <VIcon>mdi-arrow-expand-horizontal</VIcon>
          Fit
        </VBtn>
        <VBtn id="aud-stageop-fit-height-btn" title="Fit Height" color="secondary" size="small"
          @click="fitToHeight">
          <VIcon>mdi-arrow-expand-vertical</VIcon>
          Fit
        </VBtn>
        <VBtn v-if="selectedSubsection" id="aud-stageop-history-btn" title="Historial de asientos" color="success"
          size="small" @click="openHistory">
          <VIcon start>mdi-history</VIcon>
          Hist
        </VBtn>
      </div>
    </div>

    <div style="display: flex; gap: 2px">
      <div id="subsectionPanel"
        :style="{ backgroundColor: 'blueviolet', flex: 1, height: containerOuterHeight, overflow: 'hidden' }">
        <VStage ref="konvaStage" :config="adjustedStageConfig"
          :style="{ backgroundColor: selectedSubsection ? 'lightgray' : 'pink' }" @wheel="handleWheel"
          @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd"
          @dragstart="handleDragStart" @dragend="handleDragEnd">
          <VLayer :config="{ x: contentOffsetX, scaleX: zoomLevel, scaleY: zoomLevel }">
            <template v-if="selectedSubsection">
              <AuditoriumSeatsStageSubsection :subsection="selectedSubsection" :categories="categories"
                :selected-seats-array="selectedSeatsArray" :blink-state="blinkState" :loading-seats="loadingSeats"
                @seat-click="handleSeatClick" />
            </template>

            <template v-else>
              <VGroup v-for="(section, sIdx) in sections" :key="`section-${sIdx}`" :config="getSectionConfig(sIdx)">
                <VRect :config="getSectionBgConfig(section)" />
                <VText :config="getSectionTitleConfig(section)" />

                <template v-if="!(section.l || section.isLabel)">
                  <VGroup v-for="(sub, subIdx) in (section.ss || section.subsections)"
                    :key="`sub-${sIdx}-${subIdx}`"
                    :config="{
                      ...getSubsectionPosition(section, subIdx),
                      onClick: () => handleSubsectionClick(sub),
                      onTap: () => handleSubsectionClick(sub),
                      onMouseenter: handleSeatHover,
                      onMouseleave: handleSeatLeave,
                    }">
                    <template v-if="sub.l || sub.isLabel">
                      <AuditoriumSeatsStageSubsectionLabel :subsection="sub"
                        :section-height="getSectionHeight(section)" />
                    </template>

                    <template v-else>
                      <AuditoriumSeatsStageSubsection :subsection="sub" :categories="categories"
                        :selected-seats-array="selectedSeatsArray" :blink-state="blinkState"
                        :loading-seats="loadingSeats" />
                    </template>
                  </VGroup>
                </template>
              </VGroup>
            </template>
          </VLayer>
        </VStage>
      </div>
    </div>

    <MyDragPanel id="cmp-my-drag-panel-mark" v-model="showMarkPanel" :title="'Asientos: ' + selectedSeatsArray.length" mode="fixed"
      :top="panelVerticalPos.top" :bottom="panelVerticalPos.bottom" left="calc(50% - 95px)">
      <div class="mark-grid">
        <template v-for="(config, key) in activeStatusConfig" :key="key">
          <div v-if="key === '_'" class="mark-item mark-spacer"></div>
          <div v-else class="mark-item">
            <VBtn class="mb-1" icon :title="config.label"
              :style="`background-color: ${config.color} !important; color: white`"
              @click="setEventSeat(key == 'e' ? null : key)">
              <svg v-if="config?.icon" viewBox="0 0 24 24" style="width: 32px; height: 32px; fill: currentColor">
                <path :d="config.icon" />
              </svg>
              <VIcon v-else>{{ getIconName(key) }}</VIcon>
            </VBtn>
            <span class="mark-label">{{ config.label }}</span>
          </div>
        </template>
      </div>
    </MyDragPanel>

    <AuditoriumSeatsHistory id="cmp-auditorium-seats-history" v-model="historyDialog" :history-loading="historyLoading" :history-log="historyLog"
      :history-users="historyUsers" />
  </div>
</template>

<script setup lang="ts">
import { DEFAULT_SETTINGS, STATUS_CONFIG, getPercentageColor } from "~/constants/auditorium"
import { useUAParser } from "~/utils/userAgent"
import { useLayout } from "vuetify"

interface Seat {
  id?: number | string
  i?: number | string
  status?: string | null
  [key: string]: unknown
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
  s?: (Seat | null)[][]
  seats?: (Seat | null)[][]
  [key: string]: unknown
}

interface Section {
  id?: number | string
  i?: number | string
  name?: string
  n?: string
  isLabel?: boolean
  l?: boolean
  ss?: Subsection[]
  subsections?: Subsection[]
  [key: string]: unknown
}

const props = defineProps<{
  sections: Section[]
  stageConfig: Record<string, unknown>
  auditoriumEventId?: number | string | null
  sectionPrefix?: string | null
  categories?: unknown[]
  loadingSeats?: unknown[]
  // Height (px) of any fixed page header rendered above this component. It is
  // reserved in-flow by the page (a spacer div) but is NOT part of the
  // viewport space the stage can fill, so it must be subtracted here or the
  // stage overflows the viewport bottom and the page shows a scrollbar.
  topOffset?: number
}>()

const emit = defineEmits<{
  (e: 'setEventSeat', payload: { seatIds: (number | string)[]; status: string | null }): void
}>()

const { mainRect } = useLayout()
const uaParser = useUAParser()

const konvaStage = ref<any>(null)
const controlRow = ref<HTMLElement | null>(null)

const eventArrays = ref<string[]>([])
const selectedSubsection = ref<Subsection | null>(null)
const zoomLevel = ref(1)
const minZoom = 0.3
const maxZoom = 8.0
const zoomStep = 0.1
const dragMode = ref<string | null>(null)
const cachedControlHeight = ref(50)
const selectedSeatsArray = ref<(number | string)[]>([])
const lastClickClientY = ref<number | null>(null)
const blinkState = ref(false)
const blinkInterval = ref<ReturnType<typeof setInterval> | null>(null)
const fitstate = ref<string | null>(null)
const lastDist = ref(0)
const lastCenter = ref<{ x: number; y: number } | null>(null)
const isTwoFingerGesture = ref(false)
const isDraggingStage = ref(false)
const dragStartPos = ref<{ x: number; y: number } | null>(null)
const markPanelVisible = ref(false)
const historyDialog = ref(false)
const historyLog = ref<Record<string, unknown>[]>([])
const historyUsers = ref<Record<string, unknown>[]>([])
const historyLoading = ref(false)

const activeStatusConfig = computed(() => {
  const order = ['e', 'h', 'i', 't', '_', 'm', 'n', 'c']
  return order
    .filter(key => key === '_' || (STATUS_CONFIG[key] && STATUS_CONFIG[key].active !== false))
    .reduce((acc, key) => {
      acc[key] = key === '_' ? null : STATUS_CONFIG[key]
      return acc
    }, {} as Record<string, (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG] | null>)
})

const showMarkPanel = computed({
  get: () => markPanelVisible.value,
  set: (val: boolean) => {
    if (!val) {
      markPanelVisible.value = false
      selectedSeatsArray.value = []
      lastClickClientY.value = null
      isDraggingStage.value = false
      dragStartPos.value = null
    }
  },
})

const panelVerticalPos = computed(() => {
  if (lastClickClientY.value === null || typeof window === 'undefined') {
    return { bottom: '90px', top: null as string | null }
  }
  const viewportMid = window.innerHeight / 2
  if (lastClickClientY.value < viewportMid) {
    return { bottom: '20px', top: null as string | null }
  }
  return { top: '60px', bottom: null as string | null }
})

const seatSpacing = computed(() => {
  return DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE
})

const allSubsections = computed(() => {
  const subsections: Subsection[] = []
  props.sections.forEach((section) => {
    const isLabel = section.l || section.isLabel
    const rawSubs = section.ss || section.subsections
    if (!isLabel && rawSubs) {
      rawSubs.forEach((sub) => {
        const isSubLabel = sub.l || sub.isLabel
        const seatsSource = sub.s || sub.seats
        if (!isSubLabel && seatsSource) {
          subsections.push(sub)
        }
      })
    }
  })
  return subsections
})

const currentSubsectionIndex = computed(() => {
  if (!selectedSubsection.value || allSubsections.value.length === 0) return -1
  const selectedId = selectedSubsection.value.i || selectedSubsection.value.id
  return allSubsections.value.findIndex((sub) => (sub.i || sub.id) === selectedId)
})

const adjustedStageConfig = computed(() => {
  return {
    ...props.stageConfig,
    width: containerWidth.value,
    height: containerHeightPx.value,
    x: 0,
    draggable: !isTwoFingerGesture.value,
    dragBoundFunc: selectedSubsection.value && dragMode.value ? getDragBoundFunc() : undefined,
  }
})

const contentOffsetX = computed(() => {
  if (selectedSubsection.value) return 0
  if (!props.sections || props.sections.length === 0) return 0
  const maxSectionWidth = Math.max(...props.sections.map((section) => getSectionWidth(section)))
  const scaledWidth = maxSectionWidth * zoomLevel.value
  const containerWidthVal = adjustedStageConfig.value.width as number
  return Math.max(0, (containerWidthVal - scaledWidth) / 2)
})

const containerHeight = computed(() => {
  if (selectedSubsection.value) {
    const subsectionHeight = getSubsectionHeight(selectedSubsection.value) + 40
    return `${subsectionHeight * zoomLevel.value}px`
  }
  if (!props.sections || props.sections.length === 0) return "500px"
  const totalContentHeight =
    props.sections.reduce((acc, section, idx) => {
      return acc + getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
    }, 0) + 40
  const scaledHeight = totalContentHeight * zoomLevel.value
  return `${scaledHeight}px`
})

const controlHeight = computed(() => cachedControlHeight.value)

const appBarHeight = computed(() => {
  return mainRect.value?.top ?? 0
})

const containerOuterHeight = computed(() => {
  const controlH = controlHeight.value
  const appBarH = appBarHeight.value
  const offset = props.topOffset ?? 0
  // The page's fixed info bar reserves its real, measured height in-flow via
  // a spacer div before this component mounts. That height is part of the
  // page's vertical budget but not usable stage space, so it must be
  // subtracted alongside the control row and the real VAppBar.
  return `calc(100dvh - ${controlH}px - ${appBarH}px - ${offset}px - env(safe-area-inset-bottom, 10px))`
})

const containerWidth = computed(() => {
  if (typeof window === "undefined") return 800
  return window.innerWidth
})

const containerHeightPx = computed(() => {
  if (typeof window === "undefined") return 600
  const controlH = controlHeight.value
  const appBarH = appBarHeight.value
  const offset = props.topOffset ?? 0
  const baseHeight = window.innerHeight || document.documentElement.clientHeight
  return baseHeight - controlH - appBarH - offset - 10
})

const subsectionStats = computed(() => {
  const seatsSource = selectedSubsection.value?.s || selectedSubsection.value?.seats
  if (!selectedSubsection.value || !seatsSource) {
    return { withStatus: 0, total: 0, percent: 0 }
  }
  let total = 0
  let withStatus = 0
  seatsSource.forEach((row) => {
    row.forEach((seat) => {
      if (seat) {
        total++
        if (seat.status && seat.status !== null) {
          withStatus++
        }
      }
    })
  })
  const percent = total > 0 ? Math.round((withStatus / total) * 100) : 0
  return { withStatus, total, percent }
})

watch(selectedSubsection, () => {
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight()
    }, 100)
  })
})

watch(selectedSeatsArray, (arr) => {
  markPanelVisible.value = arr.length > 0
})

// Vuetify 3's layout system (useLayout) can report `mainRect.top` as 0 on the
// very first render, before the VAppBar has registered its height with the
// layout provider. If we size/fit the Konva stage against that stale 0, the
// stage ends up taller than the actual space below the app bar and visually
// overlaps it (cropped/overlapping header). Re-run the fit once the real
// app-bar height comes through.
watch(appBarHeight, () => {
  nextTick(() => {
    cachedControlHeight.value = getControlRowHeight()
    applyCurrentFit()
  })
})

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight()
      fitToHeight()
    }, 100)
  })

  blinkInterval.value = setInterval(() => {
    blinkState.value = !blinkState.value
  }, 330)
})

onBeforeUnmount(() => {
  if (blinkInterval.value) {
    clearInterval(blinkInterval.value)
  }
})

function getIconName(key: string) {
  return STATUS_CONFIG[key]?.mdi || ""
}

function getSubsectionStatsFor(sub: Subsection | null) {
  const seatsSource = sub?.s || sub?.seats
  if (!sub || !seatsSource) {
    return { withStatus: 0, total: 0, percent: 0 }
  }
  let total = 0
  let withStatus = 0
  seatsSource.forEach((row) => {
    row.forEach((seat) => {
      if (seat) {
        total++
        if (seat.status && seat.status !== null) {
          withStatus++
        }
      }
    })
  })
  const percent = total > 0 ? Math.round((withStatus / total) * 100) : 0
  return { withStatus, total, percent }
}

function getControlRowHeight() {
  if (controlRow.value) {
    const element = controlRow.value as HTMLElement
    if (element && element.offsetHeight) {
      const height = element.offsetHeight
      return height > 0 ? height : 50
    }
  }
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const fallback = isMobile ? 52 : 48
  return fallback
}

function getSectionConfig(sIdx: number) {
  const section = props.sections[sIdx]
  let y = 0
  for (let i = 0; i < sIdx; i++) {
    y += getSectionHeight(props.sections[i])
  }
  if (sIdx > 0) {
    y += sIdx * 20
  }
  const maxSectionWidth = Math.max(...props.sections.map((s) => getSectionWidth(s)))
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

function getRowLabelConfig(rowIdx: number) {
  return {
    x: -12,
    y: rowIdx * seatSpacing.value + DEFAULT_SETTINGS.SEAT_SIZE / 2,
    text: (rowIdx + 1).toString(),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "right",
    verticalAlign: "middle",
    offsetY: 3,
  }
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
  return seatsSource.length * seatSpacing.value - DEFAULT_SETTINGS.SEATS_DISTANCE
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
              return acc + (isSubLabel ? (sub.w || sub.width || 40) - 20 : getSubsectionWidth(sub))
            }, 0) +
            (rawSubs.length - 1) * DEFAULT_SETTINGS.SUBSECTION_SPACING +
            DEFAULT_SETTINGS.SECTION_SIDE_PADDING * 2 +
            20
          )
        })
    )
    return maxSectionWidth || 800
  }
  const rawSubs = section.ss || section.subsections
  if (!rawSubs || !rawSubs.length) return 0
  const extraWidthPadding = 20
  return (
    rawSubs.reduce((acc, s) => {
      const isSubLabel = s.l || s.isLabel
      return acc + (isSubLabel ? (s.w || s.width || 40) - 20 : getSubsectionWidth(s))
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
  if (!rawSubs || !rawSubs.length) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
  const maxRows = Math.max(...rawSubs.map((sub) => {
    const isSubLabel = sub.l || sub.isLabel
    const seatsSource = sub.s || sub.seats
    return (isSubLabel ? 0 : seatsSource?.length || 0)
  }))
  if (maxRows === 0) return DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + 40
  const extraHeightPadding = 40
  return maxRows * seatSpacing.value - DEFAULT_SETTINGS.SEATS_DISTANCE + DEFAULT_SETTINGS.SECTION_TOP_PADDING + DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING + extraHeightPadding
}

function handleSubsectionClick(subSection: Subsection) {
  selectedSubsection.value = subSection

  if (fitstate.value === null) {
    fitstate.value = "width"
  }
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight()
      applyCurrentFit()
    }, 100)
  })
}

function goBackToFullView() {
  selectedSubsection.value = null
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight()
      applyCurrentFit()
    }, 100)
  })
}

function nextSubsection() {
  if (!selectedSubsection.value || allSubsections.value.length === 0) return
  const currentIndex = currentSubsectionIndex.value
  const nextIndex = (currentIndex + 1) % allSubsections.value.length
  selectedSubsection.value = allSubsections.value[nextIndex]
  nextTick(() => {
    setTimeout(() => {
      applyCurrentFit()
    }, 100)
  })
}

function previousSubsection() {
  if (!selectedSubsection.value || allSubsections.value.length === 0) return
  const currentIndex = currentSubsectionIndex.value
  const prevIndex = currentIndex === 0 ? allSubsections.value.length - 1 : currentIndex - 1
  selectedSubsection.value = allSubsections.value[prevIndex]
  nextTick(() => {
    setTimeout(() => {
      applyCurrentFit()
    }, 100)
  })
}

function zoomIn() {
  const newZoom = Math.min(maxZoom, zoomLevel.value + zoomStep)
  zoomLevel.value = Math.round(newZoom * 10) / 10
}

function zoomOut() {
  const newZoom = Math.max(minZoom, zoomLevel.value - zoomStep)
  zoomLevel.value = Math.round(newZoom * 10) / 10
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
      const actualWidth = containerWidth.value

      let maxContentWidth
      if (selectedSubsection.value) {
        const subsectionContentWidth = getSubsectionWidth(selectedSubsection.value)
        maxContentWidth = subsectionContentWidth + 20
      } else {
        maxContentWidth = Math.max(...props.sections.map((section) => getSectionWidth(section))) + 25
      }

      if (maxContentWidth > 0 && actualWidth > 0) {
        const optimalZoom = actualWidth / maxContentWidth
        zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, Math.round(optimalZoom * 10) / 10))
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
      const availableHeight = containerHeightPx.value

      let totalContentHeight
      if (selectedSubsection.value) {
        const subsectionContentHeight = getSubsectionHeight(selectedSubsection.value)
        totalContentHeight = subsectionContentHeight + 35
      } else {
        totalContentHeight =
          props.sections.reduce((acc, section, idx) => {
            return acc + getSectionHeight(section) + (idx > 0 ? DEFAULT_SETTINGS.SECTION_TOP_MARGIN : 0)
          }, 0) + 40
      }

      if (totalContentHeight > 0 && availableHeight > 0) {
        const optimalZoom = availableHeight / totalContentHeight
        zoomLevel.value = Math.max(minZoom, Math.min(maxZoom, Math.round(optimalZoom * 10) / 10))
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

function handleSeatClick(payload: { seat: Seat; event?: any }) {
  const { seat, event } = payload

  let clickY: number | null = null
  if (event) {
    if (event.evt && typeof event.evt.clientY === 'number') {
      clickY = event.evt.clientY
    }
    if (clickY === null && event.target) {
      try {
        const stage = event.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            const stageRect = stage.container().getBoundingClientRect()
            clickY = stageRect.top + pointer.y
          }
        }
      } catch (_) { /* ignore */ }
    }
  }
  if (clickY !== null) {
    lastClickClientY.value = clickY
  }

  const isIOS = uaParser.isIOS()
  const isAndroid = uaParser.isAndroid()

  eventArrays.value.push(`handleSeatClick ${isIOS}/${isAndroid} ${String(seat.id)}`)

  if (!selectedSubsection.value) {
    return
  }

  if (isDraggingStage.value) {
    return
  }

  const stage = konvaStage.value?.getStage()
  if (stage && dragStartPos.value) {
    const currentPos = stage.position()
    const dragDistance = Math.sqrt(
      Math.pow(currentPos.x - dragStartPos.value.x, 2) +
      Math.pow(currentPos.y - dragStartPos.value.y, 2)
    )

    if (dragDistance > DEFAULT_SETTINGS.DRAG_THRESHOLD) {
      return
    }
  }

  const seatId = seat.id
  const index = selectedSeatsArray.value.indexOf(seatId)

  selectedSeatsArray.value = index > -1
    ? selectedSeatsArray.value.filter((id) => id !== seatId)
    : [...selectedSeatsArray.value, seatId]
}

function setEventSeat(status: string | null) {
  if (selectedSeatsArray.value.length === 0) {
    return
  }

  const seatIdsToSend = selectedSeatsArray.value.filter((seatId) => {
    const seat = findSeatById(seatId)
    if (!seat) return true
    const currentStatus = seat.status || null
    return currentStatus !== status
  })

  selectedSeatsArray.value = selectedSeatsArray.value.filter((id) => seatIdsToSend.includes(id))

  if (seatIdsToSend.length === 0) {
    selectedSeatsArray.value = []
    return
  }

  emit("setEventSeat", {
    seatIds: seatIdsToSend,
    status,
  })

  selectedSeatsArray.value = []
}

function clearSelectedSeats() {
  selectedSeatsArray.value = []
}

function findSeatById(seatId: number | string) {
  for (const section of props.sections) {
    const rawSubs = section.ss || section.subsections
    if (!rawSubs) continue
    for (const sub of rawSubs) {
      const seatsSource = sub.s || sub.seats
      if (!seatsSource) continue
      for (const row of seatsSource) {
        for (const seat of row) {
          if (seat && (seat.i || seat.id) === seatId) return seat
        }
      }
    }
  }
  return null
}

function handleSeatHover(e: any) {
  const container = e.target.getStage().container()
  container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
}

function handleSeatLeave(e: any) {
  e.target.getStage().container().style.cursor = "default"
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

function getStatusColor(status: string) {
  const STATUS_COLORS: Record<string, string> = {
    a: 'green',
    p: 'orange',
    r: 'red',
    e: 'grey',
  }
  return STATUS_COLORS[status] || 'blue-grey'
}

async function openHistory() {
  historyDialog.value = true
  historyLoading.value = true
  historyLog.value = []
  const prefix = props.sectionPrefix || (selectedSubsection.value ? (selectedSubsection.value.i || selectedSubsection.value.id) : null)
  try {
    const { AuditoriumEventSeatLog } = useRepository()
    const response = await AuditoriumEventSeatLog.index(
      { auditorium_event_id: props.auditoriumEventId, section_prefix: prefix + "-" }
    )
    historyLog.value = (response as any)?.seatsLog || []
    historyUsers.value = (response as any)?.users || []
  } catch (e) {
    /* ignore */
  } finally {
    historyLoading.value = false
  }
}
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

.mark-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px 8px;
  padding: 8px 6px 6px;
  justify-items: center;
}

.mark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mark-label {
  font-size: 9px;
  text-align: center;
  line-height: 1.1;
  color: #333;
}
</style>
