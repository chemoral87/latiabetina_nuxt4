<template>
  <VMenu
    :id="id"
    ref="menuRef"
    v-model="menuOpen"
    offset-y
    min-width="auto"
    transition="scale-transition"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <VTextField
        readonly
        :label="label"
        v-bind="props"
        :density="density"
        :variant="variant"
        :disabled="disabled"
        :clearable="clearable"
        :model-value="displayText"
        :hide-details="hideDetails"
        :error-messages="errorMessages"
        prepend-inner-icon="mdi-calendar"
      />
    </template>

    <VCard rounded="lg" elevation="4" class="my-date-month-picker">
      <VDatePickerControls :disabled="disabled" :view-mode="viewMode">
        <template #default="controls">
          <VBtn
            id="my-datemonthpicker-prev-btn"
            icon
            variant="text"
            color="primary"
            :aria-label="controls.viewMode === 'year' ? 'Año anterior' : 'Mes anterior'"
            @click="goPrev"
          >
            <VIcon>mdi-chevron-left</VIcon>
          </VBtn>
          <VSpacer />
          <VBtn
            id="my-datemonthpicker-title-btn"
            rounded
            variant="text"
            class="text-subtitle-1 font-weight-bold text-none px-2"
            @click="onTitleClick"
          >
            {{ headerTitle }}
          </VBtn>
          <VSpacer />
          <VBtn
            id="my-datemonthpicker-next-btn"
            icon
            variant="text"
            color="primary"
            :aria-label="controls.viewMode === 'year' ? 'Año siguiente' : 'Mes siguiente'"
            @click="goNext"
          >
            <VIcon>mdi-chevron-right</VIcon>
          </VBtn>
        </template>
      </VDatePickerControls>

      <div v-if="viewMode === 'months'" class="my-date-month-grid pa-2">
        <VBtn
          v-for="(monthLabel, m) in monthShortLabels"
          :key="monthLabel"
          rounded="pill"
          class="my-date-month-btn"
          :disabled="disabled || isMonthDisabled(m)"
          :color="m === selectedMonth ? color : undefined"
          :variant="m === selectedMonth ? 'flat' : 'text'"
          @click="pickMonth(m)"
        >
          {{ monthLabel }}
        </VBtn>
      </div>
      <VDatePickerYears
        v-else
        :height="280"
        :color="color"
        :max="maxDate"
        :min="minDate"
        :model-value="selectedYear"
        @update:model-value="pickYear"
      />

      <VDivider />
      <div class="d-flex justify-space-between pa-2">
        <VBtn id="my-datemonthpicker-clear-btn" color="primary" variant="outlined" prepend-icon="mdi-close" @click="onClear">
          LIMPIAR
        </VBtn>
        <VBtn id="my-datemonthpicker-current-btn" variant="flat" color="primary" prepend-icon="mdi-calendar" @click="onCurrentMonth">
          MES ACTUAL
        </VBtn>
      </div>
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  id?: string
  modelValue?: string | null
  label?: string
  disabled?: boolean
  clearable?: boolean
  hideDetails?: boolean
  errorMessages?: string | string[]
  density?: "default" | "comfortable" | "compact" | null
  variant?: "outlined" | "filled" | "solo" | "plain" | "underlined" | "elevated" | "flat" | "tonal" | null
  color?: string
  min?: string | null
  max?: string | null
}>(), {
  id: "cmp-my-date-month-picker",
  modelValue: null,
  label: "Mes",
  disabled: false,
  clearable: true,
  hideDetails: false,
  errorMessages: () => [],
  density: "compact",
  variant: "outlined",
  color: "primary",
  min: null,
  max: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
  (e: 'clear'): void
}>()

const adapter = useDate()

const menuRef = ref()
const menuOpen = ref(false)
const viewMode = ref<'months' | 'year'>('months')
const displayDate = ref<Date>((adapter.date() ?? new Date()) as Date)

