<template>
  <div>
    <VAutocomplete
      v-model="model"
      :filter="customFilter"
      item-value="id"
      item-title="name"
      :label="label || 'Usuarios'"
      variant="underlined"
      hide-selected
      :hide-no-data="!search"
      :items="items"
      v-model:search="search"
      multiple
      return-object
    >
      <template #no-data>
        <VListItem v-if="!searching">Intente con otra búsqueda</VListItem>
        <VListItem v-else>Buscando...</VListItem>
      </template>
      <template #selection="{ item, selected }">
        <VChip 
          v-if="typeof item.raw === 'object'" 
          color="primary" 
          variant="flat"
          :model-value="selected" 
          closable 
          @click:close="removeUser(item.raw as UserItem)"
        >
          <span class="pr-2">{{ item.raw.name }} {{ item.raw.last_name }} ({{ item.raw.email }})</span>
        </VChip>
      </template>
      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip v-if="item.raw && typeof item.raw === 'object'" color="info" variant="flat" size="small" label>
              {{ item.raw.name }} {{ item.raw.last_name }} ({{ item.raw.email }})
            </VChip>
            <span v-else>{{ item.title }}</span>
          </template>
        </VListItem>
      </template>
    </VAutocomplete>
  </div>
</template>

<script setup lang="ts">
interface UserItem {
  id: number
  name: string
  last_name?: string
  email?: string
}

const props = defineProps<{
  users?: UserItem[]
  label?: string
}>()

const emit = defineEmits<{
  (e: 'modelChange', val: UserItem[]): void
}>()

// items: populated ONLY by the search API — never pre-filled with model data
const items = ref<UserItem[]>([])
const model = ref<UserItem[]>([])
const search = ref<string | null>(null)
const searching = ref(false)

const { User } = useRepository()

const userIds = computed(() => model.value.map((el) => el.id))

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function runSearch(val: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      const result = await User.filter({ queryText: val, ids: userIds.value })
      items.value = (Array.isArray(result) ? result : []) as UserItem[]
    } finally {
      searching.value = false
    }
  }, 500)
}

watch(search, (val) => {
  if (val == null || val.trim() === '') {
    searching.value = false
    return
  }
  searching.value = true
  runSearch(val)
})

watch(model, (val, prev) => {
  if (val.length === prev.length) return
  let i = val.length
  const copy = [...val]
  while (i--) {
    if (typeof copy[i] === 'string' || typeof copy[i] === 'number') copy.splice(i, 1)
  }
  
  if (val.length > prev.length) {
    search.value = ''
  }

  // Only write back if we actually removed strings to avoid infinite loop
  if (copy.length !== val.length) {
    model.value = copy as UserItem[]
    return
  }
  emit('modelChange', copy as UserItem[])
})

// Use immediate watcher so it reacts if the parent sets users after mount
watch(
  () => props.users,
  (val) => {
    model.value = val && val.length > 0 ? [...val] : []
  },
  { immediate: true },
)

function customFilter(value: unknown, query: string, item: { title: string; raw: Record<string, unknown> }) {
  const text = (item.title ?? '').toString().toLowerCase()
  const q = (query ?? '').toString().toLowerCase()
  return text.includes(q)
}

function removeUser(user: UserItem) {
  model.value = model.value.filter((u) => u.id !== user.id)
  emit('modelChange', model.value)
}
</script>

<style scoped></style>
