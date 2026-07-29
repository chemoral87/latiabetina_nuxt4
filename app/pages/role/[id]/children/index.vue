<template>
  <VContainer :fluid="true">
    <VRow>
      <!-- Existing permissions -->
      <VCol cols="12">
        <VCard id="card-role-permissions" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
            <VIcon start size="small" color="primary">mdi-key-variant</VIcon>
            Permisos del rol
          </VCardTitle>
          <VCardText>
            <PermissionCombobox
              :key="comboboxKey"
              label="Buscar y asignar permisos"
              :permissionsx="(mRole.permissions as Record<string, unknown>[]) ?? []"
              @model-change="setPermissions"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Create new permission on the fly -->
      <VCol cols="12">
        <VCard id="card-role-new-permission" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
            <VIcon start size="small" color="success">mdi-plus-circle-outline</VIcon>
            Crear nuevo permiso
          </VCardTitle>
          <VCardText class="pb-2">
            <VRow dense align="center">
              <VCol cols="12">
                <VTextField
                  id="tf-role-index-newpermissionname-1"
                  v-model="newPermissionName"
                  label="Nombre del permiso"
                  placeholder="ej. product-create"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                  :loading="creatingPermission"
                  :disabled="creatingPermission"
                  @keyup.enter="createAndAddPermission"
                />
              </VCol>
              <VCol cols="auto" class="pt-2">
                <VBtn
                  id="btn-roldtl-create-perm"
                  color="success"
                  :disabled="!newPermissionName || creatingPermission"
                  :loading="creatingPermission"
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
        <VCard id="card-roldtl-actions" variant="outlined">
          <VCardText class="d-flex justify-end pa-4">
            <VBtn id="btn-roldtl-cancel" color="primary" variant="outlined" class="mr-4" @click="navigateTo('/role')">
              <VIcon start>mdi-close</VIcon>
              Cancelar
            </VBtn>
            <VBtn id="btn-roldtl-save" color="primary" variant="elevated" @click="saveRolePermissions()">
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
})

const route = useRoute()
const roleId = route.params.id as string

const { Role } = useRepository()
const { $api } = useApi()

const mRole = ref<Record<string, unknown>>({})
const comboboxKey = ref(0)
const newPermissionName = ref("")
const creatingPermission = ref(false)

// Snackbar
const notify = useNotifyStore()

onMounted(async () => {
  const res = await Role.show(roleId).catch(() => null)
  mRole.value = (res as Record<string, unknown>) ?? {}
  if (mRole.value.name) {
    route.meta.title = `Rol ${mRole.value.name}`
    route.meta.icon = "mdi-redhat"
    route.meta.back = "/role"
    route.meta.showDrawer = false
  } else {
    route.meta.title = "Permisos del Rol"
  }
})

function setPermissions(permissions: Record<string, unknown>[]) {
  mRole.value.permissions = permissions
}

async function createAndAddPermission() {
  const name = (newPermissionName.value || "").trim()
  if (!name) return

  const currentPermissions = (mRole.value.permissions as Record<string, unknown>[]) ?? []
  const alreadyAssigned = currentPermissions.some(
    (p) => (p.name as string).toLowerCase() === name.toLowerCase()
  )
  if (alreadyAssigned) {
    notify.notify({ warning: `El permiso "${name}" ya está asignado al rol.` })
    return
  }

  creatingPermission.value = true
  try {
    const res = await $api<{ permission: Record<string, unknown> }>(`/role/${mRole.value.id as number}/permission`, {
      method: "POST",
      body: { name },
    })
    if (!mRole.value.permissions) mRole.value.permissions = []
    mRole.value.permissions = [...(mRole.value.permissions as Record<string, unknown>[]), res.permission]
    comboboxKey.value++
    newPermissionName.value = ""
    notify.notify({ success: `Permiso "${res.permission.name}" agregado al rol.` })
  } catch (e) {
    const errMsg = (e as Record<string, unknown>)?.response
      ? ((e as Record<string, unknown>).response as Record<string, unknown>)?.data as Record<string, unknown>
      : {}
    const msg =
      ((errMsg?.errors as Record<string, string[]>)?.["name"]?.[0]) ??
      (errMsg?.message as string) ??
      "Error al crear el permiso."
    notify.notify({ error: msg })
  } finally {
    creatingPermission.value = false
  }
}

async function saveRolePermissions() {
  const permissionsIds = ((mRole.value.permissions as Record<string, unknown>[]) ?? []).map((x) => x.id)
  await Role.children(roleId, { permissionsIds })
  navigateTo("/role")
}
</script>

<style scoped></style>
