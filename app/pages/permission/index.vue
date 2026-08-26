<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Filter -->
      <VCol md="2" cols="12">
        <VTextField
          id="per-index-filter-tf-1"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          append-inner-icon="mdi-magnify"
          placeholder="Buscar permiso..."
        />
      </VCol>

      <!-- Action buttons -->
      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="per-refresh-btn"
          class="mr-4"
          color="primary"
          :loading="loading"
          @click="refreshPermissions"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn id="per-new-btn" color="success" @click="newPermission">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Permiso
        </VBtn>
      </VCol>

      <!-- Permission table -->
      <VCol cols="12">
        <PermissionTable
          v-model:dialog-delete="permissionDialogDelete"
          :loading="loading"
          :response="response"
          :removing-id="removingId"
          :search="filterPermission"
          :highlight-id="highlightId"
          :initial-sort-by="(lastOptions.sortBy as any)"
          @edit="editPermission"
          @sorting="handleSorting"
          @delete="deletePermission"
          @distribution="distributePermission"
        />
      </VCol>
    </VRow>

    <!-- Create/Edit dialog -->
    <PermissionDialog
      v-if="permissionDialog"
      :loading="saving"
      :permission="permission"
      @close="closeDialog"
      @save="savePermission"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { buildApiParams } from "~/utils/buildApiParams";
import { useRowHighlight } from "~/composables/useRowHighlight";

definePageMeta({
  title: "Permisos",
  icon: "mdi-key-variant",
  permission: "permission-index",
  middleware: ["authenticated", "permission"],
});

const { Permission } = useRepository();

const filterInput = ref("");
const filterPermission = ref("");
const permission = ref<Record<string, unknown> | null>(null);
const response = ref({ data: [], total: 0 });
const loading = ref(false);
const saving = ref(false);
const permissionDialog = ref(false);
const permissionDialogDelete = ref(false);
const { highlightId, flash, prependCreated, removingId, removeWithAnimation } =
  useRowHighlight();

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "name", order: "asc" }],
});

// Top-level await — loads initial data before render (asyncData equivalent)
{
  const apiParams = buildApiParams(lastOptions.value);
  const initialResponse = await Permission.index(apiParams).catch(() => ({
    data: [],
    total: 0,
  }));
  response.value = initialResponse as { data: unknown[]; total: number };
}

// Debounced filter (300ms)
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val) {
    filterPermission.value = "";
    return;
  }
  debounceTimer = setTimeout(() => {
    filterPermission.value = val;
  }, 300);
});

async function loadPermissions(opts: Record<string, unknown>) {
  try {
    loading.value = true;
    lastOptions.value = opts;
    const params = buildApiParams(opts);
    if (filterPermission.value && !params.filter) params.filter = filterPermission.value;
    response.value = await Permission.index(params);
  } catch (e) {
    console.error("Error al cargar permisos", e);
  } finally {
    loading.value = false;
  }
}

async function refreshPermissions() {
  if (lastOptions.value) {
    await loadPermissions(lastOptions.value);
  }
}

let initialLoaded = false;

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true;
    return;
  }
  loadPermissions(opts);
}

function newPermission() {
  useValidationErrors().clearErrors();
  permission.value = {};
  permissionDialog.value = true;
}

function editPermission(item: Record<string, unknown>) {
  useValidationErrors().clearErrors();
  permission.value = { ...item };
  permissionDialog.value = true;
}

function distributePermission(item: Record<string, unknown>) {
  navigateTo(`/permission/${item.id}/distribution`);
}

async function deletePermission(item: Record<string, unknown>) {
  try {
    saving.value = true;
    await Permission.delete(item.id as number);
    permissionDialogDelete.value = false;
    await removeWithAnimation(response, item.id as number);
  } catch (e) {
    console.error("Error al eliminar el permiso", e);
  } finally {
    saving.value = false;
  }
}

async function savePermission(item: Record<string, unknown>) {
  try {
    saving.value = true;
    if (item.id) {
      await Permission.update(item.id as number, item);
      permissionDialog.value = false;
      permission.value = null;
      await refreshPermissions();
      flash(item.id as number);
    } else {
      const res = await Permission.create(item);
      const created = (res as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      if (created) {
        prependCreated(response, created);
      }
      permissionDialog.value = false;
      permission.value = null;
    }
  } catch (e) {
    console.error("Error al guardar el permiso", e);
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  permissionDialog.value = false;
  permission.value = null;
  useValidationErrors().clearErrors();
}
</script>

<style scoped></style>
