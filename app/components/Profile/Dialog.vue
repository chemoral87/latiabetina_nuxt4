<template>
  <VDialog id="dlg-profi-dialo-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-plus</VIcon>
        Nuevo Perfil
        <VSpacer />
        <VBtn id="btn-profile-dialog-close" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VForm ref="formRef" @submit.prevent="saveProfile">
        <VCardText class="py-1">
          <VRow density="comfortable">
            <VCol cols="12">
              <VTextField id="tf-profi-dialo-filterprofile-1"
                v-model="filterProfile"
                label="Filtro"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                clearable
                hide-details
                @keyup.enter="searchOrganizations"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="item.org_id"
                :items="organizations"
                item-value="id"
                item-title="name"
                label="Organizaciones"
                variant="outlined"
                :rules="[vrules.required]"
              />
            </VCol>
          </VRow>
        </VCardText>

        <div class="d-flex justify-end px-4 pb-4">
          <VBtn id="btn-profile-dialog-cancel" color="primary" variant="outlined" class="mr-4" @click="close">
            <VIcon start>mdi-close</VIcon>
            Cancelar
          </VBtn>
          <VBtn id="btn-profile-dialog-save" color="primary" variant="elevated" type="submit" :loading="saving || loading" :disabled="saving || loading">
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
