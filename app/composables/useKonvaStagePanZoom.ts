/**
 * Shared Konva stage pan/zoom: mouse-wheel zoom toward pointer (desktop) and
 * pinch-zoom + one-finger pan (touch). Lifted from
 * Auditorium/SeatsStageCanvas.vue so the mark page and the v2 floating editor
 * share the same gesture feel.
 *
 * Zoom is expected to be applied on a content layer via scaleX/scaleY; pan is
 * the stage's own position (stage.draggable should follow isTwoFingerGesture).
 */
export function useKonvaStagePanZoom(options?: {
  minZoom?: number
  maxZoom?: number
  scaleBy?: number
}) {
  const minZoom = options?.minZoom ?? 0.3
  const maxZoom = options?.maxZoom ?? 8.0
  const scaleBy = options?.scaleBy ?? 1.05

  const konvaStage = ref<{ getStage: () => any } | null>(null)
  const zoomLevel = ref(1)
  const lastDist = ref(0)
  const lastCenter = ref<{ x: number; y: number } | null>(null)
  const isTwoFingerGesture = ref(false)
  const isDraggingStage = ref(false)
  const dragStartPos = ref<{ x: number; y: number } | null>(null)

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

  function handleWheel(e: any) {
    e.evt.preventDefault()

    const stage = konvaStage.value?.getStage()
    if (!stage) return

    const oldScale = zoomLevel.value
    const pointer = stage.getPointerPosition()
    if (!pointer) return

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
    }
  }

  function handleTouchEnd() {
    lastDist.value = 0
    lastCenter.value = null
    isTwoFingerGesture.value = false
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
    return konvaStage.value?.getStage() ?? null
  }

  function resetView() {
    zoomLevel.value = 1
    nextTick(() => {
      const stage = getStage()
      if (stage) {
        stage.position({ x: 0, y: 0 })
        stage.batchDraw()
      }
    })
  }

  return {
    konvaStage,
    zoomLevel,
    minZoom,
    maxZoom,
    isTwoFingerGesture,
    isDraggingStage,
    dragStartPos,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleDragStart,
    handleDragEnd,
    getDistance,
    getCenter,
    getStage,
    resetView,
  }
}
