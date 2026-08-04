<template>
  <VDialog id="dlg-testi-dialo-1" :model-value="true" persistent max-width="600px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-comment-text-outline</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="btn-testimony-dialog-close" icon size="x-small" :disabled="saving || loading" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol cols="12">
              <OrganizationSelect
                v-model="item.org_id"
                permission="testimony-index"
                hide-one
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-domain"
                :disabled="loading || saving || isEditMode"
                :rules="[vrules.requiredField('Organización')]"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tf-testi-dialo-item-name-1"
                v-model="item.name"
                label="Nombre"
                variant="outlined"
                prepend-inner-icon="mdi-account-outline"
                :error-messages="errors?.name"
                :disabled="loading || saving"
                :rules="[vrules.requiredField('Nombre')]"
                autofocus
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tf-testi-dialo-item-phone_number-2"
                v-model="item.phone_number"
                label="Teléfono"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                :error-messages="errors?.phone_number"
                :disabled="loading || saving"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tf-testi-dialo-categoriesstring-3"
                v-model="categoriesString"
                label="Categorías (coma separadas)"
                variant="outlined"
                prepend-inner-icon="mdi-tag-multiple-outline"
                :disabled="loading || saving"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tf-testi-dialo-item-link-4"
                v-model="item.link"
                label="Enlace"
                variant="outlined"
                prepend-inner-icon="mdi-link"
                :disabled="loading || saving"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="item.description"
                label="Descripción"
                variant="outlined"
                rows="4"
                prepend-inner-icon="mdi-text-box-outline"
                :error-messages="errors?.description"
                :disabled="loading || saving"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="btn-testimony-dialog-cancel" color="primary" variant="outlined" class="mr-4" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="btn-testimony-dialog-save" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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

interface TestimonyItem {
  id?: number | null
  name: string
  phone_number?: string
  categories: string[]
  link?: string | null
  description?: string
  org_id?: number | string | null
}

const props = defineProps<{
  testimony?: Record<string, unknown>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Record<string, unknown>): void
}>()

const { vrules } = useVrules()
const { errors, clearErrors } = useValidationErrors()

const formRef = ref()
const saving = ref(false)
const item = ref<TestimonyItem>({
  id: null,
  name: "",
  phone_number: "",
  categories: [],
  link: null,
  description: "",
  org_id: null,
})

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

const isEditMode = computed(() => !!item.value.id)

const formTitle = computed(() => (isEditMode.value ? "Editar Testimonio" : "Nuevo Testimonio"))

const categoriesString = computed<string>({
  get() {
    return Array.isArray(item.value.categories) ? item.value.categories.join(", ") : ""
  },
  set(v: string) {
    item.value.categories = v
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  },
})

watch(
  () => props.testimony,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = {
        id: null,
        name: "",
        phone_number: "",
        categories: [],
        link: null,
        description: "",
        org_id: null,
        ...val,
      }
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  if (props.testimony && Object.keys(props.testimony).length > 0) {
    item.value = { ...item.value, ...props.testimony } as TestimonyItem
  }
  clearErrors()
})

function close() {
  emit("close")
}

async function save() {
  if (saving.value || props.loading) return
  const form = formRef.value
  const { valid } = form ? await form.validate() : { valid: true }
  if (!valid) return
  // Re-check after the async gap — both clicks pass the first guard while
  // validate() is pending, so only the first one may proceed.
  if (saving.value || props.loading) return
  saving.value = true
  emit("save", { ...item.value })
}
</script>
