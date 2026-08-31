<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Existing permissions -->
      <VCol cols="12">
        <VCard id="rol-permissions-card" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
            <VIcon start size="small" color="primary">mdi-key-variant</VIcon>
            Permisos del rol
          </VCardTitle>
          <VCardText>
            <PermissionCombobox
              density="compact"
              label="Buscar y asignar permisos"
              :permissionsx="
                (mRole.permissions as Record<string, unknown>[]) ?? []
              "
              @model-change="setPermissions"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Create new permission on the fly -->
      <VCol cols="12">
        <VCard id="rol-new-permission-card" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
            <VIcon start size="small" color="success"
              >mdi-plus-circle-outline</VIcon
            >
            Crear nuevo permiso
          </VCardTitle>
          <VCardText class="pb-2">
            <VRow align="center" density="comfortable">
              <VCol cols="12">
                <VTextField
                  id="rol-index-newpermissionname-tf-1"
                  v-model="newPermissionName"
                  clearable
                  hide-details
                  density="compact"
                  variant="outlined"
                  label="Nombre del permiso"
                  :loading="creatingPermission"
                  :disabled="creatingPermission"
                  placeholder="ej. product-create o song-update, song-delete"
                  hint="Separa varios permisos con comas"
                  persistent-hint
                  @keyup.enter="createAndAddPermission"
                />
              </VCol>
              <VCol cols="auto" class="pt-2">
                <VBtn
                  id="roldtl-create-perm-btn"
                  color="success"
                  :loading="creatingPermission"
                  :disabled="!newPermissionName || creatingPermission"
                  @click="createAndAddPermission"
                >
                  <VIcon start>mdi-plus</VIcon>
                  Crear y agregar
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Actions -->
      <VCol cols="12">
        <VCard id="roldtl-actions-card" variant="outlined">
          <VCardText class="d-flex justify-end pa-4">
            <VBtn
              id="roldtl-cancel-btn"
              class="mr-4"
              color="primary"
              variant="outlined"
              @click="navigateTo('/role')"
            >
              <VIcon start>mdi-close</VIcon>
              Cancelar
            </VBtn>
            <VBtn
              id="roldtl-save-btn"
              color="primary"
              variant="elevated"
              @click="saveRolePermissions()"
            >
              <VIcon start>mdi-content-save</VIcon>
              Guardar
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">

definePageMeta({
  title: "Permisos del Rol",
  middleware: "authenticated",
});

const route = useRoute();
const roleId = route.params.id as string;

const { Role } = useRepository();
const { $api } = useApi();

const mRole = ref<Record<string, unknown>>({});
const newPermissionName = ref("");
const creatingPermission = ref(false);

// Snackbar
const notify = useNotifyStore();

// Top-level await — data loads before render (asyncData equivalent)
const res = await Role.show(roleId).catch(() => null);
mRole.value = (res as Record<string, unknown>) ?? {};
if (mRole.value.name) {
  route.meta.title = `Rol ${mRole.value.name}`;
  route.meta.icon = "mdi-redhat";
  route.meta.back = "/role";
  route.meta.showDrawer = false;
} else {
  route.meta.title = "Permisos del Rol";
}

function setPermissions(permissions: Record<string, unknown>[]) {
  mRole.value.permissions = permissions;
}

async function createAndAddPermission() {
  const raw = (newPermissionName.value || "").trim();
  if (!raw) return;

  // Support comma-separated bulk creation: "song-update, song-delete"
  const names = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // Deduplicate case-insensitive within input
  const uniqueMap = new Map<string, string>();
  for (const n of names) {
    const low = n.toLowerCase();
    if (!uniqueMap.has(low)) uniqueMap.set(low, n);
  }
  const uniqueNames = [...uniqueMap.values()];
  if (uniqueNames.length === 0) return;

  const currentPermissions =
    (mRole.value.permissions as Record<string, unknown>[]) ?? [];
  const currentNamesLower = new Set(
    currentPermissions.map((p) => (p.name as string).toLowerCase()),
  );

  const toCreate = uniqueNames.filter((n) => !currentNamesLower.has(n.toLowerCase()));
  const alreadyAssigned = uniqueNames.filter((n) => currentNamesLower.has(n.toLowerCase()));

  if (alreadyAssigned.length > 0) {
    notify.notify({
      warning: `Ya asignado: ${alreadyAssigned.join(", ")}`,
    });
  }
  if (toCreate.length === 0) return;

  creatingPermission.value = true;
  try {
    // Backend supports comma-separated `name` or `names` array; send as `name` joined
    const body =
      toCreate.length === 1 ? { name: toCreate[0] } : { name: toCreate.join(", ") };
    const res = await $api<{
      permission: Record<string, unknown>;
      permissions: Record<string, unknown>[];
    }>(`/role/${mRole.value.id as number}/permission`, {
      method: "POST",
      body,
    });
    const newPerms: Record<string, unknown>[] =
      (res.permissions as Record<string, unknown>[]) ??
      (res.permission ? [res.permission] : []);
    if (!mRole.value.permissions) mRole.value.permissions = [];
    mRole.value.permissions = [
      ...(mRole.value.permissions as Record<string, unknown>[]),
      ...newPerms,
    ];
    newPermissionName.value = "";
    if (newPerms.length === 1) {
      notify.notify({
        success: `Permiso "${newPerms[0].name}" agregado al rol.`,
      });
    } else {
      notify.notify({
        success: `Permisos agregados: ${newPerms.map((p) => p.name).join(", ")}`,
      });
    }
  } catch (e) {
    const errMsg = (e as Record<string, unknown>)?.response
      ? (((e as Record<string, unknown>).response as Record<string, unknown>)
          ?.data as Record<string, unknown>)
      : {};
    const msg =
      (errMsg?.errors as Record<string, string[]>)?.["name"]?.[0] ??
      (errMsg?.message as string) ??
      "Error al crear el permiso.";
    notify.notify({ error: msg });
  } finally {
    creatingPermission.value = false;
  }
}

async function saveRolePermissions() {
  const permissionsIds = (
    (mRole.value.permissions as Record<string, unknown>[]) ?? []
  ).map((x) => x.id);
  await Role.children(roleId, { permissionsIds });
  navigateTo("/role");
}
</script>

<style scoped></style>
