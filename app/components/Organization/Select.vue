<template>
  <VSelect  v-show="showSelect" v-model="selected" :disabled="isDisabled" :items="items" :label="label" item-title="name" item-value="id" v-bind="$attrs" />
</template>

<script setup lang="ts">
interface Org {
  id: number
  name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  permission: string
  hideOne?: boolean
  preventAutoSelect?: boolean
  modelValue?: string | number | null
  label?: string
  disabled?: boolean
  orgs?: Org[]
}>(), {
  hideOne: false,
  preventAutoSelect: false,
  modelValue: null,
  label: "Org",
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number | null): void
  (e: 'update:hidden', val: boolean): void
}>()

const auth = useAuthStore()

const items = ref<Org[]>([])
const selected = ref<string | number | null>(null)
const autoDisabled = ref(false)

const isDisabled = computed(() => props.disabled || autoDisabled.value)

const showSelect = computed(() => {
  if (props.hideOne && autoDisabled.value) return false
  return true
})

// Same source as AUI: the organizations come from the authenticated user's
// data (`user.orgs`), filtered by the org ids granted for `permission`
// (`user.permissions_org`). The `orgs` prop is an optional explicit override.
const userOrgs = computed<Org[]>(() => (auth.user?.orgs as Org[] | undefined) ?? [])

function buildItems() {
  const orgIds = auth.permissionsOrg[props.permission] ?? []
  const source = props.orgs && props.orgs.length > 0 ? props.orgs : userOrgs.value
  const filteredOrgs = source.filter((org) => orgIds.includes(org.id))
  items.value = filteredOrgs

  if (filteredOrgs.length === 1 && !props.preventAutoSelect && (props.modelValue === null || props.modelValue === "" || props.modelValue === undefined)) {
    nextTick(() => {
      selected.value = filteredOrgs[0].id
      autoDisabled.value = true
    })
  }
}

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

onMounted(buildItems)
watch([() => auth.user?.orgs, () => auth.permissionsOrg], buildItems)
</script>
