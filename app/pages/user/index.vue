<template>
  <VContainer :fluid="true">
    <VRow>
      <VCol cols="12" sm="6" md="2">
        <VTextField id="tf-user-index-filteruser-1" v-model="filterInput" append-inner-icon="mdi-magnify" variant="outlined" density="compact" clearable hide-details placeholder="Filtro" />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-user-refresh" color="primary" :loading="loading" class="mr-4" @click="refresh">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-user-new" color="success"  @click="newUser()">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Usuario
        </VBtn>
      </VCol>

      <VCol cols="12">
        <UserTable :search="filterUser" :response="response" :loading="loading" :highlight-id="highlightId" :removing-id="removingId" v-model:dialog-delete="dialogDeleteUser"          @sorting="handleSorting" @edit="editUser" @edit-profiles="editProfiles" @delete="deleteUser" />
      </VCol>
    </VRow>

    <UserDialog v-if="userDialog" :userx="userx" :loading="saving" @close="closeDialog" @save="saveUser" />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight"

definePageMeta({
  title: "Usuarios",
  icon: "mdi-account",
  middleware: "authenticated",
})

const dialogDeleteUser = ref(false)
const userDialog = ref(false)
const response = ref({})
const filterInput = ref("")
const filterUser = ref("")
const loading = ref(false)
const saving = ref(false)
const userx = ref<Record<string, unknown> | null>(null)
const lastOptions = ref<Record<string, unknown> | null>(null)
const { highlightId, prependCreated, updateRow, removingId, removeWithAnimation } = useRowHighlight()

const { User } = useRepository()

// Top-level await — loads initial data before render (asyncData equivalent)
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["name"],
    sortDesc: [false],
  }
  const initialResponse = await User.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
  lastOptions.value = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "name", order: "asc" }],
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterUser.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterUser.value = val
  }, 300)
})

async function indexUsers(opts: Record<string, unknown>) {
  lastOptions.value = opts
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    itemsPerPage: opts.itemsPerPage ?? 10,
  }
  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key]
    params.sortDesc = [sortBy[0].order === 'desc']
  }
  if (filterUser.value) {
    params.filter = filterUser.value
  }
  try {
    loading.value = true
    response.value = await User.index(params)
  } finally {
    loading.value = false
  }
}

let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true
    return
  }
  indexUsers(opts)
}

function refresh() {
  if (lastOptions.value) {
    indexUsers(lastOptions.value)
  }
}

function newUser() {
  useValidationErrors().clearErrors()
  userx.value = {}
  userDialog.value = true
}

function editUser(item: Record<string, unknown>) {
  useValidationErrors().clearErrors()
  userx.value = { ...item }
  userDialog.value = true
}

function editProfiles(item: Record<string, unknown>) {
  navigateTo(`/user/${item.id}/profile`)
}

async function deleteUser(item: Record<string, unknown>) {
  try {
    await User.delete(item.id as number)
    dialogDeleteUser.value = false
    await removeWithAnimation(response, item.id as number)
  } catch (e) {
    console.error(e)
  }
}

async function saveUser(item: Record<string, unknown>) {
  saving.value = true
  try {
    if (item.id) {
      const res = await User.update<Record<string, unknown>>(item.id as number, item)
      const updated = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (updated) {
        updateRow(response, updated)
      }
      userDialog.value = false
    } else {
      const res = await User.create<Record<string, unknown>>(item)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (created) {
        prependCreated(response, created)
      }
      userDialog.value = false
      if ((res as Record<string, unknown>)?.data) {
        editProfiles((res as Record<string, unknown>).data as Record<string, unknown>)
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  userDialog.value = false
  useValidationErrors().clearErrors()
}
</script>

<style scoped></style>
