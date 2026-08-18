<template>
  <VDialog id="con-membe-dlg-1" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">{{ iconTitle }}</VIcon>
        {{ formTitle }}
        <VSpacer />
        <VBtn id="con-memberdialog-close-btn" icon size="x-small" :disabled="loading" @click="close">
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
                :disabled="loading"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="4" cols="12">
              <VTextField
                id="tf-conso-membe-item-last_name-2"
                v-model="item.last_name"
                required
                :disabled="loading"
                label="Apellido Paterno"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="4" cols="12">
              <VTextField
                id="tf-conso-membe-item-second_last_name-3"
                v-model="item.second_last_name"
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
                :disabled="loading"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="tf-conso-membe-item-number_of_children-5"
                v-model="item.number_of_children"
                min="0"
                type="number"
                label="Núm. Hijos"
                :disabled="loading"
              />
            </VCol>
            <VCol md="4" cols="12">
              <VTextField
                id="con-membe-item-cellphone-tf-6"
                v-model="item.cellphone"
                label="Celular"
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
              <VAutocomplete
                id="con-membe-item-address-tf-7"
                v-model="addressModel"
                clearable
                return-object
                label="Dirección"
                :disabled="loading"
                item-title="displayName"
                item-value="displayName"
                :items="addressSuggestions"
                :loading="addressSearching"
                :hide-no-data="!addressModel"
                :no-data-text="!addressModel ? '' : 'Intente con otra búsqueda...'"
                @update:search="onAddressSearch"
                @update:model-value="onAddressSelect"
              >
                <template #item="{ item: suggestion, props: itemProps }">
                  <VListItem v-bind="itemProps">
                    <template #title>{{ suggestion.title }}</template>
                    <template #subtitle>
                      <span v-if="(suggestion.raw as AddressSuggestion).residential">
                        {{ (suggestion.raw as AddressSuggestion).residential }}
                      </span>
                      <span v-if="(suggestion.raw as AddressSuggestion).state">
                        , {{ (suggestion.raw as AddressSuggestion).state }}
                      </span>
                    </template>
                  </VListItem>
                </template>
              </VAutocomplete>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="con-memberdialog-cancel-btn" class="mr-4" color="primary" variant="outlined" :disabled="loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="con-memberdialog-save-btn" color="primary" :loading="loading" variant="elevated" :disabled="!isValid || loading" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { searchAddresses, type AddressSuggestion } from "~/services/address-service"

interface MemberItem {
  id?: number | null
  conso_sheet_id?: number | string | null
  name: string
  last_name: string
  second_last_name?: string
  years_old?: number | null
  number_of_children?: number | null
  cellphone?: string
  address?: string
  marriage_status?: string
}

const props = defineProps<{
  member?: Record<string, unknown>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Record<string, unknown>): void
}>()

const formRef = ref()
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
})

const marriageStatuses = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Unión Libre"]

const addressSuggestions = ref<AddressSuggestion[]>([])
const addressModel = ref<AddressSuggestion | string | null>("")
const addressSearching = ref(false)
let addressDebounce: ReturnType<typeof setTimeout> | null = null

async function onAddressSearch(query: string) {
  if (addressDebounce) clearTimeout(addressDebounce)
  if (!query || query.trim().length < 3) {
    addressSuggestions.value = []
    return
  }
  addressDebounce = setTimeout(async () => {
    try {
      addressSearching.value = true
      addressSuggestions.value = await searchAddresses(query)
    } catch {
      addressSuggestions.value = []
    } finally {
      addressSearching.value = false
    }
  }, 500)
}

function onAddressSelect(value: unknown) {
  if (!value) return
  const suggestion = value as AddressSuggestion
  if (suggestion && typeof suggestion === "object" && "address" in suggestion) {
    item.value.address = suggestion.address
  }
}

watch(
  () => item.value.address,
  (val) => {
    if (typeof val === "string") addressModel.value = val || ""
  },
)

const isEditMode = computed(() => !!item.value.id)
const iconTitle = computed(() => (isEditMode.value ? "mdi-pencil" : "mdi-plus"))
const formTitle = computed(() => (isEditMode.value ? "Editar Miembro" : "Nuevo Miembro"))
const isValid = computed(() => !!(item.value.name && item.value.last_name))

watch(
  () => props.member,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as MemberItem
    }
  },
  { immediate: true, deep: true },
)

function close() {
  emit("close")
}

function save() {
  if (!isValid.value || props.loading) return
  emit("save", { ...item.value })
}
</script>
