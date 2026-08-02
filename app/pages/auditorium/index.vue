<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <VCol cols="12" md="2">
        <VTextField id="tf-audit-index-filterauditorium-1" v-model="filterInput" append-inner-icon="mdi-magnify" variant="outlined" density="compact" clearable hide-details placeholder="Filtro" />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-auditorium-refresh" color="primary" :loading="loading" class="mr-4" @click="refresh">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-auditorium-new" color="success" @click="newAuditorium">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
      </VCol>

      <VCol v-if="!orgFilterHidden" cols="2">
        <OrganizationSelect v-model="filterOrgId" v-model:hidden="orgFilterHidden" permission="auditorium-index" hide-one density="compact" hide-details clearable variant="outlined" />
      </VCol>

      <VCol cols="12">
        <AuditoriumTable :search="filterAuditorium" :response="response" :loading="loading" :highlight-id="highlightId" v-model:dialog-delete="dialogDeleteAuditorium" @sorting="handleSorting" @edit="editAuditorium" @layout="goToLayout" @delete="deleteAuditorium" />
      </VCol>
    </VRow>

    <AuditoriumDialog v-if="auditoriumDialog" :auditorium="auditorium" :loading="saving" @close="closeDialog" @save="saveAuditorium" />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight"

definePageMeta({
  title: "Auditorios",
  icon: "mdi-seat",
  middleware: "authenticated",
})

const auditoriumDialog = ref(false)
const dialogDeleteAuditorium = ref(false)
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const filterInput = ref("")
const filterAuditorium = ref("")
const filterOrgId = ref<string | number | null>(null)
const orgFilterHidden = ref(false)
const loading = ref(false)
const saving = ref(false)
const auditorium = ref<Record<string, unknown> | null>(null)
const lastOptions = ref<Record<string, unknown> | null>(null)
const { highlightId, flash } = useRowHighlight()
const { Auditorium } = useRepository()

// Top-level await — loads initial data before render (asyncData equivalent)
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["name"],
    sortDesc: [false],
  }
  const initialResponse = await Auditorium.index(apiParams).catch(() => ({ data: [], total: 0 }))
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
    filterAuditorium.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterAuditorium.value = val
  }, 300)
})

watch(filterOrgId, (val) => {
  const overrides: Record<string, unknown> = { page: 1 }
  overrides.org_id = val ?? undefined
  indexAuditoriums(overrides)
})

async function indexAuditoriums(overrides: Record<string, unknown> = {}) {
  const opts: Record<string, unknown> = {
    ...(lastOptions.value ?? {}),
    ...overrides,
  }
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
  if (filterAuditorium.value) {
    params.filter = filterAuditorium.value
  }
  if (filterOrgId.value) {
    params.org_id = filterOrgId.value
  }

  try {
    loading.value = true
    response.value = await Auditorium.index(params)
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
  indexAuditoriums(opts)
}

function refresh() {
  if (lastOptions.value) {
    indexAuditoriums(lastOptions.value)
  }
}

function newAuditorium() {
  useValidationErrors().clearErrors()
  auditorium.value = {}
  auditoriumDialog.value = true
}

function editAuditorium(item: Record<string, unknown>) {
  useValidationErrors().clearErrors()
  auditorium.value = { ...item }
  auditoriumDialog.value = true
}

async function deleteAuditorium(item: Record<string, unknown>) {
  try {
    await Auditorium.delete(item.id as number)
    await indexAuditoriums(lastOptions.value ?? {})
    dialogDeleteAuditorium.value = false
  } catch (e) {
    console.error(e)
  }
}

async function saveAuditorium(item: Record<string, unknown>) {
  saving.value = true
  const payload: Record<string, unknown> = { ...item }

  if (item.id) {
    delete payload.org_id
  } else {
    payload.org_id = (item.org_id as Record<string, unknown>)?.id ?? item.org_id
  }

  try {
    let savedId: number | undefined
    if (payload.id) {
      await Auditorium.update<Record<string, unknown>>(payload.id as number, payload)
      savedId = payload.id as number
    } else {
      const res = await Auditorium.create<Record<string, unknown>>(payload)
      const created = (res as Record<string, unknown>)?.data as Record<string, unknown> | undefined
      savedId = created?.id as number | undefined
    }
    await indexAuditoriums(lastOptions.value ?? {})
    if (savedId != null) {
      flash(savedId)
    }
    auditoriumDialog.value = false
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  auditoriumDialog.value = false
  useValidationErrors().clearErrors()
}

function goToLayout(item: Record<string, unknown>) {
  navigateTo(`/auditorium/${item.id}/editor`)
}
</script>

<style scoped></style>
