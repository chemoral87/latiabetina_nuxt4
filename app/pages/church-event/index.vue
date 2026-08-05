<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <!-- Filtro de busqueda -->
      <VCol cols="12" md="2">
        <VTextField
          id="tf-churc-index-filterchurchevent-1"
          v-model="filterChurchEvent"
          append-inner-icon="mdi-magnify"
          clearable
          hide-details
          placeholder="Buscar evento..."
          density="compact"
        />
      </VCol>

      <!-- Botones de accion -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn id="btn-chrcev-refresh" color="primary" :loading="loading" class="mr-1" @click="refreshChurchEvents">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="btn-chrcev-new" color="success" class="mr-1" @click="newChurchEvent">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
        <VBtn id="btn-chrcev-calendar" variant="outlined" color="primary" to="/church-event/calendar">
          <VIcon start>mdi-calendar-month</VIcon>
          Calendario
        </VBtn>
      </VCol>
      <VCol v-if="!orgFilterHidden" cols="auto">
        <OrganizationSelect
          v-model="filterOrgId"
          v-model:hidden="orgFilterHidden"
          permission="church-event-index"
          hide-one
          density="compact"
          hide-details
          clearable
          variant="outlined"
        />
      </VCol>

      <!-- Tabla de eventos -->
      <VCol cols="12">
        <ChurchEventTable
          :response="response"
          :loading="loading"
          :search="filterChurchEvent"
          @sorting="handleSorting"
          @edit="editChurchEvent"
          @delete="beforeDeleteChurchEvent"
          @copy="openCopyDialog"
        />
      </VCol>
    </VRow>

    <!-- Dialogo de copiar evento en varias fechas -->
    <ChurchEventCopyDialog v-if="churchEventDialogCopy" :church-event="copyingChurchEvent" :loading="copying" @copy="copyChurchEvent" @close="churchEventDialogCopy = false" />

    <!-- Dialogo de confirmacion de eliminacion -->
    <DialogDelete v-if="churchEventDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteChurchEvent" @close="churchEventDialogDelete = false" />
  </VContainer>
</template>

<script setup lang="ts">
import { useChurchEventActions } from "~/composables/useChurchEventActions"

definePageMeta({
  title: "Eventos de Iglesia",
  icon: "mdi-calendar",
  permission: "church-event-index",
  middleware: ["authenticated", "permission"],
})

const { ChurchEvent } = useRepository()
const notify = useNotifyStore()
const auth = useAuthStore()

const filterChurchEvent = ref("")
const filterOrgId = ref<string | number | null>(null)
const orgFilterHidden = ref(false)
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const churchEventDialogDelete = ref(false)
const dialogDelete = ref<Record<string, unknown>>({})
const churchEventDialogCopy = ref(false)
const copyingChurchEvent = ref<Record<string, unknown>>({})
const copying = ref(false)
const loading = ref(false)
const deleting = ref(false)
const skipFilterWatch = ref(false)

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "event_date", order: "desc" }],
})

function getEffectiveOrgId() {
  const orgPermission = auth.permissionsOrg["church-event-index"] ?? []
  const orgs = auth.user?.orgs ?? []
  if (orgs.length === 1 && orgPermission.includes((orgs[0] as { id: unknown }).id)) {
    return (orgs[0] as { id: unknown }).id
  }
  return null
}

const effectiveOrgId = getEffectiveOrgId()

// Initial load (asyncData equivalent)
{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["event_date"],
    sortDesc: [true],
  }
  if (effectiveOrgId) apiParams.org_id = effectiveOrgId
  const initialResponse = await ChurchEvent.index(apiParams).catch(() => ({ data: [], total: 0 }))
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

// Debounced filter
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterChurchEvent, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false
    return
  }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadChurchEvents({ filter: val || "", page: 1 })
  }, 500)
})

let initialOrgLoadDone = false

watch(filterOrgId, (value) => {
  if (!initialOrgLoadDone) {
    initialOrgLoadDone = true
    return
  }
  const overrides: Record<string, unknown> = { page: 1 }
  overrides.org_id = value ?? undefined
  loadChurchEvents(overrides)
})

async function loadChurchEvents(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true

    const requestOptions = { ...lastOptions.value, ...overrides }

    if (filterChurchEvent.value && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
      requestOptions.filter = filterChurchEvent.value
    }

    if (filterOrgId.value && !Object.prototype.hasOwnProperty.call(overrides, "org_id")) {
      requestOptions.org_id = filterOrgId.value
    }

    if (Object.prototype.hasOwnProperty.call(overrides, "org_id") && !overrides.org_id) {
      delete requestOptions.org_id
    }

    const params = buildApiParams(requestOptions)
    const res = await ChurchEvent.index(params)
    response.value = normalizeResponse(res)
    lastOptions.value = requestOptions
  } catch (error) {
    console.error(error)
    notify.notify({ error: "Error al cargar eventos de iglesia" })
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
  if (opts.org_id) params.org_id = opts.org_id
  return params
}

async function refreshChurchEvents() {
  await loadChurchEvents()
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true
    return
  }
  loadChurchEvents(opts)
}

function newChurchEvent() {
  navigateTo({ path: "/church-event/new", query: { from: "table" } })
}

// ── Shared actions (copy/edit/delete) ─────────────────────────────────

const {
  openCopyDialog,
  copyChurchEvent,
  editChurchEvent,
  beforeDeleteChurchEvent,
  deleteChurchEvent,
} = useChurchEventActions({
  loadChurchEvents,
  routeQuery: () => ({ from: "table" }),
  deleteReloadOverrides: () => ({ page: 1 }),
  churchEventDialogCopy,
  copyingChurchEvent,
  copying,
  churchEventDialogDelete,
  dialogDelete,
  deleting,
  skipFilterWatch,
  filterChurchEvent,
})
</script>

<style scoped></style>
