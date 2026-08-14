<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <!-- Organization filter -->
      <VCol cols="12" md="3">
        <VSelect
          id="roldst-org-sel"
          v-model="selectedOrganization"
          :items="organizationOptions"
          item-title="name"
          item-value="id"
          label="Organización"
          clearable
          variant="outlined"
          density="compact"
          hide-details
        />
      </VCol>

      <!-- Profiles with the role -->
      <VCol cols="12">
        <VCard id="roldst-profiles-card" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
            <VIcon start size="small" color="primary">mdi-shield-key-outline</VIcon>
            Perfiles con el rol {{ role.name }}
            <VSpacer />
            <VChip id="rdi-count-chip" color="info" size="small" variant="elevated">{{ filteredProfiles.length }} perfiles</VChip>
          </VCardTitle>

          <VCardText class="pt-0">
            <VDataTable
              id="roldst-profiles-dt-1"
              :headers="headers"
              :items="filteredProfiles"
              :items-per-page="10"
              class="elevation-0"
              no-data-text="No hay perfiles asignados a este rol"
              density="compact"
            >
              <template #[`item.user`]="{ item }">
                {{ userName((item as Record<string, unknown>).user as Record<string, unknown>) }}
              </template>
              <template #[`item.organization`]="{ item }">
                {{ (item as Record<string, unknown>).organization_name }} ({{ (item as Record<string, unknown>).organization_short_code }})
              </template>
              <template #[`item.lastLogin`]="{ item }">
                {{ formatLastLogin(((item as Record<string, unknown>).user as Record<string, unknown>)?.last_login_at) }}
              </template>
              <template #[`item.actions`]="{ item }">
                <VBtn
                  :id="'rdi-profile-btn-' + (item as Profile).id"
                  icon
                  size="small"
                  variant="text"
                  color="primary"
                  title="Editar perfil"
                  @click="goToProfile(item as Profile)"
                >
                  <VIcon size="small">mdi-account-edit</VIcon>
                </VBtn>
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Actions -->
      <VCol cols="12">
        <VCard id="roldst-actions-card" variant="outlined">
          <VCardText class="d-flex justify-end pa-4">
            <VBtn id="roldst-back-btn" color="primary" variant="outlined" @click="navigateTo('/role')">
              <VIcon start>mdi-arrow-left</VIcon>
              Volver
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Distribución del Rol",
  middleware: "authenticated",
})

interface Profile {
  id: number | string
  org_id: number | string
  organization_name: string
  organization_short_code: string
  user?: {
    id?: number | string
    name?: string
    last_name?: string
    second_last_name?: string
    email?: string
    last_login_at?: string
  }
  [key: string]: unknown
}

interface OrgOption {
  id: number | string
  name: string
  short_code: string
}

const route = useRoute()
const roleId = route.params.id as string

const { Role } = useRepository()

const role = ref<Record<string, unknown>>({})
const profiles = ref<Profile[]>([])
const selectedOrganization = ref<number | string | null>(null)

const headers = [
  { title: "Usuario", value: "user" },
  { title: "Correo", value: "user.email" },
  { title: "Organización", value: "organization" },
  { title: "Último acceso", value: "lastLogin" },
  { title: "Acciones", value: "actions", sortable: false },
]

const organizationOptions = computed<OrgOption[]>(() => {
  const orgMap = new Map<number | string, OrgOption>()
  profiles.value.forEach((profile) => {
    if (!orgMap.has(profile.org_id)) {
      orgMap.set(profile.org_id, {
        id: profile.org_id,
        name: profile.organization_name,
        short_code: profile.organization_short_code,
      })
    }
  })
  return Array.from(orgMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredProfiles = computed(() => {
  if (!selectedOrganization.value) {
    return profiles.value
  }
  return profiles.value.filter((profile) => profile.org_id === selectedOrganization.value)
})

// Top-level await — loads initial data before render (asyncData equivalent)
const res = await Role.distribution(roleId).catch(() => ({ role: {}, profiles: [] }))
const data = res as { role: Record<string, unknown>; profiles: Profile[] }
role.value = data.role ?? {}
profiles.value = data.profiles ?? []
if (role.value.name) {
  route.meta.title = `Distribución: ${role.value.name}`
  route.meta.icon = "mdi-share-variant"
  route.meta.back = "/role"
  route.meta.showDrawer = false
}

function goToProfile(profile: Profile) {
  navigateTo(`/user/${profile.user?.id}/profile/${profile.id}`)
}

function userName(user: Record<string, unknown> | null | undefined): string {
  if (!user) return ""
  return [user.name, user.last_name, user.second_last_name].filter(Boolean).join(" ")
}

function formatLastLogin(dateStr: string | null | undefined): string {
  if (!dateStr) return "Nunca"
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}
</script>

<style scoped></style>
