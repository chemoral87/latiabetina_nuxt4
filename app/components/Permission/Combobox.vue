<template>
  <div>
    <VCombobox
      v-model="model"
      variant="underlined"
      :filter="customFilter"
      item-value="id"
      item-title="name"
      label="Permisos Directos"
      hide-selected
      :hide-no-data="!search"
      :items="items"
      v-model:search="search"
      multiple
      return-object
    >
      <template #no-data>
        <VListItem>
          <template #title>
            <span v-if="!searching">Intente con otra búsqueda...</span>
            <span v-else>Buscando...</span>
          </template>
        </VListItem>
      </template>

      <template #selection="{ item }">
        <VChip
          color="info"
          variant="flat"
          closable
          @click:close="removePermission(item.raw as PermissionItem)"
        >
          <span class="pr-2">{{ item.title }}</span>
        </VChip>
      </template>

      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip v-if="item.raw && typeof item.raw === 'object'" color="info" variant="flat" size="small" label>{{ item.raw.name }}</VChip>
            <span v-else>{{ item.title }}</span>
          </template>
        </VListItem>
      </template>
    </VCombobox>
  </div>
</template>

<script setup lang="ts">
interface PermissionItem {
  id: number
  name: string
}

const props = defineProps<{
  permissionsx?: PermissionItem[]
  label?: string
}>()

const emit = defineEmits<{
  (e: 'modelChange', val: PermissionItem[]): void
}>()

const items = ref<PermissionItem[]>([])
const model = ref<PermissionItem[]>([])
const search = ref<string | null>(null)
const searching = ref(false)

const { Permission } = useRepository()

const permissionsId = computed(() => model.value.map((el) => el.id))

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

async function loadPermissions(queryText: string) {
  const currentRequestId = ++requestId
  searching.value = true
  try {
    const result = await Permission.filter({ queryText, ids: permissionsId.value })
    if (currentRequestId === requestId) {
      items.value = (Array.isArray(result) ? result : []) as PermissionItem[]
      const selected = model.value
      if (selected.length > 0) {
        const existingIds = new Set(items.value.map((r) => r.id))
        for (const perm of selected) {
          if (!existingIds.has(perm.id)) {
            items.value.push(perm)
          }
        }
      }
    }
  } catch (error) {
    console.error("Unable to load filtered permissions", error)
  } finally {
    if (currentRequestId === requestId) {
      searching.value = false
    }
  }
}

function runSearch(queryText: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadPermissions(queryText), 500)
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
    model.value = copy as PermissionItem[]
    return
  }
  emit('modelChange', copy as PermissionItem[])
})

watch(
  () => props.permissionsx,
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

function removePermission(perm: PermissionItem) {
  model.value = model.value.filter((p) => p.id !== perm.id)
  emit('modelChange', model.value)
}
</script>

<style scoped></style>
