<template>
  <VMenu
    :id="id"
    ref="dateMenuRef"
    v-model="dateMenu"
    offset-y
    min-width="auto"
    transition="scale-transition"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <VTextField
        id="my-datep-formatteddate-tf-1"
        readonly
        :label="label"
        :rules="rules"
        v-bind="props"
        :disabled="disabled"
        :required="required"
        :clearable="clearable"
        :hide-details="hideDetails"
        :model-value="formattedDate"
        :error-messages="errorMessages"
        :prepend-inner-icon="prependIcon"
        :density="density ?? (dense ? 'compact' : undefined)"
        :variant="variant ?? (outlined ? 'outlined' : undefined)"
      />
    </template>

    <VCard rounded="lg" elevation="4" class="my-date-picker">
      <VDatePickerControls :disabled="disabled" :view-mode="viewMode">
        <template #default="controls">
          <VBtn
            id="my-datepicker-prev-btn"
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
            id="my-datepicker-title-btn"
            rounded
            variant="text"
            class="text-subtitle-1 font-weight-bold text-none px-2"
            @click="onTitleClick"
          >
            {{ headerTitle }}
          </VBtn>
          <VSpacer />
          <VBtn
            id="my-datepicker-next-btn"
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
        :color="color"
        :max="maxDate"
        :min="minDate"
        :year="displayYear"
        :disabled="disabled"
        :month="displayMonth"
        weekday-format="short"
        weeks-in-month="static"
        :model-value="selectedModel"
        :show-adjacent-months="scrollable"
        :first-day-of-week="firstDayOfWeek"
        @update:year="onYearUpdate"
        @update:model-value="pickDay"
        @update:month="onMonthUpdate"
      />
      <VDatePickerMonths
        v-else-if="viewMode === 'months'"
        :columns="3"
        :color="color"
        :max="maxDate"
        :min="minDate"
        :year="displayYear"
        :height="gridHeight"
        :model-value="highlightMonth"
        @update:model-value="pickMonth"
      />
      <VDatePickerYears
        v-else
        :color="color"
        :max="maxDate"
        :min="minDate"
        :height="gridHeight"
        :model-value="highlightYear"
        @update:model-value="pickYear"
      />

      <VDivider />
      <div class="d-flex justify-space-between pa-2">
        <VBtn id="my-datepicker-clear-btn" color="primary" variant="outlined" prepend-icon="mdi-close" @click="onClear">
          LIMPIAR
        </VBtn>
        <VBtn id="my-datepicker-today-btn" variant="flat" color="primary" prepend-icon="mdi-calendar" @click="onToday">
          HOY
        </VBtn>
      </div>
    </VCard>
  </VMenu>
</template>

<script setup lang="ts">
import { formatShortDateSlash, capitalizeFirst } from "~/utils/date"

const props = withDefaults(defineProps<{
  id?: string
  modelValue?: Date | string | null
  label?: string
  placeholder?: string
  prependIcon?: string
  required?: boolean
  rules?: ((v: unknown) => boolean | string)[]
  errorMessages?: string | string[]
  dense?: boolean
  outlined?: boolean
  variant?: string
  density?: string
  hideDetails?: boolean
  disabled?: boolean
  clearable?: boolean
  noTitle?: boolean
  scrollable?: boolean
  min?: Date | string | null
  max?: Date | string | null
  color?: string
  firstDayOfWeek?: number | string
  gridHeight?: number | string
}>(), {
  id: "cmp-my-date-picker",
  modelValue: null,
  label: "Fecha",
  placeholder: "Selecciona una fecha",
  prependIcon: "mdi-calendar",
  required: false,
  rules: () => [],
  errorMessages: () => [],
  dense: false,
  outlined: false,
  hideDetails: false,
  disabled: false,
  clearable: true,
  noTitle: true,
  scrollable: true,
  min: null,
  max: null,
  color: "primary",
  firstDayOfWeek: 1,
  gridHeight: 280,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
  (e: 'clear'): void
  (e: 'today'): void
}>()

const adapter = useDate()

const dateMenuRef = ref()
const dateMenu = ref(false)
const viewMode = ref<'month' | 'months' | 'year'>('month')
const displayDate = ref<Date>((adapter.date() ?? new Date()) as Date)
const selectedDate = ref<Date | null>(null)

function toDate(val: Date | string | null | undefined): Date | null {
  if (!val) return null
  const d = adapter.date(val) as Date | null
  return d && adapter.isValid(d) ? d : null
}

function toIso(val: Date | string | null | undefined): string | null {
  const d = toDate(val)
  return d ? adapter.toISO(d) : null
}

const minDate = computed(() => toDate(props.min))
const maxDate = computed(() => toDate(props.max))
const displayMonth = computed(() => adapter.getMonth(displayDate.value))
const displayYear = computed(() => adapter.getYear(displayDate.value))
const highlightMonth = computed(() => selectedDate.value ? adapter.getMonth(selectedDate.value) : displayMonth.value)
const highlightYear = computed(() => selectedDate.value ? adapter.getYear(selectedDate.value) : displayYear.value)
const selectedModel = computed(() => selectedDate.value ? [selectedDate.value] : [])

const headerTitle = computed(() => {
  if (viewMode.value === 'month') return capitalizeFirst(adapter.format(displayDate.value, 'monthAndYear'))
  return String(displayYear.value)
})

const formattedDate = computed(() => formatShortDateSlash(toIso(props.modelValue) ?? undefined))

watch(() => props.modelValue, (val) => {
  const d = toDate(val)
  selectedDate.value = d
  if (d) displayDate.value = d
}, { immediate: true })

watch(dateMenu, (open) => {
  if (open) {
    viewMode.value = 'month'
    const d = selectedDate.value ?? toDate(props.modelValue)
    if (d) displayDate.value = d
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

function pickDay(val: unknown) {
  const arr = Array.isArray(val) ? val : val ? [val] : []
  const d = toDate(arr[0] as Date | string | null)
  if (!d) return
  selectedDate.value = d
  displayDate.value = d
  emit("update:modelValue", adapter.toISO(d))
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function onMonthUpdate(m: number) {
  displayDate.value = adapter.setMonth(displayDate.value, m) as Date
}

function onYearUpdate(y: number) {
  displayDate.value = adapter.setYear(displayDate.value, y) as Date
}

function onClear() {
  selectedDate.value = null
  emit("update:modelValue", null)
  emit("clear")
}

function onToday() {
  const t = (adapter.date() ?? new Date()) as Date
  selectedDate.value = t
  displayDate.value = t
  viewMode.value = 'month'
  emit("update:modelValue", adapter.toISO(t))
  emit("today")
}
</script>

<style scoped>
.my-date-picker {
  width: 360px;
}

.my-date-picker :deep(.v-date-picker-controls) {
  min-height: 48px;
}

.my-date-picker :deep(.v-date-picker-month__weekday) {
  color: rgb(var(--v-theme-medium-emphasis));
  font-size: 0.7rem;
  text-transform: uppercase;
}
</style>
