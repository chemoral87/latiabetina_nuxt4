<template>
  <div id="cmp-role-combobox">
    <VCombobox
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
        <VListItem>
          <template #title>
            <span v-if="!searching">Intente con otra búsqueda</span>
            <span v-else>Buscando...</span>
          </template>
        </VListItem>
      </template>

      <template #selection="{ item }">
        <VChip
          closable
          size="small"
          variant="flat"
          :color="hashColorForName(item.name)"
          @click:close="removeRole(item as RoleItem)"
        >
          <span>{{ item.name }}</span>
        </VChip>
      </template>

      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip size="small" variant="flat" :color="hashColorForName(item.name)">{{ item.name }}</VChip>
          </template>
        </VListItem>
      </template>
    </VCombobox>
  </div>
</template>

<script setup lang="ts">
import { hashColorForName } from "~/utils/permissionChipColor"

defineOptions({ inheritAttrs: false })

interface RoleItem {
  id: number
  name: string
}

const props = withDefaults(
  defineProps<{
    roles?: RoleItem[]
    label?: string
  }>(),
  {
    label: "Roles",
  },
)

const emit = defineEmits<{
  (e: 'modelChange', val: RoleItem[]): void
}>()

const items = ref<RoleItem[]>([])
const model = ref<RoleItem[]>([])
const search = ref<string | null>(null)
const searching = ref(false)
const menu = ref(false)

const { Role } = useRepository()

const rolesId = computed(() => model.value.map((el) => el.id))

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

async function loadRoles(queryText: string) {
  const currentRequestId = ++requestId
  searching.value = true
  try {
    const result = await Role.filter({ queryText, ids: rolesId.value })
    if (currentRequestId === requestId) {
      items.value = (Array.isArray(result) ? result : []) as RoleItem[]
      // Merge selected roles back into items so VCombobox can match them for chips
      const selected = model.value
      if (selected.length > 0) {
        const existingIds = new Set(items.value.map((r) => r.id))
        for (const role of selected) {
          if (!existingIds.has(role.id)) {
            items.value.push(role)
          }
        }
      }
    }
  } catch (error) {
    console.error("Unable to load filtered roles", error)
  } finally {
    if (currentRequestId === requestId) {
      searching.value = false
    }
  }
}

function runSearch(queryText: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadRoles(queryText), 500)
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

  if (copy.length !== val.length) {
    model.value = copy as RoleItem[]
    return
  }
  emit('modelChange', copy as RoleItem[])
})

// Sync the initial selection from the parent's `roles` prop only once,
// matching the old Vuetify 2 component's `mounted()` behavior. We deliberately
// do NOT keep this reactive: the parent re-assigns its roles ref on every
// `modelChange` emit (see user/[id]/profile/[profile_id]/index.vue setRoles),
// which would otherwise loop back here and overwrite `items` with only the
// currently selected roles, wiping out the rest of the active search results.
// Parents that push NEW roles in after mount use the additive watch below — no remount needed.
if (props.roles && props.roles.length > 0) {
  isInitialSync = true
  model.value = [...props.roles]
  items.value = [...props.roles]
  nextTick(() => {
    isInitialSync = false
  })
}

// Additively merge roles pushed in by the parent after mount (e.g. a
// "create and add" flow). Only items missing from the current model are
// appended, so a chip the user removed is never re-added and there is no
// emit loop: the merged append emits one `modelChange`, the parent
// re-assigns the same array, and the next pass finds nothing new.
watch(
  () => props.roles,
  (val) => {
    if (!val || val.length === 0) return
    const known = new Set(model.value.map((r) => r.id))
    const fresh = val.filter((r) => !known.has(r.id))
    if (fresh.length === 0) return
    model.value = [...model.value, ...fresh]
    items.value = [...items.value, ...fresh]
  },
)

function customFilter(
  value: unknown,
  query: string,
  item: { title: string; raw: Record<string, unknown> },
) {
  const text = (item.title ?? '').toString().toLowerCase()
  const q = (query ?? '').toString().toLowerCase()
  return text.includes(q)
}

function removeRole(role: RoleItem) {
  model.value = model.value.filter((r) => r.id !== role.id)
  emit('modelChange', model.value)
}
</script>

<style scoped></style>
