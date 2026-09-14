<template>
  <div id="cmp-user-combobox">
    <VAutocomplete
      v-model="model"
      v-model:menu="menu"
      v-model:search="search"
      v-bind="$attrs"
      multiple
      hide-selected
      return-object
      :items="items"
      :label="label"
      item-value="id"
      item-title="name"
      variant="outlined"
      :filter="customFilter"
      :hide-no-data="!search"
    >
      <template #no-data>
        <VListItem v-if="!searching">Intente con otra búsqueda</VListItem>
        <VListItem v-else>Buscando...</VListItem>
      </template>
      <template #selection="{ item }">
        <VChip
          closable
          size="small"
          variant="flat"
          color="primary"
          @click:close="removeUser(item as UserItem)"
        >
          {{ (item as UserItem).name }} {{ (item as UserItem).last_name }} ({{ (item as UserItem).email }})
        </VChip>
      </template>
      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip size="small" variant="flat" color="primary">
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
    // Cancel the pending debounce and invalidate any in-flight response so a
    // late API result can't repopulate stale items after the clear.
    if (debounceTimer) clearTimeout(debounceTimer)
    requestId++
    // Drop stale results from the previous search and keep only the selected
    // items (they must stay in `items` for the chips to render); with nothing
    // left to show, the dropdown closes instead of listing old matches.
    items.value = [...model.value]
    return
  }
  runSearch(q)
})

// Re-open the menu when a debounced API response arrives. Vuetify closes it
// as soon as the keystroke filter matches nothing against the still-empty
// items list; reopening on results makes the dropdown show them.
watch(items, (val) => {
  if (val.length > 0 && search.value && search.value.trim()) {
    nextTick(() => {
      menu.value = true
    })
  }
})

// Clear the search text when the menu closes so refocusing the combobox
// doesn't concatenate stale text into the next query (e.g. "a" + "assistance").
watch(menu, (isOpen) => {
  if (!isOpen) {
    search.value = ''
  }
})

// Set during the one-time initial sync below so this watcher doesn't
// open the menu while the parent's prop populates the model.
let isInitialSync = false

watch(model, (val, prev) => {
  if (val.length === prev.length) return
  let i = val.length
  const copy = [...val]
  while (i--) {
    if (typeof copy[i] === 'string' || typeof copy[i] === 'number') copy.splice(i, 1)
  }

  if (val.length > prev.length && !isInitialSync) {
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
// Permission/Combobox fix). Parents that push NEW users in after mount use
// the additive watch below — no remount needed.
if (props.users && props.users.length > 0) {
  isInitialSync = true
  model.value = [...props.users]
  items.value = [...props.users]
  nextTick(() => {
    isInitialSync = false
  })
}

// Additively merge users pushed in by the parent after mount (e.g. a
// "create and add" flow). Only items missing from the current model are
// appended, so a chip the user removed is never re-added and there is no
// emit loop: the merged append emits one `modelChange`, the parent
// re-assigns the same array, and the next pass finds nothing new.
watch(
  () => props.users,
  (val) => {
    if (!val || val.length === 0) return
    const known = new Set(model.value.map((u) => u.id))
    const fresh = val.filter((u) => !known.has(u.id))
    if (fresh.length === 0) return
    model.value = [...model.value, ...fresh]
    items.value = [...items.value, ...fresh]
  },
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
