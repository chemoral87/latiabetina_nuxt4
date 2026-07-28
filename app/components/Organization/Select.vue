<template>
  <VSelect v-show="showSelect" v-model="selected" :disabled="isDisabled" :items="items" :label="label" item-title="name" item-value="id" v-bind="$attrs" />
</template>

<script setup lang="ts">
interface Org {
  id: number
  name: string
  [key: string]: unknown
}

const props = defineProps<{
  permission: string
  hideOne?: boolean
  preventAutoSelect?: boolean
  modelValue?: string | number | null
  label?: string
  disabled?: boolean
  orgs?: Org[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number | null): void
  (e: 'update:hidden', val: boolean): void
}>()

const { permissionsOrg } = useAuthStore()

const items = ref<Org[]>([])
const selected = ref<string | number | null>(null)
const autoDisabled = ref(false)

const isDisabled = computed(() => props.disabled || autoDisabled.value)

const showSelect = computed(() => {
  if (props.hideOne && autoDisabled.value) return false
  return true
})

watch(selected, (val) => {
  emit("update:modelValue", val)
})

watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== null) {
    selected.value = val
  }
}, { immediate: true })

watch(showSelect, (val) => {
  emit("update:hidden", !val)
})

onMounted(() => {
  const orgIds = permissionsOrg[props.permission] ?? []
  const filteredOrgs = (props.orgs ?? []).filter((org) => orgIds.includes(org.id))
  items.value = filteredOrgs

  if (filteredOrgs.length === 1 && !props.preventAutoSelect && (props.modelValue === null || props.modelValue === "" || props.modelValue === undefined)) {
    nextTick(() => {
      selected.value = filteredOrgs[0].id
      autoDisabled.value = true
    })
  }
})
</script>
