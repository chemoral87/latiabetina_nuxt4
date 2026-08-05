<template>
  <VDialog id="con-membe-dlg-1" :model-value="true" persistent max-width="600px">
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
          <VRow dense>
            <VCol cols="12" md="4">
              <VTextField
                id="con-membe-item-name-tf-1"
                v-model="item.name"
                label="Nombre"
                :disabled="loading"
                required
                autofocus
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                id="tf-conso-membe-item-last_name-2"
                v-model="item.last_name"
                label="Apellido Paterno"
                :disabled="loading"
                required
                @keyup.enter="save"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                id="tf-conso-membe-item-second_last_name-3"
                v-model="item.second_last_name"
                label="Apellido Materno"
                :disabled="loading"
              />
            </VCol>
            <VCol cols="12" md="3" lg="2">
              <VTextField
                id="tf-conso-membe-item-years_old-4"
                v-model="item.years_old"
                label="Edad"
                type="number"
                min="0"
                :disabled="loading"
              />
            </VCol>
            <VCol cols="12" md="3">
              <VTextField
                id="tf-conso-membe-item-number_of_children-5"
                v-model="item.number_of_children"
                label="Núm. Hijos"
                type="number"
                min="0"
                :disabled="loading"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                id="con-membe-item-cellphone-tf-6"
                v-model="item.cellphone"
                label="Celular"
                :disabled="loading"
              />
            </VCol>
            <VCol cols="12" md="5">
              <VSelect
                v-model="item.marriage_status"
                :items="marriageStatuses"
                label="Estado Civil"
                :disabled="loading"
                variant="outlined"
                density="compact"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                id="con-membe-item-address-tf-7"
                v-model="item.address"
                label="Dirección"
                :disabled="loading"
                @keyup.enter="save"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="con-memberdialog-cancel-btn" color="primary" variant="outlined" class="mr-4" :disabled="loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="con-memberdialog-save-btn" color="primary" variant="elevated" :loading="loading" :disabled="!isValid || loading" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
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
