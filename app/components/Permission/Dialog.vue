<template>
  <VDialog id="per-dialog-dlg-1" v-model="dialogVisible" persistent max-width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-key-variant</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="per-dialog-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol cols="12">
              <VTextField
                id="per-dialog-name-tf-1"
                v-model="item.name"
                required
                autofocus
                label="Nombre"
                variant="outlined"
                :error-messages="errors?.name"
                :rules="[vrules.requiredField('Nombre')]"
                @keyup.enter="save"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="per-dialog-cancel-btn" class="mr-4" color="primary" variant="outlined" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="per-dialog-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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
  permission?: Record<string, unknown> | null
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

const item = ref<Record<string, unknown>>({ name: "" })

const isEditMode = computed(() => !!item.value.id)
const formTitle = computed(() => isEditMode.value ? "Editar Permiso" : "Nuevo Permiso")

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  clearErrors()
  if (props.permission && Object.keys(props.permission).length > 0) {
    item.value = { ...props.permission }
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
  emit("save", { ...item.value })
}
</script>

<style scoped></style>