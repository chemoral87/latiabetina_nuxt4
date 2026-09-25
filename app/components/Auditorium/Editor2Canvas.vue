<template>
  <VSheet
    id="ae2-canvas-sheet"
    ref="sheetRef"
    color="black"
    elevation="2"
    class="pa-0 stage-container"
    :style="{ height: `${stageConfig.height}px`, minHeight: '400px', overflow: 'hidden' }"
  >
    <VStage
      ref="konvaStage"
      :config="adjustedStageConfig"
      style="background-color: #000"
      @wheel="handleWheel"
      @dragend="handleDragEnd"
      @touchend="handleTouchEnd"
      @dragstart="handleDragStart"
      @touchmove="handleTouchMove"
      @touchstart="handleTouchStart"
    >
      <VLayer
        :config="{
          scaleX: zoomLevel,
          scaleY: zoomLevel,
        }"
      >
        <!-- Sections -->
        <VGroup v-for="section in config.sections" :key="`section-${section.id}`" :config="getSectionGroupConfig(section)">
          <AuditoriumSeatGrid
            boxed
            :show-stats="true"
            :seat-size="seatSize"
            :title="section.name"
            :seats="section.seats"
            :categories="categories"
            :seats-distance="seatsDistance"
            :border-width="SUBSECTION_BORDER_WIDTH"
            :border-color="SUBSECTION_BORDER_COLORS[config.sections.indexOf(section) % SUBSECTION_BORDER_COLORS.length]"
          />
          <!-- Pencil hit-target (top-right); marked as control so it doesn't drag the section -->
          <VGroup :config="getSectionPencilConfig(section)">
            <VCircle :config="controlCircleConfig('#1976d2', e => onSectionEdit(section, e))" />
            <VText
              :config="{
                x: 0,
                y: 0,
                text: '✎',
                fontSize: 14,
                fill: '#fff',
                align: 'center',
                verticalAlign: 'middle',
                offsetX: 5,
                offsetY: 7,
                listening: false,
              }"
            />
          </VGroup>
        </VGroup>

        <!-- Tags -->
        <VGroup v-for="tag in config.tags" :key="`tag-${tag.id}`" :config="getTagGroupConfig(tag)">
          <VRect :config="getTagBgConfig(tag)" />
          <VText :config="getTagTextConfig(tag)" />
          <!-- Pencil / rename -->
          <VGroup :config="{ x: getTagWidth(tag) + 4, y: -4 }">
            <VCircle :config="controlCircleConfig('#1976d2', e => openTagRename(tag, e))" />
            <VText
              :config="{
                x: 0,
                y: 0,
                text: '✎',
                fontSize: 12,
                fill: '#fff',
                offsetX: 4,
                offsetY: 6,
                listening: false,
              }"
            />
          </VGroup>
        </VGroup>
      </VLayer>
    </VStage>
  </VSheet>

  <!-- Tag rename dialog -->
  <VDialog id="ae2-tag-rename-dlg" v-model="tagRenameOpen" max-width="400">
    <VCard id="ae2-tag-rename-card">
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-tag</VIcon>
        Editar etiqueta
        <VSpacer />
        <VBtn id="ae2-tag-rename-close-btn" icon size="x-small" @click="tagRenameOpen = false">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>
      <VCardText class="pt-0">
        <VTextField id="ae2-tag-rename" v-model="tagRenameText" autofocus hide-details label="Texto" density="compact" variant="outlined" @keyup.enter="confirmTagRename" />
      </VCardText>
      <div class="d-flex justify-space-between align-center px-4 pb-4">
        <VBtn id="ae2-tag-delete-btn" size="small" color="error" variant="flat" @click="confirmTagDelete">
          <VIcon start size="small">mdi-delete</VIcon>
          Eliminar
        </VBtn>
        <div class="d-flex ga-2">
          <VBtn id="ae2-tag-rename-cancel-btn" variant="outlined" @click="tagRenameOpen = false"> Cancelar </VBtn>
          <VBtn id="ae2-tag-rename-save-btn" color="primary" variant="elevated" @click="confirmTagRename"> Guardar </VBtn>
        </div>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
  /**
   * Overview canvas for Auditorium Editor v2: every floating section and tag as
   * a freely draggable Konva group on a pan/zoom stage. Section pencil emits
   * `section-edit` (task 4/6 wires the rows/cols dialog). Tag rename/delete are
   * handled here with a small dialog + emit.
   */
  import { COLORS, DEFAULT_SETTINGS, STAGE_CATEGORIES, SUBSECTION_BORDER_COLORS, SUBSECTION_BORDER_WIDTH } from '~/constants/auditorium'
  import type { FloatingLayoutConfig, FloatingSection, FloatingTag } from '~/types/auditorium'
  import { getFloatingSectionHeight, getFloatingSectionWidth } from '~/utils/auditoriumFloating'
  import { useUAParser } from '~/utils/userAgent'

  const ICON_HIT_DESKTOP = 14
  const ICON_HIT_MOBILE = 20
  const TAG_HEIGHT = 36
  const TAG_PAD_X = 16

  const props = defineProps<{
    config: FloatingLayoutConfig
    stageConfig: { width: number; height: number }
  }>()

  const emit = defineEmits<{
    (e: 'section-edit', section: FloatingSection): void
    (e: 'tag-delete', tag: FloatingTag): void
    (e: 'tag-rename', tag: FloatingTag, text: string): void
    (e: 'move-group', groupNumber: number, dx: number, dy: number): void
  }>()

  const uaParser = useUAParser()
  const categories = STAGE_CATEGORIES
  const seatSize = DEFAULT_SETTINGS.SEAT_SIZE
  const seatsDistance = DEFAULT_SETTINGS.SEATS_DISTANCE
  /** Touch-friendly hit radius (see Auditorium/README.md dragDistance guidance). */
  const iconHit = computed(() => (uaParser.isMobile() ? ICON_HIT_MOBILE : ICON_HIT_DESKTOP))

  const sheetRef = ref<any>(null)
  const containerWidth = ref(props.stageConfig.width)
  const containerHeight = ref(props.stageConfig.height)

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    const el = sheetRef.value?.$el ?? sheetRef.value
    if (el && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          if (width > 0) containerWidth.value = Math.round(width)
          if (height > 0) containerHeight.value = Math.round(height)
        }
      })
      resizeObserver.observe(el)
    }
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  const { konvaStage, zoomLevel, isTwoFingerGesture, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleDragStart, handleDragEnd } = useKonvaStagePanZoom()

  const adjustedStageConfig = computed(() => ({
    width: containerWidth.value,
    height: containerHeight.value,
    draggable: !isTwoFingerGesture.value,
    dragDistance: uaParser.isMobile() ? 12 : 5,
  }))

  // ── Tag rename dialog state ──────────────────────────────────────────────────
  const tagRenameOpen = ref(false)
  const tagRenameText = ref('')
  const tagBeingRenamed = ref<FloatingTag | null>(null)

  function getSectionGroupConfig(section: FloatingSection) {
    return {
      x: section.x,
      y: section.y,
      draggable: true,
      id: `ae2-section-${section.id}`,
      ae2Group: section.group ?? null,
      onDragstart: onItemDragStart,
      onDragend: (e: any) => onSectionDragEnd(section, e),
    }
  }
  function getSectionPencilConfig(section: FloatingSection) {
    const w = getFloatingSectionWidth(section)
    return {
      x: w + 4,
      y: -4,
    }
  }

  /**
   * Shared config for pencil/delete hit circles. Marked with `ae2Control` so a
   * parent group's dragstart can abort when the pointer started on a control
   * (Konva 10 pointer events still bubble into the draggable ancestor).
   */
  function controlCircleConfig(fill: string, onActivate: (e: any) => void) {
    return {
      x: 0,
      y: 0,
      radius: iconHit.value,
      fill,
      opacity: 0.9,
      ae2Control: true,
      name: 'ae2-control',
      onMousedown: blockControlPointer,
      onTouchstart: blockControlPointer,
      onPointerdown: blockControlPointer,
      onClick: onActivate,
      onTap: onActivate,
      onPointerclick: onActivate,
      onMouseenter: setPointerCursor,
      onMouseleave: clearCursor,
    }
  }

  /** Abort group/stage drag when the gesture started on a control icon. */
  function onItemDragStart(e: any) {
    try {
      const origin = e?.target
      if (isControlNode(origin)) {
        e.cancelBubble = true
        // currentTarget is the draggable group that began dragging
        e.currentTarget?.stopDrag?.()
        origin?.stopDrag?.()
      }
    } catch {
      // ignore
    }
  }

  function isControlNode(node: any): boolean {
    let n = node
    while (n) {
      if (n.getAttr?.('ae2Control') || n.name?.() === 'ae2-control') return true
      n = n.getParent?.()
    }
    return false
  }

  function onSectionDragEnd(section: FloatingSection, e: any) {
    if (isControlNode(e?.target)) return
    const node = e?.currentTarget ?? e?.target
    if (!node || typeof node.x !== 'function') return

    const newX = Math.round(node.x())
    const newY = Math.round(node.y())
    const dx = newX - section.x
    const dy = newY - section.y

    if (dx !== 0 || dy !== 0) {
      if (section.group !== undefined) {
        emit('move-group', section.group, dx, dy)
      }
      section.x = newX
      section.y = newY
    }
  }

  function onSectionEdit(section: FloatingSection, e: any) {
    blockControlPointer(e)
    emit('section-edit', section)
  }

  function getTagWidth(tag: FloatingTag) {
    const approx = (tag.text?.length || 1) * 8 + TAG_PAD_X * 2
    return Math.max(80, approx)
  }

  function getTagGroupConfig(tag: FloatingTag) {
    return {
      x: tag.x,
      y: tag.y,
      draggable: true,
      id: `ae2-tag-${tag.id}`,
      onDragstart: onItemDragStart,
      onDragend: (e: any) => onTagDragEnd(tag, e),
    }
  }

  function getTagBgConfig(tag: FloatingTag) {
    return {
      width: getTagWidth(tag),
      height: TAG_HEIGHT,
      fill: '#424242',
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
      fontStyle: 'bold',
      fontFamily: 'Arial',
      align: 'center',
      verticalAlign: 'middle',
      offsetX: getTextWidth(tag.text, 14) / 2,
      offsetY: 7,
    }
  }

  function onTagDragEnd(tag: FloatingTag, e: any) {
    if (isControlNode(e?.target)) return
    const node = e?.currentTarget ?? e?.target
    if (!node || typeof node.x !== 'function') return
    tag.x = Math.round(node.x())
    tag.y = Math.round(node.y())
  }

  function openTagRename(tag: FloatingTag, e: any) {
    blockControlPointer(e)
    tagBeingRenamed.value = tag
    tagRenameText.value = tag.text
    tagRenameOpen.value = true
  }

  function confirmTagRename() {
    const tag = tagBeingRenamed.value
    if (!tag) {
      tagRenameOpen.value = false
      return
    }
    const text = (tagRenameText.value || '').trim() || 'Etiqueta'
    tag.text = text
    emit('tag-rename', tag, text)
    tagRenameOpen.value = false
    tagBeingRenamed.value = null
  }

  function confirmTagDelete() {
    const tag = tagBeingRenamed.value
    if (tag) {
      emit('tag-delete', tag)
    }
    tagRenameOpen.value = false
    tagBeingRenamed.value = null
  }

  function onTagDelete(tag: FloatingTag, e: any) {
    blockControlPointer(e)
    emit('tag-delete', tag)
  }

  function blockControlPointer(e: any) {
    try {
      if (e?.evt) {
        e.evt.stopPropagation?.()
        e.evt.preventDefault?.()
      }
      if (e) e.cancelBubble = true
      // Stop any ancestor that already began dragging from this pointer
      let node = e?.target
      while (node) {
        if (typeof node.draggable === 'function' && node.draggable()) {
          node.stopDrag?.()
        }
        node = node.getParent?.()
      }
    } catch {
      // ignore
    }
  }

  function setPointerCursor(e: any) {
    try {
      e.target.getStage().container().style.cursor = 'pointer'
    } catch {
      // ignore
    }
  }

  function clearCursor(e: any) {
    try {
      e.target.getStage().container().style.cursor = 'default'
    } catch {
      // ignore
    }
  }

  let _textMeasureCtx: CanvasRenderingContext2D | null = null
  function getTextWidth(text: string, fontSize = 14, fontFamily = 'Arial') {
    try {
      if (typeof document === 'undefined') return text.length * (fontSize * 0.6)
      if (!_textMeasureCtx) {
        const canvas = document.createElement('canvas')
        _textMeasureCtx = canvas.getContext('2d')
      }
      if (!_textMeasureCtx) return text.length * (fontSize * 0.6)
      _textMeasureCtx.font = `${fontSize}px ${fontFamily}`
      return _textMeasureCtx.measureText(text || '').width
    } catch {
      return (text || '').length * (fontSize * 0.6)
    }
  }
</script>

<style scoped>
  .stage-container {
    position: relative;
    width: auto;
    margin-right: 30px;
    touch-action: none;
    user-select: none;
  }

  .stage-container :deep(.konvajs-content),
  .stage-container :deep(canvas) {
    touch-action: none;
  }
</style>
