<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Filter -->
      <VCol cols="12" md="2">
        <VTextField
          id="tf-permission-index-filter-1"
          v-model="filterInput"
          append-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          placeholder="Buscar permiso..."
        />
      </VCol>

      <!-- Action buttons -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-permission-refresh" color="primary" :loading="loading" class="mr-4" @click="refreshPermissions">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-permission-new" color="success" @click="newPermission">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Permiso
        </VBtn>
      </VCol>

      <!-- Permission table -->
      <VCol cols="12">
        <PermissionTable
          :search="filterPermission"
          :response="response"
          :loading="loading"
          :highlight-id="highlightId"
          :removing-id="removingId"
          v-model:dialog-delete="permissionDialogDelete"
          @sorting="handleSorting"
          @edit="editPermission"
          @distribution="distributePermission"
          @delete="deletePermission"
        />
      </VCol>
    </VRow>

    <!-- Create/Edit dialog -->
    <PermissionDialog
      v-if="permissionDialog"
      :permission="permission"
      :loading="saving"
      @close="closeDialog"
      @save="savePermission"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight"

definePageMeta({
  title: "Permisos",
  icon: "mdi-key-variant",
  middleware: "authenticated",
})

const { Permission } = useRepository()

const filterInput = ref("")
const filterPermission = ref("")
const permission = ref<Record<string, unknown> | null>(null)
const response = ref({ data: [], total: 0 })
const loading = ref(false)
const saving = ref(false)
const permissionDialog = ref(false)
const permissionDialogDelete = ref(false)
const { highlightId, flash, prependCreated, removingId, removeWithAnimation } = useRowHighlight()

const lastOptions = ref<Record<string, unknown> | null>(null)

// Top-level await — loads initial data before render (asyncData equivalent)
// Use backend-compatible format for the API call, but store Vuetify 4 format
// in lastOptions so loadPermissions() conversion logic works correctly.
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["name"],
    sortDesc: [false],
  }
  const initialResponse = await Permission.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
  lastOptions.value = {
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: "name", order: "asc" }],
  }
}

// Debounced filter (300ms)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterPermission.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterPermission.value = val
  }, 300)
})

async function loadPermissions(opts: Record<string, unknown>) {
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
    if (filterPermission.value) {
      params.filter = filterPermission.value
    }
    response.value = await Permission.index(params)
  } catch (e) {
    console.error("Error al cargar permisos", e)
  } finally {
    loading.value = false
  }
}

async function refreshPermissions() {
  if (lastOptions.value) {
    await loadPermissions(lastOptions.value)
  }
}

let initialLoaded = false

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true
    return
  }
  loadPermissions(opts)
}

function newPermission() {
  useValidationErrors().clearErrors()
  permission.value = {}
  permissionDialog.value = true
}

function editPermission(item: Record<string, unknown>) {
  useValidationErrors().clearErrors()
  permission.value = { ...item }
  permissionDialog.value = true
}

function distributePermission(item: Record<string, unknown>) {
  navigateTo(`/permission/${item.id}/distribution`)
}

async function deletePermission(item: Record<string, unknown>) {
  try {
    saving.value = true
    await Permission.delete(item.id as number)
    permissionDialogDelete.value = false
    await removeWithAnimation(response, item.id as number)
  } catch (e) {
    console.error("Error al eliminar el permiso", e)
  } finally {
    saving.value = false
  }
}

async function savePermission(item: Record<string, unknown>) {
  try {
    saving.value = true
    if (item.id) {
      await Permission.update(item.id as number, item)
      permissionDialog.value = false
      permission.value = null
      await refreshPermissions()
      flash(item.id as number)
    } else {
      const res = await Permission.create(item)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (created) {
        prependCreated(response, created)
      }
      permissionDialog.value = false
      permission.value = null
    }
  } catch (e) {
    console.error("Error al guardar el permiso", e)
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  permissionDialog.value = false
  permission.value = null
  useValidationErrors().clearErrors()
}
</script>

<style scoped></style>