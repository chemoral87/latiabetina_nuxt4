<template>
  <div id="cmp-role-combobox">
    <VCombobox
      v-model="model"
      v-model:search="search"
      variant="outlined"
      :filter="customFilter"
      item-value="id"
      item-title="name"
      label="Roles"
      hide-selected
      :hide-no-data="!search"
      :items="items"
      multiple
      return-object
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
    
          color="primary"
          size="large"
          variant="elevated"
          closable
          @click:close="removeRole(item as RoleItem)"
        >
          <span >{{ item.name }}</span>
        </VChip>
      </template>

      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip color="success" variant="elevated" size="large" label>{{ item.name }}</VChip>
          </template>
        </VListItem>
      </template>
    </VCombobox>
  </div>
</template>

<script setup lang="ts">
interface RoleItem {
  id: number
  name: string
}

const props = defineProps<{
  roles?: RoleItem[]
}>()

const emit = defineEmits<{
  (e: 'modelChange', val: RoleItem[]): void
}>()

const items = ref<RoleItem[]>([])
const model = ref<RoleItem[]>([])
const search = ref<string | null>(null)
const searching = ref(false)

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
  if (!q) return
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
    search.value = ''
  }

  if (copy.length !== val.length) {
    model.value = copy as RoleItem[]
    return
  }
  emit('modelChange', copy as RoleItem[])
})

watch(
  () => props.roles,
  (val) => {
    model.value = val && val.length > 0 ? [...val] : []
    if (val && val.length > 0) {
      items.value = [...val]
    }
  },
  { immediate: true },
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
