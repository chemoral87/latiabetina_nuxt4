<template>
  <VDialog :id="id" persistent max-width="500px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">{{ iconTitle }}</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="con-dialog-close-btn" icon size="x-small" :disabled="saving || loading" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <OrganizationSelect
            v-model="item.org_id"
            hide-one
            required
            class="mb-2"
            density="compact"
            variant="outlined"
            label="Organización"
            :disabled="saving || loading"
            permission="conso-sheet-index"
            :error-messages="errors?.org_id"
            :rules="[vrules.requiredField('Organización')]"
          />
          <VTextField
            id="con-dialog-folio-number"
            v-model="item.folio_number"
            required
            autofocus
            density="compact"
            variant="outlined"
            label="Número de Folio"
            :disabled="saving || loading"
            :error-messages="errors?.folio_number"
            :rules="[vrules.requiredField('Número de Folio')]"
            @keyup.enter="save"
          />
          <MyDatePicker
            v-model="item.date"
            required
            class="mt-2"
            label="Fecha"
            density="compact"
            variant="outlined"
            :disabled="saving || loading"
            :error-messages="errors?.date"
            :rules="[vrules.requiredField('Fecha')]"
          />
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="con-dialog-cancel-btn" class="mr-4" color="primary" variant="outlined" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="con-dialog-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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

interface SheetItem {
  id?: number | null
  org_id?: number | string | null
  folio_number?: string
  date?: string | null
}

const props = withDefaults(defineProps<{
  id?: string
  sheet?: Record<string, unknown>
  loading?: boolean
}>(), {
  id: "con-dialo-dlg-1",
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Record<string, unknown>): void
}>()

const { errors, clearErrors } = useValidationErrors()
const { vrules } = useVrules()

const formRef = ref()
const item = ref<SheetItem>({
  id: null,
  org_id: null,
  folio_number: "",
  date: "",
})
const saving = ref(false)

const isEditMode = computed(() => !!item.value.id)
const iconTitle = computed(() => (isEditMode.value ? "mdi-pencil" : "mdi-plus"))
const formTitle = computed(() => (isEditMode.value ? "Editar Consolidado" : "Nuevo Consolidado"))

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

watch(
  () => props.sheet,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as SheetItem
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  if (props.sheet && Object.keys(props.sheet).length > 0) {
    item.value = { ...item.value, ...props.sheet } as SheetItem
  } else {
    // Default to today
    const today = new Date().toISOString().substr(0, 10)
    item.value.date = today
  }
  clearErrors()
})

function close() {
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
