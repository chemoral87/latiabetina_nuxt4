<template>
  <div
    v-if="modelValue"
    id="cmp-my-drag-panel"
    ref="panel"
    class="drag-panel elevation-8"
    :style="panelStyle"
  >
    <div :class="enterAnimClass">
      <!-- Header / Drag Handle -->
      <div
        class="drag-panel-header"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <slot name="header">
          <span class="text-caption font-weight-bold">{{ title }}</span>
        </slot>
        <VSpacer />
        <VBtn
          id="mydrag-close-btn"
          variant="outlined"
          icon
          size="x-small"
          color="white"
          title="Cerrar"
          class="ml-2"
          @click.stop="close"
        >
          <VIcon size="small">mdi-close</VIcon>
        </VBtn>
      </div>

      <!-- Body Content -->
      <div class="drag-panel-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  initialX?: number
  initialY?: number
  anchor?: string
  mode?: string
  top?: string | null
  left?: string | null
  right?: string | null
  bottom?: string | null
}>(), {
  title: "",
  initialX: 0,
  initialY: 0,
  anchor: "right",
  mode: "absolute",
  top: null,
  left: null,
  right: null,
  bottom: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const panel = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const pos = ref({ x: props.initialX, y: props.initialY })
const dragOffset = ref({ x: 0, y: 0 })
const hasMoved = ref(false)
const resizeObserver = ref<ResizeObserver | null>(null)

/**
 * Pick the slide direction based on initial position:
 * - `top` prop set → panel appears anchored at top → slide DOWN from above
 * - `bottom` prop set → panel appears anchored at bottom → slide UP from below
 * - No explicit vertical anchor → default slide up
 */
const enterAnimClass = computed(() => {
  return {
    'anim-enter': true,
    'anim-from-top': !!props.top && !props.bottom,
    'anim-from-bottom': !!props.bottom || (!props.top && !props.bottom),
  }
})

watch(
  () => [props.modelValue, props.top, props.bottom, props.left, props.right],
  ([val]) => {
    if (val) {
      hasMoved.value = false
    }
  }
)

const panelStyle = computed(() => {
  const style: Record<string, string> = {
    position: props.mode,
    zIndex: '2000',
    transform: 'none',
  }

  if (!hasMoved.value) {
    style.top = props.top ?? 'auto'
    style.left = props.left ?? 'auto'
    style.right = props.right ?? 'auto'
    style.bottom = props.bottom ?? 'auto'

    if (!props.top && !props.bottom) {
      style.top = '100%'
      style.marginTop = '4px'
    } else {
      style.marginTop = '0px'
    }
    if (!props.left && !props.right) {
      if (props.anchor === 'right') {
        style.right = '0px'
        style.left = 'auto'
      } else {
        style.left = '0px'
        style.right = 'auto'
      }
    }
  } else {
    style.left = `${pos.value.x}px`
    style.top = `${pos.value.y}px`
    style.right = 'auto'
    style.bottom = 'auto'
  }

  return style
})

onMounted(() => {
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchend', stopDrag)

  nextTick(() => {
    adjustPosition()

    const panelEl = panel.value
    if (panelEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver.value = new ResizeObserver(() => {
        adjustPosition()
      })
      resizeObserver.value.observe(panelEl)
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchend', stopDrag)

  if (resizeObserver.value) {
    resizeObserver.value.disconnect()
    resizeObserver.value = null
  }
})

/**
 * Smart viewport-aware positioning for dragged panel.
 */
function adjustPosition() {
  if (!hasMoved.value) return

  const panelEl = panel.value
  if (!panelEl) return

  const rect = panelEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = 8

  let dx = 0
  let dy = 0

  if (rect.right > vw) dx = vw - rect.right - margin
  if (rect.left + dx < 0) dx = -rect.left + margin

  if (rect.top < 0) dy = -rect.top + margin
  if (rect.bottom > vh) dy = vh - rect.bottom - margin

  if (dx !== 0 || dy !== 0) {
    pos.value.x += dx
    pos.value.y += dy
  }
}

function close() {
  emit('update:modelValue', false)
}

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true

  const clientX = e.type === 'touchstart' ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
  const clientY = e.type === 'touchstart' ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY

  const panelEl = panel.value
  if (panelEl) {
    const rect = panelEl.getBoundingClientRect()

    if (!hasMoved.value) {
      let parentLeft = 0
      let parentTop = 0
      if (props.mode !== 'fixed' && panelEl.offsetParent) {
        const pRect = (panelEl.offsetParent as HTMLElement).getBoundingClientRect()
        parentLeft = pRect.left
        parentTop = pRect.top
      }
      pos.value.x = rect.left - parentLeft
      pos.value.y = rect.top - parentTop
      hasMoved.value = true
    }

    dragOffset.value.x = clientX - rect.left
    dragOffset.value.y = clientY - rect.top
  }
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return

  if (e.type === 'touchmove') e.preventDefault()

  const clientX = e.type === 'touchmove' ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
  const clientY = e.type === 'touchmove' ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY

  const panelEl = panel.value
  if (panelEl) {
    let parentLeft = 0
    let parentTop = 0

    if (props.mode !== 'fixed' && panelEl.offsetParent) {
      const parentRect = (panelEl.offsetParent as HTMLElement).getBoundingClientRect()
      parentLeft = parentRect.left
      parentTop = parentRect.top
    }

    const rawX = clientX - parentLeft - dragOffset.value.x
    const rawY = clientY - parentTop - dragOffset.value.y

    const margin = 8
    const panelRect = panelEl.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const viewportX = rawX + parentLeft
    const viewportY = rawY + parentTop

    pos.value.x = Math.max(margin, Math.min(viewportX, vw - panelRect.width - margin)) - parentLeft
    pos.value.y = Math.max(margin, Math.min(viewportY, vh - panelRect.height - margin)) - parentTop
  }
}

function stopDrag() {
  isDragging.value = false
  adjustPosition()
}
</script>

<style scoped>
.drag-panel {
  background: #fff;
  border-radius: 8px;
  min-width: 190px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
}

.drag-panel-header {
  display: flex;
  align-items: center;
  padding: 6px 8px 6px 12px;
  background: #1976d2;
  color: #fff;
  cursor: move;
  user-select: none;
  border-radius: 8px 8px 0 0;
}

.drag-panel-body {
  border-radius: 0 0 8px 8px;
}

/* ── Enter animation ─────────────────────────────────────── */

.anim-enter {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

.anim-from-top {
  animation-name: slideInDown;
}

.anim-from-bottom {
  animation-name: slideInUp;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
