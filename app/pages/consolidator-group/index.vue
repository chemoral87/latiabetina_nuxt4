<template>
  <VContainer :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol md="3" sm="5" cols="12">
          <VTextField
            id="cgr-index-filter"
            v-model="filterInput"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            placeholder="Buscar grupo..."
            append-inner-icon="mdi-magnify"
          />
        </VCol>

        <VCol v-if="!singleOrg" md="3" sm="5" cols="12">
          <OrganizationSelect
            v-model="filterOrgId"
            hide-one
            clearable
            hide-details
            density="compact"
            variant="outlined"
            prevent-auto-select
            permission="consolidator-group-index"
          />
        </VCol>

        <VCol cols="auto" class="d-flex align-center">
          <VBtn
            id="cgr-refresh-btn"
            class="mr-4"
            color="primary"
            :loading="loading"
            variant="outlined"
            @click="refreshGroups"
          >
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
          <VBtn id="cgr-new-btn" color="success" :disabled="!canManage" @click="newGroup">
            <VIcon start>mdi-plus</VIcon>
            Nuevo Grupo
          </VBtn>
        </VCol>

        <VCol cols="12">
          <ConsolidatorGroupTable
            v-model:dialog-delete="groupDialogDelete"
            :loading="loading"
            :response="response"
            :search="filterGroup"
            :removing-id="removingId"
            :highlight-id="highlightId"
            :initial-sort-by="lastOptions.sortBy"
            @edit="editGroup"
            @delete="deleteGroup"
            @sorting="handleSorting"
          />
        </VCol>
      </VRow>
    </VSheet>

    <ConsolidatorGroupDialog
      v-if="groupDialog"
      :group="group"
      :loading="saving"
      @save="saveGroup"
      @close="closeDialog"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { buildApiParams } from '~/utils/buildApiParams'

definePageMeta({
  title: 'Grupos de Consolidadores',
  icon: 'mdi-account-group-outline',
  permission: 'consolidator-group-index',
  middleware: ['authenticated', 'permission'],
})

const { ConsolidatorGroup } = useRepository()
const auth = useAuthStore()

const filterInput = ref('')
const filterGroup = ref('')
const filterOrgId = ref<string | number | null>(null)
const group = ref<Record<string, unknown> | null>(null)
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const loading = ref(false)
const saving = ref(false)
const groupDialog = ref(false)
const groupDialogDelete = ref(false)
const { highlightId, flash, prependCreated, updateRow, removingId, removeWithAnimation } = useRowHighlight()

const singleOrg = computed(() => auth.hasSingleOrgFor('consolidator-group-index'))
const canManage = computed(() => auth.hasPermission('consolidator-group-manage'))

const lastOptions = ref<Record<string, unknown> & { sortBy: { key: string; order: string }[] }>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: 'name', order: 'asc' }],
})

{
  const apiParams = buildApiParams(lastOptions.value)
  const initialResponse = await ConsolidatorGroup.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
}

useDebouncedFilter(filterInput, filterGroup)

async function loadGroups(opts: Record<string, unknown>) {
  try {
    loading.value = true
    lastOptions.value = opts as typeof lastOptions.value
    const params = buildApiParams(opts)
    if (filterGroup.value && !params.filter) params.filter = filterGroup.value
    if (!singleOrg.value && filterOrgId.value) params.org_id = filterOrgId.value
    response.value = await ConsolidatorGroup.index(params)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

async function refreshGroups() {
  if (lastOptions.value) {
    await loadGroups(lastOptions.value)
  }
}

let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true
    return
  }
  loadGroups(opts)
}

watch(filterOrgId, val => {
  if (singleOrg.value) return
  loadGroups({ ...lastOptions.value, page: 1, org_id: val ?? undefined })
})

function newGroup() {
  useValidationErrors().clearErrors()
  group.value = {}
  groupDialog.value = true
}

function editGroup(val: unknown) {
  const item = val as Record<string, unknown>
  useValidationErrors().clearErrors()
  group.value = { ...item }
  groupDialog.value = true
}

async function deleteGroup(val: unknown) {
  const item = val as Record<string, unknown>
  try {
    saving.value = true
    await ConsolidatorGroup.delete(item.id as number)
    groupDialogDelete.value = false
    await removeWithAnimation(response, item.id as number)
  } catch (e) {
    console.error('Error al eliminar el grupo', e)
  } finally {
    saving.value = false
  }
}

async function saveGroup(item: Record<string, unknown>) {
  try {
    saving.value = true
    const userIds = (item.user_ids as number[] | undefined) ?? []
    if (item.id) {
      const res = await ConsolidatorGroup.update<Record<string, unknown>>(item.id as number, {
        name: item.name,
      })
      const id = item.id as number
      await ConsolidatorGroup.syncMembers(id, userIds)
      const updated = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (updated) updateRow(response, updated)
      else flash(id)
    } else {
      const res = await ConsolidatorGroup.create<Record<string, unknown>>(item)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (created) {
        const id = created.id as number
        if (userIds.length) {
          await ConsolidatorGroup.syncMembers(id, userIds)
          await refreshGroups()
          flash(id)
        } else {
          prependCreated(response, created)
        }
      }
    }
    groupDialog.value = false
    group.value = null
  } catch (e) {
    console.error('Error al guardar el grupo', e)
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  groupDialog.value = false
  group.value = null
  useValidationErrors().clearErrors()
}
</script>

<style scoped></style>
