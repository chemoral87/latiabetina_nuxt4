<template>
  <VContainer class="" :fluid="true">
    <VSheet variant="outlined">
      <VSheet>
        <VRow density="compact">
          <!-- Filter -->
          <VCol md="4" cols="12">
            <VTextField
              id="pro-index-filter"
              v-model="filterInput"
              clearable
              hide-details
              density="compact"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              placeholder="Buscar por profesión o nombre..."
            />
          </VCol>

          <!-- Action buttons -->
          <VCol cols="auto" class="d-flex align-center">
            <VBtn
              id="pro-refresh-btn"
              class="mr-4"
              color="primary"
              :loading="loading"
              variant="outlined"
              @click="refreshProfessionals"
            >
              <VIcon start>mdi-reload</VIcon>
              Refrescar
            </VBtn>
            <ClientOnly>
              <VBtn
                v-if="auth.loggedIn"
                id="pro-new-btn"
                color="success"
                @click="navigateTo('/professional/new')"
              >
                <VIcon start>mdi-plus</VIcon>
                Publicar Servicio
              </VBtn>
            </ClientOnly>
          </VCol>

          <!-- Professional table -->
          <VCol cols="12">
            <ProfessionalTable
              :loading="loading"
              :response="response"
              :search="filterProfessional"
              :initial-sort-by="lastOptions.sortBy"
              @sorting="handleSorting"
            />
          </VCol>
        </VRow>
      </VSheet>
    </VSheet>
  </VContainer>
</template>

<script setup lang="ts">
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Profesionales",
  icon: "mdi-account-search",
});

const { Professional } = useRepository();
const auth = useAuthStore();

const filterInput = ref("");
const filterProfessional = ref("");
const response = ref<{ data: unknown[]; total: number }>({ data: [], total: 0 });
const loading = ref(false);

const lastOptions = ref<{ page: number; itemsPerPage: number; sortBy: { key: string; order: string }[] }>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "created_at", order: "desc" }],
});

// Initial list data loaded during SSR via useAsyncData so the payload is reused
// on the client. Public page — no permission middleware. See
// ai_rule/ssr_and_data_loading.md.
{
  const apiParams = buildApiParams(lastOptions.value);
  const { data: initialData } = await useAsyncData(
    "professional-index",
    async () => {
      return await Professional.search<{ data: unknown[]; total: number }>(apiParams).catch(() => ({
        data: [] as unknown[],
        total: 0,
      }));
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  );

  response.value = initialData.value;
}

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterProfessional);

async function loadProfessionals(opts: { page: number; itemsPerPage: number; sortBy: { key: string; order: string }[] }) {
  try {
    loading.value = true;
    lastOptions.value = opts;
    const params = buildApiParams(opts);
    if (filterProfessional.value && !params.filter) params.filter = filterProfessional.value;
    response.value = await Professional.search(params);
  } catch (e) {
    console.error("Error al cargar profesionales", e);
  } finally {
    loading.value = false;
  }
}

async function refreshProfessionals() {
  if (lastOptions.value) {
    await loadProfessionals(lastOptions.value);
  }
}

let initialLoaded = false;

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true;
    return;
  }
  loadProfessionals(opts as { page: number; itemsPerPage: number; sortBy: { key: string; order: string }[] });
}
</script>

<style scoped>
:deep(.v-sheet) {
  margin: 0;
  padding: 0;
  border: none;
  background-color: #ffffff;
}
</style>
