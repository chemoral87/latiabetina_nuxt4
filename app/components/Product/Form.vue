<template>
  <div id="cmp-product-form">
    <VForm ref="formRef" @submit.prevent="save">
      <!-- Section 1: Información básica -->
      <VCard id="prd-form-card-1" variant="outlined">
        <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
          <VIcon start size="small" color="primary"
            >mdi-information-outline</VIcon
          >
          Información del producto
        </VCardTitle>
        <VCardText>
          <VRow dense>
            <VCol v-if="showOrgSelect" cols="12">
              <OrganizationSelect
                v-model="item.org_id"
                required
                density="compact"
                variant="outlined"
                :disabled="loading"
                :permission="permission"
                :rules="[vrules.required]"
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                id="prd-form-item-name-tf-1"
                v-model="item.name"
                required
                autofocus
                label="Nombre"
                density="compact"
                variant="outlined"
                :disabled="loading"
                :rules="[vrules.required]"
                :error-messages="errors?.name"
                @keyup.enter="save"
              />
            </VCol>

            <VCol md="6" cols="12">
              <VTextField
                id="prd-form-item-sku-tf-2"
                v-model="item.sku"
                label="SKU"
                density="compact"
                variant="outlined"
                :disabled="loading"
                :error-messages="errors?.sku"
              />
            </VCol>

            <VCol cols="12">
              <VTextarea
                v-model="item.description"
                rows="3"
                density="compact"
                variant="outlined"
                :disabled="loading"
                label="Descripción"
                :error-messages="errors?.description"
              />
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Section 2: Precio, existencias e imagen -->
      <VCard id="prd-form-card-2" class="mt-4" variant="outlined">
        <VCardTitle class="text-subtitle-1 font-weight-medium pb-2">
          <VIcon start size="small" color="primary">mdi-currency-usd</VIcon>
          Precio y existencias
        </VCardTitle>
        <VCardText>
          <VRow dense>
            <!-- Left column: numeric fields -->
            <VCol md="6" cols="12">
              <VRow dense>
                <VCol sm="6" cols="12">
                  <VTextField
                    id="prd-form-item-price-tf-3"
                    v-model="item.price"
                    required
                    type="number"
                    label="Precio"
                    placeholder="0"
                    density="compact"
                    variant="outlined"
                    class="no-spinners"
                    :disabled="loading"
                    :error-messages="errors?.price"
                    :rules="[vrules.numeric, vrules.min(0)]"
                  />
                </VCol>

                <VCol sm="6" cols="12">
                  <VTextField
                    id="prd-form-item-stock-tf-4"
                    v-model="item.stock"
                    required
                    label="Stock"
                    type="number"
                    placeholder="0"
                    density="compact"
                    variant="outlined"
                    class="no-spinners"
                    :disabled="loading"
                    :error-messages="errors?.stock"
                    :rules="[vrules.numeric, vrules.min(0)]"
                  />
                </VCol>

                <VCol sm="6" cols="12">
                  <VTextField
                    id="prd-form-item-order-tf-5"
                    v-model="item.order"
                    label="Orden"
                    type="number"
                    placeholder="0"
                    density="compact"
                    variant="outlined"
                    class="no-spinners"
                    :disabled="loading"
                    :error-messages="errors?.order"
                  />
                </VCol>

                <VCol sm="6" cols="12">
                  <div class="d-flex align-center">
                    <VIcon class="mr-2" size="small" color="grey-darken-1"
                      >mdi-eye</VIcon
                    >
                    <VSwitch
                      v-model="item.hidden"
                      hide-details
                      density="compact"
                      label="Ocultar producto"
                    />
                  </div>
                </VCol>

                <VCol sm="6" cols="12">
                  <div class="d-flex align-center">
                    <VIcon class="mr-2" size="small" color="grey-darken-1"
                      >mdi-chef-hat</VIcon
                    >
                    <VSwitch
                      v-model="item.requires_preparation"
                      hide-details
                      density="compact"
                      label="Requiere preparar"
                    />
                  </div>
                </VCol>
              </VRow>
            </VCol>

            <!-- Right column: image -->
            <VCol md="6" cols="12">
              <div
                class="text-caption font-weight-medium mb-1 text-grey-darken-1"
              >
                <VIcon class="mr-1" size="small">mdi-image-outline</VIcon>
                Imagen del producto
              </div>
              <MyUploadimage
                v-model:url="item.image"
                v-model="item.image_file"
                :disabled="loading"
                label="Seleccionar imagen"
                @change="imageLoading = false"
                @loading="imageLoading = true"
              />

              <div v-if="previewImage || imageLoading" class="mt-2">
                <MyPreviewImage
                  max-height="180"
                  :src="previewImage"
                  :loading="imageLoading"
                  loading-text="Procesando imagen..."
                />
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>

      <!-- Section 3: Acciones -->
      <VCard id="prd-form-card-3" class="mt-4" variant="outlined">
        <VCardText class="d-flex justify-end pa-4 flex-wrap">
          <VBtn
            id="prd-form-cancel-btn"
            color="primary"
            variant="outlined"
            class="mr-2 mb-2 mb-sm-0"
            :disabled="loading || imageLoading"
            @click="close"
          >
            <VIcon start>mdi-close</VIcon>
            Cancelar
          </VBtn>
          <VBtn
            id="prd-form-save-btn"
            color="primary"
            :loading="loading"
            :disabled="!isValid"
            @click="save"
          >
            <VIcon start>mdi-content-save</VIcon>
            Guardar
          </VBtn>
        </VCardText>
      </VCard>
    </VForm>
  </div>
