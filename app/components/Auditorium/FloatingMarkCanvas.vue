<template>
  <VSheet
    id="ae2-mark-canvas-sheet"
    color="black"
    elevation="2"
     class="pa-0 ma-0 stage-container"
     :style="{ height: '100%', width: '100%', overflow: 'hidden' }"
  >
    <VStage
      ref="konvaStage"
      :config="adjustedStageConfig"
      style="background-color: #000"
      @wheel="onWheel"
      @dragend="onDragEnd"
      @touchmove="onTouchMove"
      @touchend="handleTouchEnd"
      @dragstart="handleDragStart"
      @touchstart="handleTouchStart"
    >
      <VLayer
        :config="{
          scaleX: zoomLevel,
          scaleY: zoomLevel,
        }"
      >
        <VGroup
          v-for="section in visibleSections"
          :key="`section-${section.id}`"
          :config="{
            x: section.x,
            y: section.y,
            // Tapping anywhere on a section (its box, its padding or one of its
            // seats) drills into it. Seat clicks bubble up to here, which is
            // what makes the whole box a hit target in the overview.
            onClick: () => {
              if (!props.selectedSectionId) emit('section-click', section)
            },
            onTap: () => {
              if (!props.selectedSectionId) emit('section-click', section)
            },
          }"
        >
          <AuditoriumSeatGrid
            boxed
            :show-stats="true"
            :seat-size="seatSize"
            :title="section.name"
            :seats="section.seats"
            :categories="categories"
            :blink-state="blinkState"
            :seats-distance="seatsDistance"
            :selected-seat-ids="selectedSeatIds"
            :compact="Boolean(selectedSectionId)"
            :border-width="SUBSECTION_BORDER_WIDTH"
            :border-color="getSectionBorderColor(sectionOrderIndex(section))"
            @seat-click="(p: any) => emit('seat-click', p)"
          />
        </VGroup>

        <VGroup
          v-for="tag in visibleTags"
          :key="`tag-${tag.id}`"
          :config="{ x: tag.x, y: tag.y }"
        >
          <VRect :config="getTagBgConfig(tag)" />
          <VText :config="getTagTextConfig(tag)" />
        </VGroup>
      </VLayer>
    </VStage>
  </VSheet>
</template>

<script setup lang="ts">
import {
  COLORS,
  DEFAULT_SETTINGS,
  FLOATING_SECTION_BOX,
  STAGE_CATEGORIES,
  SUBSECTION_BORDER_COLORS,
  SUBSECTION_BORDER_WIDTH,
} from "~/constants/auditorium"
import type { FloatingLayoutConfig, FloatingSection, FloatingTag } from "~/types/auditorium"
import { useUAParser } from "~/utils/userAgent"

const TAG_HEIGHT = 36
const TAG_PAD_X = 16

const props = withDefaults(
  defineProps<{
    config: FloatingLayoutConfig
    stageConfig: { width: number; height: number }
    /** When set, only this section is rendered (drilled-in view). */
    selectedSectionId?: string | null
    /** Seat ids picked by the user, rendered blinking. */
    selectedSeatIds?: (number | string)[]
    /** Toggled by the parent to animate the picked seats. */
    blinkState?: boolean
  }>(),
  {
    selectedSectionId: null,
    selectedSeatIds: () => [],
    blinkState: false,
  },
)

const emit = defineEmits<{
  (e: "seat-click", payload: { seat: { id: string; row: number; col: number }; event: unknown }): void
  (e: "section-click", section: FloatingSection): void
}>()

const uaParser = useUAParser()
const categories = STAGE_CATEGORIES
const seatSize = DEFAULT_SETTINGS.SEAT_SIZE
const seatsDistance = DEFAULT_SETTINGS.SEATS_DISTANCE
const seatSpacing = DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE

const {
  konvaStage,
  zoomLevel,
  minZoom,
  maxZoom,
  isTwoFingerGesture,
  handleWheel,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleDragStart,
  handleDragEnd,
} = useKonvaStagePanZoom()

const adjustedStageConfig = computed(() => ({
  width: props.stageConfig.width,
  height: props.stageConfig.height,
  draggable: !isTwoFingerGesture.value,
  dragDistance: uaParser.isMobile() ? 12 : 5,
}))

/** Only the drilled-in section (when one is selected), otherwise all of them. */
const visibleSections = computed<FloatingSection[]>(() => {
  if (!props.selectedSectionId) return props.config.sections
  return props.config.sections.filter((s) => s.id === props.selectedSectionId)
})

// Tags are layout annotations; they would only clutter the drilled-in view.
const visibleTags = computed<FloatingTag[]>(() =>
  props.selectedSectionId ? [] : (props.config.tags ?? [])
)

/**
 * Border colour index. Always resolved against the full section list so a
 * section keeps its colour when it is viewed on its own.
 */
function sectionOrderIndex(section: FloatingSection) {
  return props.config.sections.findIndex((s) => s.id === section.id)
}

function getSectionBorderColor(sectionIndex: number) {
  return SUBSECTION_BORDER_COLORS[sectionIndex % SUBSECTION_BORDER_COLORS.length]
}

/** Free space kept between the content bounding box and the viewport edges. */
const FIT_PADDING = 16

// Once the user pans/zooms by hand, auto-centering must stop: a viewport resize
// (window resize, mobile URL bar) would otherwise yank their view back.
const userAdjusted = ref(false)

