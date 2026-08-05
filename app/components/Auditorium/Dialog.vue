<template>
  <VDialog id="aud-dialog-dlg-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-seat</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="aud-dialog-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol v-if="!item.id" cols="12">
              <OrganizationSelect id="aud-dialog-org" v-model="item.org_id" permission="auditorium-index" hide-one density="compact"  variant="outlined" :rules="[vrules.requiredField('Organización')]" />
            </VCol>
            <VCol cols="12">
              <VTextField id="aud-dialog-name"
                v-model="item.name"
                label="Nombre"
                variant="outlined"
                density="compact"
                :error-messages="errors?.name"
                :rules="[vrules.requiredField('Nombre')]"
                :disabled="saving || loading"
                @keyup.enter="save"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="aud-dialog-cancel-btn" color="primary" variant="outlined" class="mr-4" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="aud-dialog-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useValidationErrors } from "~/composables/useValidationErrors"
import { useVrules } from "~/composables/useVrules"

const props = defineProps<{
  auditorium?: Record<string, unknown> | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', item: Record<string, unknown>): void
}>()

const { errors, clearErrors } = useValidationErrors()
const { vrules } = useVrules()

const formRef = ref()
const dialogVisible = ref(true)
const saving = ref(false)

const item = ref<Record<string, unknown>>({})

const formTitle = computed(() => item.value.id ? "Editar Auditorio" : "Nuevo Auditorio")

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  if (props.auditorium) {
    item.value = { ...props.auditorium }
  }
})

function close() {
  clearErrors()
  emit("close")
}

async function save() {
  if (saving.value || props.loading) return
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  if (saving.value || props.loading) return
  saving.value = true
  const payload = { ...item.value }
  if (item.value.id) {
    delete payload.org_id
  }
  emit("save", payload)
}
</script>

<style scoped></style>
