<template>
  <VMenu ref="dateMenuRef" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
    <template #activator="{ props }">
      <VTextField
        id="tf-my-datep-formatteddate-1"
        :model-value="formattedDate"
        :label="label"
        :prepend-inner-icon="prependIcon"
        readonly
        :required="required"
        :rules="rules"
        :error-messages="errorMessages"
        v-bind="props"
        :density="density ?? (dense ? 'compact' : undefined)"
        :variant="variant ?? (outlined ? 'outlined' : undefined)"
        :hide-details="hideDetails"
        :disabled="disabled"
        :clearable="clearable"
      />
    </template>
    <VDatePicker
      :model-value="modelValue ?? null"
      @update:model-value="pickDate"
      :show-adjacent-months="scrollable"
      weekday-format="short"
      first-day-of-week="1"
      hide-header
      elevation="5"
    >
      <template #controls="{ disabled, nextMonth, prevMonth, monthYearText }">
        <VBtn
          :disabled="disabled?.includes?.('prev-month')"
          color="primary"
          icon="mdi-chevron-left"
          variant="text"
          @click="prevMonth"
        />
        <VSpacer />
        <div class="text-center text-body-1 font-weight-medium">
          {{ capitalizeFirst(monthYearText) }}
        </div>
        <VSpacer />
        <VBtn
          :disabled="disabled?.includes?.('next-month')"
          color="primary"
          icon="mdi-chevron-right"
          variant="text"
          @click="nextMonth"
        />
      </template>
      <template #actions>
     

        <VBtn color="primary" variant="outlined" class="mr-2" id="btn-my-datepicker-clear" @click="clearDate">
          <VIcon start>mdi-close</VIcon>
          Limpiar
        </VBtn>
        <VBtn color="primary" variant="elevated" id="btn-my-datepicker-today" @click="setToday">
          <VIcon start>mdi-calendar-today</VIcon>
          Hoy
        </VBtn>
 
      </template>
    </VDatePicker>
  </VMenu>
</template>

<script setup lang="ts">
import { formatShortDateSlash, capitalizeFirst } from "~/utils/date"
const props = withDefaults(defineProps<{
  modelValue?: string | null
  label?: string
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
}>(), {
  modelValue: null,
  label: "Fecha",
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
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
}>()

const dateMenuRef = ref()
const dateMenu = ref(false)

const formattedDate = computed(() => {
  return formatShortDateSlash(props.modelValue)
})

function pickDate(val: Date | string | null) {
  let isoDate: string | null = null
  if (val instanceof Date && !isNaN(val.getTime())) {
    const offset = val.getTimezoneOffset()
    const localDate = new Date(val.getTime() - offset * 60 * 1000)
    isoDate = localDate.toISOString().substr(0, 10)
  } else if (typeof val === "string" && val) {
    isoDate = val
  }
  emit("update:modelValue", isoDate)
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function clearDate() {
  emit("update:modelValue", null)
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function setToday() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const localDate = new Date(now.getTime() - offset * 60 * 1000)
  emit("update:modelValue", localDate.toISOString().substr(0, 10))
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}
</script>
