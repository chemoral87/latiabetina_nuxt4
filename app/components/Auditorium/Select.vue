<template>
  <VSelect
    :id="id"
    v-model="selected"
    :label="label"
    item-value="id"
    item-title="name"
    :loading="loading"
    :disabled="disabled"
    :items="displayItems"
    @update:menu="onMenuChange"
    v-bind="$attrs"
  >
    <template #prepend-item>
      <VTextField
        v-model="search"
        class="px-3 pt-2"
        density="compact"
        variant="outlined"
        placeholder="Buscar auditorio..."
        hide-details
        clearable
        @click.stop
        @mousedown.stop
        @keydown.stop
      />
      <VDivider class="mt-2 mb-1" />
    </template>
  </VSelect>
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
const search = ref('')

// Name of the last auditorium the user actually picked from the list. When the
// selection leaves the current items (search cleared back to a short org list),
// this is more accurate than props.selectedName, which still holds the name of
// the record that was originally being edited.
const pickedName = ref<string | null>(null)

// When editing, the current auditorium may not be in the fetched items yet
// (or it fell outside the paged list). Inject a synthetic item built from the
// record's name so the select renders the name instead of the raw id.
const displayItems = computed<AuditoriumItem[]>(() => {
  if (!selected.value) return items.value
  const exists = items.value.some((it) => String(it.id) === String(selected.value))
  if (exists) return items.value
  const name = pickedName.value ?? props.selectedName
  if (!name) return items.value
  return [{ id: selected.value, name }, ...items.value]
})

// Cache auditoriums per org so the dropdown only fetches once per org
// (reopening the dialog shouldn't re-hit api/auditorium).
const cache = new Map<string, AuditoriumItem[]>()

watch(selected, (val) => {
  emit("update:modelValue", val)
  const match = items.value.find((it) => String(it.id) === String(val))
  if (match) pickedName.value = match.name
})

watch(() => props.modelValue, (val) => {
  selected.value = val
}, { immediate: true })

watch(() => props.orgId, (newOrgId, oldOrgId) => {
  // On mount (oldOrgId === undefined) the selection has already been restored
  // from props.modelValue above, so keep it — an edited record must show its
  // auditorium (via displayItems/selectedName) even before items load. Only
  // clear when the org genuinely changes afterwards: a previously chosen
  // auditorium may belong to a different org and would be stale.
  if (oldOrgId !== undefined && newOrgId !== oldOrgId) {
    selected.value = null
    pickedName.value = null
  }
  if (newOrgId) {
    loadAuditoriums()
  } else {
    items.value = []
  }
}, { immediate: true })

// Search-as-you-type: the dropdown is filled from /auditorium/filter while the
// user types. An empty query restores the org's cached list.
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

watch(search, (val) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  const q = (val ?? '').trim()
  if (!q) {
    loadAuditoriums()
    return
  }
  searchDebounceTimer = setTimeout(() => searchAuditoriums(q), 300)
})

function onMenuChange(open: boolean) {
  // Reset the query when the menu closes so reopening shows the full list.
  if (!open && search.value) {
    search.value = ''
  }
}

async function searchAuditoriums(queryText: string) {
  const currentRequestId = ++searchRequestId
  loading.value = true
  try {
    const result = await Auditorium.filter<AuditoriumItem[]>({
      queryText,
      org_id: props.orgId ?? undefined,
    })
    if (currentRequestId !== searchRequestId) return
    items.value = Array.isArray(result) ? result : []
  } catch (error) {
    if (currentRequestId === searchRequestId) items.value = []
  } finally {
    if (currentRequestId === searchRequestId) loading.value = false
  }
}

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
