<template>
  <VContainer fluid>
    <VRow dense>
      <!-- Filtro de busqueda -->
      <VCol cols="12" md="2">
        <VTextField
          id="eve-calen-filterchurchevent-tf-1"
          v-model="filterChurchEvent"
          append-inner-icon="mdi-magnify"
          clearable
          hide-details
          placeholder="Buscar evento..."
          density="compact"
        />
      </VCol>

      <!-- Botones de accion -->
      <VCol cols="auto">
        <VBtn id="chrcev-new-btn" color="primary" class="mr-2" @click="newChurchEvent">
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
        <VBtn id="chrcev-refresh-btn" color="primary" :loading="loading" class="mr-2" @click="refreshChurchEvents">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="chrcev-table-btn" variant="outlined" color="primary" to="/church-event">
          <VIcon start>mdi-table</VIcon>
          Tabla
        </VBtn>
      </VCol>
      <VCol cols="auto">
        <OrganizationSelect
          v-model="filterOrgId"
          permission="church-event-index"
          hide-one
          density="compact"
          hide-details
          clearable
          variant="outlined"
        />
      </VCol>

      <VCol cols="auto">
        <VBtnToggle v-model="weekStartsOnMonday" mandatory density="compact" @update:model-value="changeWeekStart">
          <VBtn id="chrcev-sun-btn" :value="false">Dom</VBtn>
          <VBtn id="chrcev-mon-btn" :value="true">Lun</VBtn>
        </VBtnToggle>
      </VCol>

      <!-- Calendario de eventos -->
      <VCol cols="12">
        <ChurchEventCalendarView
          :cal-year="calYear"
          :cal-month="calMonth"
          :events="churchEvents"
          :week-starts-on-monday="weekStartsOnMonday"
          @prev-month="prevMonth"
          @next-month="nextMonth"
          @new="newChurchEventOnDate"
          @edit="editChurchEvent"
          @copy="openCopyDialog"
          @delete="beforeDeleteChurchEvent"
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
  title: "Calendario de Eventos",
  icon: "mdi-calendar-month",
  permission: "church-event-index",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { ChurchEvent } = useRepository()
const notify = useNotifyStore()

const toIso = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

const toWeekColumn = (jsDay: number, weekStartsOnMonday: boolean) => (weekStartsOnMonday ? (jsDay + 6) % 7 : jsDay)

const buildDateRange = (year: number, month: number, weekStartsOnMonday: boolean) => {
  const firstDayOfWeek = toWeekColumn(new Date(year, month, 1).getDay(), weekStartsOnMonday)
  const prevMonth = month === 0 ? 11 : month - 1
  const prevYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
  const firstVisibleDay = firstDayOfWeek === 0 ? 1 : daysInPrevMonth - (firstDayOfWeek - 1)
  const firstVisibleMonth = firstDayOfWeek === 0 ? month : prevMonth
  const firstVisibleYear = firstDayOfWeek === 0 ? year : prevYear
  const startDate = toIso(firstVisibleYear, firstVisibleMonth, firstVisibleDay)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lastDayOfWeek = toWeekColumn(new Date(year, month, daysInMonth).getDay(), weekStartsOnMonday)
  const trailingDays = lastDayOfWeek < 6 ? 6 - lastDayOfWeek : 0
  const end = new Date(year, month, daysInMonth + trailingDays)
  const endDate = toIso(end.getFullYear(), end.getMonth(), end.getDate())

  return { start_date: startDate, end_date: endDate }
}

const filterChurchEvent = ref("")
const filterOrgId = ref<string | number | null>(null)
const weekStartsOnMonday = ref(true)
const calYear = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth())
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
const churchEventDialogDelete = ref(false)
const dialogDelete = ref<Record<string, unknown>>({})
const churchEventDialogCopy = ref(false)
const copyingChurchEvent = ref<Record<string, unknown>>({})
const copying = ref(false)
const loading = ref(false)
const deleting = ref(false)
const skipFilterWatch = ref(false)

// Initial load (asyncData equivalent) — honor query params
{
  const today = new Date()
  calYear.value = route.query.cal_year ? parseInt(String(route.query.cal_year)) : today.getFullYear()
  calMonth.value = route.query.cal_month !== undefined ? parseInt(String(route.query.cal_month)) : today.getMonth()
  weekStartsOnMonday.value = route.query.week_start !== "sunday"

  const params = {
    ...buildDateRange(calYear.value, calMonth.value, weekStartsOnMonday.value),
  }
  const initialResponse = await ChurchEvent.calendar<{ data?: unknown[] }>(params).catch(() => ({ data: [] }))
  response.value = { data: initialResponse?.data ?? [], total: initialResponse?.data?.length ?? 0 }
}

const churchEvents = computed(() => response.value?.data || [])

// Debounced filter
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterChurchEvent, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false
    return
  }
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    loadChurchEvents({ filter: val || "" })
  }, 500)
})

watch(filterOrgId, (value) => {
  const overrides: Record<string, unknown> = {}
  overrides.org_id = value ?? undefined
  loadChurchEvents(overrides)
})

async function changeWeekStart() {
  await loadChurchEvents()
  navigateTo({
    query: {
      ...route.query,
      week_start: weekStartsOnMonday.value ? "monday" : "sunday",
    },
    replace: true,
  })
}

async function loadChurchEvents(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true

    const params: Record<string, unknown> = {
      ...buildDateRange(calYear.value, calMonth.value, weekStartsOnMonday.value),
      ...overrides,
    }

    if (filterChurchEvent.value && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
      params.filter = filterChurchEvent.value
    }

    if (filterOrgId.value && !Object.prototype.hasOwnProperty.call(overrides, "org_id")) {
      params.org_id = filterOrgId.value
    }

    if (Object.prototype.hasOwnProperty.call(overrides, "org_id") && !overrides.org_id) {
      delete params.org_id
    }

    const res = await ChurchEvent.calendar<{ data?: unknown[] }>(params)
    response.value = { data: res?.data ?? [], total: res?.data?.length ?? 0 }
  } catch (error) {
    console.error(error)
    notify.notify({ error: "Error al cargar el calendario" })
  } finally {
    loading.value = false
  }
}

async function refreshChurchEvents() {
  await loadChurchEvents()
}

async function prevMonth() {
  if (calMonth.value === 0) {
    calMonth.value = 11
    calYear.value -= 1
  } else {
    calMonth.value -= 1
  }
  await loadChurchEvents()
}

async function nextMonth() {
  if (calMonth.value === 11) {
    calMonth.value = 0
    calYear.value += 1
  } else {
    calMonth.value += 1
  }
  await loadChurchEvents()
}

function newChurchEvent() {
  navigateTo({
    path: "/church-event/new",
    query: { from: "calendar", cal_year: String(calYear.value), cal_month: String(calMonth.value) },
  })
}

function newChurchEventOnDate(dateIso: string) {
  navigateTo({
    path: "/church-event/new",
    query: { from: "calendar", event_date: dateIso, cal_year: String(calYear.value), cal_month: String(calMonth.value) },
  })
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
  routeQuery: () => ({ from: "calendar", cal_year: String(calYear.value), cal_month: String(calMonth.value) }),
  deleteReloadOverrides: () => ({}),
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
