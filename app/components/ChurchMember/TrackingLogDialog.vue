<template>
  <VDialog
    :id="id"
    persistent
    max-width="600px"
    :model-value="true"
  >
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-pencil</VIcon>
        Editar Interacción
        <VSpacer />
        <VBtn
          id="cmm-tlg-close-btn"
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
            <VCol md="6" cols="12">
              <MyDatePicker
                v-model="contactDate"
                label="Fecha de contacto"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol md="6" cols="12">
              <VTextField
                id="cmm-tlg-contact-time"
                v-model="contactTime"
                label="Hora"
                type="time"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol md="6" cols="12">
              <VSelect
                id="cmm-tlg-medium"
                v-model="item.medium"
                :items="mediumOptions"
                label="Medio"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol md="6" cols="12">
              <VSelect
                id="cmm-tlg-classification"
                v-model="item.classification"
                :items="classificationOptions"
                label="Clasificación"
                density="compact"
                variant="outlined"
                :disabled="loading"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                id="cmm-tlg-description"
                v-model="item.description"
                label="Descripción"
                density="compact"
                variant="outlined"
                :disabled="loading"
                rows="3"
                auto-grow
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn
          id="cmm-tlg-cancel-btn"
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
          id="cmm-tlg-save-btn"
          color="primary"
          :loading="loading"
          variant="elevated"
          :disabled="loading"
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
interface LogItem {
  id?: number | null
  contact_datetime?: string
  medium?: string
  classification?: string
  description?: string
  creator?: Record<string, unknown>
}

const props = withDefaults(defineProps<{
  id?: string
  log?: Record<string, unknown>
  loading?: boolean
}>(), {
  id: "cmm-tracking-log-dlg",
  loading: false,
})

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", val: Record<string, unknown>): void
}>()

const item = ref<LogItem>({
  id: null,
  contact_datetime: "",
  medium: "whatsapp",
  classification: "",
  description: "",
})

const contactDate = ref<string | null>(null)
const contactTime = ref("")

const mediumOptions = [
  { title: "WhatsApp", value: "whatsapp" },
  { title: "Llamada", value: "llamada" },
  { title: "Presencial", value: "presencial" },
  { title: "SMS", value: "sms" },
]

const classificationOptions = [
  { title: "Contesta", value: "CONTESTA" },
  { title: "No contesta", value: "NO CONTESTA" },
]

watch(
  () => props.log,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as LogItem
      if (val.contact_datetime) {
        const dt = String(val.contact_datetime)
        const parts = dt.includes("T") ? dt.split("T") : dt.split(" ")
        contactDate.value = parts[0] || null
        contactTime.value = parts[1]?.substring(0, 5) || ""
      }
    }
  },
  { immediate: true, deep: true },
)

function close() {
  emit("close")
}

function save() {
  const payload = { ...item.value }
  if (contactDate.value) {
    payload.contact_datetime = contactTime.value
      ? `${contactDate.value} ${contactTime.value}:00`
      : `${contactDate.value} 00:00:00`
  }
  emit("save", payload)
}
</script>

<style scoped></style>