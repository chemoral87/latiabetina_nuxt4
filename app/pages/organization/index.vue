<template>
  <VContainer :fluid="true">
    <VRow>
      <VCol md="2" sm="6" cols="12">
        <VTextField
          id="org-index-filterorganization-tf-1"
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
          id="org-refresh-btn"
          class="mr-4"
          color="primary"
          :loading="loading"
          @click="refresh"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="org-new-btn" color="success" @click="newOrganization()">
          <VIcon start>mdi-plus</VIcon>
          Nueva Organización
        </VBtn>
      </VCol>

      <VCol cols="12">
        <OrganizationTable
          v-model:dialog-delete="dialogDeleteOrganization"
          :loading="loading"
          :response="response"
          :removing-id="removingId"
          :highlight-id="highlightId"
          :search="filterOrganization"
          :initial-sort-by="(lastOptions.sortBy as any)"
          @config="goConfig"
          @edit="editOrganization"
          @sorting="handleSorting"
          @delete="deleteOrganization"
        />
      </VCol>
    </VRow>

    <OrganizationFormDialog
      v-if="organizationFormDialog"
      :loading="saving"
      :organization="organization"
      @save="saveOrganization"
      @close="closeFormDialog()"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Organizaciones",
  icon: "mdi-domain",
  permission: "organization-index",
  middleware: ["authenticated", "permission"],
});

const dialogDeleteOrganization = ref(false);
const organizationFormDialog = ref(false);
const response = ref({});
const filterInput = ref("");
const filterOrganization = ref("");
const loading = ref(false);
const saving = ref(false);
const organization = ref<Record<string, unknown> | null>(null);
const {
  highlightId,
  prependCreated,
  updateRow,
  removingId,
  removeWithAnimation,
} = useRowHighlight();

const { Organization } = useRepository();

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 5,
  sortBy: [{ key: "name", order: "asc" }],
});

// Top-level await — loads initial data before render (asyncData equivalent)
{
  const apiParams = buildApiParams(lastOptions.value);
  const initialResponse = await Organization.index(apiParams).catch(() => ({
    data: [],
    total: 0,
  }));
  response.value = initialResponse as { data: unknown[]; total: number };
}

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterOrganization)

async function indexOrganizations(opts: Record<string, unknown>) {
  lastOptions.value = opts;
  const params = buildApiParams(opts);
  if (filterOrganization.value && !params.filter) params.filter = filterOrganization.value;
  try {
    loading.value = true;
    response.value = await Organization.index(params);
  } finally {
    loading.value = false;
  }
}

let initialLoaded = false;

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true;
    return;
  }
  indexOrganizations(opts);
}

function refresh() {
  if (lastOptions.value) {
    indexOrganizations(lastOptions.value);
  }
}

function goConfig(item: Record<string, unknown>) {
  navigateTo(`/organization/${item.id}/config`);
}

function newOrganization() {
  useValidationErrors().clearErrors();
  organization.value = {};
  organizationFormDialog.value = true;
}

function editOrganization(item: Record<string, unknown>) {
  useValidationErrors().clearErrors();
  organization.value = { ...item };
  organizationFormDialog.value = true;
}

async function deleteOrganization(item: Record<string, unknown>) {
  try {
    await Organization.delete(item.id as number);
    dialogDeleteOrganization.value = false;
    await removeWithAnimation(response, item.id as number);
  } catch (e) {
    console.error(e);
  }
}

async function saveOrganization(item: Record<string, unknown>) {
  saving.value = true;
  try {
    if (item.id) {
      const res = await Organization.update<Record<string, unknown>>(
        item.id as number,
        item,
      );
      const updated = (res as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      if (updated) {
        updateRow(response, updated);
      }
    } else {
      const res = await Organization.create<Record<string, unknown>>(item);
      const created = (res as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      if (created) {
        prependCreated(response, created);
      }
    }
    organizationFormDialog.value = false;
  } catch (e) {
    console.error(e);
  } finally {
    saving.value = false;
  }
}

function closeFormDialog() {
  organizationFormDialog.value = false;
  useValidationErrors().clearErrors();
}
</script>
