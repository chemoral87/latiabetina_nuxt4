<template>
  <VContainer class="" :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol md="2" sm="6" cols="12">
          <VTextField
            id="usr-index-filteruser-tf-1"
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
            id="usr-refresh-btn"
            class="mr-4"
            color="primary"
            :loading="loading"
            variant="outlined"
            @click="refresh"
          >
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
          <VBtn id="usr-new-btn" color="success" @click="newUser()">
            <VIcon start>mdi-plus</VIcon>
            Nuevo Usuario
          </VBtn>
        </VCol>

        <VCol cols="12">
          <UserTable
            v-model:dialog-delete="dialogDeleteUser"
            :loading="loading"
            :response="response"
            :search="filterUser"
            :removing-id="removingId"
            :highlight-id="highlightId"
            :initial-sort-by="lastOptions.sortBy as any"
            @edit="editUser"
            @delete="deleteUser"
            @sorting="handleSorting"
            @edit-profiles="editProfiles"
          />
        </VCol>
      </VRow>
    </VSheet>

    <UserDialog
      v-if="userDialog"
      :userx="userx"
      :loading="saving"
      @save="saveUser"
      @close="closeDialog"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useRowHighlight } from "~/composables/useRowHighlight";
import { buildApiParams } from "~/utils/buildApiParams";

definePageMeta({
  title: "Usuarios",
  icon: "mdi-account",
  permission: "user-index",
  middleware: ["authenticated", "permission"],
});

const dialogDeleteUser = ref(false);
const userDialog = ref(false);
const response = ref({});
const filterInput = ref("");
const filterUser = ref("");
const loading = ref(false);
const saving = ref(false);
const userx = ref<Record<string, unknown> | null>(null);
const {
  highlightId,
  prependCreated,
  updateRow,
  removingId,
  removeWithAnimation,
} = useRowHighlight();

const { User } = useRepository();

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "name", order: "asc" }],
});

// Top-level await — loads initial data before render (asyncData equivalent)
{
  const apiParams = buildApiParams(lastOptions.value);
  const initialResponse = await User.index(apiParams).catch(() => ({
    data: [],
    total: 0,
  }));
  response.value = initialResponse as { data: unknown[]; total: number };
}

// Debounced filter — shared useDebouncedFilter (300ms immediate clear)
useDebouncedFilter(filterInput, filterUser);

async function indexUsers(opts: Record<string, unknown>) {
  lastOptions.value = opts;
  const params = buildApiParams(opts);
  if (filterUser.value && !params.filter) params.filter = filterUser.value;
  try {
    loading.value = true;
    response.value = await User.index(params);
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
  indexUsers(opts);
}

function refresh() {
  if (lastOptions.value) {
    indexUsers(lastOptions.value);
  }
}

function newUser() {
  useValidationErrors().clearErrors();
  userx.value = {};
  userDialog.value = true;
}

function editUser(item: Record<string, unknown>) {
  useValidationErrors().clearErrors();
  userx.value = { ...item };
  userDialog.value = true;
}

function editProfiles(item: Record<string, unknown>) {
  navigateTo(`/user/${item.id}/profile`);
}

async function deleteUser(item: Record<string, unknown>) {
  try {
    await User.delete(item.id as number);
    dialogDeleteUser.value = false;
    await removeWithAnimation(response, item.id as number);
  } catch (e) {
    console.error(e);
  }
}

async function saveUser(item: Record<string, unknown>) {
  saving.value = true;
  try {
    if (item.id) {
      const res = await User.update<Record<string, unknown>>(
        item.id as number,
        item,
      );
      const updated = (res as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      if (updated) {
        updateRow(response, updated);
      }
      userDialog.value = false;
    } else {
      const res = await User.create<Record<string, unknown>>(item);
      const created = (res as Record<string, unknown>)?.data as
        | Record<string, unknown>
        | undefined;
      if (created) {
        prependCreated(response, created);
      }
      userDialog.value = false;
      if ((res as Record<string, unknown>)?.data) {
        editProfiles(
          (res as Record<string, unknown>).data as Record<string, unknown>,
        );
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  userDialog.value = false;
  useValidationErrors().clearErrors();
}
</script>

<style scoped></style>
