<template>
  <VContainer fluid>
    <VRow density="comfortable">
      <VCol cols="12" md="3">
        <MyDateRange v-model="filterAuditoriumEvent" />
      </VCol>
      <VCol cols="auto" class="d-flex align-center">
        <VBtn color="primary" :loading="loading" class="mr-1" id="btn-auditoriumevent-refresh"
          @click="getAuditoriumEvents()">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn color="success" class="mr-1" id="btn-auditoriumevent-new" @click="newAuditoriumEvent()">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
      </VCol>
      <VCol v-if="!orgFilterHidden" cols="4" lg="2">
        <OrganizationSelect v-model="filterOrgId" v-model:hidden="orgFilterHidden" permission="auditorium-index"
          hide-one density="compact" hide-details clearable variant="outlined" />
      </VCol>
      <VCol cols="12">
        <AuditoriumEventTable :loading="loading" :response="response" :options="options"
          @sorting="handleSorting" @download="downloadAuditoriumEvent" @edit="editAuditoriumEvent"
          @mark="markAuditoriumEvent" @delete="beforeDeleteAuditoriumEvent" />
      </VCol>
    </VRow>

    <AuditoriumEventDialog v-if="auditoriumEventDialog" v-model="auditoriumEventDialog"
      :auditorium-event="auditoriumEvent" @close="closeDialog" @save="saveAuditoriumEvent" />
    <DialogDelete v-if="auditoriumEventDialogDelete" :dialog="dialogDelete"
      @ok="deleteAuditoriumEvent" @close="auditoriumEventDialogDelete = false" />
  </VContainer>
</template>

<script setup lang="ts">
import { STATUS_CONFIG } from "~/constants/auditorium"

definePageMeta({
  title: "Eventos de Auditorio",
  icon: "mdi-theater",
  middleware: "authenticated",
})

const { AuditoriumEvent } = useRepository()
const notify = useNotifyStore()

const filterAuditoriumEvent = ref<(string | null)[]>([])
const filterOrgId = ref<string | number | null>(null)
const orgFilterHidden = ref(false)
const auditoriumEvent = ref<Record<string, unknown>>({})
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const options = ref<Record<string, unknown>>({})
const loading = ref(false)
const auditoriumEventDialog = ref(false)
const auditoriumEventDialogDelete = ref(false)
const dialogDelete = ref<Record<string, unknown>>({})

const initialOptions: Record<string, unknown> = {
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "event_date", order: "desc" }],
}

{
  const apiParams: Record<string, unknown> = {
    page: 1,
    itemsPerPage: 10,
    sortBy: ["event_date"],
    sortDesc: [true],
  }
  const initialResponse = await AuditoriumEvent.index(apiParams).catch(() => ({ data: [], total: 0 }))
  response.value = initialResponse as { data: unknown[]; total: number }
  options.value = initialOptions
}

let initialLoaded = false

watch(filterAuditoriumEvent, (value) => {
  if (value && value.length > 0) {
    value = [...value].sort() as (string | null)[]
  }
  getAuditoriumEvents({ filter: value, page: 1 })
})

watch(filterOrgId, (value) => {
  const overrides: Record<string, unknown> = { page: 1 }
  overrides.org_id = value ?? undefined
  getAuditoriumEvents(overrides)
})

async function getAuditoriumEvents(overrides: Record<string, unknown> = {}) {
  const requestOptions = {
    ...options.value,
    ...overrides,
  }
  options.value = requestOptions

  const params: Record<string, unknown> = {
    page: requestOptions.page ?? 1,
    itemsPerPage: requestOptions.itemsPerPage ?? 10,
  }
  const sortBy = (requestOptions.sortBy as { key: string; order: string }[]) ?? []
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key]
    params.sortDesc = [sortBy[0].order === 'desc']
  }
  if (requestOptions.filter && (requestOptions.filter as unknown[]).length > 0) {
    params.filter = requestOptions.filter
  }
  if (filterOrgId.value) {
    params.org_id = filterOrgId.value
  }

  try {
    loading.value = true
    response.value = await AuditoriumEvent.index(params)
  } finally {
    loading.value = false
  }
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true
    return
  }
  getAuditoriumEvents(opts)
}

function newAuditoriumEvent() {
  auditoriumEvent.value = {}
  auditoriumEventDialog.value = true
}

function editAuditoriumEvent(item: unknown) {
  auditoriumEvent.value = { ...(item as Record<string, unknown>) }
  auditoriumEventDialog.value = true
}

async function downloadAuditoriumEvent(item: unknown) {
  const event = item as Record<string, unknown>
  loading.value = true
  try {
    const result = await AuditoriumEvent.show<{ seats?: Record<string, string[]> }>(event.id as number)
    if (result && result.seats) {
      const headerRow = (event.auditorium_name as string) + " - " + (event.event_date as string)
      const rows = [[headerRow], ["Status", "Cantidad"]]

      Object.keys(STATUS_CONFIG).forEach((key) => {
        const count = result.seats[key] ? result.seats[key].length : 0
        if (count > 0) {
          rows.push([STATUS_CONFIG[key].label ?? key, String(count)])
        }
      })

      const csvContent = rows.map((e) => e.join(",")).join("\n")
      const bom = "\uFEFF"
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      let dateStr = ""
      if (event.event_date) {
        dateStr = String(event.event_date).substring(0, 10).replace(/-/g, "")
        dateStr = `_${dateStr}`
      }

      a.setAttribute("download", `Resumen_Auditorio_${event.id}${dateStr}.csv`)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  } catch (error) {
    notify.notify({ error: "Error descargando resumen" })
  } finally {
    loading.value = false
  }
}

function markAuditoriumEvent(item: unknown) {
  const event = item as Record<string, unknown>
  navigateTo(`/auditorium-event/${event.id}/mark`)
}

function beforeDeleteAuditoriumEvent(item: unknown) {
  const event = item as Record<string, unknown>
  dialogDelete.value = {
    text: "¿Desea eliminar el Evento de Auditorio ",
    strong: event.auditorium_name as string,
    payload: item,
  }
  auditoriumEventDialogDelete.value = true
}

async function deleteAuditoriumEvent(item: unknown) {
  const event = item as Record<string, unknown>
  try {
    await AuditoriumEvent.delete(event.id as number)
    await getAuditoriumEvents()
  } catch (error) {
    notify.notify({ error: "Error eliminando evento de auditorio" })
  } finally {
    auditoriumEventDialogDelete.value = false
  }
}

async function saveAuditoriumEvent(item: Record<string, unknown>) {
  try {
    if (item.id) {
      await AuditoriumEvent.update(item.id as number, item)
    } else {
      await AuditoriumEvent.create(item)
    }
    auditoriumEventDialog.value = false
    await getAuditoriumEvents()
  } catch (error) {
    notify.notify({ error: "Error guardando evento de auditorio" })
  }
}

function closeDialog() {
  auditoriumEventDialog.value = false
}
</script>
