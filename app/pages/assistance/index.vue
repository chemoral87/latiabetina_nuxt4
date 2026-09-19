<template>
  <VContainer class="" :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol md="2" cols="12">
          <VTextField
            id="ass-index-filter"
            v-model="filterInput"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            append-inner-icon="mdi-magnify"
            placeholder="Buscar asistencia..."
          />
        </VCol>

        <VCol cols="auto" class="d-flex align-center">
          <VBtn
            id="ass-refresh-btn"
            class="mr-1"
            color="primary"
            :loading="loading"
            variant="outlined"
            @click="refreshAssistances"
          >
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
          <VBtn
            v-if="canCreate"
            id="ass-new-btn"
            class="mr-1"
            color="success"
            @click="newAssistance"
          >
            <VIcon start>mdi-plus</VIcon>
            Nuevo
          </VBtn>
          <VBtn
            v-if="canBulk"
            id="ass-bulk-btn"
            color="primary"
            variant="outlined"
            @click="bulkDialog = true"
          >
            <VIcon start>mdi-file-excel</VIcon>
            Importar
          </VBtn>
        </VCol>

        <VCol v-if="!orgFilterHidden" lg="1" md="3" sm="4" cols="6">
          <OrganizationSelect
            v-model="filterOrgId"
            v-model:hidden="orgFilterHidden"
            hide-one
            clearable
            hide-details
            density="compact"
            variant="outlined"
            prevent-auto-select
            permission="assistance-index"
          />
        </VCol>

        <VCol cols="12">
          <AssistanceTable
            :loading="loading"
            :response="response"
            :search="filterAssistances"
            :initial-sort-by="lastOptions.sortBy as any"
            @edit="openEditDialog"
            @sorting="handleSorting"
            @delete="beforeDeleteAssistance"
          />
        </VCol>
      </VRow>
    </VSheet>

    <AssistanceForm
      v-if="assistanceDialog"
      :dialog="true"
      :loading="savingAssistance"
      permission="assistance-create"
      :assistance="newAssistanceRecord"
      @save="saveNewAssistance"
      @close="closeAssistanceDialog"
    />

    <AssistanceForm
      v-if="editDialog"
      :dialog="true"
      :loading="savingAssistance"
      permission="assistance-update"
      :assistance="editAssistanceRecord"
      @close="closeEditDialog"
      @save="saveEditAssistance"
    />

    <DialogDelete
      v-if="assistanceDialogDelete"
      :loading="deleting"
      :dialog="dialogDelete"
      @ok="deleteAssistance"
      @close="assistanceDialogDelete = false"
    />

    <VDialog v-model="bulkDialog" max-width="500">
      <VCard>
        <VCardTitle class="d-flex align-center">
          <VIcon start>mdi-file-excel</VIcon>
          Importar Excel
          <VSpacer />
          <VBtn variant="text" icon="mdi-close" @click="bulkDialog = false" />
        </VCardTitle>
        <VCardText>
          <VFileInput
            id="ass-bulk-file"
            v-model="bulkFile"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            accept=".xlsx,.xls"
            label="Archivo Excel"
          />
        </VCardText>
        <VCardText>
          <div class="d-flex justify-end">
            <VBtn id="ass-bulk-cancel-btn" class="mr-2" variant="outlined" @click="bulkDialog = false">Cancelar</VBtn>
            <VBtn id="ass-bulk-save-btn" color="primary" variant="elevated" :loading="bulkLoading" @click="processBulk">Importar</VBtn>
          </div>
        </VCardText>
      </VCard>
    </VDialog>
  </VContainer>
</template>

