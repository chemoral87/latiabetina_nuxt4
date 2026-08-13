<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Filter -->
      <VCol cols="12" md="2">
        <VTextField
          id="rol-index-filterrole-tf-1"
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
        <VBtn id="rol-refresh-btn" color="primary" :loading="loading" class="mr-4" @click="refreshRoles">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="rol-new-btn" color="success" @click="newRole">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Rol
        </VBtn>
      </VCol>

      <!-- Role table -->
      <VCol cols="12">
        <RoleTable
          v-model:dialog-delete="roleDialogDelete"
          :search="filterRole"
          :response="response"
          :loading="loading"
          :highlight-id="highlightId"
          :removing-id="removingId"
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
import { useRowHighlight } from "~/composables/useRowHighlight"

definePageMeta({
  title: "Roles",
  icon: "mdi-redhat",
  permission: "role-index",
  middleware: ["authenticated", "permission"],
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
const { highlightId, prependCreated, updateRow, removingId, removeWithAnimation } = useRowHighlight()

const lastOptions = ref<Record<string, unknown> | null>(null)

// Initial list data is loaded during SSR via useAsyncData so the payload is
// reused on the client (no double fetch, no hydration mismatch). See
// ai_rule/nuxt4_ssr_hydration.md.
// Store the Vuetify 4 format in lastOptions so loadRoles() conversion logic
// works correctly.
{
  const { data: initialData } = await useAsyncData(
    "role-index",
    async () => {
      const apiParams: Record<string, unknown> = {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["name"],
        sortDesc: [false],
      }
      return await Role.index<{ data: unknown[]; total: number }>(apiParams)
        .catch(() => ({ data: [] as unknown[], total: 0 }))
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  )

  response.value = initialData.value
  lastOptions.value = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "name", order: "asc" }],
  }
}

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
    if ((e as { code?: string })?.code === "UNAUTHENTICATED") {
      // useApi already cleared the session and is redirecting to /login
      return
    }
  } finally {
    loading.value = false
  }
}

async function refreshRoles() {
  if (lastOptions.value) {
    await loadRoles(lastOptions.value)
  }
}

let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true
    return
  }
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
  navigateTo(`/role/${item.id}/children`)
}

function distributeRole(item: Record<string, unknown>) {
  navigateTo(`/role/${item.id}/distribution`)
}

async function deleteRole(item: Record<string, unknown>) {
  try {
    saving.value = true
    await Role.delete(item.id as number)
    roleDialogDelete.value = false
    await removeWithAnimation(response, item.id as number)
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
      const res = await Role.update<Record<string, unknown>>(item.id as number, item)
      const updated = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (updated) {
        updateRow(response, updated)
      }
    } else {
      const res = await Role.create<Record<string, unknown>>(item)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (created) {
        prependCreated(response, created)
      }
    }
    roleDialog.value = false
    role.value = null
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
