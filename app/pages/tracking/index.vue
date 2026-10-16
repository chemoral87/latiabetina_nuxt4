<template>
  <VContainer :fluid="true" class="page-tracking">
    <VSheet rounded color="white">
      <VRow density="compact">
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

        <VCol md="2" sm="4" cols="6">
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

        <VCol cols="auto" class="d-flex align-center">
          <VCheckbox
            id="seg-has-phone-chk"
            v-model="filterHasPhone"
            hide-details
            density="compact"
            label="Con teléfono"
          />
        </VCol>

        <VCol cols="auto" class="d-flex align-center">
          <VBtn
            id="seg-refresh-btn"
            color="primary"
            :loading="loading"
            variant="outlined"
            @click="fetchData"
          >
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
        </VCol>

        <VCol cols="12">
          <TrackingTable
            :orgs="orgs"
            :total="total"
            :loading="loading"
            :members="members"
            @view="viewMember"
            @update:options="onUpdateOptions"
          />
        </VCol>
      </VRow>
    </VSheet>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Seguimiento",
  icon: "mdi-account-search",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
  color: "purple-lighten-4",
});

const { ChurchMember } = useRepository();
const notify = useNotifyStore();
const auth = useAuthStore();
const { statuses: statusOptions } = useChurchMemberStatus();

const filterInput = ref("");
const filterTerm = ref("");
const filterStatus = ref("ACTIVO");
const filterOrgId = ref<string | number | null>(null);
const filterHasPhone = ref(true);
const loading = ref(false);
const members = ref<Record<string, unknown>[]>([]);
const total = ref(0);
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "last_contacted", order: "asc" },
]);
const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
});

const showOrgSelect = computed(
  () => auth.orgIdsFor("conso-sheet-index").length > 1,
);

const orgs = computed(
  () =>
    (auth.user?.orgs as { id: number | string; name: string }[] | undefined) ??
    [],
);

function viewMember(item: unknown) {
  const id = (item as Record<string, unknown> | undefined)?.id;
  if (id != null) navigateTo(`/church-member/${id}?from=tracking`);
}

function onUpdateOptions(opts: Record<string, unknown>) {
  lastOptions.value = { ...lastOptions.value, ...opts };
  const newSortBy = (opts.sortBy as { key: string; order: string }[]) ?? [];
  if (newSortBy.length) {
    sortBy.value = newSortBy;
  }
  fetchData();
}

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterTerm);

function normalizeResponse(res: unknown): {
  data: Record<string, unknown>[];
  total: number;
} {
  if (Array.isArray(res)) {
    return { data: res as Record<string, unknown>[], total: res.length };
  }
  const r = res as { data?: unknown[]; total?: number } | null | undefined;
  if (r && Array.isArray(r.data)) {
    return {
      data: r.data as Record<string, unknown>[],
      total: r.total ?? r.data.length,
    };
  }
  return { data: [], total: 0 };
}

async function fetchData() {
  loading.value = true;
  const params: Record<string, unknown> = {
    mine: true,
    page: lastOptions.value.page,
    itemsPerPage: lastOptions.value.itemsPerPage,
  };
  if (filterStatus.value) params.status = filterStatus.value;
  if (filterTerm.value) params.filter = filterTerm.value;
  if (filterOrgId.value) params.org_id = filterOrgId.value;
  if (filterHasPhone.value) params.has_phone = true;

  if (sortBy.value.length) {
    params["sortBy"] = sortBy.value.map((s) => s.key);
    params["sortDesc"] = sortBy.value.map((s) =>
      s.order === "desc" ? "true" : "false",
    );
  }

  try {
    const res = await ChurchMember.index<unknown>(params);
    const norm = normalizeResponse(res);
    members.value = norm.data;
    total.value = norm.total;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar miembros",
    });
    members.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

watch(filterStatus, fetchData);
watch(filterOrgId, fetchData);
watch(filterTerm, fetchData);
watch(filterHasPhone, fetchData);
</script>

<style scoped></style>
