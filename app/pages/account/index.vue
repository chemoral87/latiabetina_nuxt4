<template>
  <ClientOnly>
    <VContainer>
    <VRow density="comfortable">
      <VCol md="5" cols="12">
        <VCard id="acc-index-card-1" flat border class="mb-3 pa-4">
          <div class="d-flex align-center mb-3">
            <VAvatar size="52" class="mr-3" color="primary">
              <span class="text-white text-h6">{{ initials }}</span>
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ user.name }} {{ user.last_name }} {{ user.second_last_name }}</div>
              <div class="text-body-2 text-grey">{{ user.email }}</div>
            </div>
          </div>
          <VBtn id="acc-changepw-btn" size="small" color="success" variant="elevated" @click="dialogPassword = true">
            <VIcon start size="small">mdi-lock-reset</VIcon>
            Cambiar contraseña
          </VBtn>
        </VCard>

        <VCard id="acc-index-toggle-card" flat border class="mb-3 pa-3">
          <div style="gap: 6px" class="d-flex align-center">
            <span class="text-caption text-grey">Separado</span>
            <VSwitch id="acc-combined-view-sw" v-model="combinedView" inset hide-details class="mt-0 pt-0" density="compact" />
            <span class="text-caption text-grey">Combinado</span>
          </div>
          <VDivider class="my-2" />
          <div style="gap: 6px" class="d-flex align-center">
            <span class="text-caption text-grey">Por rol</span>
            <VSwitch id="acc-combined-view-org-sw" v-model="combinedOrgView" inset hide-details class="mt-0 pt-0" density="compact" />
            <span class="text-caption text-grey">Por Org</span>
          </div>
        </VCard>

        <VCard v-if="!combinedView" id="acc-index-card-2" flat border>
          <VCardTitle class="text-subtitle-1 font-weight-bold pb-1">
            <VIcon start size="small" color="primary">mdi-redhat</VIcon>
            Roles
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-2">
            <template v-if="combinedOrgView">
              <div v-if="orgGroups.length === 0" class="text-grey text-body-2">Sin roles asignados</div>
              <div v-else>
                <div v-for="group in orgGroups" :key="group.org.id" class="mb-2">
                  <div style="gap: 6px" class="d-flex align-center flex-wrap">
                    <VChip :id="'chip-acc-roles-org-' + group.org.id" label size="small" color="primary" variant="elevated">
                      <VIcon start size="small">mdi-domain</VIcon>
                      {{ getOrgNameById(group.org.id) }}
                    </VChip>
                    <VChip v-for="role in group.roles" :id="'chip-acc-roles-org-' + group.org.id + '-role-' + role" :key="role" size="x-small" color="primary" variant="outlined">
                      {{ role }}
                    </VChip>
                  </div>
                  <div v-if="group.roles.length === 0" class="text-grey text-caption pl-2">Sin roles en esta organización</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div v-if="!hasRoles" class="text-grey text-body-2">Sin roles asignados</div>
              <div v-for="(orgIds, role) in sortedRolesOrg" :key="role" class="mb-2">
                <div style="gap: 6px" class="d-flex align-center flex-wrap">
                  <VChip :id="'chip-acc-role-' + role" label size="small" color="primary" variant="elevated">{{ role }}</VChip>
                  <VChip v-for="oid in orgIds" :id="'chip-acc-role-org-' + oid" :key="oid" size="x-small" color="primary" variant="outlined">
                    {{ getOrgNameById(oid) }}
                  </VChip>
                </div>
              </div>
            </template>
          </VCardText>
        </VCard>
      </VCol>

      <VCol md="7" cols="12">
        <VCard id="acc-permissions-card" flat border height="100%">
          <VCardTitle class="text-subtitle-1 font-weight-bold pb-1">
            <span v-if="!combinedView">
              <VIcon start size="small" color="secondary">mdi-key-variant</VIcon>
              Permisos
            </span>
            <span v-else>
              <VIcon start size="small" color="primary">mdi-redhat</VIcon>
              <VIcon start size="small" color="secondary">mdi-key-variant</VIcon>
              Roles y permisos
            </span>
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-2">
            <template v-if="!combinedView">
              <template v-if="combinedOrgView">
                <div v-if="orgGroups.length === 0" class="text-grey text-body-2">Sin permisos asignados</div>
                <div v-else>
                  <div v-for="group in orgGroups" :key="group.org.id" class="mb-3">
                    <div style="gap: 4px" class="d-flex align-center flex-wrap mb-1">
                      <VChip :id="'chip-acc-perms-org-' + group.org.id" label size="small" color="secondary" variant="elevated">
                        <VIcon start size="small">mdi-domain</VIcon>
                        {{ getOrgNameById(group.org.id) }}
                      </VChip>
                      <VChip :id="'chip-acc-perms-org-count-' + group.org.id" size="x-small" color="secondary" variant="outlined">
                        {{ group.perms.length }} permisos
                      </VChip>
                    </div>
                    <div v-if="group.perms.length > 0" class="pl-2">
                      <VChip v-for="perm in group.perms" :id="'chip-acc-perms-org-' + group.org.id + '-perm-' + perm" :key="perm" label size="small" class="mr-1 mb-1" color="secondary" variant="elevated">
                        {{ perm }}
                      </VChip>
                    </div>
                    <div v-else class="text-grey text-caption pl-2">Sin permisos en esta organización</div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-if="!hasPermissions" class="text-grey text-body-2">Sin permisos asignados</div>
                <VRow density="comfortable">
                  <VCol v-for="(orgIds, perm) in sortedPermissionsOrg" :key="perm" sm="6" cols="12">
                    <div style="gap: 4px" class="d-flex align-center flex-wrap">
                      <VChip :id="'chip-acc-permission-' + perm" label class="mr-1" size="small" color="secondary" variant="elevated">{{ perm }}</VChip>
                      <VChip v-for="oid in orgIds" :id="'chip-acc-permission-org-' + oid" :key="oid" size="x-small" color="secondary" variant="outlined">
                        {{ getOrgNameById(oid) }}
                      </VChip>
                    </div>
                  </VCol>
                </VRow>
              </template>
            </template>

            <template v-else>
              <template v-if="combinedOrgView">
                <div v-if="orgGroups.length === 0" class="text-grey text-body-2">Sin organizaciones asignadas</div>
                <div v-else>
                  <div v-for="group in orgGroups" :key="group.org.id" class="mb-4">
                    <div style="gap: 6px" class="d-flex align-center flex-wrap mb-1">
                      <VChip :id="'chip-acc-org-combined-' + group.org.id" label size="small" color="primary" variant="elevated">
                        <VIcon start size="small">mdi-domain</VIcon>
                        {{ getOrgNameById(group.org.id) }}
                      </VChip>
                      <VChip :id="'chip-acc-org-roles-count-' + group.org.id" size="x-small" color="primary" variant="outlined">
                        {{ group.roles.length }} roles
                      </VChip>
                      <VChip :id="'chip-acc-org-perms-count-' + group.org.id" size="x-small" color="secondary" variant="outlined">
                        {{ group.perms.length }} permisos
                      </VChip>
                    </div>

                    <div v-if="group.roles.length > 0" class="pl-2">
                      <div v-for="role in group.roles" :key="role" style="gap: 4px" class="d-flex align-center flex-wrap mb-1">
                        <VChip :id="'chip-acc-org-combined-' + group.org.id + '-role-' + role" label class="mr-1" size="small" color="primary" variant="elevated">
                          <VIcon start size="small">mdi-redhat</VIcon>
                          {{ role }}
                        </VChip>
                        <template v-if="sortedRolesPermissions[role] && sortedRolesPermissions[role].length > 0">
                          <VChip v-for="perm in sortedRolesPermissions[role]" :id="'chip-acc-org-combined-' + group.org.id + '-role-' + role + '-perm-' + perm" :key="perm" label size="small" class="mr-1 mb-1" color="secondary" variant="elevated">
                            {{ perm }}
                          </VChip>
                        </template>
                        <span v-else class="text-caption text-grey">Sin permisos asociados</span>
                      </div>
                    </div>
                    <div v-if="group.roles.length === 0 && group.perms.length > 0" class="pl-2">
                      <VChip v-for="perm in group.perms" :id="'chip-acc-org-combined-' + group.org.id + '-perm-' + perm" :key="perm" label size="small" class="mr-1 mb-1" color="secondary" variant="elevated">
                        {{ perm }}
                      </VChip>
                    </div>
                    <div v-if="group.roles.length === 0 && group.perms.length === 0" class="text-grey text-caption pl-2">
                      Sin roles ni permisos en esta organización
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div v-if="!hasRoles" class="text-grey text-body-2">Sin roles asignados</div>
                <div v-else>
                  <div v-for="(orgIds, roleName) in sortedRolesOrg" :key="roleName" class="mb-4">
                    <div style="gap: 6px" class="d-flex align-center flex-wrap mb-1">
                      <VChip :id="'chip-acc-role-combined-' + roleName" label size="small" color="primary" variant="elevated">
                        <VIcon start size="small">mdi-redhat</VIcon>
                        {{ roleName }}
                      </VChip>
                      <VChip v-for="oid in orgIds" :id="'chip-acc-combined-org-' + oid" :key="oid" size="x-small" color="primary" variant="outlined">
                        {{ getOrgNameById(oid) }}
                      </VChip>
                      <VChip :id="'chip-acc-permission-count-' + roleName" class="ml-1" size="small" color="secondary" variant="outlined">
                        {{ (sortedRolesPermissions[roleName] || []).length }} permisos
                      </VChip>
                    </div>

                    <div v-if="sortedRolesPermissions[roleName] && sortedRolesPermissions[roleName].length > 0" class="pl-2">
                      <VChip v-for="perm in sortedRolesPermissions[roleName]" :id="'chip-acc-permission-combined-' + perm" :key="perm" label size="small" class="mr-1 mb-1" color="secondary" variant="elevated">
                        {{ perm }}
                      </VChip>
                    </div>
                    <div v-else class="text-grey text-caption pl-2">Sin permisos asociados a este rol</div>
                  </div>
                </div>
              </template>
            </template>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <div class="text-center mt-4">
      <span style="font-size: 10px" class="text-overline text-grey">v{{ buildVersion }}</span>
    </div>
  </VContainer>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Perfil",
  icon: "mdi-account-circle",
  middleware: "authenticated",
})

