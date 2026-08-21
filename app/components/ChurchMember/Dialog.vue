<template>
  <VDialog :id="id" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle
        class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center"
      >
        <VIcon start size="small" color="primary">{{ iconTitle }}</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn
          id="cmm-dialog-close-btn"
          icon
          size="x-small"
          :disabled="loading"
          @click="close"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol cols="6">
              <VTextField
                id="cmm-dialog-name"
                v-model="item.name"
                required
                label="Nombre"
                density="compact"
                variant="outlined"
                :disabled="loading"
                :rules="[(v) => !!v || 'Nombre es requerido']"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                id="cmm-dialog-last-name"
                v-model="item.last_name"
                required
                label="Apellido Paterno"
                density="compact"
                variant="outlined"
                :disabled="loading"
                :rules="[(v) => !!v || 'Apellido es requerido']"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                id="cmm-dialog-second-last-name"
                v-model="item.second_last_name"
                density="compact"
                variant="outlined"
                :disabled="loading"
                label="Apellido Materno"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                id="cmm-dialog-cellphone"
                v-model="item.cellphone"
                label="Celular"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                id="cmm-dialog-years-old"
                v-model="item.years_old"
                label="Edad"
                density="compact"
                variant="outlined"
                :disabled="loading"
                inputmode="numeric"
                :rules="numericRules"
                @keypress="onlyDigits"
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                id="cmm-dialog-children"
                v-model="item.number_of_children"
                density="compact"
                label="Núm. Hijos"
                variant="outlined"
                :disabled="loading"
                inputmode="numeric"
                :rules="numericRules"
                @keypress="onlyDigits"
              />
            </VCol>
            <VCol cols="6">
              <VSelect
                id="cmm-dialog-marriage-status"
                v-model="item.marriage_status"
                density="compact"
                variant="outlined"
                :disabled="loading"
                label="Estado Civil"
                :items="marriageStatuses"
              />
            </VCol>
            <VCol cols="12">
              <VMenu
                v-model="addressMenu"
                max-height="310"
                location="bottom start"
                :disabled="!addressSuggestions.length"
              >
                <template #activator="{ props: activatorProps }">
                  <VTextField
                    id="cmm-dialog-address"
                    v-model="addressText"
                    v-bind="activatorProps"
                    clearable
                    density="compact"
                    label="Dirección"
                    variant="outlined"
                    :disabled="loading"
                    :loading="addressSearching"
                    @click:clear="onAddressClear"
                    @update:model-value="onAddressText"
                  />
                </template>
                <VList density="compact">
                  <VListItem
                    v-for="(suggestion, i) in addressSuggestions"
                    :key="i"
                    :active="false"
                    @click="onAddressPick(suggestion)"
                  >
                    <span class="text-body-2 font-weight-medium">{{
                      suggestion.displayName
                    }}</span>
                  </VListItem>
                </VList>
              </VMenu>
            </VCol>
            <VCol cols="12">
              <div class="d-flex align-center">
                <MyUploadimageCrop
                  v-model="item.url_image"
                  v-model:url="item.url_image_s3"
                  :size="120"
                  label="Foto"
                />
                <VAvatar
                  v-if="item.url_image_s3"
                  size="80"
                  class="ml-4"
                  rounded="circle"
                >
                  <VImg cover alt="Vista previa" :src="item.url_image_s3" />
                </VAvatar>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn
          id="cmm-dialog-cancel-btn"
          class="mr-4"
          color="primary"
          variant="outlined"
          :disabled="loading"
          @click="close"
        >
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn
          id="cmm-dialog-save-btn"
          color="primary"
          :loading="loading"
          variant="elevated"
          @click="save"
        >
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import {
  searchAddresses,
  buildAddressWithCity,
  type AddressSuggestion,
} from "~/services/address-service";

interface MemberItem {
  id?: number | null;
  conso_sheet_id?: number | string | null;
  name?: string;
  last_name?: string;
  second_last_name?: string;
  cellphone?: string;
  years_old?: number | null;
  number_of_children?: number | null;
  marriage_status?: string;
  address?: string;
  url_image?: string;
  url_image_s3?: string;
}

const props = withDefaults(
  defineProps<{
    id?: string;
    member?: Record<string, unknown>;
    loading?: boolean;
  }>(),
  {
    id: "cmm-dialog-dlg",
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", val: Record<string, unknown>): void;
}>();

const formRef = ref();
const item = ref<MemberItem>({
  id: null,
  conso_sheet_id: null,
  name: "",
  last_name: "",
  second_last_name: "",
  cellphone: "",
  years_old: null,
  number_of_children: null,
  marriage_status: "",
  address: "",
  url_image: "",
  url_image_s3: "",
});

const marriageStatuses = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
  "Viudo/a",
  "Unión Libre",
];

/* ── Address autocomplete ─────────────────────────────────── */

const addressSuggestions = ref<AddressSuggestion[]>([]);
const addressText = ref("");
const addressMenu = ref(false);
const addressSearching = ref(false);
let addressDebounce: ReturnType<typeof setTimeout> | null = null;

function onAddressText(query: string) {
  if (addressDebounce) clearTimeout(addressDebounce);
  if (!query || query.trim().length < 3) {
    addressSuggestions.value = [];
    addressMenu.value = false;
    return;
  }
  addressDebounce = setTimeout(async () => {
    try {
      addressSearching.value = true;
      addressSuggestions.value = await searchAddresses(query);
      addressMenu.value = true;
    } catch {
      addressSuggestions.value = [];
      addressMenu.value = false;
    } finally {
      addressSearching.value = false;
    }
  }, 500);
}

function onAddressPick(suggestion: AddressSuggestion) {
  item.value.address = buildAddressWithCity(suggestion);
  addressMenu.value = false;
}

function onAddressClear() {
  item.value.address = "";
  addressSuggestions.value = [];
  addressMenu.value = false;
}

watch(
  () => item.value.address,
  (val) => {
    if (typeof val === "string") addressText.value = val || "";
  },
);

/* ── Computed ─────────────────────────────────────────────── */

const isEditMode = computed(() => !!item.value.id);
const iconTitle = computed(() =>
  isEditMode.value ? "mdi-pencil" : "mdi-plus",
);
const formTitle = computed(() =>
  isEditMode.value ? "Editar Miembro" : "Nuevo Miembro",
);

/* ── Props watcher ────────────────────────────────────────── */

watch(
  () => props.member,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as MemberItem;
    }
  },
  { immediate: true, deep: true },
);

/* ── Validation ───────────────────────────────────────────── */

function onlyDigits(e: KeyboardEvent) {
  if (!/\d/.test(e.key)) e.preventDefault();
}

const numericRules = [
  (v: string | number | null) =>
    v === null ||
    v === "" ||
    String(v).trim() === "" ||
    /^\d+$/.test(String(v)) ||
    "Solo se permiten números",
];

/* ── Actions ──────────────────────────────────────────────── */

function close() {
  emit("close");
}

async function save() {
  if (props.loading) return;
  const form = formRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) return;
  }
  if (item.value.address !== addressText.value) {
    item.value.address = addressText.value;
  }
  const { url_image, url_image_s3, ...rest } = item.value as Record<
    string,
    unknown
  >;
  const payload = { ...rest };
  if (payload.years_old !== null && payload.years_old !== "") {
    payload.years_old = Number(payload.years_old);
  }
  if (
    payload.number_of_children !== null &&
    payload.number_of_children !== ""
  ) {
    payload.number_of_children = Number(payload.number_of_children);
  }
  if (url_image instanceof Blob) {
    payload.url_image = url_image_s3;
  }
  emit("save", payload);
}
</script>
