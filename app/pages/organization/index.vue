<template>
  <VContainer :fluid="true">
    <VRow>
      <VCol cols="12" sm="6" md="2">
        <VTextField id="tf-organ-index-filterorganization-1" v-model="filterOrganization" append-inner-icon="mdi-magnify" clearable hide-details placeholder="Filtro" />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-org-refresh" color="primary" :loading="loading" class="mr-1" @click="indexOrganizations()">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-org-new" color="success" class="mr-1" @click="newOrganization()">
          <VIcon start>mdi-plus</VIcon>
          Nueva Organización
        </VBtn>
      </VCol>

      <VCol cols="12">
        <OrganizationTable :options="options" :response="response" v-model:dialog-delete="dialogDeleteOrganization" @sorting="indexOrganizations" @edit="editOrganization" @delete="deleteOrganization" @config="goConfig" />
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

const config = useRuntimeConfig()
const dialogDeleteOrganization = ref(false)
const organizationFormDialog = ref(false)
const options = ref({ sortBy: ["name"], sortDesc: [true], itemsPerPage: 5 })
const response = ref({})
const filterOrganization = ref("")
const loading = ref(false)
const organization = ref<Record<string, unknown> | null>(null)

function getBaseUrl() {
  if (config.public.baseUrl) return config.public.baseUrl
  if (import.meta.client) {
    return `http://${window.location.hostname}${config.public.suffixUrl}`
  }
  return ""
}

async function apiIndex(opts: Record<string, unknown>) {
  const baseUrl = getBaseUrl()
  return await $fetch(`${baseUrl}/organization`, { params: opts })
}

async function apiDelete(id: number) {
  const baseUrl = getBaseUrl()
  return await $fetch(`${baseUrl}/organization/${id}`, { method: "DELETE" })
}

async function apiCreate(data: Record<string, unknown>) {
  const baseUrl = getBaseUrl()
  return await $fetch(`${baseUrl}/organization`, { method: "POST", body: data })
}

async function apiUpdate(id: number, data: Record<string, unknown>) {
  const baseUrl = getBaseUrl()
  return await $fetch(`${baseUrl}/organization/${id}`, { method: "PUT", body: data })
}

const { data: initialResponse, error: initialError } = await useAsyncData("organizations", () =>
  apiIndex(options.value)
)

if (initialError.value) {
  console.error("Failed to load organizations", initialError.value)
} else if (initialResponse.value) {
  response.value = initialResponse.value
}

watch(filterOrganization, async (value) => {
  const op = { ...options.value, filter: value, page: 1 }
  response.value = await apiIndex(op)
})

function goConfig(item: Record<string, unknown>) {
  navigateTo(`/organizations/${item.id}/config`)
}

function newOrganization() {
  organization.value = {}
  organizationFormDialog.value = true
}

function editOrganization(item: Record<string, unknown>) {
  organization.value = { ...item }
  organizationFormDialog.value = true
}

async function indexOrganizations(extraOptions?: Record<string, unknown>) {
  if (extraOptions) {
    options.value = { ...options.value, ...extraOptions }
  }
  const op = { filter: filterOrganization.value, ...options.value }
  try {
    loading.value = true
    response.value = await apiIndex(op)
  } finally {
    loading.value = false
  }
}

async function deleteOrganization(item: Record<string, unknown>) {
  try {
    await apiDelete(item.id as number)
    dialogDeleteOrganization.value = false
    await indexOrganizations()
  } catch (e) {
    console.error(e)
  }
}

async function saveOrganization(item: Record<string, unknown>) {
  try {
    if (item.id) {
      await apiUpdate(item.id as number, item)
    } else {
      await apiCreate(item)
    }
    await indexOrganizations()
    organizationFormDialog.value = false
  } catch (e) {
    console.error(e)
  }
}

function closeFormDialog() {
  organizationFormDialog.value = false
}
</script>