const auth = useAuthStore()
const buildVersion = useRuntimeConfig().public.version
const user = computed(() => (auth.user ?? {}) as Record<string, unknown>)
const orgs = computed(() => (user.value?.orgs as Array<{ id: number; name: string; short_code?: string }>) || [])
const roles_org = computed(() => (user.value?.roles_org as Record<string, number[]>) || {})
const permissions_org = computed(() => (user.value?.permissions_org as Record<string, number[]>) || {})
const roles_permissions = computed(() => (user.value?.roles_permissions as Record<string, string[]>) || {})

const sortedRolesOrg = computed(() =>
  Object.fromEntries(Object.entries(roles_org.value).sort(([a], [b]) => a.localeCompare(b)))
)
const sortedPermissionsOrg = computed(() =>
  Object.fromEntries(Object.entries(permissions_org.value).sort(([a], [b]) => a.localeCompare(b)))
)
const sortedRolesPermissions = computed(() =>
  Object.fromEntries(
    Object.entries(roles_permissions.value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([role, perms]) => [role, [...perms].sort((a, b) => a.localeCompare(b))])
  )
)

const sortedOrgs = computed(() =>
  [...orgs.value].sort((a, b) => (a.short_code || a.name || "").localeCompare(b.short_code || b.name || ""))
)

