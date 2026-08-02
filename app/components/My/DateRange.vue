<template>
  <VMenu ref="dateMenuRef" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
    <template #activator="{ props }">
      <VTextField
        id="tf-my-dater-label-1"
        :model-value="dateRangeText"
        :label="label"
        :placeholder="placeholder"
        :prepend-inner-icon="prependIcon"
        readonly
        clearable
        :hide-details="hideDetails"
        :density="density ?? (dense ? 'compact' : undefined)"
        :variant="variant ?? (outlined ? 'outlined' : undefined)"
        :disabled="disabled"
        :error-messages="errorMessages"
        v-bind="props"
      />
    </template>

    <VDatePicker
      v-model="pendingValue"
      multiple="range"
      :show-adjacent-months="scrollable"
      :locale="locale"
    >
      <template #actions>
        <VBtn color="primary" variant="outlined" class="mr-2" id="btn-my-daterange-clear" @click="clearRange">
          <VIcon start>mdi-close</VIcon>
          Limpiar
        </VBtn>
        <VBtn color="primary" id="btn-my-daterange-confirm" @click="confirm">
          <VIcon start>mdi-check</VIcon>
          OK
        </VBtn>
      </template>
    </VDatePicker>
  </VMenu>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: (string | null)[]
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
  locale?: string
  errorMessages?: string | string[]
  separator?: string
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
  locale: "es-mx",
  errorMessages: () => [],
  separator: " ~ ",
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void
}>()

const dateMenuRef = ref()
const dateMenu = ref(false)
const pendingValue = ref<(string | null)[]>([])
const pendingSyncDone = ref(false)

const dateRangeText = computed(() => {
  if (!props.modelValue || props.modelValue.length === 0) return ""
  return [...props.modelValue].sort().join(props.separator)
})

watch(dateMenu, (open) => {
  if (open) {
    pendingValue.value = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    pendingSyncDone.value = false
    nextTick(() => { pendingSyncDone.value = true })
  }
})

watch(pendingValue, (val) => {
  if (pendingSyncDone.value && Array.isArray(val) && val.length === 2) {
    confirm()
  }
})

function confirm() {
  const sorted = Array.isArray(pendingValue.value) ? [...pendingValue.value].filter(Boolean) as string[] : []
  sorted.sort()
  emit("update:modelValue", sorted)
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}

function clearRange() {
  pendingValue.value = []
  emit("update:modelValue", [])
  dateMenu.value = false
  nextTick(() => {
    dateMenuRef.value?.$el?.querySelector?.("input")?.focus?.()
  })
}
</script>
