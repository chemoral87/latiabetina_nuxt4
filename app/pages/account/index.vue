<template>
  <ClientOnly>
    <VContainer>
    <VRow density="comfortable">
      <VCol cols="12" md="5">
        <VCard id="card-accou-index-1" flat class="mb-3 pa-4" border>
          <div class="d-flex align-center mb-3">
            <VAvatar color="primary" size="52" class="mr-3">
              <span class="text-white text-h6">{{ initials }}</span>
            </VAvatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ user.name }} {{ user.last_name }} {{ user.second_last_name }}</div>
              <div class="text-body-2 text-grey">{{ user.email }}</div>
            </div>
          </div>
          <VBtn id="btn-account-changepw" color="success" variant="elevated" size="small" @click="dialogPassword = true">
            <VIcon start size="small">mdi-lock-reset</VIcon>
            Cambiar contraseña
          </VBtn>
        </VCard>

        <VCard id="card-accou-index-toggle" flat class="mb-3 pa-3" border>
          <div class="d-flex align-center" style="gap: 6px">
            <span class="text-caption text-grey">Separado</span>
            <VSwitch v-model="combinedView" hide-details density="compact" inset class="mt-0 pt-0" />
            <span class="text-caption text-grey">Combinado</span>
          </div>
        </VCard>

        <VCard id="card-accou-index-2" v-if="!combinedView" flat border>
          <VCardTitle class="text-subtitle-1 font-weight-bold pb-1">
            <VIcon start size="small" color="primary">mdi-redhat</VIcon>
            Roles
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-2">
            <div v-if="!hasRoles" class="text-grey text-body-2">Sin roles asignados</div>
            <div v-for="(orgIds, role) in roles_org" :key="role" class="mb-2">
              <div class="d-flex align-center flex-wrap" style="gap: 6px">
                <VChip size="small" color="primary" variant="elevated" label>{{ role }}</VChip>
                <VChip v-for="oid in orgIds" :key="oid" size="x-small" variant="outlined" color="primary">
                  {{ getOrgNameById(oid) }}
                </VChip>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="7">
        <VCard flat border height="100%">
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
              <div v-if="!hasPermissions" class="text-grey text-body-2">Sin permisos asignados</div>
              <VRow density="comfortable">
                <VCol v-for="(orgIds, perm) in permissions_org" :key="perm" cols="12" sm="6">
                  <div class="d-flex align-center flex-wrap" style="gap: 4px">
                    <VChip size="small" color="secondary" variant="elevated" label class="mr-1">{{ perm }}</VChip>
                    <VChip v-for="oid in orgIds" :key="oid" size="x-small" variant="outlined" color="secondary">
                      {{ getOrgNameById(oid) }}
                    </VChip>
                  </div>
                </VCol>
              </VRow>
            </template>

            <template v-else>
              <div v-if="!hasRoles" class="text-grey text-body-2">Sin roles asignados</div>
              <div v-else>
                <div v-for="(orgIds, roleName) in roles_org" :key="roleName" class="mb-4">
                  <div class="d-flex align-center flex-wrap mb-1" style="gap: 6px">
                    <VChip size="small" color="primary" variant="elevated" label>
                      <VIcon start size="small">mdi-redhat</VIcon>
                      {{ roleName }}
                    </VChip>
                    <VChip v-for="oid in orgIds" :key="oid" size="x-small" variant="outlined" color="primary">
                      {{ getOrgNameById(oid) }}
                    </VChip>
                    <VChip size="small" variant="outlined" color="secondary" class="ml-1">
                      {{ (roles_permissions[roleName] || []).length }} permisos
                    </VChip>
                  </div>

                  <div v-if="roles_permissions[roleName] && roles_permissions[roleName].length > 0" class="pl-2">
                    <VChip v-for="perm in roles_permissions[roleName]" :key="perm" size="small" variant="elevated" label color="secondary" class="mr-1 mb-1">
                      {{ perm }}
                    </VChip>
                  </div>
                  <div v-else class="text-grey text-caption pl-2">Sin permisos asociados a este rol</div>
                </div>
              </div>
            </template>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Perfil",
  middleware: "authenticated",
})

const auth = useAuthStore()
const user = computed(() => (auth.user ?? {}) as Record<string, unknown>)
const orgs = computed(() => (user.value?.orgs as Array<{ id: number; name: string; short_code?: string }>) || [])
const roles_org = computed(() => (user.value?.roles_org as Record<string, number[]>) || {})
const permissions_org = computed(() => (user.value?.permissions_org as Record<string, number[]>) || {})
const roles_permissions = computed(() => (user.value?.roles_permissions as Record<string, string[]>) || {})
const dialogPassword = ref(false)
const combinedView = ref(false)

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
