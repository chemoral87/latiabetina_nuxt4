<template>
  <div>
    <VCombobox
      v-model="model"
      :filter="customFilter"
      item-value="id"
      item-title="name"
      label="Permisos Directos"
      hide-selected
      :hide-no-data="!search"
      :items="items"
      v-model:search="search"
      multiple
      clearable
    >
      <template #no-data>
        <VListItem v-if="!searching">Intente con otra búsqueda...</VListItem>
        <VListItem v-else>Buscando...</VListItem>
      </template>
      <template #selection="{ item, selected }">
        <VChip v-if="typeof item.raw === 'object'" color="info" :model-value="selected" label>
          <span class="pr-2">{{ item.raw.name }}</span>
        </VChip>
      </template>
      <template #item="{ item }">
        <VChip color="info" label size="small">{{ item.raw.name }}</VChip>
      </template>
    </VCombobox>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  permissionsx?: Record<string, unknown>[]
  label?: string
}>()

const emit = defineEmits<{
  (e: 'modelChange', val: Record<string, unknown>[]): void
}>()

const items = ref<Record<string, unknown>[]>([])
const model = ref<Record<string, unknown>[]>([])
const search = ref<string | null>(null)
const searching = ref(false)

const { Permission } = useRepository()

const permissionsId = computed(() => model.value.map((el) => el.id))

const debouncedSearch = ref<ReturnType<typeof setTimeout> | null>(null)

watch(search, (val) => {
  if (val == null || val.trim() === "") {
    searching.value = false
    return
  }
  searching.value = true
  if (debouncedSearch.value) clearTimeout(debouncedSearch.value)
  debouncedSearch.value = setTimeout(async () => {
    try {
      const result = await Permission.filter({ queryText: val, ids: permissionsId.value })
      items.value = Array.isArray(result) ? result : []
    } finally {
      searching.value = false
    }
  }, 500)
})

watch(model, (val, prev) => {
  if (val.length === prev.length) return
  const filtered = val.filter((el) => typeof el !== "string")
  model.value = filtered
  emit("modelChange", filtered)
})

onMounted(() => {
  model.value = props.permissionsx ?? []
})

function customFilter(item: Record<string, unknown>, queryText: string, itemText: string) {
  const text = (itemText ?? "").toString().toLowerCase()
  const query = (queryText ?? "").toString().toLowerCase()
  return text.includes(query)
}
</script>

<style scoped></style>
