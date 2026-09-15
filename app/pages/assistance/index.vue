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

    <DialogDelete
      v-if="assistanceDialogDelete"
      :loading="deleting"
      :dialog="dialogDelete"
      @ok="deleteAssistance"
      @close="assistanceDialogDelete = false"
    />
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
  const savingAssistance = ref(false)
  const newAssistanceRecord = ref<Record<string, unknown>>(createNewAssistance())
  const deleting = ref(false)
  const skipFilterWatch = ref(false)
  const { clearErrors, extractFromError } = useValidationErrors()

  const canCreate = computed(() => auth.hasPermission('assistance-create'))

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
      notify.notify({ success: 'Asistencia creada correctamente.' })
      closeAssistanceDialog()
      await loadAssistances()
    } catch (error) {
      extractFromError(error)
      const response = (error as { response?: { status?: number } })?.response
      notify.notify({
        error: response?.status === 422 ? 'Error de validación' : 'Error al crear la asistencia',
      })
      console.error('Error al crear asistencia', error)
    } finally {
      savingAssistance.value = false
    }
  }

  const { beforeDeleteAssistance, deleteAssistance, editAssistance } = useAssistanceActions({
    loadAssistances,
    routeQuery: () => ({ from: 'table' }),
    deleteReloadOverrides: () => ({ page: 1 }),
    assistanceDialogDelete,
    dialogDelete,
    deleting,
    skipFilterWatch,
    filterAssistances,
  })
</script>

<style scoped></style>
