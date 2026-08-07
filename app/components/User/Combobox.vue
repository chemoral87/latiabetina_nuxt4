<template>
  <div id="cmp-user-combobox">
    <VAutocomplete
      v-model="model"
      v-model:search="search"
      v-model:menu="menu"
      v-bind="$attrs"
      :filter="customFilter"
      item-value="id"
      item-title="name"
      :label="label"
      variant="underlined"
      hide-selected
      :hide-no-data="!search"
      :items="items"
      multiple
      return-object
    >
      <template #no-data>
        <VListItem v-if="!searching">Intente con otra búsqueda</VListItem>
        <VListItem v-else>Buscando...</VListItem>
      </template>
      <template #selection="{ item }">
        <VChip
          color="primary"
          size="large"
          variant="elevated"
          closable
          @click:close="removeUser(item as UserItem)"
        >
          {{ (item as UserItem).name }} {{ (item as UserItem).last_name }} ({{ (item as UserItem).email }})
        </VChip>
      </template>
      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip color="primary" variant="elevated" size="large" label>
              {{ (item as UserItem).name }} {{ (item as UserItem).last_name }} ({{ (item as UserItem).email }})
            </VChip>
          </template>
        </VListItem>
      </template>
    </VAutocomplete>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

interface UserItem {
  id: number
  name: string
  last_name?: string
  email?: string
}

const props = withDefaults(
  defineProps<{
    users?: UserItem[]
    label?: string
  }>(),
  {
    label: "Usuarios",
  },
)

const emit = defineEmits<{
  (e: 'modelChange', val: UserItem[]): void
}>()

const items = ref<UserItem[]>([])
const model = ref<UserItem[]>([])
const search = ref<string | null>(null)
const searching = ref(false)
const menu = ref(false)

const { User } = useRepository()

const userIds = computed(() => model.value.map((el) => el.id))

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

async function loadUsers(queryText: string) {
  const currentRequestId = ++requestId
  searching.value = true
  try {
    const result = await User.filter({ queryText, ids: userIds.value })
    if (currentRequestId === requestId) {
      items.value = (Array.isArray(result) ? result : []) as UserItem[]
      // Merge selected users back into items so VAutocomplete can match them for chips
      const selected = model.value
      if (selected.length > 0) {
        const existingIds = new Set(items.value.map((r) => r.id))
        for (const user of selected) {
          if (!existingIds.has(user.id)) {
            items.value.push(user)
          }
        }
      }
    }
  } catch (error) {
    console.error("Unable to load filtered users", error)
  } finally {
    if (currentRequestId === requestId) {
      searching.value = false
    }
  }
}

function runSearch(queryText: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadUsers(queryText), 500)
}

watch(search, (val) => {
  const q = val?.trim() ?? ''
  if (!q) {
    searching.value = false
    return
  }
  runSearch(q)
})

watch(model, (val, prev) => {
  if (val.length === prev.length) return
  let i = val.length
  const copy = [...val]
  while (i--) {
    if (typeof copy[i] === 'string' || typeof copy[i] === 'number') copy.splice(i, 1)
  }

  if (val.length > prev.length) {
    // Keep the menu open and the current search text so the user can
    // keep clicking additional matching items without retyping the query.
    nextTick(() => {
      menu.value = true
    })
  }

  // Only write back if we actually removed strings to avoid infinite loop
  if (copy.length !== val.length) {
    model.value = copy as UserItem[]
    return
  }
  emit('modelChange', copy as UserItem[])
})

// Sync the initial selection from the parent's `users` prop only once,
// matching the old Vuetify 2 component's `mounted()` behavior. We deliberately
// do NOT keep this reactive: the parent re-assigns its users ref on every
// `modelChange` emit, which would otherwise loop back here and overwrite the
// model/items mid-interaction, wiping out the active search results (see the
// Permission/Combobox fix). If a parent needs to push NEW users in after
// mount, force a remount with a `:key` (same pattern as role/[id]/children).
if (props.users && props.users.length > 0) {
  model.value = [...props.users]
  items.value = [...props.users]
}

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
