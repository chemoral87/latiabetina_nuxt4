<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <VCol v-if="showOrgSelect" lg="2" md="3" sm="4" cols="6">
        <OrganizationSelect
          v-model="filterOrgId"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          prevent-auto-select
          permission="conso-sheet-index"
        />
      </VCol>

      <VCol md="2" sm="4" cols="12">
        <VSelect
          id="seg-index-status"
          v-model="filterStatus"
          clearable
          hide-details
          label="Estado"
          density="compact"
          variant="outlined"
          :items="statusOptions"
        />
      </VCol>

      <VCol md="2" sm="4" cols="12">
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

      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="seg-refresh-btn"
          color="primary"
          :loading="loading"
          @click="fetchData"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>

      <VCol cols="12">
        <TrackingTable
          :members="members"
          :loading="loading"
          :orgs="orgs"
          @view="viewMember"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Tracking",
  icon: "mdi-account-search",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
})

const { ChurchMember } = useRepository()
const notify = useNotifyStore()
const auth = useAuthStore()
const { statuses: statusOptions } = useChurchMemberStatus()

const filterInput = ref("")
const filterTerm = ref("")
const filterStatus = ref("ACTIVO")
const filterOrgId = ref<string | number | null>(null)
const loading = ref(false)
const members = ref<Record<string, unknown>[]>([])



const showOrgSelect = computed(
  () => auth.orgIdsFor("conso-sheet-index").length > 1,
)

const orgs = computed(
  () =>
    (auth.user?.orgs as { id: number | string; name: string }[] | undefined) ??
    [],
)

function viewMember(item: unknown) {
  const id = (item as Record<string, unknown> | undefined)?.id
  if (id != null) navigateTo(`/church-member/${id}?from=tracking`)
}

// Debounced filter — 300ms, matches the index page pattern.
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val) {
    filterTerm.value = ""
    return
  }
  debounceTimer = setTimeout(() => {
    filterTerm.value = val
  }, 300)
})

function normalizeMembers(res: unknown): Record<string, unknown>[] {
  if (Array.isArray(res)) return res as Record<string, unknown>[]
  const r = res as { data?: unknown[] } | null | undefined
  if (r && Array.isArray(r.data)) return r.data as Record<string, unknown>[]
  return []
}

async function fetchData() {
  loading.value = true
  const params: Record<string, unknown> = { mine: true }
  if (filterStatus.value) params.status = filterStatus.value
  if (filterTerm.value) params.filter = filterTerm.value
  if (filterOrgId.value) params.org_id = filterOrgId.value
  try {
    const res = await ChurchMember.index<unknown>(params)
    members.value = normalizeMembers(res)
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar miembros",
    })
    members.value = []
  } finally {
    loading.value = false
  }
}

watch(filterStatus, fetchData)
watch(filterOrgId, fetchData)
watch(filterTerm, fetchData)

// Initial list data is loaded during SSR via useAsyncData so the payload is
// reused on the client (no double fetch, no hydration mismatch).
{
  const { data: initialData } = await useAsyncData(
    "tracking-index",
    async () =>
      await ChurchMember.index<unknown>({ mine: true, status: "ACTIVO" }).catch(
        () => [] as unknown,
      ),
    { default: () => [] as unknown },
  )

  members.value = normalizeMembers(initialData.value)
}
</script>

<style scoped></style>