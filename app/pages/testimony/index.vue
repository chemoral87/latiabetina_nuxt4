<template>
  <VContainer fluid>
    <VRow density="comfortable" align="center">
      <VCol md="4" sm="6" cols="12">
        <VTextField
          id="tes-index-filtertestimony-tf-1"
          v-model="filterTestimony"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Filtro"
          prepend-inner-icon="mdi-magnify"
        />
      </VCol>

      <VCol md="3" sm="6" cols="12">
        <MyDateRange v-model="filterDateRange" variant="outlined" />
      </VCol>

      <VCol md="2" sm="4" cols="12">
        <VSelect
          id="tes-status-sel"
          v-model="statusFilter"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Estado"
          :items="[
            { title: 'Pendientes', value: '' },
            { title: 'Aprobados', value: 'approved' },
            { title: 'Rechazados', value: 'rejected' },
          ]"
          @update:model-value="onStatusChange"
        />
      </VCol>

      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="tes-refresh-btn"
          class="mr-1"
          color="primary"
          :loading="loading"
          @click="refreshTestimonies"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn
          id="tes-new-btn"
          class="mr-1"
          color="success"
          @click="newTestimony"
        >
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
      </VCol>

      <VCol
        v-if="!orgFilterHidden"
        lg="1"
        md="3"
        sm="4"
        cols="6"
      >
        <OrganizationSelect
          v-model="filterOrgId"
          v-model:hidden="orgFilterHidden"
          hide-one
          clearable
          hide-details
          density="compact"
          variant="outlined"
          prevent-auto-select
          permission="testimony-index"
        />
      </VCol>

      <VCol cols="12">
        <TestimonyTable
          :loading="loading"
          :response="response"
          :search="filterTestimony"
          :highlight-id="highlightId"
          :initial-sort-by="(lastOptions.sortBy as any)"
          @edit="editTestimony"
          @show="showTestimony"
          @sorting="handleSorting"
          @delete="beforeDeleteTestimony"
        />
      </VCol>
    </VRow>

    <TestimonyDialog
      v-if="testimonyDialog"
      :loading="saving"
      :testimony="testimony"
      @close="closeDialog"
      @save="saveTestimony"
    />

    <DialogDelete
      v-if="testimonyDialogDelete"
      :loading="deleting"
      :dialog="dialogDelete"
      @ok="deleteTestimony"
      @close="testimonyDialogDelete = false"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { buildApiParams } from "~/utils/buildApiParams";
import { useRowHighlight } from "~/composables/useRowHighlight";

definePageMeta({
  title: "Testimonios",
  icon: "mdi-comment-text-outline",
  middleware: "authenticated",
});

const { Testimony } = useRepository();
const notify = useNotifyStore();
const auth = useAuthStore();
const { highlightId, prependCreated, updateRow } = useRowHighlight();

const filterTestimony = ref("");
const filterDateRange = ref<(string | null)[]>([]);
const statusFilter = ref("");
const filterOrgId = ref<string | number | null>(null);
const orgFilterHidden = ref(false);
const testimony = ref<Record<string, unknown>>({});
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const testimonyDialog = ref(false);
const testimonyDialogDelete = ref(false);
const dialogDelete = ref<Record<string, unknown>>({});
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const skipFilterWatch = ref(false);

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "created_at", order: "desc" }],
});

const effectiveOrgId = computed(() => {
  const orgPermission = auth.permissionsOrg["testimony-index"] ?? [];
  const orgs = auth.user?.orgs ?? [];
  if (
    orgs.length === 1 &&
    orgPermission.includes((orgs[0] as { id: unknown }).id)
  ) {
    return (orgs[0] as { id: unknown }).id;
  }
  return null;
});

// Initial load (asyncData equivalent)
{
  const apiParams = buildApiParams(lastOptions.value);
  const initialResponse = await Testimony.index(apiParams).catch(() => ({
    data: [],
    total: 0,
  }));
  response.value = initialResponse as { data: unknown[]; total: number };
}

let initialLoaded = false;

// Debounced filter — matches project convention (manual setTimeout)
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(filterTestimony, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false;
    return;
  }
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadTestimonies({ filter: val || "", page: 1 });
  }, 500);
});

