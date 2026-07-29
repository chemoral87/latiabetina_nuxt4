<template>
  <VContainer>
    <div class="text-h6">{{ profile.organization_name }} ({{ profile.organization_short_code }})</div>
    <VRow>
      <VCol cols="12" md="6">
        <RoleCombobox :roles="profile.roles as Record<string, unknown>[]" @model-change="setRoles" />
      </VCol>
      <VCol cols="12" md="6">
        <PermissionCombobox :permissionsx="profile.direct_permissions as Record<string, unknown>[]" label="Permisos Directos" @model-change="setDirectPermissions" />
      </VCol>

      <VCol cols="12" class="d-flex justify-end">
        <VBtn id="btn-useprf-cancel" color="primary" variant="outlined" class="mr-4" @click="back()">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="btn-useprf-save" color="primary" variant="elevated" @click="saveProfileRolesPermissions()">
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
  middleware: "authenticated",
})

const route = useRoute()
const userId = route.params.id as string
const profileId = route.params.profile_id as string

const { User, Profile } = useRepository()

const mUser = ref<Record<string, unknown>>({})
const profile = ref<Record<string, unknown>>({})

onMounted(async () => {
  const [_mUser, _profile] = await Promise.all([
    User.show(userId).catch(() => null),
    Profile.show(userId, profileId).catch(() => null),
  ])
  mUser.value = (_mUser as Record<string, unknown>) ?? {}
  profile.value = (_profile as Record<string, unknown>) ?? {}

  // Replicates: eventBus.$emit("setNavBar", { title: `Perfilx: ${mUser.name} ${mUser.last_name}`, icon: "mdi-account", back: `/user/${userId}/profile`, showDrawer: false })
  if (mUser.value.name) {
    route.meta.title = `Perfil de: ${mUser.value.name} ${mUser.value.last_name ?? ''}`.trim()
    route.meta.icon = 'mdi-account'
    route.meta.back = `/user/${userId}/profile`
    route.meta.showDrawer = false
  }
})

function setRoles(roles: Record<string, unknown>[]) {
  profile.value.roles = roles
}

function setDirectPermissions(permissions: Record<string, unknown>[]) {
  profile.value.direct_permissions = permissions
}

function back() {
  navigateTo(`/user/${userId}/profile`)
}

async function saveProfileRolesPermissions() {
  const roleIds = (profile.value.roles as Record<string, unknown>[]).map((x) => x.id)
  const permissionsIds = (profile.value.direct_permissions as Record<string, unknown>[]).map((x) => x.id)
  const params = { roleIds, permissionsIds }
  await Profile.update(userId, profileId, params)
  navigateTo(`/user/${userId}/profile`)
}
</script>

<style scoped></style>
