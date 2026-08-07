<template>
  <VSelect :id="id" v-model="selected" :label="label" item-value="id" item-title="name" :loading="loading" :disabled="disabled" :items="displayItems" v-bind="$attrs" />
</template>

<script setup lang="ts">
interface AuditoriumItem {
  id: number | string
  name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  id?: string
  orgId?: string | number | null
  modelValue?: string | number | null
  label?: string
  selectedName?: string | null
}>(), {
  id: "cmp-auditorium-select",
  orgId: null,
  modelValue: null,
  label: "Auditorio",
  selectedName: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number | null): void
}>()

const { Auditorium } = useRepository()

const items = ref<AuditoriumItem[]>([])
const selected = ref<string | number | null>(null)
const disabled = ref(false)
const loading = ref(false)

// When editing, the current auditorium may not be in the fetched items yet
// (or it fell outside the paged list). Inject a synthetic item built from the
// passed `selectedName` so the select renders the name instead of the raw id.
const displayItems = computed<AuditoriumItem[]>(() => {
  if (!selected.value || !props.selectedName) return items.value
  const exists = items.value.some((it) => String(it.id) === String(selected.value))
  if (exists) return items.value
  return [{ id: selected.value, name: props.selectedName }, ...items.value]
})

// Cache auditoriums per org so the dropdown only fetches once per org
// (reopening the dialog shouldn't re-hit api/auditorium).
const cache = new Map<string, AuditoriumItem[]>()

watch(selected, (val) => {
  emit("update:modelValue", val)
})

watch(() => props.modelValue, (val) => {
  selected.value = val
}, { immediate: true })

watch(() => props.orgId, (newOrgId) => {
  // Always clear the current selection when the org changes — a previously
  // chosen auditorium may belong to a different org and would be stale.
  selected.value = null
  if (newOrgId) {
    loadAuditoriums()
  } else {
    items.value = []
  }
}, { immediate: true })

async function loadAuditoriums() {
  if (!props.orgId) {
    items.value = []
    return
  }

  const key = String(props.orgId)
  if (cache.has(key)) {
    items.value = cache.get(key)!
    if (items.value.length === 1 && !selected.value) {
      selected.value = items.value[0].id
    }
    return
  }

  loading.value = true
  try {
    const response = await Auditorium.index<{ data?: AuditoriumItem[] }>({
      org_id: props.orgId,
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 15,
    })
    items.value = response?.data || []
    cache.set(key, items.value)

    if (items.value.length === 1 && !selected.value) {
      selected.value = items.value[0].id
    }
  } catch (error) {
    items.value = []
  } finally {
    loading.value = false
  }
}
</script>
