<template>
  <VCard id="cmp-church-event-form">
    <VCardTitle class="d-flex align-center">
      <VIcon class="mr-2">{{ iconTitle }}</VIcon>
      <span class="text-h5">{{ formTitle }}</span>
    </VCardTitle>

    <VCardText class="py-1">
      <VForm ref="formRef" @submit.prevent="save">
        <VAlert
          v-if="errors?.slug_name"
          class="mb-4"
          type="error"
          density="compact"
        >
          {{
            Array.isArray(errors.slug_name)
              ? errors.slug_name[0]
              : errors.slug_name
          }}
        </VAlert>

        <VRow>
          <VCol v-if="showOrgSelect" md="3" cols="12">
            <OrganizationSelect
              v-model="item.org_id"
              required
              density="compact"
              variant="outlined"
              :permission="permission"
              :disabled="disabled || isEditMode"
              :rules="[vrules.requiredField('Organización')]"
            />
          </VCol>
          <VCol md="3" cols="12">
            <VTextField
              id="eve-form-item-name-tf-1"
              v-model="item.name"
              required
              autofocus
              density="compact"
              variant="outlined"
              :disabled="disabled"
              label="Nombre Evento"
              :error-messages="errors?.name"
              :rules="[vrules.requiredField('Nombre Evento')]"
              @keyup.enter="save"
            />
          </VCol>
          <VCol md="6" cols="12">
            <VTextarea
              v-model="item.description"
              rows="1"
              auto-grow
              density="compact"
              variant="outlined"
              label="Descripción"
              :disabled="disabled"
              :error-messages="errors?.description"
            />
          </VCol>

          <VCol md="3" cols="12">
            <MyDatePicker
              id="eve-form-publish-date"
              v-model="item.publish_date"
              required
              density="compact"
              variant="outlined"
              :disabled="disabled"
              label="Fecha Publicación"
              :error-messages="errors?.publish_date"
            />
          </VCol>
          <VCol md="3" cols="12">
            <MyDatePicker
              id="eve-form-event-date"
              v-model="item.event_date"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              label="Fecha Evento"
              :error-messages="errors?.event_date"
            />
          </VCol>
          <VCol md="3" cols="12">
            <MyTimePicker
              v-model="item.time_start"
              dense
              outlined
              label="Hora"
              :disabled="disabled"
              :error-messages="errors?.time_start"
            />
          </VCol>
          <VCol md="3" cols="12">
            <VTextField
              id="eve-form-location"
              v-model="item.location"
              label="Lugar"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              :error-messages="errors?.location"
            />
          </VCol>
          <VCol md="3" cols="12">
            <VSelect
              id="eve-form-classification"
              v-model="item.classification"
              clearable
              density="compact"
              item-title="label"
              item-value="value"
              variant="outlined"
              :disabled="disabled"
              label="Clasificación"
              :items="classificationOptions"
              :error-messages="errors?.classification"
            >
              <template #item="{ item: optionItem, props: itemProps }">
                <VListItem v-bind="itemProps" :title="undefined">
                  <VChip
                    class="mr-2"
                    size="small"
                    variant="elevated"
                    :color="
                      (optionItem as { color?: string })?.color ?? 'grey'
                    "
                  >
                    {{ (optionItem as { label?: string })?.label }}
                  </VChip>
                </VListItem>
              </template>
              <template #selection="{ item: optionItem }">
                <VChip
                  size="small"
                  variant="elevated"
                  :color="
                    (optionItem as { color?: string })?.color ?? 'grey'
                  "
                >
                  {{ (optionItem as { label?: string })?.label }}
                </VChip>
              </template>
            </VSelect>
          </VCol>
        </VRow>

        <VRow>
          <VCol md="6" cols="12">
            <MyUploadimage
              v-model="item.image_file"
              v-model:url="item.url_image"
              :disabled="disabled"
              label="Imagen del evento"
              @change="imageLoading = false"
              @loading="imageLoading = true"
            />
          </VCol>
        </VRow>

        <VRow v-if="previewImage || imageLoading">
          <VCol cols="12">
            <MyPreviewImage
              :src="previewImage"
              :loading="imageLoading"
              loading-text="Procesando imagen..."
            />
          </VCol>
        </VRow>
      </VForm>
    </VCardText>

    <div class="d-flex justify-end px-4 pb-4">
      <VBtn
        id="eve-form-cancel-btn"
        variant="text"
        color="primary"
        :disabled="disabled || imageLoading"
        @click="close"
      >
        Cancelar
      </VBtn>
      <VBtn
        id="eve-form-save-btn"
        color="primary"
        variant="elevated"
        :loading="saving || loading"
        :disabled="saving || loading || imageLoading"
        @click="save"
      >
        Guardar
      </VBtn>
    </div>
  </VCard>
