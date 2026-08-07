<template>
  <VContainer>
    <div class="text-h6 mb-2">
      {{ profile.organization_name }} ({{ profile.organization_short_code }})
    </div>
    <VRow>
      <VCol md="6" cols="12">
        <RoleCombobox
          :roles="profile.roles as Record<string, unknown>[]"
          @model-change="setRoles"
        />
      </VCol>
      <VCol md="6" cols="12">
        <PermissionCombobox
          label="Permisos Directos"
          :permissionsx="
            profile.direct_permissions as Record<string, unknown>[]
          "
          @model-change="setDirectPermissions"
        />
      </VCol>

      <VCol cols="12" class="d-flex justify-end">
        <VBtn
          id="useprf-cancel-btn"
          class="mr-4"
          color="primary"
          variant="outlined"
          @click="back()"
        >
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn
          id="useprf-save-btn"
          color="primary"
          variant="elevated"
          @click="saveProfileRolesPermissions()"
        >
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Perfil",
  permission: "profile-index",
  middleware: ["authenticated", "permission"],
});

const route = useRoute();
const userId = route.params.id as string;
const profileId = route.params.profile_id as string;

const { User, Profile } = useRepository();

const mUser = ref<Record<string, unknown>>({});
const profile = ref<Record<string, unknown>>({});

{
  const [_mUser, _profile] = await Promise.all([
    User.show(userId).catch(() => null),
    Profile.show(userId, profileId).catch(() => null),
  ]);
  mUser.value = (_mUser as Record<string, unknown>) ?? {};
  profile.value = (_profile as Record<string, unknown>) ?? {};
}

if (mUser.value.name) {
  route.meta.title =
    `Perfil de: ${mUser.value.name} ${mUser.value.last_name ?? ""}`.trim();
  route.meta.icon = "mdi-account";
  route.meta.back = `/user/${userId}/profile`;
  route.meta.showDrawer = false;
}

function setRoles(roles: Record<string, unknown>[]) {
  profile.value.roles = roles;
}

function setDirectPermissions(permissions: Record<string, unknown>[]) {
  profile.value.direct_permissions = permissions;
}

function back() {
  navigateTo(`/user/${userId}/profile`);
}

async function saveProfileRolesPermissions() {
  const roleIds = (profile.value.roles as Record<string, unknown>[]).map(
    (x) => x.id,
  );
  const permissionsIds = (
    profile.value.direct_permissions as Record<string, unknown>[]
  ).map((x) => x.id);
  const params = { roleIds, permissionsIds };
  await Profile.update(userId, profileId, params);
  navigateTo(`/user/${userId}/profile`);
}
</script>

<style scoped></style>
