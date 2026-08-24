<template>
  <VMenu id="cmp-my-time-picker" ref="timeMenuRef" v-model="timeMenu" :close-on-content-click="false" transition="scale-transition" offset-y :disabled="disabled">
    <template #activator="{ props: menuProps }">
      <VTextField
        :id="props.id"
        ref="inputField"
        :model-value="displayValue"
        :label="label"
        prepend-inner-icon="mdi-clock-outline"
        readonly
        :error-messages="errorMessages"
        :disabled="disabled"
        :density="dense ? 'compact' : undefined"
        :variant="outlined ? 'outlined' : undefined"
        :hide-details="hideDetails"
        v-bind="menuProps"
        clearable
      />
    </template>

    <VCard id="my-timep-card-1" min-width="auto">
      <VRow no-gutters>
        <!-- Hours column -->
        <VCol cols="4" class="tp-col">
          <div v-for="h in hours" :key="h" class="tp-item" :class="{ 'tp-item--selected': selectedHour === h }" @click="selectedHour = h">
            {{ h }}
          </div>
        </VCol>

        <!-- Minutes column -->
        <VCol cols="4" class="tp-col">
          <div v-for="m in minutes" :key="m" class="tp-item" :class="{ 'tp-item--selected': selectedMinute === m }" @click="selectedMinute = m">
            {{ m }}
          </div>
        </VCol>

        <!-- AM/PM column -->
        <VCol cols="4" class="tp-col">
          <div v-for="p in periods" :key="p" class="tp-item" :class="{ 'tp-item--selected': selectedPeriod === p }" @click="selectedPeriod = p">
            {{ p }}
          </div>
        </VCol>
      </VRow>

      <div class="d-flex justify-end px-4 pb-4 pt-2">
        <VBtn id="my-timepicker-clear-btn" color="primary" variant="outlined" class="mr-4" @click="clearTime">
          <VIcon start>mdi-close</VIcon>
          Limpiar
        </VBtn>
        <VBtn id="my-timepicker-confirm-btn" color="primary" variant="elevated" @click="confirmTime">
          <VIcon start>mdi-check</VIcon>
          OK
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
  errorMessages?: string | string[]
  disabled?: boolean
  dense?: boolean
  outlined?: boolean
  hideDetails?: boolean
}>(), {
  id: "my-timep-label-tf-1",
  modelValue: null,
  label: "Hora",
  errorMessages: () => [],
  disabled: false,
  dense: false,
  outlined: false,
  hideDetails: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | null): void
}>()

const timeMenuRef = ref()
const inputField = ref()
const timeMenu = ref(false)
const selectedHour = ref("09")
const selectedMinute = ref("00")
const selectedPeriod = ref("AM")
const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
const minutes = ["00", "15", "30", "45"]
const periods = ["AM", "PM"]

const displayValue = computed(() => {
  if (!props.modelValue) return ""
  // modelValue is stored as HH:mm (24h), display as hh:mm AM/PM
  const [hStr, mStr] = String(props.modelValue).split(":")
  if (!hStr || !mStr) return String(props.modelValue)
  const h24 = parseInt(hStr, 10)
  const period = h24 >= 12 ? "PM" : "AM"
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return `${String(h12).padStart(2, "0")}:${mStr} ${period}`
})

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    const [hStr, mStr] = String(val).split(":")
    if (!hStr || !mStr) return
    const h24 = parseInt(hStr, 10)
    const period = h24 >= 12 ? "PM" : "AM"
    let h12 = h24 % 12
    if (h12 === 0) h12 = 12
    selectedHour.value = String(h12).padStart(2, "0")
    selectedMinute.value = mStr === "30" ? "30" : "00"
    selectedPeriod.value = period
  },
  { immediate: true },
)

watch(timeMenu, (val) => {
  if (val && !props.modelValue) {
    // default to current hour when opening without a value
    const now = new Date()
    let h = now.getHours()
    const period = h >= 12 ? "PM" : "AM"
    h = h % 12
    if (h === 0) h = 12
    selectedHour.value = String(h).padStart(2, "0")
    selectedMinute.value = "00"
    selectedPeriod.value = period
  }
})

function focusInput() {
  nextTick(() => {
    inputField.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function confirmTime() {
  let h24 = parseInt(selectedHour.value, 10)
  if (selectedPeriod.value === "AM" && h24 === 12) {
    h24 = 0
  } else if (selectedPeriod.value === "PM" && h24 !== 12) {
    h24 += 12
  }
  const time24 = `${String(h24).padStart(2, "0")}:${selectedMinute.value}`
  emit("update:modelValue", time24)
  timeMenu.value = false
  focusInput()
}

function clearTime() {
  emit("update:modelValue", null)
  timeMenu.value = false
  focusInput()
}
</script>

<style>
.tp-col {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
}

.tp-col:last-child {
  border-right: none;
}

.tp-item {
  padding: 10px 0;
  text-align: center;
  cursor: pointer;
  font-size: 0.95rem;
  user-select: none;
  border-radius: 4px;
  margin: 2px 4px;
  transition: background-color 0.15s;
}

.tp-item:hover {
  background-color: rgba(25, 118, 210, 0.25);
}

.tp-item--selected {
  background-color: #1976d2;
  color: #fff;
  font-weight: 600;
}
</style>
