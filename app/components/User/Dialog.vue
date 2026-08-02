<template>
  <VDialog id="dlg-user-dialo-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-account</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn icon size="x-small" id="btn-user-dialog-close" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1" >
        <VForm ref="formRef">
          <VRow density="comfortable">
            <VCol cols="12">
              <VTextField id="tf-user-dialo-item-name-1"
                v-model="item.name"
                label="Nombre"
                variant="outlined"
                :error-messages="errors?.name"
                :rules="[vrules.requiredField('Nombre')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-user-dialo-item-last_name-2"
                v-model="item.last_name"
                label="Ap. Paterno"
                variant="outlined"
                :error-messages="errors?.last_name"
                :rules="[vrules.requiredField('Ap. Paterno')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-user-dialo-item-second_last_name-3"
                v-model="item.second_last_name"
                label="Ap. Materno"
                variant="outlined"
                :error-messages="errors?.second_last_name"
                @keyup.enter="save"
              />
            </VCol>
            <VCol v-if="!item.id" cols="12">
              <VTextField id="tf-user-dialo-item-email-4"
                v-model="item.email"
                label="E-mail"
                variant="outlined"
                :error-messages="errors?.email"
                :rules="[vrules.requiredField('E-mail'), vrules.email]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-user-dialo-item-cellphone-5"
                v-model="item.cellphone"
                label="Celular"
                variant="outlined"
                :error-messages="errors?.cellphone"
                @keyup.enter="save"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn color="primary" variant="outlined" class="mr-4" id="btn-user-dialog-cancel" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" id="btn-user-dialog-save" @click="save">
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
  userx?: Record<string, unknown> | null
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

const formTitle = computed(() => item.value.id ? "Editar Usuario" : "Nuevo Usuario")

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  if (props.userx) {
    item.value = { ...props.userx }
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
