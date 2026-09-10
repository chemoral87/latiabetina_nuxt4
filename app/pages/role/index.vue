<template>
  <VContainer class="" :fluid="true">
    <VSheet variant="outlined">
      <VSheet>
        <VRow density="compact">
          <!-- Filter -->
          <VCol md="2" cols="12">
            <VTextField
              id="rol-index-filterrole-tf-1"
              v-model="filterInput"
              clearable
              hide-details
              density="compact"
              variant="outlined"
              placeholder="Buscar rol..."
              append-inner-icon="mdi-magnify"
            />
          </VCol>

          <!-- Action buttons -->
          <VCol cols="auto" class="d-flex align-center">
            <VBtn
              id="rol-refresh-btn"
              class="mr-4"
              color="primary"
              variant="outlined"
              :loading="loading"
              @click="refreshRoles"
            >
              <VIcon start>mdi-reload</VIcon>
              Refrescar
            </VBtn>
            <VBtn id="rol-new-btn" color="success" @click="newRole">
              <VIcon start>mdi-plus</VIcon>
              Nuevo Rol
            </VBtn>
          </VCol>

          <!-- Role table -->
          <VCol cols="12">
            <RoleTable
              v-model:dialog-delete="roleDialogDelete"
              :loading="loading"
              :response="response"
              :search="filterRole"
              :removing-id="removingId"
              :highlight-id="highlightId"
              :initial-sort-by="lastOptions.sortBy as any"
              @edit="editRole"
              @delete="deleteRole"
              @sorting="handleSorting"
              @distribution="distributeRole"
              @editPermissions="editRolePermissions"
            />
          </VCol>
        </VRow>
      </VSheet>
    </VSheet>

    <!-- Create/Edit dialog -->
    <RoleDialog
      v-if="roleDialog"
      :role="role"
      :loading="saving"
      @save="saveRole"
      @close="closeDialog"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Roles",
  icon: "mdi-redhat",
  permission: "role-index",
  middleware: ["authenticated", "permission"],
});

const { Role } = useRepository();

const filterInput = ref("");
const filterRole = ref("");
const role = ref<Record<string, unknown> | null>(null);
const response = ref({ data: [], total: 0 });
const loading = ref(false);
const saving = ref(false);
const roleDialog = ref(false);
const roleDialogDelete = ref(false);
const {
  highlightId,
  prependCreated,
  updateRow,
  removingId,
  removeWithAnimation,
} = useRowHighlight();

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "name", order: "asc" }],
});

// Initial list data is loaded during SSR via useAsyncData so the payload is
// reused on the client (no double fetch, no hydration mismatch). See
// ai_rule/nuxt4_ssr_hydration.md.
{
  const apiParams = buildApiParams(lastOptions.value);
  const { data: initialData } = await useAsyncData(
    "role-index",
    async () => {
      return await Role.index<{ data: unknown[]; total: number }>(
        apiParams,
      ).catch(() => ({ data: [] as unknown[], total: 0 }));
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  );

  response.value = initialData.value;
}

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterRole);

async function loadRoles(opts: Record<string, unknown>) {
  try {
    loading.value = true;
    lastOptions.value = opts;
    const params = buildApiParams(opts);
    if (filterRole.value && !params.filter) params.filter = filterRole.value;
    response.value = await Role.index(params);
  } catch (e) {
    console.error("Error al cargar roles", e);
    if ((e as { code?: string })?.code === "UNAUTHENTICATED") {
      // useApi already cleared the session and is redirecting to /login
      return;
    }
  } finally {
    loading.value = false;
  }
}

async function refreshRoles() {
  if (lastOptions.value) {
    await loadRoles(lastOptions.value);
  }
}

let initialLoaded = false;

function handleSorting(opts: Record<string, unknown>) {
  if (!initialLoaded) {
    // Suppress mount-time @update:options — data was already loaded by top-level await
    initialLoaded = true;
    return;
  }
  loadRoles(opts);
}

function newRole() {
  useValidationErrors().clearErrors();
  role.value = {};
  roleDialog.value = true;
}

function editRole(item: Record<string, unknown>) {
  useValidationErrors().clearErrors();
  role.value = { ...item };
  roleDialog.value = true;
}

function editRolePermissions(item: Record<string, unknown>) {
  navigateTo(`/role/${item.id}/children`);
}

function distributeRole(item: Record<string, unknown>) {
  navigateTo(`/role/${item.id}/distribution`);
}

async function deleteRole(item: Record<string, unknown>) {
  try {
    saving.value = true;
    await Role.delete(item.id as number);
    roleDialogDelete.value = false;
    await removeWithAnimation(response, item.id as number);
  } catch (e) {
    console.error("Error al eliminar el rol", e);
  } finally {
    saving.value = false;
  }
}

async function saveRole(item: Record<string, unknown>) {
  try {
    saving.value = true;
    if (item.id) {
      const res = await Role.update<Record<string, unknown>>(
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
      const res = await Role.create<Record<string, unknown>>(item);
      const created = (res as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      if (created) {
        prependCreated(response, created);
      }
    }
    roleDialog.value = false;
    role.value = null;
  } catch (e) {
    console.error("Error al guardar el rol", e);
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  roleDialog.value = false;
  role.value = null;
  useValidationErrors().clearErrors();
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
