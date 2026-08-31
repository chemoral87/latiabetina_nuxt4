<template>
  <VSelect v-if="showSelect" :id="id" v-model="selected" :items="items" :label="label" item-value="id" item-title="name" :disabled="isDisabled" v-bind="$attrs" />
</template>

<script setup lang="ts">
interface Org {
  id: number
  name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  id?: string
  permission?: string
  hideOne?: boolean
  preventAutoSelect?: boolean
  modelValue?: string | number | null
  label?: string
  disabled?: boolean
  orgs?: Org[]
}>(), {
  id: "cmp-organization-select",
  permission: undefined,
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
  const source = props.orgs && props.orgs.length > 0 ? props.orgs : userOrgs.value
  let filteredOrgs: Org[]
  if (!props.permission) {
    filteredOrgs = source
  } else {
    const orgIds = auth.permissionsOrg[props.permission] ?? []
    // If permission is specified but user has no orgs for it, fall back to all orgs
    // so that pages without a dedicated index permission (e.g. song) still show the filter.
    filteredOrgs = orgIds.length > 0 ? source.filter((org) => orgIds.includes(org.id)) : source
  }
  items.value = filteredOrgs

  if (filteredOrgs.length === 1) {
    // Only one accessible org — hide the selector (hide-one) so the backend
    // resolves the org from auth context instead of sending org_id. This must
    // happen regardless of prevent-auto-select.
    if (props.hideOne) {
      autoDisabled.value = true
    }
    // Auto-select the single org unless explicitly prevented (prevents the
    // mount-time update:modelValue emit that would fire a duplicate request).
    if (!props.preventAutoSelect && (props.modelValue === null || props.modelValue === "" || props.modelValue === undefined)) {
      nextTick(() => {
        selected.value = filteredOrgs[0].id
      })
    }
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
