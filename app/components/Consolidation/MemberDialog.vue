<template>
  <VDialog
    :id="id"
    persistent
    max-width="600px"
    :model-value="true"
  >
    <VCard>
      <VCardTitle
        class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center"
      >
        <VIcon start size="small" color="primary">{{ iconTitle }}</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn
          id="con-memberdialog-close-btn"
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
            <VCol md="4" cols="12">
              <VTextField
                id="con-membe-item-name-tf-1"
                v-model="item.name"
                required
                autofocus
                label="Nombre"
                density="compact"
                variant="outlined"
                :disabled="loading"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="4" cols="12">
              <VTextField
                id="tf-conso-membe-item-last_name-2"
                v-model="item.last_name"
                required
                density="compact"
                variant="outlined"
                :disabled="loading"
                label="Apellido Paterno"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="4" cols="12">
              <VTextField
                id="tf-conso-membe-item-second_last_name-3"
                v-model="item.second_last_name"
                density="compact"
                variant="outlined"
                :disabled="loading"
                label="Apellido Materno"
              />
            </VCol>
            <VCol lg="2" md="3" cols="12">
              <VTextField
                id="tf-conso-membe-item-years_old-4"
                v-model="item.years_old"
                min="0"
                label="Edad"
                type="number"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="tf-conso-membe-item-number_of_children-5"
                v-model="item.number_of_children"
                min="0"
                type="number"
                density="compact"
                label="Núm. Hijos"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol md="4" cols="12">
              <VTextField
                id="con-membe-item-cellphone-tf-6"
                v-model="item.cellphone"
                label="Celular"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol md="5" cols="12">
              <VSelect
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
                    id="con-membe-item-address-tf-7"
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
                  label="Foto"
                  :size="120"
                />
                <VAvatar
                  v-if="item.url_image_s3"
                  size="80"
                  class="ml-4"
                  rounded="circle"
                >
                  <VImg
                    :src="item.url_image_s3"
                    alt="Vista previa"
                    cover
                  />
                </VAvatar>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn
          id="con-memberdialog-cancel-btn"
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
          id="con-memberdialog-save-btn"
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
  type AddressSuggestion,
} from "~/services/address-service";

interface MemberItem {
  id?: number | null;
  conso_sheet_id?: number | string | null;
  name: string;
  last_name: string;
  second_last_name?: string;
  years_old?: number | null;
  number_of_children?: number | null;
  cellphone?: string;
  address?: string;
  marriage_status?: string;
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
    id: "con-membe-dlg-1",
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
  years_old: null,
  number_of_children: null,
  cellphone: "",
  address: "",
  marriage_status: "",
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
  item.value.address = suggestion.address;
  addressMenu.value = false;
}

function onAddressClear() {
  item.value.address = "";
  addressSuggestions.value = [];
  addressMenu.value = false;
}

function addressPartsRaw(suggestion: AddressSuggestion | null): string {
  if (!suggestion) return "";
  return [
    suggestion.road,
    suggestion.residential,
    suggestion.city,
    suggestion.county,
    suggestion.state,
    suggestion.postcode,
    suggestion.country,
  ]
    .filter((p) => !!p)
    .join(", ");
}

watch(
  () => item.value.address,
  (val) => {
    if (typeof val === "string") addressText.value = val || "";
  },
);

const isEditMode = computed(() => !!item.value.id);
const iconTitle = computed(() =>
  isEditMode.value ? "mdi-pencil" : "mdi-plus",
);
const formTitle = computed(() =>
  isEditMode.value ? "Editar Miembro" : "Nuevo Miembro",
);

watch(
  () => props.member,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as MemberItem;
    }
  },
  { immediate: true, deep: true },
);

function close() {
  emit("close");
}

async function save() {
  if (loading) return;
  const form = formRef.value;
  if (form) {
    const { valid } = await form.validate();
    if (!valid) return;
  }
  if (item.value.address !== addressText.value) {
    item.value.address = addressText.value;
  }
  emit("save", { ...item.value });
}
</script>
