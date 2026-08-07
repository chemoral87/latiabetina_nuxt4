<template>
  <VDialog id="usp-dialo-dlg-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-plus</VIcon>
        Nuevo Perfil
        <VSpacer />
        <VBtn id="profile-dialog-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VForm ref="formRef" @submit.prevent="saveProfile">
        <VCardText class="py-1">
          <VRow density="comfortable">
            <VCol cols="12">
              <VTextField id="usp-dialo-filterprofile-tf-1"
                v-model="filterProfile"
                clearable
                hide-details
                label="Filtro"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                @keyup.enter="searchOrganizations"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="item.org_id"
                required
                item-value="id"
                item-title="name"
                variant="outlined"
                :items="organizations"
                label="Organizaciones"
                :rules="[vrules.required]"
              />
            </VCol>
          </VRow>
        </VCardText>

        <div class="d-flex justify-end px-4 pb-4">
          <VBtn id="profile-dialog-cancel-btn" class="mr-4" color="primary" variant="outlined" @click="close">
            <VIcon start>mdi-close</VIcon>
            Cancelar
          </VBtn>
          <VBtn id="profile-dialog-save-btn" type="submit" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading">
            <VIcon start>mdi-content-save</VIcon>
            Guardar
          </VBtn>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useVrules } from "~/composables/useVrules"

const props = defineProps<{
  modelValue?: boolean
  userId: string | number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'close'): void
  (e: 'save', item: Record<string, unknown>): void
}>()

const { vrules } = useVrules()
const { Organization } = useRepository()

const formRef = ref()
const dialogVisible = ref(true)
const saving = ref(false)
const item = ref<Record<string, unknown>>({})
const organizations = ref<Record<string, unknown>[]>([])
const filterProfile = ref("")

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  searchOrganizations()
})

function searchOrganizations() {
  const params: Record<string, unknown> = {}
  if (filterProfile.value) {
    params.queryText = filterProfile.value
  }
  params.user_id = props.userId
  Organization.filter(params).then((res) => {
    organizations.value = Array.isArray(res) ? res : []
  })
}

function close() {
  emit("close")
}

async function saveProfile() {
  if (saving.value || props.loading) return
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  if (saving.value || props.loading) return
  saving.value = true
  emit("save", { ...item.value })
}
</script>

<style scoped></style>
