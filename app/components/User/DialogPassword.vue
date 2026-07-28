<template>
  <VDialog id="dlg-user-dialo-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-account-plus</VIcon>
        Cambiar Contraseña
        <VSpacer />
        <VBtn icon size="x-small" id="btn-user-password-close" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow density="comfortable">
          <VCol cols="12">
            <VTextField id="tf-user-dialo-item-password-1"
              v-model="item.password"
              label="Contraseña"
              variant="outlined"
              :type="showPassword ? 'text' : 'password'"
              hide-details
              @keyup.enter="save"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              autocomplete="new-password"
              class="password-field"
            />
          </VCol>
          <VCol cols="12">
            <VTextField id="tf-user-dialo-item-confirm_password-2"
              v-model="item.confirm_password"
              label="Confirme Contraseña"
              variant="outlined"
              :error-messages="localError.confirm_password"
              :type="showConfirmPassword ? 'text' : 'password'"
              @keyup.enter="save"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              autocomplete="new-password"
              class="password-field"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions class="pa-4">
        <VSpacer />
        <VBtn color="primary" variant="outlined" class="mr-2" id="btn-user-password-cancel" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" id="btn-user-password-save" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
  userx?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'close'): void
  (e: 'save', item: Record<string, unknown>): void
}>()

const dialogVisible = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const item = ref<Record<string, unknown>>({})
const localError = ref<Record<string, string>>({})

function close() {
  emit("close")
}

function save() {
  localError.value = {}

  if (item.value.password !== item.value.confirm_password) {
    localError.value.confirm_password = "No coinciden las contraseñas"
    return
  }
  if ((item.value.confirm_password as string)?.length < 8) {
    localError.value.confirm_password = "Mínimo debe ser de 8 caracteres"
    return
  }
  emit("save", { ...item.value })
}
</script>

<style scoped>
.password-field :deep(.v-field__input) {
  padding-right: 40px;
  letter-spacing: 0.1em;
}
</style>
