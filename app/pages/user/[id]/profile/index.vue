<template>
  <VContainer>
    <VRow dense>
      <VCol cols="12">
        <VBtn id="btn-user-profile-new" color="primary" @click="newProfile()">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Perfil
        </VBtn>
      </VCol>

      <VCol v-for="profile in profiles" :key="profile.id as number" cols="12">
        <VCard>
          <VCardTitle class="py-0">
            <span class="text-subtitle-1 py-1">{{ profile.organization_name }} ({{ profile.organization_short_code }})</span>
            <VSpacer />

            <VBtn id="btn-user-profile-fav" icon :color="getColorFavorite(profile.favorite)" @click="setFavProfile(profile)">
              <VIcon>mdi-star</VIcon>
            </VBtn>
            <VBtn id="btn-user-profile-edit" icon color="primary" @click="editProfile(profile)">
              <VIcon>mdi-pencil</VIcon>
            </VBtn>
            <VBtn id="btn-user-profile-delete" icon color="error" @click="confirmDeleteProfile(profile)">
              <VIcon>mdi-delete</VIcon>
            </VBtn>
          </VCardTitle>
          <VCardText>
            <VRow dense>
              <VCol cols="12" sm="6">
                <div class="text-subtitle-2">Roles</div>

                <VChip v-for="it in (profile.roles as Record<string, unknown>[])" :key="it.id as number" class="ma-2" color="primary">
                  {{ it.name as string }}
                </VChip>
              </VCol>
              <VCol cols="12" sm="6">
                <div class="text-subtitle-2">Permisos Directos</div>

                <VChip v-for="it in (profile.permissions as Record<string, unknown>[])" :key="it.id as number" class="ma-2" color="info">
                  {{ it.name as string }}
                </VChip>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard border>
          <VCardText class="d-flex justify-end pa-4">
            <VBtn id="btn-user-profile-back" color="primary" variant="outlined" @click="navigateTo('/user')">
              <VIcon start>mdi-arrow-left</VIcon>
              Volver
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <ProfileDialog v-if="profileDialog" :user-id="userId" @close="closeProfileDialog" @save="saveProfile" />
    <DialogDelete v-if="dialogDelete" :dialog="dialogDeleteProp" @ok="(item) => { deleteProfile(item) }" @close="dialogDelete = false" />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Perfiles de Usuario",
  middleware: "authenticated",
})

const route = useRoute()
const userId = route.params.id as string

const { User, Profile } = useRepository()

const mUser = ref<Record<string, unknown>>({})
const profiles = ref<Record<string, unknown>[]>([])
const profileDialog = ref(false)
const dialogDelete = ref(false)
const dialogDeleteProp = ref<Record<string, unknown>>({})

onMounted(async () => {
  const [userRes, profilesRes] = await Promise.all([
    User.show(userId).catch(() => null),
    Profile.index(userId).catch(() => []),
  ])
  mUser.value = (userRes as Record<string, unknown>) ?? {}
  profiles.value = (profilesRes as Record<string, unknown>[]) ?? []
})

function getColorFavorite(favorite: unknown) {
  return favorite ? "orange" : "grey"
}

function setFavProfile(profile: Record<string, unknown>) {
  Profile.favorite(userId, profile.id as number).then(() => {
    profiles.value = profiles.value.map((x) => {
      x.favorite = x.id === profile.id
      return x
    })
  })
}

function editProfile(profile: Record<string, unknown>) {
  navigateTo(`/user/${userId}/profile/${profile.id}`)
}

function newProfile() {
  profileDialog.value = true
}

function closeProfileDialog() {
  profileDialog.value = false
}

function saveProfile(item: Record<string, unknown>) {
  Profile.create(userId, { org_id: item.org_id }).then((res) => {
    profileDialog.value = false
    navigateTo(`/user/${userId}/profile/${(res as Record<string, unknown>).profile?.id}`)
  })
}

function confirmDeleteProfile(profile: Record<string, unknown>) {
  dialogDeleteProp.value = {
    text: "Desea eliminar el Perfil ",
    strong: profile.organization_name,
    payload: profile,
  }
  dialogDelete.value = true
}

function deleteProfile(profile: Record<string, unknown>) {
  Profile.delete(userId, profile.id as number).then(() => {
    profiles.value = profiles.value.filter((x) => x.id !== profile.id)
    dialogDelete.value = false
  })
}
</script>

<style scoped></style>
