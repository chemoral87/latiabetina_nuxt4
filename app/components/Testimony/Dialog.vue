<template>
  <VDialog id="tes-dialo-dlg-1" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-comment-text-outline</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="tes-dialog-close-btn" icon size="x-small" :disabled="saving || loading" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol cols="12">
              <OrganizationSelect
                v-model="item.org_id"
                hide-one
                required
                density="compact"
                variant="outlined"
                permission="testimony-index"
                prepend-inner-icon="mdi-domain"
                :disabled="loading || saving || isEditMode"
                :rules="[vrules.requiredField('Organización')]"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tes-dialo-item-name-tf-1"
                v-model="item.name"
                required
                autofocus
                label="Nombre"
                variant="outlined"
                :disabled="loading || saving"
                :error-messages="errors?.name"
                prepend-inner-icon="mdi-account-outline"
                :rules="[vrules.requiredField('Nombre')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tf-testi-dialo-item-phone_number-2"
                v-model="item.phone_number"
                label="Teléfono"
                variant="outlined"
                :disabled="loading || saving"
                prepend-inner-icon="mdi-phone"
                :error-messages="errors?.phone_number"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tes-dialo-categoriesstring-tf-3"
                v-model="categoriesString"
                variant="outlined"
                :disabled="loading || saving"
                label="Categorías (coma separadas)"
                prepend-inner-icon="mdi-tag-multiple-outline"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="tes-dialo-item-link-tf-4"
                v-model="item.link"
                label="Enlace"
                variant="outlined"
                :disabled="loading || saving"
                prepend-inner-icon="mdi-link"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="item.description"
                rows="4"
                variant="outlined"
                label="Descripción"
                :disabled="loading || saving"
                :error-messages="errors?.description"
                prepend-inner-icon="mdi-text-box-outline"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="tes-dialog-cancel-btn" class="mr-4" color="primary" variant="outlined" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="tes-dialog-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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
