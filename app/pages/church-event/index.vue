<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <!-- Filtro de busqueda -->
      <VCol md="2" cols="12">
        <VTextField
          id="eve-index-filter"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Buscar evento..."
          append-inner-icon="mdi-magnify"
        />
      </VCol>

      <!-- Botones de accion -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="chrcev-refresh-btn"
          class="mr-1"
          color="primary"
          :loading="loading"
          @click="refreshChurchEvents"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn
          id="chrcev-new-btn"
          class="mr-1"
          color="success"
          @click="newChurchEvent"
        >
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
        <VBtn
          id="chrcev-calendar-btn"
          color="primary"
          variant="outlined"
          to="/church-event/calendar"
        >
          <VIcon start>mdi-calendar-month</VIcon>
          Calendario
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
          permission="church-event-index"
        />
      </VCol>

      <!-- Tabla de eventos -->
      <VCol cols="12">
        <ChurchEventTable
          :loading="loading"
          :response="response"
          :search="filterChurchEvent"
          @copy="openCopyDialog"
          @edit="editChurchEvent"
          @sorting="handleSorting"
          @delete="beforeDeleteChurchEvent"
        />
      </VCol>
    </VRow>

    <!-- Dialogo de copiar evento en varias fechas -->
    <ChurchEventCopyDialog
      v-if="churchEventDialogCopy"
      :loading="copying"
      :church-event="copyingChurchEvent"
      @copy="copyChurchEvent"
      @close="churchEventDialogCopy = false"
    />

    <!-- Dialogo de confirmacion de eliminacion -->
    <DialogDelete
      v-if="churchEventDialogDelete"
      :loading="deleting"
      :dialog="dialogDelete"
      @ok="deleteChurchEvent"
      @close="churchEventDialogDelete = false"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useChurchEventActions } from "~/composables/useChurchEventActions";

definePageMeta({
  title: "Eventos de Iglesia",
  icon: "mdi-calendar",
  permission: "church-event-index",
  middleware: ["authenticated", "permission"],
});

const { ChurchEvent } = useRepository();
const notify = useNotifyStore();
const auth = useAuthStore();

const filterInput = ref("");
const filterChurchEvent = ref("");
const filterOrgId = ref<string | number | null>(null);
const orgFilterHidden = ref(false);
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const churchEventDialogDelete = ref(false);
const dialogDelete = ref<Record<string, unknown>>({});
const churchEventDialogCopy = ref(false);
const copyingChurchEvent = ref<Record<string, unknown>>({});
const copying = ref(false);
const loading = ref(false);
const deleting = ref(false);
const skipFilterWatch = ref(false);

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "event_date", order: "desc" }],
});

// Computed: the org id when the user has exactly 1 org, else null. The
// backend resolves the org from the auth context — never send org_id for
// single-org users (see index_page_table_pattern.md).
const effectiveOrgId = computed(() => {
  const orgPermission = auth.permissionsOrg["church-event-index"] ?? [];
  const orgs = auth.user?.orgs ?? [];
  if (
    orgs.length === 1 &&
    orgPermission.includes((orgs[0] as { id: unknown }).id)
  ) {
    return (orgs[0] as { id: unknown }).id;
  }
  return null;
});

// SSR initial load — first paint contains the list (no hydration mismatch,
// see nuxt4_ssr_hydration.md). NOTE: no org_id here — the backend resolves
// the org from auth context.
const { data: initialData } = await useAsyncData(
  "church-event-index",
  async () => {
    const apiParams: Record<string, unknown> = {
      page: 1,
      itemsPerPage: 10,
      sortBy: ["event_date"],
      sortDesc: [true],
    };
    return await ChurchEvent.index<{ data: unknown[]; total: number }>(
      apiParams,
    ).catch(() => ({ data: [], total: 0 }));
  },
  { default: () => ({ data: [] as unknown[], total: 0 }) },
);
response.value = normalizeResponse(initialData.value);

let initialLoaded = false;

function normalizeResponse(res: unknown): { data: unknown[]; total: number } {
  if (Array.isArray(res)) return { data: res, total: res.length };
  const r = res as { data?: unknown[]; total?: number } | null | undefined;
  if (r && Array.isArray(r.data)) {
    return { data: r.data, total: r.total ?? r.data.length };
  }
  return { data: [], total: 0 };
}

// Debounced filter (300ms): the input ref feeds the API-driving ref, and the
// clear is immediate (never debounced) — see index_page_table_pattern.md.
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val) {
    filterChurchEvent.value = "";
    return;
  }
  debounceTimer = setTimeout(() => {
    filterChurchEvent.value = val;
  }, 300);
});

watch(filterChurchEvent, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false;
    // External clear (e.g. after delete) — mirror it back to the input
    if (val === "" && filterInput.value !== "") {
      filterInput.value = "";
    }
    return;
  }
  loadChurchEvents({ filter: val || "", page: 1 });
});

watch(filterOrgId, (value) => {
  // When user has only 1 org, never send org_id — backend resolves it.
  if (effectiveOrgId.value) return;
  const overrides: Record<string, unknown> = { page: 1 };
  overrides.org_id = value ?? undefined;
  loadChurchEvents(overrides);
});

async function loadChurchEvents(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true;

    const requestOptions = { ...lastOptions.value, ...overrides };

    if (
      filterChurchEvent.value &&
      !Object.prototype.hasOwnProperty.call(overrides, "filter")
    ) {
      requestOptions.filter = filterChurchEvent.value;
    }

    const params = buildApiParams(requestOptions);
    const res = await ChurchEvent.index(params);
    response.value = normalizeResponse(res);
    lastOptions.value = requestOptions;
  } catch (error) {
    console.error(error);
    notify.notify({ error: "Error al cargar eventos de iglesia" });
  } finally {
    loading.value = false;
  }
}

function buildApiParams(
  opts: Record<string, unknown>,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    itemsPerPage: opts.itemsPerPage ?? 10,
  };
  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? [];
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key];
    params.sortDesc = [sortBy[0].order === "desc"];
  }
  if (opts.filter) params.filter = opts.filter;
  if (opts.org_id) params.org_id = opts.org_id;
  return params;
}

async function refreshChurchEvents() {
  await loadChurchEvents();
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    initialLoaded = true;
    return;
  }
  loadChurchEvents(opts);
}

function newChurchEvent() {
  navigateTo({ path: "/church-event/new", query: { from: "table" } });
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
});
</script>

<style scoped></style>