<script setup lang="ts">
  import { useAssistanceActions } from '~/composables/useAssistanceActions'
  import { buildApiParams } from '~/utils/buildApiParams'

  definePageMeta({
    title: 'Asistencias',
    icon: 'mdi-account-multiple-plus',
    permission: 'assistance-index',
    middleware: ['authenticated', 'permission'],
  })

  const { Assistance } = useRepository()
  const notify = useNotifyStore()
  const auth = useAuthStore()

  const filterInput = ref('')
  const filterAssistances = ref('')
  const filterOrgId = ref<string | number | null>(null)
  const orgFilterHidden = ref(false)
  const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 })
  const assistanceDialogDelete = ref(false)
  const dialogDelete = ref<Record<string, unknown>>({})
  const assistanceDialog = ref(false)
  const editDialog = ref(false)
  const editAssistanceRecord = ref<Record<string, unknown>>({})
  const savingAssistance = ref(false)
  const newAssistanceRecord = ref<Record<string, unknown>>(createNewAssistance())
  const loading = ref(false)
  const deleting = ref(false)
  const skipFilterWatch = ref(false)
  const { clearErrors, extractFromError } = useValidationErrors()

  const canCreate = computed(() => auth.hasPermission('assistance-create'))
  const canBulk = computed(() => auth.hasPermission('assistance-insert'))
  const bulkDialog = ref(false)
  const bulkFile = ref<File[]>([])
  const bulkLoading = ref(false)

  const lastOptions = ref<Record<string, unknown>>({
    page: 1,
    itemsPerPage: 10,
    sortBy: [{ key: 'assistance_date', order: 'desc' }],
  })

  const effectiveOrgId = computed(() => {
    const orgPermission = auth.permissionsOrg['assistance-index'] ?? []
    const orgs = auth.user?.orgs ?? []
    if (orgs.length === 1 && orgPermission.includes((orgs[0] as { id: unknown }).id)) {
      return (orgs[0] as { id: unknown }).id
    }
    return null
  })

  const { data: initialData } = await useAsyncData(
    'assistance-index',
    async () => {
      const apiParams = buildApiParams(lastOptions.value)
      return await Assistance.index<{ data: unknown[]; total: number }>(apiParams).catch(() => ({
        data: [],
        total: 0,
      }))
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) }
  )
  response.value = normalizeResponse(initialData.value)

  let initialLoaded = false

  function normalizeResponse(res: unknown): { data: unknown[]; total: number } {
    if (Array.isArray(res)) return { data: res, total: res.length }
    const r = res as { data?: unknown[]; total?: number } | null | undefined
    if (r && Array.isArray(r.data)) {
      return { data: r.data, total: r.total ?? r.data.length }
    }
    return { data: [], total: 0 }
  }

  useDebouncedFilter(filterInput, filterAssistances)

  watch(filterAssistances, val => {
    if (skipFilterWatch.value) {
      skipFilterWatch.value = false
      if (val === '' && filterInput.value !== '') {
        filterInput.value = ''
      }
      return
    }
    loadAssistances({ filter: val || '', page: 1 })
  })

  watch(filterOrgId, value => {
    if (effectiveOrgId.value) return
    const overrides: Record<string, unknown> = { page: 1 }
    overrides.org_id = value ?? undefined
    loadAssistances(overrides)
  })

  async function loadAssistances(overrides: Record<string, unknown> = {}) {
    try {
      loading.value = true

      const requestOptions = { ...lastOptions.value, ...overrides }

      if (filterAssistances.value && !Object.prototype.hasOwnProperty.call(overrides, 'filter')) {
        requestOptions.filter = filterAssistances.value
      }

      const params = buildApiParams(requestOptions)
      const res = await Assistance.index(params)
      response.value = normalizeResponse(res)
      lastOptions.value = requestOptions
    } catch (error) {
      console.error(error)
      notify.notify({ error: 'Error al cargar asistencias' })
    } finally {
      loading.value = false
    }
  }

  async function refreshAssistances() {
    await loadAssistances()
  }

  function handleSorting(opts: Record<string, unknown>) {
    if (!initialLoaded) {
      initialLoaded = true
      return
    }
    loadAssistances(opts)
  }

  function newAssistance() {
    clearErrors()
    newAssistanceRecord.value = createNewAssistance()
    assistanceDialog.value = true
  }

  function closeAssistanceDialog() {
    assistanceDialog.value = false
    clearErrors()
  }

  function openEditDialog(item: unknown) {
    clearErrors()
    const record = { ...(item as Record<string, unknown>) }
    if (typeof record.service_time === 'string') {
      record.service_time = record.service_time.slice(0, 5)
    }
    editAssistanceRecord.value = record
    editDialog.value = true
  }

  function closeEditDialog() {
    editDialog.value = false
    clearErrors()
  }

  async function saveEditAssistance(item: Record<string, unknown>) {
    const payload = { ...item }
    delete payload.org_id

    try {
      savingAssistance.value = true
      await Assistance.update(payload.id as number, payload)
      closeEditDialog()
      await loadAssistances()
    } catch (error) {
      extractFromError(error)
    } finally {
      savingAssistance.value = false
    }
  }

  function createNewAssistance(): Record<string, unknown> {
    const now = new Date()
    const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10)

    return {
      assistance_date: localToday,
      service_time: '09:45',
      adults: 0,
      teens: 0,
      kids: 0,
      babies: 0,
      newcomers: 0,
      notes: '',
    }
  }

  async function saveNewAssistance(item: Record<string, unknown>) {
    const payload = { ...item }
    if (payload.org_id && typeof payload.org_id === 'object') {
      payload.org_id = (payload.org_id as { id?: unknown }).id
    }

    try {
      savingAssistance.value = true
      await Assistance.create<{ data: Record<string, unknown> }>(payload)
      closeAssistanceDialog()
      await loadAssistances()
    } catch (error) {
      extractFromError(error)
    } finally {
      savingAssistance.value = false
    }
  }

  const { beforeDeleteAssistance, deleteAssistance } = useAssistanceActions({
    loadAssistances,
    routeQuery: () => ({ from: 'table' }),
    deleteReloadOverrides: () => ({ page: 1 }),
    assistanceDialogDelete,
    dialogDelete,
    deleting,
    skipFilterWatch,
    filterAssistances,
  })

  async function processBulk() {
    if (!bulkFile.value?.[0]) {
      notify.notify({ error: 'Seleccione un archivo' })
      return
    }

    try {
      bulkLoading.value = true
      const file = bulkFile.value[0]
      const XLSX = await import('xlsx')
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

      const rows = json.map((row: Record<string, unknown>) => {
        const date = row.fecha || row.date || row.assistance_date
        const time = row.hora || row.time || row.service_time
        return {
          org_id: effectiveOrgId.value || filterOrgId.value,
          assistance_date: typeof date === 'number' ? excelDateToISO(date) : date,
          service_time: typeof time === 'number' ? excelTimeToHHMM(time) : time,
          adults: Number(row.adults || row.adultos || 0),
          teens: Number(row.teens || row.jovenes || 0),
          kids: Number(row.kids || row.ninos || 0),
          babies: Number(row.babies || row.bebes || 0),
          newcomers: Number(row.newcomers || row.nuevos || 0),
          notes: row.notes || row.notas || '',
        }
      })

      await Assistance.bulk(rows)
      bulkDialog.value = false
      bulkFile.value = []
      await loadAssistances()
    } catch (error) {
      console.error(error)
      notify.notify({ error: 'Error al importar' })
    } finally {
      bulkLoading.value = false
    }
  }

  function excelDateToISO(serial: number): string {
    const epoch = new Date(1900, 0, serial - 1)
    return epoch.toISOString().slice(0, 10)
  }

  function excelTimeToHHMM(serial: number): string {
    const totalMinutes = Math.round(serial * 1440)
    const h = Math.floor(totalMinutes / 60)
    const m = totalMinutes % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }
</script>

<style scoped></style>