const orgGroups = computed(() =>
  sortedOrgs.value.map((org) => {
    const roles = Object.entries(roles_org.value)
      .filter(([, orgIds]) => orgIds.includes(org.id))
      .map(([role]) => role)
      .sort((a, b) => a.localeCompare(b))
    const perms = Object.entries(permissions_org.value)
      .filter(([, orgIds]) => orgIds.includes(org.id))
      .map(([perm]) => perm)
      .sort((a, b) => a.localeCompare(b))
    return { org, roles, perms }
  })
)
const dialogPassword = ref(false)
const combinedView = ref(false)
const combinedOrgView = ref(
  typeof window !== "undefined" && window.localStorage.getItem("acc-combined-view-org") === "1"
)

watch(combinedOrgView, (val) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("acc-combined-view-org", val ? "1" : "0")
  }
})

const hasRoles = computed(() => Object.keys(roles_org.value).length > 0)
const hasPermissions = computed(() => Object.keys(permissions_org.value).length > 0)

const initials = computed(() => {
  const u = user.value
  const n = (u?.name as string)?.[0] || ""
  const l = (u?.last_name as string)?.[0] || ""
  return (n + l).toUpperCase() || "?"
})

function getOrgNameById(id: number) {
  const org = orgs.value.find((o) => o.id === id)
  return org ? org.short_code || org.name : id
}
</script>
