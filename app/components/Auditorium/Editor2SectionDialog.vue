<template>
  <VDialog id="ae2-section-edit-dlg" persistent max-width="560px" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <VCard v-if="section" id="ae2-section-edit-card">
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-seat-outline</VIcon>
        Editar sección
        <VSpacer />
        <VBtn id="ae2-section-edit-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pt-0">
        <VTextField id="ae2-section-name" v-model="section.name" class="mb-3" hide-details label="Nombre" density="compact" variant="outlined" />

        <VRow class="mb-3" density="compact">
          <VCol sm="4" cols="6">
            <VTextField id="ae2-section-rows" v-model.number="tempRows" type="text" hide-details label="Filas" density="compact" variant="outlined" />
          </VCol>
          <VCol sm="4" cols="6">
            <VTextField id="ae2-section-cols" v-model.number="tempCols" type="text" hide-details label="Columnas" density="compact" variant="outlined" />
          </VCol>
        </VRow>

        <div class="text-caption text-medium-emphasis mb-1">Clic en un asiento para asignar categoría</div>
        <VSheet id="ae2-section-mini-stage" rounded color="black" class="pa-2 mb-3" style="overflow: auto; height: 250px">
          <ClientOnly>
            <VStage :config="miniStageConfig" @tap="handleStageClick" @click="handleStageClick">
              <VLayer>
                <VGroup :config="{ x: GRID_PAD_X, y: GRID_PAD_Y }">
                  <AuditoriumSeatGrid
                    :seat-size="seatSize"
                    :seats="section.seats"
                    :categories="categories"
                    :seats-distance="seatsDistance"
                    @seat-click="handleSeatClick"
                    @seat-hover="handleSeatHover"
                    @seat-leave="handleSeatLeave"
                  />
                </VGroup>
              </VLayer>

              <VLayer>
                <VGroup v-if="activeSeat" :config="{ x: tooltipPos.x, y: tooltipPos.y }">
                  <VRect
                    :config="{
                      width: tooltipWidth,
                      height: tooltipHeight,
                      fill: '#333',
                      cornerRadius: 6,
                      opacity: 0.95,
                    }"
                  />
                  <VText
                    :config="{
                      x: 8,
                      y: 6,
                      text: 'Clasificación:',
                      fontSize: 11,
                      fill: '#fff',
                      fontStyle: 'bold',
                    }"
                  />
                  <template v-for="(cat, ci) in categories" :key="`cat-${ci}`">
                    <VText
                      :config="{
                        x: 8,
                        y: 24 + ci * 16,
                        text: '-> ' + cat.label,
                        fontSize: 12,
                        fill: '#fff',
                        onClick: () => setSeatCategory(cat.value),
                        onTap: () => setSeatCategory(cat.value),
                        onMouseenter: handleTooltipHover,
                        onMouseleave: handleTooltipLeave,
                      }"
                    />
                    <VRect
                      :config="{
                        ...getUnderlineConfig(cat, ci),
                        onClick: () => setSeatCategory(cat.value),
                        onTap: () => setSeatCategory(cat.value),
                      }"
                    />
                  </template>
                </VGroup>
              </VLayer>
            </VStage>
          </ClientOnly>
        </VSheet>

        <div class="d-flex flex-wrap ga-2">
          <VBtn id="ae2-section-dup-btn" size="small" color="secondary" variant="outlined" @click="emit('duplicate', section)">
            <VIcon start size="small">mdi-content-copy</VIcon>
            Duplicar
          </VBtn>
          <VBtn id="ae2-section-delete-btn" size="small" color="error" variant="flat" @click="emit('delete', section)">
            <VIcon start size="small">mdi-delete</VIcon>
            Eliminar
          </VBtn>
        </div>
      </VCardText>

      <div class="d-flex justify-end ga-2 px-4 pb-4">
        <VBtn id="ae2-section-edit-cancel-btn" color="secondary" variant="outlined" @click="cancel"> Cancelar </VBtn>
        <VBtn id="ae2-section-edit-done-btn" color="primary" variant="elevated" @click="save">
          <VIcon start>mdi-check</VIcon>
          Listo
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
  /**
   * Section edit dialog for Auditorium Editor v2: rename, rows/cols resize
   * (preserving seat categories), mini seat-grid with the same click-to-categorize
   * tooltip as v1 Seats.vue, plus duplicate/delete actions.
   */
  import { DEFAULT_SETTINGS, STAGE_CATEGORIES, type StageCategory } from '~/constants/auditorium'
  import type { FloatingSeat, FloatingSection } from '~/types/auditorium'
  import { getFloatingSectionHeight, getFloatingSectionWidth, resizeFloatingSectionGrid } from '~/utils/auditoriumFloating'

  const GRID_PAD_X = 24
  const GRID_PAD_Y = 20
  const GRID_PAD_BOTTOM = 28

  const props = defineProps<{
    modelValue: boolean
    section: FloatingSection | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'duplicate', section: FloatingSection): void
    (e: 'delete', section: FloatingSection): void
  }>()

  const categories = STAGE_CATEGORIES
  const seatSize = DEFAULT_SETTINGS.SEAT_SIZE
  const seatsDistance = DEFAULT_SETTINGS.SEATS_DISTANCE

  const tempRows = ref(4)
  const tempCols = ref(4)
  const snapshot = ref<{ name: string; rows: number; cols: number; seats: any } | null>(null)

  const activeSeat = ref<{
    id: string
    x: number
    y: number
  } | null>(null)

  watch(
    () => props.section,
    s => {
      if (s) {
        tempRows.value = s.rows
        tempCols.value = s.cols
        activeSeat.value = null
      }
    },
    { immediate: true }
  )

  watch(
    () => props.modelValue,
    open => {
      if (open && props.section) {
        snapshot.value = {
          name: props.section.name,
          rows: props.section.rows,
          cols: props.section.cols,
          seats: JSON.parse(JSON.stringify(props.section.seats)),
        }
      }
      if (!open) {
        activeSeat.value = null
        snapshot.value = null
      }
    }
  )

  watch([tempRows, tempCols], ([rows, cols]) => {
    if (!props.section) return
    resizeFloatingSectionGrid(props.section, rows, cols)
  })

  const miniStageConfig = computed(() => {
    const s = props.section
    if (!s) return { width: 200, height: 120 }
    return {
      width: Math.max(200, getFloatingSectionWidth(s) + GRID_PAD_X + 16),
      height: Math.max(120, getFloatingSectionHeight(s) + GRID_PAD_Y + GRID_PAD_BOTTOM),
    }
  })

  const tooltipWidth = computed(() => {
    const base = 110
    try {
      const maxText = Math.max(...categories.map(cat => getTextWidth('-> ' + cat.label, 12)))
      return Math.max(base, Math.ceil(maxText) + 16)
    } catch {
      return base
    }
  })

  const tooltipHeight = computed(() => {
    const header = 20
    const optionHeight = 16
    const bottomPad = 12
    return Math.max(40, header + categories.length * optionHeight + bottomPad)
  })

  const tooltipPos = computed(() => {
    if (!activeSeat.value) return { x: 0, y: 0 }
    return {
      x: activeSeat.value.x + seatSize / 2 + 6,
      y: Math.max(0, activeSeat.value.y - seatSize / 2 - 8),
    }
  })

  function close() {
    activeSeat.value = null
    emit('update:modelValue', false)
  }

  function save() {
    if (!props.section) return
    tempRows.value = props.section.rows
    tempCols.value = props.section.cols
    close()
  }

  function cancel() {
    if (!props.section || !snapshot.value) {
      close()
      return
    }
    props.section.name = snapshot.value.name
    props.section.rows = snapshot.value.rows
    props.section.cols = snapshot.value.cols
    props.section.seats = snapshot.value.seats
    tempRows.value = snapshot.value.rows
    tempCols.value = snapshot.value.cols
    close()
  }

  function handleSeatClick(payload: { seat: FloatingSeat & { x?: number; y?: number }; event?: any }) {
    const { seat, event: e } = payload
    try {
      if (e?.evt?.stopPropagation) e.evt.stopPropagation()
      else if (e && typeof e.cancelBubble !== 'undefined') e.cancelBubble = true
    } catch {
      // ignore
    }
    activeSeat.value = {
      id: seat.id,
      x: GRID_PAD_X + (seat.x ?? 0),
      y: GRID_PAD_Y + (seat.y ?? 0),
    }
  }

  function setSeatCategory(category: string | null) {
    if (!props.section || !activeSeat.value) return
    const seat = findSeatById(activeSeat.value.id)
    if (seat) {
      seat.category = category == null ? 'Ninguno' : category
    }
    activeSeat.value = null
  }

  function findSeatById(id: string): FloatingSeat | null {
    const seats = props.section?.seats
    if (!seats) return null
    for (const row of seats) {
      for (const seat of row) {
        if (seat && seat.id === id) return seat
      }
    }
    return null
  }

  function handleStageClick(e: any) {
    let node = e.target
    while (node) {
      const cls = node.getClassName && node.getClassName()
      if (cls === 'Circle') return
      if (cls === 'Stage') break
      node = node.getParent()
    }
    activeSeat.value = null
  }

  function handleSeatHover(e: any) {
    try {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? 'not-allowed' : 'pointer'
    } catch {
      // ignore
    }
  }

  function handleSeatLeave(e: any) {
    try {
      e.target.getStage().container().style.cursor = 'default'
    } catch {
      // ignore
    }
  }

  function handleTooltipHover(e: any) {
    try {
      e.target.getStage().container().style.cursor = 'pointer'
    } catch {
      // ignore
    }
  }

  function handleTooltipLeave(e: any) {
    try {
      e.target.getStage().container().style.cursor = 'default'
    } catch {
      // ignore
    }
  }

  let _textMeasureCtx: CanvasRenderingContext2D | null = null
  function getTextWidth(text: string, fontSize = 12, fontFamily = 'Arial') {
    try {
      if (typeof document === 'undefined') return text.length * (fontSize * 0.6)
      if (!_textMeasureCtx) {
        const canvas = document.createElement('canvas')
        _textMeasureCtx = canvas.getContext('2d')
      }
      if (!_textMeasureCtx) return text.length * (fontSize * 0.6)
      _textMeasureCtx.font = `${fontSize}px ${fontFamily}`
      return _textMeasureCtx.measureText(text).width
    } catch {
      return text.length * (fontSize * 0.6)
    }
  }

  function getUnderlineConfig(cat: StageCategory, ci: number) {
    const text = '-> ' + cat.label
    const fontSize = 12
    const width = getTextWidth(text, fontSize)
    return {
      x: 8,
      y: 26 + ci * 16 + fontSize - 2,
      width,
      height: 2,
      fill: cat.fill,
      cornerRadius: 1,
    }
  }
</script>
