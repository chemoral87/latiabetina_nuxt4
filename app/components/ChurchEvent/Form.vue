<template>
  <VCard id="cmp-church-event-form">
    <VCardTitle class="d-flex align-center">
      <VIcon class="mr-2">{{ iconTitle }}</VIcon>
      <span class="text-h5">{{ formTitle }}</span>
    </VCardTitle>

    <VCardText class="py-1">
      <VForm ref="formRef" @submit.prevent="save">
        <VAlert v-if="errors?.slug_name" type="error" class="mb-4" density="compact">
          {{ Array.isArray(errors.slug_name) ? errors.slug_name[0] : errors.slug_name }}
        </VAlert>

        <VRow>
          <VCol v-if="showOrgSelect" cols="12" md="3">
            <OrganizationSelect
              v-model="item.org_id"
              :permission="permission"
              variant="outlined"
              density="compact"
              :rules="[vrules.required]"
              :disabled="disabled || isEditMode"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField
              id="tf-churc-form-item-name-1"
              v-model="item.name"
              label="Nombre Evento"
              :error-messages="errors?.name"
              :disabled="disabled"
              required
              autofocus
              @keyup.enter="save"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VTextarea
              v-model="item.description"
              label="Descripción"
              :error-messages="errors?.description"
              :disabled="disabled"
              rows="1"
              auto-grow
            />
          </VCol>

          <VCol cols="12" md="3">
            <MyDatePicker
              v-model="item.publish_date"
              label="Fecha Publicación"
              :error-messages="errors?.publish_date"
              :disabled="disabled"
              required
            />
          </VCol>
          <VCol cols="12" md="3">
            <MyDatePicker
              v-model="item.event_date"
              label="Fecha Evento"
              :error-messages="errors?.event_date"
              :disabled="disabled"
            />
          </VCol>
          <VCol cols="12" md="3">
            <MyTimePicker
              v-model="item.time_start"
              label="Hora"
              :error-messages="errors?.time_start"
              :disabled="disabled"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VTextField
              id="tf-churc-form-item-location-2"
              v-model="item.location"
              label="Lugar"
              :error-messages="errors?.location"
              :disabled="disabled"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VSelect
              v-model="item.classification"
              :items="classificationOptions"
              item-title="label"
              item-value="value"
              label="Clasificación"
              :error-messages="errors?.classification"
              :disabled="disabled"
              clearable
              density="compact"
              variant="outlined"
            >
              <template #item="{ item: optionItem, props: itemProps }">
                <VListItem v-bind="itemProps" :title="undefined">
                  <VChip
                    size="small"
                    variant="elevated"
                    :color="(optionItem.raw as { color?: string })?.color ?? 'grey'"
                    class="mr-2"
                  >
                    {{ optionItem.title }}
                  </VChip>
                </VListItem>
              </template>
              <template #selection="{ item: optionItem }">
                <VChip size="small" variant="elevated" :color="(optionItem.raw as { color?: string })?.color ?? 'grey'">
                  {{ optionItem.title }}
                </VChip>
              </template>
            </VSelect>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" md="6">
            <MyUploadimage
              v-model="item.image_file"
              label="Imagen del evento"
              v-model:url="item.url_image"
              :disabled="disabled"
              @loading="imageLoading = true"
              @change="imageLoading = false"
            />
          </VCol>
        </VRow>

        <VRow v-if="previewImage || imageLoading">
          <VCol cols="12">
            <MyPreviewImage :src="previewImage" :loading="imageLoading" loading-text="Procesando imagen..." />
          </VCol>
        </VRow>
      </VForm>
    </VCardText>

    <div class="d-flex justify-end px-4 pb-4">
      <VBtn color="primary" variant="text" :disabled="disabled || imageLoading" id="btn-churchevent-form-cancel" @click="close">
        Cancelar
      </VBtn>
      <VBtn
        color="primary"
        variant="elevated"
        :loading="saving || loading"
        :disabled="saving || loading || imageLoading"
        id="btn-churchevent-form-save"
        @click="save"
      >
        Guardar
      </VBtn>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { classifications } from "./classifications"
import { useValidationErrors } from "~/composables/useValidationErrors"
import { useVrules } from "~/composables/useVrules"
import { useAuthStore } from "~/composables/useAuth"

interface ChurchEventItem {
  id?: number | null
  name: string
  org_id?: number | string | null
  description?: string
  publish_date: string
  event_date: string
  time_start?: string
  location?: string
  classification?: string | null
  url_image: string
  url_image_s3?: string
  image_file?: unknown
}

const props = defineProps<{
  churchEvent?: Record<string, unknown>
  loading?: boolean
  permission?: string
  initialEventDate?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Record<string, unknown>): void
}>()

const { vrules } = useVrules()
const { errors: validationErrors, clearErrors } = useValidationErrors()
const auth = useAuthStore()

const formRef = ref()
const saving = ref(false)
const imageLoading = ref(false)

const item = ref<ChurchEventItem>({
  id: null,
  name: "",
  org_id: null,
  description: "",
  publish_date: "",
  event_date: "",
  time_start: "",
  location: "",
  classification: null,
  url_image: "",
  url_image_s3: "",
  image_file: null,
})

watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

const isEditMode = computed(() => !!item.value.id)
const iconTitle = computed(() => (isEditMode.value ? "mdi-pencil" : "mdi-plus"))
const formTitle = computed(() => (isEditMode.value ? "Editar" : "Nuevo"))

const classificationOptions = computed(() => classifications.map((c) => ({ ...c, color: c.hex })))

const previewImage = computed(() => {
  if (item.value.url_image && typeof item.value.url_image === "string" && item.value.url_image.startsWith("data:")) {
    return item.value.url_image
  }
  return item.value.url_image_s3 || ""
})

const errors = computed(() => {
  const base = validationErrors.value ? { ...validationErrors.value } : {}
  if (base.slug_name) {
    base.name = base.name ? [...base.name, ...(base.slug_name as string[])] : [...(base.slug_name as string[])]
  }
  return base
})

const showOrgSelect = computed(() => {
  const orgIds = auth.permissionsOrg[props.permission ?? "church-event-index"] ?? []
  return Array.isArray(orgIds) && orgIds.length > 1
})

watch(
  () => props.churchEvent,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as ChurchEventItem
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  initializeForm()
})

function initializeForm() {
  if (props.churchEvent && Object.keys(props.churchEvent).length > 0) {
    item.value = { ...item.value, ...props.churchEvent } as ChurchEventItem
  }
  // Pre-fill event_date from calendar click
  if (props.initialEventDate && !item.value.event_date) {
    item.value.event_date = props.initialEventDate
  }
  // Pre-fill publish_date with today if not set
  if (!item.value.publish_date) {
    const d = new Date()
    item.value.publish_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }
  // Auto-set org_id when user only has access to one org
  if (!item.value.org_id && !showOrgSelect.value) {
    const orgIds = auth.permissionsOrg[props.permission ?? "church-event-index"] ?? []
    if (Array.isArray(orgIds) && orgIds.length === 1) {
      item.value.org_id = orgIds[0]
    }
  }
  clearErrors()
}

function close() {
  emit("close")
}

async function save() {
  if (saving.value || props.loading) return
  const form = formRef.value
  const { valid } = form ? await form.validate() : { valid: true }
  if (!valid) return
  if (saving.value || props.loading) return
  saving.value = true

  const payload: Record<string, unknown> = { ...item.value }
  if (isEditMode.value) {
    delete payload.org_id
  }
  emit("save", payload)
}
</script>
