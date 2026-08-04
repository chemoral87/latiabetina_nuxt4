<template>
  <VDialog id="dlg-conso-dialo-1" :model-value="true" persistent max-width="500px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">{{ iconTitle }}</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="btn-consolidation-dialog-close" icon size="x-small" :disabled="loading" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <OrganizationSelect
            v-model="item.org_id"
            label="Organización *"
            hide-one
            permission="conso-sheet-index"
            :error-messages="errors?.org_id"
            variant="outlined"
            density="compact"
            :disabled="loading"
            class="mb-2"
          />
          <VTextField
            id="tf-conso-dialo-item-folio_number-1"
            v-model="item.folio_number"
            label="Número de Folio"
            :error-messages="errors?.folio_number"
            :disabled="loading"
            required
            autofocus
            @keyup.enter="save"
          />
          <MyDatePicker
            v-model="item.date"
            label="Fecha"
            :error-messages="errors?.date"
            :disabled="loading"
            required
            class="mt-2"
          />
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="btn-consolidation-dialog-cancel" color="primary" variant="outlined" class="mr-4" :disabled="loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="btn-consolidation-dialog-save" color="primary" variant="elevated" :loading="loading" :disabled="!isValid || loading" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useValidationErrors } from "~/composables/useValidationErrors"

interface SheetItem {
  id?: number | null
  org_id?: number | string | null
  folio_number?: string
  date?: string | null
}

const props = defineProps<{
  sheet?: Record<string, unknown>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Record<string, unknown>): void
}>()

const { errors, clearErrors } = useValidationErrors()

const formRef = ref()
const item = ref<SheetItem>({
  id: null,
  org_id: null,
  folio_number: "",
  date: "",
})

const isEditMode = computed(() => !!item.value.id)
const iconTitle = computed(() => (isEditMode.value ? "mdi-pencil" : "mdi-plus"))
const formTitle = computed(() => (isEditMode.value ? "Editar Consolidado" : "Nuevo Consolidado"))
const isValid = computed(() => !!(item.value.org_id && item.value.folio_number && item.value.date))

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
  if (!isValid.value || props.loading) return
  emit("save", { ...item.value })
}
</script>
