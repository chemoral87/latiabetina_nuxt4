<template>
  <VMenu
    id="cmp-my-date-range"
    ref="dateMenuRef"
    v-model="dateMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template #activator="{ props }">
      <VTextField
        id="tf-my-dater-label-1"
        :model-value="dateRangeText"
        :label="label"
        :placeholder="placeholder"
        :prepend-inner-icon="prependIcon"
        readonly
        :clearable="clearable"
        :hide-details="hideDetails"
        :density="density ?? (dense ? 'compact' : undefined)"
        :variant="variant ?? (outlined ? 'outlined' : 'underlined')"
        :disabled="disabled"
        :error-messages="errorMessages"
        v-bind="props"
        @click:clear="onClear"
      />
    </template>

    <VCard elevation="4" rounded="lg" class="my-date-range">
      <VDatePickerControls :view-mode="viewMode" :disabled="disabled">
        <template #default="controls">
          <VBtn
            id="btn-my-daterange-prev"
            icon
            variant="text"
            color="primary"
            :aria-label="controls.viewMode === 'year' || controls.viewMode === 'months' ? 'Año anterior' : 'Mes anterior'"
            @click="goPrev"
          >
            <VIcon>mdi-chevron-left</VIcon>
          </VBtn>
          <VSpacer />
          <VBtn
            id="btn-my-daterange-title"
            variant="text"
            rounded
            class="text-subtitle-1 font-weight-bold text-none px-2"
            @click="onTitleClick"
          >
            {{ headerTitle }}
          </VBtn>
          <VSpacer />
          <VBtn
            id="btn-my-daterange-next"
            icon
            variant="text"
            color="primary"
            :aria-label="controls.viewMode === 'year' || controls.viewMode === 'months' ? 'Año siguiente' : 'Mes siguiente'"
            @click="goNext"
          >
            <VIcon>mdi-chevron-right</VIcon>
          </VBtn>
        </template>
      </VDatePickerControls>

      <VDatePickerMonth
        v-if="viewMode === 'month'"
        :model-value="pendingDates"
        :month="displayMonth"
        :year="displayYear"
        :min="minDate"
        :max="maxDate"
        :first-day-of-week="firstDayOfWeek"
        :show-adjacent-months="scrollable"
        :color="color"
        :disabled="disabled"
        multiple="range"
        weeks-in-month="static"
        weekday-format="short"
        @update:model-value="onRangeUpdate"
        @update:month="onMonthUpdate"
        @update:year="onYearUpdate"
      />
      <VDatePickerMonths
        v-else-if="viewMode === 'months'"
        :model-value="highlightMonth"
        :year="displayYear"
        :min="minDate"
        :max="maxDate"
        :columns="3"
        :height="gridHeight"
        :color="color"
        @update:model-value="pickMonth"
      />
      <VDatePickerYears
        v-else
        :model-value="highlightYear"
        :min="minDate"
        :max="maxDate"
        :height="gridHeight"
        :color="color"
        @update:model-value="pickYear"
      />

      <VDivider />
      <div class="d-flex justify-end pa-2">
        <VBtn id="btn-my-daterange-clear" variant="outlined" color="primary" prepend-icon="mdi-close" @click="onClear">
          LIMPIAR
        </VBtn>
      </div>
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
import { formatShortDateSlash, capitalizeFirst } from "~/utils/date"

const props = withDefaults(defineProps<{
  modelValue?: (Date | string | null)[]
  label?: string
  placeholder?: string
  prependIcon?: string
  dense?: boolean
  outlined?: boolean
  variant?: string
  density?: string
  hideDetails?: boolean
  disabled?: boolean
  clearable?: boolean
  noTitle?: boolean
  scrollable?: boolean
  errorMessages?: string | string[]
  separator?: string
  min?: Date | string | null
  max?: Date | string | null
  color?: string
  firstDayOfWeek?: number | string
  gridHeight?: number | string
}>(), {
  modelValue: () => [],
  label: "",
  placeholder: "Rango de fechas",
  prependIcon: "mdi-calendar",
  dense: true,
  outlined: false,
  hideDetails: true,
  disabled: false,
  clearable: true,
  noTitle: true,
  scrollable: true,
  errorMessages: () => [],
  separator: " ~ ",
  min: null,
  max: null,
  color: "primary",
  firstDayOfWeek: 1,
  gridHeight: 280,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void
  (e: 'clear'): void
}>()

const adapter = useDate()

const dateMenuRef = ref()
const dateMenu = ref(false)
const viewMode = ref<'month' | 'months' | 'year'>('month')
const displayDate = ref<Date>((adapter.date() ?? new Date()) as Date)
const pendingDates = ref<Date[]>([])
const pendingSyncDone = ref(false)

function toDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null
  const d = adapter.date(val) as Date | null
  return d && adapter.isValid(d) ? d : null
}

