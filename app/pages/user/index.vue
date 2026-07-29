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
        <UserTable :search="filterUser" :response="response" :loading="loading" v-model:dialog-delete="dialogDeleteUser" @sorting="indexUsers" @edit="editUser" @edit-profiles="editProfiles" @delete="deleteUser" />
      </VCol>
    </VRow>

    <UserDialog v-if="userDialog" :userx="userx" @close="closeDialog" @save="saveUser" />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Usuarios",
  middleware: "authenticated",
})

const dialogDeleteUser = ref(false)
const userDialog = ref(false)
const response = ref({})
const filterInput = ref("")
const filterUser = ref("")
const loading = ref(false)
const userx = ref<Record<string, unknown> | null>(null)
const lastOptions = ref<Record<string, unknown> | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterUser.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterUser.value = val
  }, 500)
})

const { User } = useRepository()

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
    refresh()
  } catch (e) {
    console.error(e)
  }
}

async function saveUser(item: Record<string, unknown>) {
  try {
    if (item.id) {
      await User.update(item.id as number, item)
      await refresh()
      userDialog.value = false
    } else {
      const res = await User.create(item)
      userDialog.value = false
      editProfiles(res as Record<string, unknown>)
    }
  } catch (e) {
    console.error(e)
  }
}

function closeDialog() {
  userDialog.value = false
  useValidationErrors().clearErrors()
}
</script>

<style scoped></style>