watch(filterOrgId, (value) => {
  // When user has only 1 org, never send org_id — backend resolves it.
  if (effectiveOrgId.value !== null) return;
  const overrides: Record<string, unknown> = { page: 1 };
  overrides.org_id = value ?? undefined;
  loadTestimonies(overrides);
});

watch(filterDateRange, (value) => {
  const range =
    value && value.length > 0 ? ([...value].sort() as string[]) : [];
  loadTestimonies({
    page: 1,
    date_from: range[0] || undefined,
    date_to: range[1] || undefined,
  });
});

async function loadTestimonies(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true;

    const requestOptions = { ...lastOptions.value, ...overrides };
    if (
      filterTestimony.value &&
      !Object.prototype.hasOwnProperty.call(overrides, "filter")
    ) {
      requestOptions.filter = filterTestimony.value;
    }
    if (
      statusFilter.value &&
      !Object.prototype.hasOwnProperty.call(overrides, "status")
    ) {
      requestOptions.status = statusFilter.value;
    }
    if (
      Object.prototype.hasOwnProperty.call(overrides, "date_from") &&
      !overrides.date_from
    ) {
      delete requestOptions.date_from;
    }
    if (
      Object.prototype.hasOwnProperty.call(overrides, "date_to") &&
      !overrides.date_to
    ) {
      delete requestOptions.date_to;
    }

    const params = buildApiParams(requestOptions);
    response.value = await Testimony.index(params);
    lastOptions.value = requestOptions;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al cargar testimonios",
    });
  } finally {
    loading.value = false;
  }
}

async function onStatusChange(value: unknown) {
  await loadTestimonies({ page: 1, status: value });
}

async function refreshTestimonies() {
  await loadTestimonies();
}

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded
    initialLoaded = true;
    return;
  }
  loadTestimonies(opts);
}

function newTestimony() {
  useValidationErrors().clearErrors();
  testimony.value = {};
  testimonyDialog.value = true;
}

function editTestimony(item: unknown) {
  useValidationErrors().clearErrors();
  testimony.value = { ...(item as Record<string, unknown>) };
  testimonyDialog.value = true;
}

function showTestimony(item: unknown) {
  navigateTo(`/testimony/review/${(item as Record<string, unknown>).id}`);
}

function beforeDeleteTestimony(item: unknown) {
  const t = item as Record<string, unknown>;
  dialogDelete.value = {
    text: "¿Desea eliminar el Testimonio ",
    strong: (t.title as string) || String(t.id),
    payload: item,
  };
  testimonyDialogDelete.value = true;
}

async function deleteTestimony(item: unknown) {
  const t = item as Record<string, unknown>;
  try {
    deleting.value = true;
    await Testimony.delete(t.id as number);
    skipFilterWatch.value = true;
    filterTestimony.value = "";
    await loadTestimonies({ page: 1, filter: "" });
    testimonyDialogDelete.value = false;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al eliminar testimonio",
    });
  } finally {
    deleting.value = false;
  }
}

async function saveTestimony(item: Record<string, unknown>) {
  try {
    saving.value = true;
    const isUpdate = Boolean(item.id);
    let saved: Record<string, unknown> | null = null;
    if (isUpdate) {
      const res = await Testimony.update<Record<string, unknown>>(
        item.id as number,
        item,
      );
      saved =
        ((res as Record<string, unknown>)?.data as
          | Record<string, unknown>
          | undefined) ||
        ((res as Record<string, unknown>)?.testimony as
          | Record<string, unknown>
          | undefined) ||
        (res as Record<string, unknown>);

      if (saved) {
        updateRow(response, saved);
      }
    } else {
      const res = await Testimony.create<Record<string, unknown>>(item);
      saved =
        ((res as Record<string, unknown>)?.data as
          | Record<string, unknown>
          | undefined) ||
        ((res as Record<string, unknown>)?.testimony as
          | Record<string, unknown>
          | undefined) ||
        (res as Record<string, unknown>);

      if (saved) {
        prependCreated(response, saved);
      }
    }

    notify.notify({
      success: `Testimonio ${isUpdate ? "actualizado" : "creado"} exitosamente`,
    });
    testimonyDialog.value = false;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ||
        `Error al ${item.id ? "actualizar" : "crear"} testimonio`,
    });
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  testimonyDialog.value = false;
  testimony.value = {};
  useValidationErrors().clearErrors();
}
</script>

<style scoped></style>
