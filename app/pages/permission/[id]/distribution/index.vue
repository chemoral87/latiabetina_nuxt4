<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <!-- Organization filter -->
      <VCol cols="12" md="3">
        <VSelect
          id="permdst-org-sel"
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

      <!-- Roles with the permission -->
      <VCol cols="12">
        <VCard id="permdst-roles-card" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
            <VIcon start size="small" color="primary">mdi-redhat</VIcon>
            Roles con el permiso {{ permission.name }}
            <VSpacer />
            <VChip id="pdi-count-chip" color="info" size="small" variant="elevated">{{ filteredRoles.length }} roles</VChip>
          </VCardTitle>

          <VCardText class="pt-0">
            <VDataTable
              id="permdst-roles-dt-1"
              :headers="headers"
              :items="filteredRoles"
              :items-per-page="10"
              class="elevation-0"
              no-data-text="No hay roles asignados a este permiso"
              density="compact"
            >
              <template #[`item.organization`]="{ item }">
                {{ (item as Record<string, unknown>).organization_name }} ({{ (item as Record<string, unknown>).organization_short_code }})
              </template>
            </VDataTable>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Actions -->
      <VCol cols="12">
        <VCard id="permdst-actions-card" variant="outlined">
          <VCardText class="d-flex justify-end pa-4">
            <VBtn id="permdst-back-btn" color="primary" variant="outlined" @click="navigateTo('/permission')">
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
  title: "Distribución del Permiso",
  middleware: "authenticated",
})

interface RoleItem {
  id: number | string
  role_name: string
  org_id: number | string
  organization_name: string
  organization_short_code: string
}

interface OrgOption {
  id: number | string
  name: string
  short_code: string
}

const route = useRoute()
const permissionId = route.params.id as string

const { Permission } = useRepository()

const permission = ref<Record<string, unknown>>({})
const roles = ref<RoleItem[]>([])
const selectedOrganization = ref<number | string | null>(null)

const headers = [
  { title: "Rol", value: "role_name" },
  { title: "Organización", value: "organization" },
]

const organizationOptions = computed<OrgOption[]>(() => {
  const orgMap = new Map<number | string, OrgOption>()
  roles.value.forEach((role) => {
    if (!orgMap.has(role.org_id)) {
      orgMap.set(role.org_id, {
        id: role.org_id,
        name: role.organization_name,
        short_code: role.organization_short_code,
      })
    }
  })
  return Array.from(orgMap.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredRoles = computed(() => {
  if (!selectedOrganization.value) {
    return roles.value
  }
  return roles.value.filter((role) => role.org_id === selectedOrganization.value)
})

// Top-level await — loads initial data before render (asyncData equivalent)
const res = await Permission.distribution(permissionId).catch(() => ({ permission: {}, roles: [] }))
const data = res as { permission: Record<string, unknown>; roles: RoleItem[] }
permission.value = data.permission ?? {}
roles.value = data.roles ?? []
if (permission.value.name) {
  route.meta.title = `Distribución: ${permission.value.name}`
  route.meta.icon = "mdi-key-variant"
  route.meta.back = "/permission"
  route.meta.showDrawer = false
}
</script>

<style scoped></style>