<template>
  <VContainer :fluid="true" class="pa-4">
    <VRow class="mb-3">
      <VCol cols="12">
        <VBtn id="btn-user-profile-new" color="primary" variant="elevated" class="font-weight-bold" @click="newProfile()">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Perfil
        </VBtn>
      </VCol>
    </VRow>

    <VRow>
      <VCol v-for="profile in profiles" :key="profile.id as number" cols="12" class="mb-3">
        <VCard variant="outlined" class="bg-white rounded-lg">
          <VCardItem class="pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="text-h6 font-weight-regular text-body-1">
                {{ profile.organization_name }} ({{ profile.organization_short_code }})
              </div>

              <div class="d-flex align-center ga-2">
                <VBtn id="btn-user-profile-fav" icon variant="text" size="small" :color="getColorFavorite(profile.favorite)" @click="setFavProfile(profile)">
                  <VIcon size="x-large" icon="mdi-star" />
                </VBtn>
                <VBtn id="btn-user-profile-edit" icon variant="text" size="small" color="primary" @click="editProfile(profile)">
                  <VIcon size="x-large" icon="mdi-pencil" />
                </VBtn>
                <VBtn id="btn-user-profile-delete" icon variant="text" size="small" color="error" @click="confirmDeleteProfile(profile)">
                  <VIcon size="x-large" icon="mdi-delete" />
                </VBtn>
              </div>
            </div>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol cols="12" md="6">
                <div class="text-caption font-weight-medium text-grey-darken-1 mb-2">
                  Roles
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <VChip v-for="it in (profile.roles as Record<string, unknown>[])" :key="it.id as number" color="primary" variant="flat" size="small" rounded="pill">
                    {{ it.name as string }}
                  </VChip>
                </div>
              </VCol>

              <VCol cols="12" md="6">
                <div class="text-caption font-weight-medium text-grey-darken-1 mb-2">
                  Permisos Directos
                </div>
                <div class="d-flex flex-wrap ga-2">
                  <VChip v-for="it in (profile.permissions as Record<string, unknown>[])" :key="it.id as number" color="info" variant="flat" size="small" rounded="pill">
                    {{ it.name as string }}
                  </VChip>
                </div>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
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

    <ProfileDialog v-if="profileDialog" :user-id="userId" :loading="saving" @close="closeProfileDialog" @save="saveProfile" />
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
const saving = ref(false)

// Top-level await — loads initial data before render (asyncData equivalent)
const [userRes, profilesRes] = await Promise.all([
  User.show(userId).catch(() => null),
  Profile.index(userId).catch(() => []),
])
mUser.value = (userRes as Record<string, unknown>) ?? {}
profiles.value = (profilesRes as Record<string, unknown>[]) ?? []
if (mUser.value.name) {
  route.meta.title = `Perfiles de: ${mUser.value.name} ${mUser.value.last_name ?? ""}`.trim()
  route.meta.icon = "mdi-shield-key-outline"
  route.meta.back = "/user"
  route.meta.showDrawer = false
}

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
  saving.value = true
  Profile.create(userId, { org_id: item.org_id })
    .then((res) => {
      profileDialog.value = false
      navigateTo(`/user/${userId}/profile/${(res as Record<string, unknown>).profile?.id}`)
    })
    .catch((e) => console.error(e))
    .finally(() => {
      saving.value = false
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
