<template>
  <VDialog id="dlg-organ-formd-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-domain</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="btn-organization-dialog-close" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef">
          <VRow density="comfortable">
            <VCol cols="12">
              <VTextField id="tf-organ-formd-item-name-1"
                v-model="item.name"
                label="Nombre"
                variant="outlined"
                :error-messages="errors?.name"
                :rules="[vrules.requiredField('Nombre')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-organ-formd-item-short_code-2"
                v-model="item.short_code"
                label="Código"
                variant="outlined"
                :error-messages="errors?.short_code"
                :rules="[vrules.requiredField('Código')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-organ-formd-item-description-3"
                v-model="item.description"
                label="Descripción"
                variant="outlined"
                :error-messages="errors?.description"
                @keyup.enter="save"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="btn-organization-dialog-cancel" color="primary" variant="outlined" class="mr-4" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="btn-organization-dialog-save" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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
  modelValue?: boolean
  organization?: Record<string, unknown> | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'close'): void
  (e: 'save', item: Record<string, unknown>): void
}>()

const { errors, clearErrors } = useValidationErrors()
const { vrules } = useVrules()

const formRef = ref()

const dialogVisible = ref(true)
const saving = ref(false)

const item = ref<Record<string, unknown>>({})

const formTitle = computed(() => item.value.id ? "Editar Organización" : "Nueva Organización")

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  if (props.organization) {
    item.value = { ...props.organization }
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