function toDate(val: string | null | undefined): Date | null {
  if (!val) return null
  const iso = /^\d{4}-\d{2}$/.test(val) ? `${val}-01` : val
  const d = adapter.date(iso) as Date | null
  return d && adapter.isValid(d) ? d : null
}

const minDate = computed(() => toDate(props.min))
const maxDate = computed(() => toDate(props.max))
const displayMonth = computed(() => adapter.getMonth(displayDate.value))
const displayYear = computed(() => adapter.getYear(displayDate.value))
const selectedMonth = computed(() => displayMonth.value)
const selectedYear = computed(() => displayYear.value)

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

const monthShortLabels = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
]

function yearMonthIndex(ym: string | null | undefined): number | null {
  if (!ym) return null
  const match = /^(\d{4})-(\d{2})/.exec(ym)
  if (!match) return null
  return Number(match[1]) * 12 + (Number(match[2]) - 1)
}

function isMonthDisabled(m: number): boolean {
  const idx = displayYear.value * 12 + m
  const minIdx = yearMonthIndex(props.min)
  if (minIdx !== null && idx < minIdx) return true
  const maxIdx = yearMonthIndex(props.max)
  if (maxIdx !== null && idx > maxIdx) return true
  return false
}

const headerTitle = computed(() => {
  if (viewMode.value === 'months') return String(displayYear.value)
  const start = Math.floor(displayYear.value / 12) * 12
  return `${start} – ${start + 11}`
})

const displayText = computed(() => {
  if (!props.modelValue) return ""
  const d = toDate(props.modelValue)
  if (!d) return ""
  const m = adapter.getMonth(d)
  const y = adapter.getYear(d)
  return `${monthNames[m]} de ${y}`
})

watch(() => props.modelValue, (val) => {
  const d = toDate(val)
  if (d) displayDate.value = d
}, { immediate: true })

watch(menuOpen, (open) => {
  if (open) {
    viewMode.value = 'months'
    const d = toDate(props.modelValue)
    if (d) displayDate.value = d
  }
})

function onTitleClick() {
  viewMode.value = viewMode.value === 'months' ? 'year' : 'months'
}

function goPrev() {
  if (viewMode.value === 'months') {
    displayDate.value = adapter.setYear(displayDate.value, displayYear.value - 1) as Date
  } else {
    displayDate.value = adapter.setYear(displayDate.value, displayYear.value - 12) as Date
  }
}

function goNext() {
  if (viewMode.value === 'months') {
    displayDate.value = adapter.setYear(displayDate.value, displayYear.value + 1) as Date
  } else {
    displayDate.value = adapter.setYear(displayDate.value, displayYear.value + 12) as Date
  }
}

function pickMonth(m: number) {
  const y = displayYear.value
  const iso = `${y}-${String(m + 1).padStart(2, '0')}`
  emit("update:modelValue", iso)
  menuOpen.value = false
  nextTick(() => {
    menuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function pickYear(y: number) {
  displayDate.value = adapter.setYear(displayDate.value, y) as Date
  viewMode.value = 'months'
}

function onClear() {
  emit("update:modelValue", null)
  emit("clear")
  menuOpen.value = false
  nextTick(() => {
    menuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function onCurrentMonth() {
  const now = (adapter.date() ?? new Date()) as Date
  const m = adapter.getMonth(now)
  const y = adapter.getYear(now)
  const iso = `${y}-${String(m + 1).padStart(2, '0')}`
  displayDate.value = now
  emit("update:modelValue", iso)
  menuOpen.value = false
  nextTick(() => {
    menuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}
</script>

<style scoped>
.my-date-month-picker {
  width: 300px;
}

.my-date-month-picker :deep(.v-date-picker-controls) {
  min-height: 48px;
}

.my-date-month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  min-height: 280px;
  align-content: start;
}

.my-date-month-btn {
  text-transform: lowercase;
}
</style>
