<template>
  <VContainer :fluid="true" class="page-tracking">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol md="2" sm="4" cols="6">
          <VTextField
            id="seg-index-filter"
            v-model="filterInput"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            placeholder="Filtro"
            append-inner-icon="mdi-magnify"
          />
        </VCol>
        <VCol md="2" sm="4" cols="6">
          <VSelect id="seg-index-status" v-model="filterStatus" clearable hide-details label="Estado" density="compact" variant="outlined" :items="statusOptions" />
        </VCol>
        <VCol md="2" sm="4" cols="6">
          <VSelect id="seg-index-gender" v-model="filterGender" hide-details label="Género" density="compact" variant="outlined" :items="trackingGenderOptions">
            <template #item="{ item, props }">
              <VListItem v-bind="props">
                <template v-if="genderMeta(item).icon" #prepend>
                  <VIcon :color="genderMeta(item).color">{{ genderMeta(item).icon }}</VIcon>
                </template>
              </VListItem>
            </template>
            <template #selection="{ item }">
              <VIcon v-if="genderMeta(item).icon" class="mr-1" size="small" :color="genderMeta(item).color">{{ genderMeta(item).icon }}</VIcon>
              {{ item.title }}
            </template>
          </VSelect>
        </VCol>
        <VCol v-if="showOrgSelect" lg="1" md="2" sm="3" cols="6">
          <OrganizationSelect v-model="filterOrgId" clearable hide-details density="compact" variant="outlined" prevent-auto-select permission="conso-sheet-index" />
        </VCol>

        <VCol cols="auto" class="d-flex align-center">
          <VBtn id="seg-refresh-btn" color="primary" :loading="loading" variant="elevated" @click="fetchData">
            <VIcon start>mdi-magnify</VIcon>
            Buscar
          </VBtn>
        </VCol>

        <VCol cols="12">
          <TrackingTable :orgs="orgs" :total="total" :loading="loading" :members="members" @view="viewMember" @update:options="onUpdateOptions" />
        </VCol>
      </VRow>
    </VSheet>
  </VContainer>
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'Seguimiento',
    icon: 'mdi-account-search',
    permission: 'conso-sheet-index',
    middleware: ['authenticated', 'permission'],
    color: 'purple-lighten-4',
  })

  import { GENDER_OPTIONS } from '~/constants/churchMember'

  const { ChurchMember } = useRepository()
  const notify = useNotifyStore()
  const auth = useAuthStore()
  const { statuses: statusOptions } = useChurchMemberStatus()
  const route = useRoute()
  const router = useRouter()

  const genderOptions = GENDER_OPTIONS

  // Tracking page gender filter: "Todos" (null) + Masculino/Femenino.
  const trackingGenderOptions = [{ title: 'Todos', value: null }, ...GENDER_OPTIONS]

  type GenderListItem = { icon?: string; color?: string; raw?: { icon?: string; color?: string } }

  // Vuetify may hand the slot the raw item or a transformed one — support both.
  function genderMeta(item: GenderListItem) {
    return {
      icon: item?.icon ?? item?.raw?.icon,
      color: item?.color ?? item?.raw?.color,
    }
  }

  // Restore filters from URL query so they survive page refresh.
  const filterInput = ref((route.query.filter as string) || '')
  const filterTerm = ref((route.query.filter as string) || '')
  const filterStatus = ref((route.query.status as string) || 'ACTIVO')
  const filterOrgId = ref<string | number | null>((route.query.org_id as string) || null)
  const filterGender = ref<string | null>((route.query.gender as string) || null)
  const loading = ref(false)
  const members = ref<Record<string, unknown>[]>([])
  const total = ref(0)
  const sortBy = ref<{ key: string; order: string }[]>([{ key: 'last_contacted', order: 'asc' }])
  const lastOptions = ref<Record<string, unknown>>({
    page: 1,
    itemsPerPage: 10,
  })

  const showOrgSelect = computed(() => auth.orgIdsFor('conso-sheet-index').length > 1)

  const orgs = computed(() => (auth.user?.orgs as { id: number | string; name: string }[] | undefined) ?? [])

  function viewMember(item: unknown) {
    const id = (item as Record<string, unknown> | undefined)?.id
    if (id != null) navigateTo(`/church-member/${id}?from=tracking`)
  }

  function onUpdateOptions(opts: Record<string, unknown>) {
    lastOptions.value = { ...lastOptions.value, ...opts }
    const newSortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
    if (newSortBy.length) {
      sortBy.value = newSortBy
    }
    fetchData()
  }

  // Debounced filter — shared useDebouncedFilter (300ms immediate clear)
  useDebouncedFilter(filterInput, filterTerm)

  function normalizeResponse(res: unknown): {
    data: Record<string, unknown>[]
    total: number
  } {
    if (Array.isArray(res)) {
      return { data: res as Record<string, unknown>[], total: res.length }
    }
    const r = res as { data?: unknown[]; total?: number } | null | undefined
    if (r && Array.isArray(r.data)) {
      return {
        data: r.data as Record<string, unknown>[],
        total: r.total ?? r.data.length,
      }
    }
    return { data: [], total: 0 }
  }

  async function fetchData() {
    loading.value = true
    const params: Record<string, unknown> = {
      mine: true,
      page: lastOptions.value.page,
      itemsPerPage: lastOptions.value.itemsPerPage,
    }
    if (filterStatus.value) params.status = filterStatus.value
    if (filterTerm.value) params.filter = filterTerm.value
    if (filterOrgId.value) params.org_id = filterOrgId.value
    params.has_phone = true
    if (filterGender.value) params.gender = filterGender.value

    if (sortBy.value.length) {
      params['sortBy'] = sortBy.value.map(s => s.key)
      params['sortDesc'] = sortBy.value.map(s => (s.order === 'desc' ? 'true' : 'false'))
    }

    try {
      const res = await ChurchMember.index<unknown>(params)
      const norm = normalizeResponse(res)
      members.value = norm.data
      total.value = norm.total

      // Persist filters to URL so they survive page refresh.
      const q: Record<string, string> = {}
      if (filterInput.value) q.filter = filterInput.value
      if (filterStatus.value) q.status = filterStatus.value
      if (filterOrgId.value) q.org_id = String(filterOrgId.value)
      if (filterGender.value) q.gender = filterGender.value
      router.replace({ query: q })
    } catch (error) {
      notify.notify({
        error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Error al cargar miembros',
      })
      members.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  watch(filterStatus, fetchData)
  watch(filterOrgId, fetchData)
  watch(filterTerm, fetchData)
  watch(filterGender, fetchData)

  // Persist filters to URL inside fetchData so the query always reflects
  // the actual state used for the last request (debounced filter included).
</script>

<style scoped></style>