</template>

<script setup lang="ts">
import { useValidationErrors } from "~/composables/useValidationErrors";
import { useVrules } from "~/composables/useVrules";
import { useAuthStore } from "~/composables/useAuth";

interface ProductItem {
  id?: number | null;
  org_id?: number | string | null;
  name: string;
  sku: string;
  description: string;
  hidden: boolean;
  requires_preparation: boolean;
  price: number | string;
  stock: number | string;
  order: number | string;
  image: string;
  image_s3?: string;
  image_file?: unknown;
}

const props = withDefaults(
  defineProps<{
    product?: Record<string, unknown>;
    loading?: boolean;
    permission?: string;
    title?: string;
    icon?: string;
  }>(),
  {
    product: () => ({}),
    loading: false,
    permission: "product-create",
    title: "",
    icon: "mdi-package-variant",
  },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", val: Record<string, unknown>): void;
}>();

const { vrules } = useVrules();
const { errors: validationErrors, clearErrors } = useValidationErrors();
const auth = useAuthStore();

const formRef = ref();
const imageLoading = ref(false);

const item = ref<ProductItem>({
  id: null,
  org_id: null,
  name: "",
  sku: "",
  description: "",
  hidden: false,
  requires_preparation: false,
  price: 0,
  stock: 0,
  order: 0,
  image: "",
  image_s3: "",
  image_file: null,
});

const errors = computed(() =>
  validationErrors.value ? { ...validationErrors.value } : {},
);

const showOrgSelect = computed(() => {
  const orgIds = auth.permissionsOrg[props.permission] ?? [];
  return Array.isArray(orgIds) && orgIds.length > 1;
});

const previewImage = computed(() => {
  if (
    item.value.image &&
    typeof item.value.image === "string" &&
    item.value.image.startsWith("data:")
  ) {
    return item.value.image;
  }
  return item.value.image_s3 || item.value.image || "";
});

const isValid = computed(
  () =>
    !!item.value.org_id &&
    !!item.value.name &&
    item.value.name.trim().length > 0 &&
    !props.loading &&
    !imageLoading.value,
);

watch(
  () => props.product,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as ProductItem;
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  initializeForm();
});

function initializeForm() {
  if (props.product && Object.keys(props.product).length > 0) {
    item.value = { ...item.value, ...props.product } as ProductItem;
  }
  // Auto-set org_id when the user only has access to one org
  if (!item.value.org_id && !showOrgSelect.value) {
    const orgIds = auth.permissionsOrg[props.permission] ?? [];
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
  if (!isValid.value) return;
  const form = formRef.value;
  const { valid } = form ? await form.validate() : { valid: true };
  if (!valid) return;

  const payload: Record<string, unknown> = {
    ...item.value,
    price: Number(item.value.price || 0),
    stock: Number(item.value.stock || 0),
    order: Number(item.value.order || 0),
  };
  emit("save", payload);
}
</script>

<style scoped>
.no-spinners :deep(input[type="number"])::-webkit-outer-spin-button,
.no-spinners :deep(input[type="number"])::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinners :deep(input[type="number"]) {
  -moz-appearance: textfield;
}
</style>