</template>

<script setup lang="ts">
import { classifications } from "./classifications";
import { useValidationErrors } from "~/composables/useValidationErrors";
import { useVrules } from "~/composables/useVrules";
import { useAuthStore } from "~/composables/useAuth";

interface ChurchEventItem {
  id?: number | null;
  name: string;
  org_id?: number | string | null;
  description?: string;
  publish_date: string;
  event_date: string;
  time_start?: string;
  location?: string;
  classification?: string | null;
  url_image: string;
  url_image_s3?: string;
  image_file?: unknown;
}

const props = defineProps<{
  churchEvent?: Record<string, unknown>;
  loading?: boolean;
  permission?: string;
  initialEventDate?: string | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", val: Record<string, unknown>): void;
}>();

const { vrules } = useVrules();
const { errors: validationErrors, clearErrors } = useValidationErrors();
const auth = useAuthStore();

const formRef = ref();
const saving = ref(false);
const imageLoading = ref(false);

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
});

watch(
  () => props.loading,
  (val) => {
    if (!val) saving.value = false;
  },
  { immediate: true },
);

const isEditMode = computed(() => !!item.value.id);
const iconTitle = computed(() =>
  isEditMode.value ? "mdi-pencil" : "mdi-plus",
);
const formTitle = computed(() => (isEditMode.value ? "Editar" : "Nuevo"));

const classificationOptions = computed(() =>
  classifications.map((c) => ({ ...c, color: c.hex })),
);

const previewImage = computed(() => {
  if (
    item.value.url_image &&
    typeof item.value.url_image === "string" &&
    item.value.url_image.startsWith("data:")
  ) {
    return item.value.url_image;
  }
  return item.value.url_image_s3 || "";
});

const errors = computed(() => {
  const base = validationErrors.value ? { ...validationErrors.value } : {};
  if (base.slug_name) {
    base.name = base.name
      ? [...base.name, ...(base.slug_name as string[])]
      : [...(base.slug_name as string[])];
  }
  return base;
});

const showOrgSelect = computed(() => {
  const orgIds =
    auth.permissionsOrg[props.permission ?? "church-event-index"] ?? [];
  return Array.isArray(orgIds) && orgIds.length > 1;
});

watch(
  () => props.churchEvent,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as ChurchEventItem;
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  initializeForm();
});

function initializeForm() {
  if (props.churchEvent && Object.keys(props.churchEvent).length > 0) {
    item.value = { ...item.value, ...props.churchEvent } as ChurchEventItem;
  }
  // Pre-fill event_date from calendar click
  if (props.initialEventDate && !item.value.event_date) {
    item.value.event_date = props.initialEventDate;
  }
  // Pre-fill publish_date with today if not set
  if (!item.value.publish_date) {
    const d = new Date();
    item.value.publish_date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  // Auto-set org_id when user only has access to one org
  if (!item.value.org_id && !showOrgSelect.value) {
    const orgIds =
      auth.permissionsOrg[props.permission ?? "church-event-index"] ?? [];
    if (Array.isArray(orgIds) && orgIds.length === 1) {
      item.value.org_id = orgIds[0];
    }
  }
  clearErrors();
}

function close() {
  emit("close");
}

async function save() {
  if (saving.value || props.loading) return;
  const form = formRef.value;
  const { valid } = form ? await form.validate() : { valid: true };
  if (!valid) return;
  if (saving.value || props.loading) return;
  saving.value = true;

  const payload: Record<string, unknown> = { ...item.value };
  if (isEditMode.value) {
    delete payload.org_id;
  }
  emit("save", payload);
}
</script>
