<template>
  <VContainer fluid>
    <VRow density="comfortable">
      <VCol cols="12" md="3">
        <VTextField
          id="con-index-filterterm-tf-1"
          v-model="filterTerm"
          append-inner-icon="mdi-magnify"
          clearable
          hide-details
          placeholder="Filtro"
          density="compact"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VBtn id="cnsld-new-btn" color="primary" class="mr-1" @click="newSheet">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
        <VBtn id="cnsld-refresh-btn" color="primary" :loading="loading" @click="fetchData">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>
      <VCol cols="12">
        <ConsolidationTable
          :response="response"
          :loading="loading"
          :search="filterTerm"
          :highlight-id="highlightId"
          @sorting="handleSorting"
          @view="viewSheet"
          @edit="editSheet"
          @delete="deleteSheet"
        />
      </VCol>
    </VRow>

    <ConsolidationDialog v-if="dialog" :sheet="sheet" :loading="saving" @close="closeDialog" @save="saveSheet" />
    <DialogDelete v-if="dialogDelete" :dialog="deleteData" :loading="deleting" @ok="confirmDelete" @close="dialogDelete = false" />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight"

definePageMeta({
  title: "Consolidación",
  icon: "mdi-clipboard-list",
  middleware: "authenticated",
})

const { ConsoSheet } = useRepository()
const notify = useNotifyStore()
const { highlightId, prependCreated, updateRow } = useRowHighlight()

const filterTerm = ref("")
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const dialogDelete = ref(false)
const sheet = ref<Record<string, unknown>>({})
const deleteData = ref<Record<string, unknown>>({})
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "id", order: "asc" }],
})

// Debounced filter
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterTerm, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchData({ filter: val || "" })
  }, 500)
})

// Initial load (asyncData equivalent)
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["id"],
    sortDesc: [false],
  }
  const initialResponse = await ConsoSheet.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = normalizeResponse(initialResponse)
}

let initialLoaded = false

function normalizeResponse(res: unknown): { data: unknown[]; total: number } {
  if (Array.isArray(res)) return { data: res, total: res.length }
  const r = res as { data?: unknown[]; total?: number } | null | undefined
  if (r && Array.isArray(r.data)) {
    return { data: r.data, total: r.total ?? r.data.length }
  }
  return { data: [], total: 0 }
}

async function fetchData(overrides: Record<string, unknown> = {}) {
  loading.value = true
  try {
    const requestOptions = { ...lastOptions.value, ...overrides }
    const params = buildApiParams(requestOptions)
    const res = await ConsoSheet.index(params)
    response.value = normalizeResponse(res)
    lastOptions.value = requestOptions
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al cargar consolidados" })
    response.value = { data: [], total: 0 }
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
  return params
}

function newSheet() {
  useValidationErrors().clearErrors()
  sheet.value = {}
  dialog.value = true
}

function viewSheet(item: unknown) {
  navigateTo(`/consolidation/${(item as Record<string, unknown>).id}/details`)
}

function editSheet(item: unknown) {
  useValidationErrors().clearErrors()
  sheet.value = { ...(item as Record<string, unknown>) }
  dialog.value = true
}

function deleteSheet(item: unknown) {
  const s = item as Record<string, unknown>
  deleteData.value = {
    text: "¿Desea eliminar el Consolidado con folio ",
    strong: String(s.folio_number),
    payload: item,
  }
  dialogDelete.value = true
}

async function confirmDelete(item: unknown) {
  const s = item as Record<string, unknown>
  try {
    deleting.value = true
    await ConsoSheet.delete(s.id as number)
    await fetchData()
    dialogDelete.value = false
    notify.notify({ success: "Consolidado eliminado exitosamente" })
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al eliminar consolidado" })
  } finally {
    deleting.value = false
  }
}

async function saveSheet(item: Record<string, unknown>) {
  try {
    saving.value = true
    const isUpdate = Boolean(item.id)

    if (isUpdate) {
      const res = await ConsoSheet.update<Record<string, unknown>>(item.id as number, item)
      updateRow(response, (res as Record<string, unknown>) ?? item)
    } else {
      const res = await ConsoSheet.create<Record<string, unknown>>(item)
      prependCreated(response, (res as Record<string, unknown>) ?? item)
    }

    notify.notify({ success: `Consolidado ${isUpdate ? "actualizado" : "creado"} exitosamente` })
    dialog.value = false
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} consolidado` })
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  dialog.value = false
  sheet.value = {}
  useValidationErrors().clearErrors()
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true
    return
  }
  fetchData(opts)
}
</script>

<style scoped></style>
