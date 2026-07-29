<template>
  <VDialog id="dlg-profi-dialo-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-plus</VIcon>
        Nuevo Perfil
        <VSpacer />
        <VBtn icon size="x-small" id="btn-profile-dialog-close" @click="close">
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
          <VBtn color="primary" variant="outlined" class="mr-4" id="btn-profile-dialog-cancel" @click="close">
            <VIcon start>mdi-close</VIcon>
            Cancelar
          </VBtn>
          <VBtn color="primary" variant="elevated" type="submit" id="btn-profile-dialog-save">
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
const item = ref<Record<string, unknown>>({})
const organizations = ref<Record<string, unknown>[]>([])
const filterProfile = ref("")

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

function saveProfile() {
  formRef.value?.validate()
  emit("save", { ...item.value })
}
</script>

<style scoped></style>
