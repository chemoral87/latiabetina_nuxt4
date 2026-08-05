<template>
  <VDialog id="usr-dialo-dlg-1" v-model="dialogVisible" persistent width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-account-plus</VIcon>
        Cambiar Contraseña
        <VSpacer />
        <VBtn id="usr-password-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <VRow density="comfortable">
          <VCol cols="12">
            <VTextField id="usr-dialo-item-password-tf-1"
              v-model="item.password"
              label="Contraseña"
              variant="outlined"
              :type="showPassword ? 'text' : 'password'"
              hide-details
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              autocomplete="new-password"
              class="password-field"
              @keyup.enter="save"
              @click:append-inner="showPassword = !showPassword"
            />
          </VCol>
          <VCol cols="12">
            <VTextField id="tf-user-dialo-item-confirm_password-2"
              v-model="item.confirm_password"
              label="Confirme Contraseña"
              variant="outlined"
              :error-messages="localError.confirm_password"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              autocomplete="new-password"
              class="password-field"
              @keyup.enter="save"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
            />
          </VCol>
        </VRow>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="usr-password-cancel-btn" color="primary" variant="outlined" class="mr-4" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="usr-password-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean
  userx?: Record<string, unknown> | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'close'): void
  (e: 'save', item: Record<string, unknown>): void
}>()

const dialogVisible = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const saving = ref(false)
const item = ref<Record<string, unknown>>({})
const localError = ref<Record<string, string>>({})

// Reset the local guard when the parent finishes the API call (success or error)
watch(() => props.loading, (val) => {
  if (!val) saving.value = false
}, { immediate: true })

function close() {
  emit("close")
}

function save() {
  if (saving.value || props.loading) return

  localError.value = {}

  if (item.value.password !== item.value.confirm_password) {
    localError.value.confirm_password = "No coinciden las contraseñas"
    return
  }
  if ((item.value.confirm_password as string)?.length < 8) {
    localError.value.confirm_password = "Mínimo debe ser de 8 caracteres"
    return
  }
  saving.value = true
  emit("save", { ...item.value })
}
</script>

<style scoped>
.password-field :deep(.v-field__input) {
  padding-right: 40px;
  letter-spacing: 0.1em;
}
</style>
