<template>
  <VDialog id="pro-dialog-dlg-1" v-model="dialogVisible" persistent max-width="600px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-account-plus</VIcon>
        Publicar Servicio Profesional
        <VSpacer />
        <DialogCloseButton id="pro-dialog-close-btn" @close="close" />
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="compact">
            <VCol md="6" cols="12">
              <VTextField
                id="pro-dialog-name"
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
            <VCol md="6" cols="12">
              <VTextField
                id="pro-dialog-last-name"
                v-model="item.last_name"
                required
                label="Apellido"
                variant="outlined"
                :error-messages="errors?.last_name"
                :rules="[vrules.requiredField('Apellido')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="6" cols="12">
              <VTextField
                id="pro-dialog-phone-number"
                v-model="item.phone_number"
                required
                label="Teléfono"
                variant="outlined"
                :error-messages="errors?.phone_number"
                :rules="[vrules.requiredField('Teléfono'), vrules.phone]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="6" cols="12">
              <VSelect
                id="pro-dialog-status"
                v-model="item.status"
                required
                variant="outlined"
                :items="statusItems"
                label="Estado laboral"
                :error-messages="errors?.status"
                :rules="[vrules.requiredField('Estado laboral')]"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="pro-dialog-title"
                v-model="item.title"
                required
                variant="outlined"
                label="Profesión u oficio"
                :error-messages="errors?.title"
                :rules="[vrules.requiredField('Profesión u oficio')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                id="pro-dialog-description"
                v-model="item.description"
                rows="3"
                auto-grow
                variant="outlined"
                label="Descripción (opcional)"
                :error-messages="errors?.description"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="pro-dialog-cancel-btn" class="mr-4" color="primary" variant="outlined" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="pro-dialog-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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
import type { ProfessionalStatus } from "~/types/models/professional"

const props = defineProps<{
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

const statusItems = [
  { title: "Desempleado", value: "unemployed" },
  { title: "Independiente", value: "selfemployed" },
  { title: "Empleado", value: "employed" },
  { title: "Estudiante", value: "student" },
  { title: "Jubilado", value: "retired" },
]

const item = ref<Record<string, unknown>>({
  name: "",
  last_name: "",
  phone_number: "",
  title: "",
  description: "",
  status: "unemployed" as ProfessionalStatus,
})

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  clearErrors()
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
