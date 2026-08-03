<template>
  <VContainer fluid>
    <VRow dense align="center">
      <VCol cols="12" md="4" sm="6">
        <VTextField
          id="tf-testi-index-filtertestimony-1"
          v-model="filterTestimony"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          density="compact"
          placeholder="Filtro"
        />
      </VCol>

      <VCol cols="12" md="2" sm="4">
        <VSelect
          id="sel-tes-status"
          v-model="statusFilter"
          :items="[
            { title: 'Pendientes', value: '' },
            { title: 'Aprobados', value: 'approved' },
            { title: 'Rechazados', value: 'rejected' },
          ]"
          placeholder="Estado"
          clearable
          density="compact"
          hide-details
          @update:model-value="onStatusChange"
        />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-testimony-refresh" color="primary" :loading="loading" class="mr-1" @click="refreshTestimonies">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-testimony-new" color="success" class="mr-1" @click="newTestimony">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
      </VCol>

      <VCol v-if="!orgFilterHidden" cols="auto" class="d-flex align-center">
        <OrganizationSelect
          v-model="filterOrgId"
          v-model:hidden="orgFilterHidden"
          permission="testimony-index"
          hide-one
          density="compact"
          hide-details
          clearable
          variant="outlined"
        />
      </VCol>

      <VCol cols="12">
        <TestimonyTable
          :response="response"
          :loading="loading"
          :search="filterTestimony"
          :highlight-id="highlightId"
          @sorting="handleSorting"
          @edit="editTestimony"
          @show="showTestimony"
          @delete="beforeDeleteTestimony"
        />
      </VCol>
    </VRow>

    <TestimonyDialog v-if="testimonyDialog" :testimony="testimony" :loading="saving" @close="closeDialog" @save="saveTestimony" />

    <DialogDelete v-if="testimonyDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteTestimony" @close="testimonyDialogDelete = false" />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight"

definePageMeta({
  title: "Testimonios",
  icon: "mdi-comment-text-outline",
  middleware: "authenticated",
})

const { Testimony } = useRepository()
const notify = useNotifyStore()
const { highlightId, prependCreated, updateRow } = useRowHighlight()

const filterTestimony = ref("")
const statusFilter = ref("")
const filterOrgId = ref<string | number | null>(null)
const orgFilterHidden = ref(false)
const testimony = ref<Record<string, unknown>>({})
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const testimonyDialog = ref(false)
const testimonyDialogDelete = ref(false)
const dialogDelete = ref<Record<string, unknown>>({})
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const skipFilterWatch = ref(false)

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "created_at", order: "desc" }],
})

// Initial load (asyncData equivalent)
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["created_at"],
    sortDesc: [true],
  }
  const initialResponse = await Testimony.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
}

let initialLoaded = false

// Debounced filter — matches project convention (manual setTimeout)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterTestimony, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false
    return
  }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadTestimonies({ filter: val || "", page: 1 })
  }, 500)
})

watch(filterOrgId, (value) => {
  const overrides: Record<string, unknown> = { page: 1 }
  overrides.org_id = value ?? undefined
  loadTestimonies(overrides)
})

async function loadTestimonies(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true

    const requestOptions = { ...lastOptions.value, ...overrides }
    if (filterTestimony.value && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
      requestOptions.filter = filterTestimony.value
    }
    if (statusFilter.value && !Object.prototype.hasOwnProperty.call(overrides, "status")) {
      requestOptions.status = statusFilter.value
    }
    if (filterOrgId.value && !Object.prototype.hasOwnProperty.call(overrides, "org_id")) {
      requestOptions.org_id = filterOrgId.value
    }
    if (Object.prototype.hasOwnProperty.call(overrides, "org_id") && !overrides.org_id) {
      delete requestOptions.org_id
    }

    const params = buildApiParams(requestOptions)
    response.value = await Testimony.index(params)
    lastOptions.value = requestOptions
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al cargar testimonios" })
  } finally {
    loading.value = false
  }
}

function buildApiParams(opts: Record<string, unknown>): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    itemsPerPage: opts.itemsPerPage ?? 10,
  }
  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key]
    params.sortDesc = [sortBy[0].order === "desc"]
  }
  if (opts.filter) params.filter = opts.filter
  if (opts.status) params.status = opts.status
  if (opts.org_id) params.org_id = opts.org_id
  return params
}

async function onStatusChange(value: unknown) {
  await loadTestimonies({ page: 1, status: value })
}

async function refreshTestimonies() {
  await loadTestimonies()
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded
    initialLoaded = true
    return
  }
  loadTestimonies(opts)
}

function newTestimony() {
  useValidationErrors().clearErrors()
  testimony.value = {}
  testimonyDialog.value = true
}

function editTestimony(item: unknown) {
  useValidationErrors().clearErrors()
  testimony.value = { ...(item as Record<string, unknown>) }
  testimonyDialog.value = true
}

function showTestimony(item: unknown) {
  navigateTo(`/testimony/review/${(item as Record<string, unknown>).id}`)
}

function beforeDeleteTestimony(item: unknown) {
  const t = item as Record<string, unknown>
  dialogDelete.value = {
    text: "¿Desea eliminar el Testimonio ",
    strong: (t.title as string) || String(t.id),
    payload: item,
  }
  testimonyDialogDelete.value = true
}

async function deleteTestimony(item: unknown) {
  const t = item as Record<string, unknown>
  try {
    deleting.value = true
    await Testimony.delete(t.id as number)
    skipFilterWatch.value = true
    filterTestimony.value = ""
    await loadTestimonies({ page: 1, filter: "" })
    testimonyDialogDelete.value = false
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al eliminar testimonio" })
  } finally {
    deleting.value = false
  }
}

async function saveTestimony(item: Record<string, unknown>) {
  try {
    saving.value = true
    const isUpdate = Boolean(item.id)
    let saved: Record<string, unknown> | null = null
    if (isUpdate) {
      const res = await Testimony.update<Record<string, unknown>>(item.id as number, item)
      saved = ((res as Record<string, unknown>)?.data as Record<string, unknown> | undefined) ||
        ((res as Record<string, unknown>)?.testimony as Record<string, unknown> | undefined) ||
        (res as Record<string, unknown>)

      if (saved) {
        updateRow(response, saved)
      }
    } else {
      const res = await Testimony.create<Record<string, unknown>>(item)
      saved = ((res as Record<string, unknown>)?.data as Record<string, unknown> | undefined) ||
        ((res as Record<string, unknown>)?.testimony as Record<string, unknown> | undefined) ||
        (res as Record<string, unknown>)

      if (saved) {
        prependCreated(response, saved)
      }
    }

    notify.notify({ success: `Testimonio ${isUpdate ? "actualizado" : "creado"} exitosamente` })
    testimonyDialog.value = false
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} testimonio` })
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  testimonyDialog.value = false
  testimony.value = {}
  useValidationErrors().clearErrors()
}
</script>

<style scoped></style>