function toIso(val: Date | string | null | undefined): string | null {
  const d = toDate(val)
  return d ? adapter.toISO(d) : null
}

function normalizeModel(val: (Date | string | null)[]): Date[] {
  return (Array.isArray(val) ? val : [])
    .map((d) => toDate(d))
    .filter((d): d is Date => !!d)
}

const minDate = computed(() => toDate(props.min))
const maxDate = computed(() => toDate(props.max))
const displayMonth = computed(() => adapter.getMonth(displayDate.value))
const displayYear = computed(() => adapter.getYear(displayDate.value))
const highlightMonth = computed(() => pendingDates.value[0] ? adapter.getMonth(pendingDates.value[0]) : displayMonth.value)
const highlightYear = computed(() => pendingDates.value[0] ? adapter.getYear(pendingDates.value[0]) : displayYear.value)

const headerTitle = computed(() => {
  if (viewMode.value === 'month') return capitalizeFirst(adapter.format(displayDate.value, 'monthAndYear'))
  return String(displayYear.value)
})

const dateRangeText = computed(() => {
  const dates = normalizeModel(props.modelValue)
  if (dates.length === 0) return ""
  return [...dates]
    .map((d) => formatShortDateSlash(adapter.toISO(d)))
    .sort()
    .join(props.separator)
})

watch(dateMenu, (open) => {
  if (open) {
    pendingDates.value = normalizeModel(props.modelValue)
    viewMode.value = 'month'
    const first = pendingDates.value[0] ?? toDate(props.modelValue?.[0])
    if (first) displayDate.value = first
    pendingSyncDone.value = false
    nextTick(() => { pendingSyncDone.value = true })
  }
})

watch(pendingDates, (val) => {
  if (pendingSyncDone.value && Array.isArray(val) && val.length === 2) {
    confirm()
  }
})

function onTitleClick() {
  if (viewMode.value === 'month') {
    viewMode.value = 'months'
  } else if (viewMode.value === 'months') {
    viewMode.value = 'year'
  }
}

function goPrev() {
  if (viewMode.value === 'month') prevMonth()
  else prevYear()
}

function goNext() {
  if (viewMode.value === 'month') nextMonth()
  else nextYear()
}

function prevMonth() {
  let d = adapter.addMonths(adapter.startOfMonth(displayDate.value) as Date, -1) as Date
  if (minDate.value && adapter.isAfter(minDate.value, d)) {
    d = adapter.startOfMonth(minDate.value) as Date
  }
  displayDate.value = d
}

function nextMonth() {
  let d = adapter.addMonths(adapter.startOfMonth(displayDate.value) as Date, 1) as Date
  if (maxDate.value && adapter.isAfter(d, maxDate.value)) {
    d = adapter.startOfMonth(maxDate.value) as Date
  }
  displayDate.value = d
}

function prevYear() {
  displayDate.value = adapter.setYear(displayDate.value, displayYear.value - 1) as Date
}

function nextYear() {
  displayDate.value = adapter.setYear(displayDate.value, displayYear.value + 1) as Date
}

function pickMonth(m: number) {
  displayDate.value = adapter.setMonth(displayDate.value, m) as Date
  viewMode.value = 'month'
}

function pickYear(y: number) {
  displayDate.value = adapter.setYear(displayDate.value, y) as Date
  viewMode.value = 'months'
}

function onRangeUpdate(val: unknown) {
  pendingDates.value = (Array.isArray(val) ? val : [])
    .map((d) => toDate(d as Date | string | null))
    .filter((d): d is Date => !!d)
}

function onMonthUpdate(m: number) {
  displayDate.value = adapter.setMonth(displayDate.value, m) as Date
}

function onYearUpdate(y: number) {
  displayDate.value = adapter.setYear(displayDate.value, y) as Date
}

function confirm() {
  const sorted = [...pendingDates.value]
    .map((d) => adapter.toISO(d))
    .sort()
  emit("update:modelValue", sorted)
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function onClear() {
  pendingDates.value = []
  emit("update:modelValue", [])
  emit("clear")
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

</script>

<style scoped>
.my-date-range {
  width: 360px;
}

.my-date-range :deep(.v-date-picker-controls) {
  min-height: 48px;
}

.my-date-range :deep(.v-date-picker-month__weekday) {
  color: rgb(var(--v-theme-medium-emphasis));
  font-size: 0.7rem;
  text-transform: uppercase;
}
</style>
