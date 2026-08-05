<template>
  <VContainer :fluid="true">
    <VRow>
      <VCol>
        <VCard id="orgcfg-card">
          <VCardTitle>
            <VRow density="comfortable">
              <VCol cols="12">
                <div class="text-h6">
                  {{ organization.name }} ({{ organization.short_code }})
                </div>
              </VCol>

              <VCol cols="12">
                <VRow density="comfortable">
                  <VCol v-for="(group, groupName) in groupedItems" :key="groupName" cols="12">
                    <div class="text-subtitle-1 font-weight-medium text-grey-darken-1 mb-1 mt-2">
                      {{ groupName }}
                    </div>
                    <VRow density="comfortable">
                      <VCol v-for="config in group" :key="config.id as number" cols="3">
                        <VTextField
                          :id="'tf-orgcfg-' + (config.key as string).replace(/\\./g, '-')"
                          v-model="config.value"
                          variant="outlined"
                          density="compact"
                          :label="getLastSegment(config.key as string)"
                          hide-details
                        />
                      </VCol>
                    </VRow>
                  </VCol>
                </VRow>
              </VCol>

              <VCol class="d-flex justify-end pt-4">
                <VBtn id="orgcfg-cancel-btn" color="primary" variant="outlined" class="mr-4" @click="goBack()">
                  <VIcon start>mdi-close</VIcon>
                  Cancelar
                </VBtn>
                <VBtn id="orgcfg-save-btn" color="primary" variant="elevated" @click="saveOrganizationConfig()">
                  <VIcon start>mdi-content-save</VIcon>
                  Guardar
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Configuración de Organización",
  middleware: "authenticated",
})

const route = useRoute()
const orgId = route.params.id as string

const { Organization, OrganizationConfig } = useRepository()

const items = ref<Record<string, unknown>[]>([])
const organization = ref<Record<string, unknown>>({})

onMounted(async () => {
  const [orgRes, configRes] = await Promise.all([
    Organization.show(orgId).catch(() => null),
    OrganizationConfig.index(orgId).catch(() => ({ organization_configs: [], configs: [] })),
  ])
  organization.value = (orgRes as Record<string, unknown>) ?? {}

  const res = configRes as Record<string, unknown>
  const configs = (res.configs as Record<string, unknown>[]) ?? []
  const organizationConfigs = (res.organization_configs as Record<string, unknown>[]) ?? []

  // Build keys: merge config definitions with org-specific values
  const keys: Record<string, unknown>[] = []
  configs.forEach((config) => {
    keys.push({ config_id: config.id, key: config.key, value: "" })
  })
  organizationConfigs.forEach((config) => {
    keys.push({ config_id: config.config_id, key: config.key, value: config.value })
  })
  // Sort ascending by key name
  keys.sort((a, b) => ((a.key as string) > (b.key as string) ? 1 : -1))
  items.value = keys

  if (organization.value.name) {
    route.meta.title = `Configuración de: ${organization.value.name} (${organization.value.short_code ?? ''})`
    route.meta.icon = "mdi-domain"
    route.meta.back = "/organization"
    route.meta.showDrawer = false
  }
})

const groupedItems = computed(() => {
  const grouped: Record<string, Record<string, unknown>[]> = {}
  items.value.forEach((item) => {
    const groupName = (item.key as string).split(".")[0]
    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(item)
  })
  return grouped
})

function getLastSegment(str: string): string {
  let stri = str.split(".").pop() ?? ""
  stri = stri.replace(/_/g, " ")
  return stri
}

async function saveOrganizationConfig() {
  await OrganizationConfig.create(orgId, { configs: items.value })
  navigateTo("/organizations")
}

function goBack() {
  navigateTo("/organizations")
}
</script>

<style scoped></style>
