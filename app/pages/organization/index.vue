<template>
  <VContainer :fluid="true">
    <VRow>
      <VCol cols="12" sm="6" md="2">
        <VTextField id="tf-organ-index-filterorganization-1" v-model="filterInput" append-inner-icon="mdi-magnify" variant="outlined" density="compact" clearable hide-details placeholder="Filtro" />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-org-refresh" color="primary" :loading="loading" class="mr-4" @click="refresh">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-org-new" color="success" @click="newOrganization()">
          <VIcon start>mdi-plus</VIcon>
          Nueva Organización
        </VBtn>
      </VCol>

      <VCol cols="12">
        <OrganizationTable :search="filterOrganization" :response="response" :loading="loading" v-model:dialog-delete="dialogDeleteOrganization"          @sorting="handleSorting" @edit="editOrganization" @delete="deleteOrganization" @config="goConfig" />
      </VCol>
    </VRow>

    <OrganizationFormDialog v-if="organizationFormDialog" :organization="organization" :loading="saving" @close="closeFormDialog()" @save="saveOrganization" />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Organizaciones",
  icon: "mdi-domain",
  middleware: "authenticated",
})

const dialogDeleteOrganization = ref(false)
const organizationFormDialog = ref(false)
const response = ref({})
const filterInput = ref("")
const filterOrganization = ref("")
const loading = ref(false)
const saving = ref(false)
const organization = ref<Record<string, unknown> | null>(null)
const lastOptions = ref<Record<string, unknown> | null>(null)
const { Organization } = useRepository()

// Top-level await — loads initial data before render (asyncData equivalent)
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 5,
    sortBy: ["name"],
    sortDesc: [false],
  }
  const initialResponse = await Organization.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
  lastOptions.value = {
    page: 1,
    itemsPerPage: 5,
    sortBy: [{ key: "name", order: "asc" }],
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterOrganization.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterOrganization.value = val
  }, 300)
})

async function indexOrganizations(opts: Record<string, unknown>) {
  lastOptions.value = opts
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    itemsPerPage: opts.itemsPerPage ?? 5,
  }
  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key]
    params.sortDesc = [sortBy[0].order === 'desc']
  }
  if (filterOrganization.value) {
    params.filter = filterOrganization.value
  }
  try {
    loading.value = true
    response.value = await Organization.index(params)
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
  indexOrganizations(opts)
}

function refresh() {
  if (lastOptions.value) {
    indexOrganizations(lastOptions.value)
  }
}

function goConfig(item: Record<string, unknown>) {
  navigateTo(`/organization/${item.id}/config`)
}

function newOrganization() {
  useValidationErrors().clearErrors()
  organization.value = {}
  organizationFormDialog.value = true
}

function editOrganization(item: Record<string, unknown>) {
  useValidationErrors().clearErrors()
  organization.value = { ...item }
  organizationFormDialog.value = true
}

async function deleteOrganization(item: Record<string, unknown>) {
  try {
    await Organization.delete(item.id as number)
    const data = response.value.data as Record<string, unknown>[]
    const idx = data.findIndex((r) => r.id === item.id)
    if (idx !== -1) {
      data.splice(idx, 1)
      response.value.total = Math.max(0, (response.value.total ?? 0) - 1)
    }
    dialogDeleteOrganization.value = false
  } catch (e) {
    console.error(e)
  }
}

async function saveOrganization(item: Record<string, unknown>) {
  saving.value = true
  try {
    if (item.id) {
      const res = await Organization.update<Record<string, unknown>>(item.id as number, item)
      const updated = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (updated) {
        const data = response.value.data as Record<string, unknown>[]
        const idx = data.findIndex((r) => r.id === updated.id)
        if (idx !== -1) {
          data[idx] = updated
        }
      }
    } else {
      const res = await Organization.create<Record<string, unknown>>(item)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      if (created) {
        ;(response.value.data as Record<string, unknown>[]).unshift(created)
        response.value.total = (response.value.total ?? 0) + 1
      }
    }
    organizationFormDialog.value = false
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function closeFormDialog() {
  organizationFormDialog.value = false
  useValidationErrors().clearErrors()
}
</script>