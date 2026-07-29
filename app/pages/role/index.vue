<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Filter -->
      <VCol cols="12" md="2">
        <VTextField
          id="tf-role-index-filterrole-1"
          v-model="filterInput"
          append-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          placeholder="Buscar rol..."
        />
      </VCol>

      <!-- Action buttons -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-role-refresh" color="primary" :loading="loading" class="mr-4" @click="refreshRoles">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-role-new" color="success" @click="newRole">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Rol
        </VBtn>
      </VCol>

      <!-- Role table -->
      <VCol cols="12">
        <RoleTable
          :search="filterRole"
          :response="response"
          :loading="loading"
          v-model:dialog-delete="roleDialogDelete"
          @sorting="handleSorting"
          @editPermissions="editRolePermissions"
          @distribution="distributeRole"
          @edit="editRole"
          @delete="deleteRole"
        />
      </VCol>
    </VRow>

    <!-- Create/Edit dialog -->
    <RoleDialog
      v-if="roleDialog"
      :role="role"
      :loading="saving"
      @close="closeDialog"
      @save="saveRole"
    />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Roles",
  middleware: "authenticated",
})

const { Role } = useRepository()

const filterInput = ref("")
const filterRole = ref("")
const role = ref<Record<string, unknown> | null>(null)
const response = ref({ data: [], total: 0 })
const loading = ref(false)
const saving = ref(false)
const roleDialog = ref(false)
const roleDialogDelete = ref(false)
const lastOptions = ref<Record<string, unknown> | null>(null)

// Debounced filter — matches Organization index pattern (300ms)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterRole.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterRole.value = val
  }, 300)
})

async function loadRoles(opts: Record<string, unknown>) {
  try {
    loading.value = true
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
    if (filterRole.value) {
      params.filter = filterRole.value
    }
    response.value = await Role.index(params)
  } catch (e) {
    console.error("Error al cargar roles", e)
  } finally {
    loading.value = false
  }
}

async function refreshRoles() {
  if (lastOptions.value) {
    await loadRoles(lastOptions.value)
  }
}

function handleSorting(opts: Record<string, unknown>) {
  loadRoles(opts)
}

function newRole() {
  useValidationErrors().clearErrors()
  role.value = {}
  roleDialog.value = true
}

function editRole(item: Record<string, unknown>) {
  useValidationErrors().clearErrors()
  role.value = { ...item }
  roleDialog.value = true
}

function editRolePermissions(item: Record<string, unknown>) {
  navigateTo(`/role/${item.id}`)
}

function distributeRole(item: Record<string, unknown>) {
  navigateTo(`/role/${item.id}/distribution`)
}

async function deleteRole(item: Record<string, unknown>) {
  try {
    saving.value = true
    await Role.delete(item.id as number)
    filterRole.value = ""
    roleDialogDelete.value = false
    await loadRoles({ page: 1, filter: "" })
  } catch (e) {
    console.error("Error al eliminar el rol", e)
  } finally {
    saving.value = false
  }
}

async function saveRole(item: Record<string, unknown>) {
  try {
    saving.value = true
    if (item.id) {
      await Role.update(item.id as number, item)
    } else {
      await Role.create(item)
    }
    roleDialog.value = false
    role.value = null
    await refreshRoles()
  } catch (e) {
    console.error("Error al guardar el rol", e)
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  roleDialog.value = false
  role.value = null
  useValidationErrors().clearErrors()
}
</script>

<style scoped></style>