function getContentBBox() {
  const sections = visibleSections.value
  const tags = visibleTags.value
  if (sections.length === 0 && tags.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0 }
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const s of sections) {
    // Section boxes are FLOATING_SECTION_BOX.EXTRA_WIDTH/EXTRA_HEIGHT larger than the
    // seat grid and start at RECT_Y, so the bbox must include that chrome or
    // Fit would leave the outermost borders outside the viewport.
    const w = s.cols * seatSpacing - seatsDistance + FLOATING_SECTION_BOX.EXTRA_WIDTH
    const h =
      s.rows * seatSpacing -
      seatsDistance +
      FLOATING_SECTION_BOX.EXTRA_HEIGHT +
      FLOATING_SECTION_BOX.RECT_Y
    minX = Math.min(minX, s.x)
    minY = Math.min(minY, s.y)
    maxX = Math.max(maxX, s.x + w)
    maxY = Math.max(maxY, s.y + h)
  }
  // Tags (labels) are part of the content too, so they are included in the
  // bbox — otherwise a tag outside the section envelope would be left off
  // screen after centering/fitting.
  for (const tag of tags) {
    minX = Math.min(minX, tag.x)
    minY = Math.min(minY, tag.y)
    maxX = Math.max(maxX, tag.x + getTagWidth(tag))
    maxY = Math.max(maxY, tag.y + TAG_HEIGHT)
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY }
}

function getViewport() {
  return {
    w: Math.max(props.stageConfig.width - FIT_PADDING, 1),
    h: Math.max(props.stageConfig.height - FIT_PADDING, 1),
  }
}

/**
 * Apply a zoom level and re-center the content in the stage. Centering is a
 * stage translation (the zoom itself lives on the content layer), so a point
 * of the content at (cx, cy) lands at `stage.x + cx * zoom`; solving for the
 * content center under the viewport center gives the position below.
 */
function applyZoomCentered(zoom: number) {
  const clamped = Math.max(minZoom, Math.min(maxZoom, zoom))
  zoomLevel.value = Math.round(clamped * 100) / 100
  nextTick(() => {
    const stage = konvaStage.value?.getStage?.()
    if (!stage) return
    const bbox = getContentBBox()
    if (bbox.w <= 0 || bbox.h <= 0) return
    const scale = zoomLevel.value
    stage.position({
      x: props.stageConfig.width / 2 - (bbox.minX + bbox.w / 2) * scale,
      y: props.stageConfig.height / 2 - (bbox.minY + bbox.h / 2) * scale,
    })
    stage.batchDraw()
  })
}

function fitToWidth() {
  const bbox = getContentBBox()
  if (bbox.w <= 0) return
  applyZoomCentered(getViewport().w / bbox.w)
}

function fitToHeight() {
  const bbox = getContentBBox()
  if (bbox.h <= 0) return
  applyZoomCentered(getViewport().h / bbox.h)
}

/**
 * Fit every section (and tag) inside the viewport and center it — used on
 * mount so the page never opens with the content pinned to the top-left of
 * the black stage, partly off screen.
 */
function centerContent() {
  const bbox = getContentBBox()
  if (bbox.w <= 0 || bbox.h <= 0) return
  const viewport = getViewport()
  applyZoomCentered(Math.min(viewport.w / bbox.w, viewport.h / bbox.h))
}

onMounted(() => {
  nextTick(() => {
    centerContent()
    setTimeout(centerContent, 100)
  })
})

// The layout arrives with the event payload, but re-center if sections are
// populated after mount (or their count changes) so the view is never stale.
watch(
  () => props.config.sections.length,
  (next, prev) => {
    if (next !== prev && next > 0) nextTick(() => centerContent())
  },
)

// The page measures the viewport in its own onMounted, which runs *after* this
// child mounts — so the first centering above uses the placeholder stage size.
// Re-center whenever the stage size actually changes (as long as the user
// hasn't taken over the view).
watch(
  () => [props.stageConfig.width, props.stageConfig.height],
  () => {
    if (!userAdjusted.value) nextTick(() => centerContent())
  },
)

// Drilling into a section (or coming back to the overview) re-frames the
// content: the bbox is computed from visibleSections, so the same fit+center
// call covers both "all sections" and "just this one", zoomed in.
watch(
  () => props.selectedSectionId,
  () => {
    userAdjusted.value = false
    nextTick(() => {
      centerContent()
      setTimeout(centerContent, 100)
    })
  },
)

function onWheel(e: any) {
  userAdjusted.value = true
  handleWheel(e)
}

function onTouchMove(e: any) {
  if (e.evt?.touches?.length > 1) userAdjusted.value = true
  handleTouchMove(e)
}

function onDragEnd(e: any) {
  userAdjusted.value = true
  handleDragEnd(e)
}

defineExpose({ fitToWidth, fitToHeight, centerContent })

function getTagWidth(tag: FloatingTag) {
  const approx = (tag.text?.length || 1) * 8 + TAG_PAD_X * 2
  return Math.max(80, approx)
}

function getTagBgConfig(tag: FloatingTag) {
  return {
    width: getTagWidth(tag),
    height: TAG_HEIGHT,
    fill: "#424242",
    opacity: 0.3,
    strokeWidth: 2,
    stroke: COLORS.LABEL_TEXT,
    dash: [5, 5],
  }
}

function getTagTextConfig(tag: FloatingTag) {
  const w = getTagWidth(tag)
  return {
    x: w / 2,
    y: TAG_HEIGHT / 2,
    text: tag.text,
    fontSize: 14,
    fill: COLORS.LABEL_TEXT,
    fontStyle: "bold",
    fontFamily: "Arial",
    align: "center",
    verticalAlign: "middle",
    offsetX: (tag.text?.length || 1) * 4,
    offsetY: 7,
  }
}
</script>

<style scoped>
.stage-container {
  position: relative;
  width: 100%;
}

@media (max-width: 600px) {
  .stage-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
