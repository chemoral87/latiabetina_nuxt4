<template>
  <VDialog id="dlg-organ-formd-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-domain</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn icon size="x-small" id="btn-organization-dialog-close" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VForm ref="formRef">
          <VRow density="comfortable">
            <VCol cols="12">
              <VTextField id="tf-organ-formd-item-name-1"
                v-model="item.name"
                label="Nombre"
                :error-messages="errors?.name"
                :rules="[vrules.required]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-organ-formd-item-short_code-2"
                v-model="item.short_code"
                label="Código"
                :error-messages="errors?.short_code"
                :rules="[vrules.required]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField id="tf-organ-formd-item-description-3"
                v-model="item.description"
                label="Descripción"
                :error-messages="errors?.description"
                @keyup.enter="save"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn color="primary" variant="outlined" class="mr-2" id="btn-organization-dialog-cancel" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" id="btn-organization-dialog-save" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useValidationErrors } from "~/composables/useValidationErrors"
import { useVrules } from "~/composables/useVrules"

const props = defineProps<{
  modelValue?: boolean
  organization?: Record<string, unknown> | null
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

const item = ref<Record<string, unknown>>({})

const formTitle = computed(() => item.value.id ? "Editar Organización" : "Nueva Organización")

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
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  emit("save", { ...item.value })
}
</script>
