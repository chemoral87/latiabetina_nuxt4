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
        <OrganizationTable :search="filterOrganization" :response="response" :loading="loading" v-model:dialog-delete="dialogDeleteOrganization" @sorting="indexOrganizations" @edit="editOrganization" @delete="deleteOrganization" @config="goConfig" />
      </VCol>
    </VRow>

    <OrganizationFormDialog v-if="organizationFormDialog" :organization="organization" @close="closeFormDialog()" @save="saveOrganization" />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Organizaciones",
  middleware: "authenticated",
})

const dialogDeleteOrganization = ref(false)
const organizationFormDialog = ref(false)
const response = ref({})
const filterInput = ref("")
const filterOrganization = ref("")
const loading = ref(false)
const organization = ref<Record<string, unknown> | null>(null)
const lastOptions = ref<Record<string, unknown> | null>(null)

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

const { Organization } = useRepository()

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
    dialogDeleteOrganization.value = false
    refresh()
  } catch (e) {
    console.error(e)
  }
}

async function saveOrganization(item: Record<string, unknown>) {
  try {
    if (item.id) {
      await Organization.update(item.id as number, item)
    } else {
      await Organization.create(item)
    }
    await refresh()
    organizationFormDialog.value = false
  } catch (e) {
    console.error(e)
  }
}

function closeFormDialog() {
  organizationFormDialog.value = false
  useValidationErrors().clearErrors()
}
</script>