<template>
  <VDialog id="dlg-audit-dialo-dialog-1" v-model="dialog" persistent max-width="600px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-theater</VIcon>
        {{ isEditing ? "Editar" : "Nuevo" }} Evento de Auditorio
        <VSpacer />
        <VBtn id="btn-auditoriumevent-dialog-close" icon size="x-small" @click="closeDialog">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VForm ref="eventForm">
          <VContainer>
            <VRow>
              <VCol v-if="!orgSelectHidden" cols="12" md="6">
                <OrganizationSelect v-model="localEvent.org_id" v-model:hidden="orgSelectHidden" label="Organización *"
                  hide-one :permission="'auditorium-index'" :rules="organizationRules"
                  density="compact" variant="outlined" />
              </VCol>
              <VCol cols="12" md="6">
                <MyDatePicker v-model="localEvent.event_date" label="Fecha del Evento *" :rules="dateRules"
                  required density="compact" variant="outlined" />
              </VCol>
              <VCol cols="12" md="6">
                <VSelect v-model="localEvent.time" :items="timeOptions" item-title="text" item-value="value"
                  label="Hora del Evento *" :rules="timeRules" required density="compact" variant="outlined" />
              </VCol>
              <VCol cols="12" md="6">
                <AuditoriumSelect v-model="localEvent.auditorium_id" :org-id="localEvent.org_id"
                  :loading="loadingAuditoriums" label="Auditorio *" :rules="auditoriumRules" density="compact"
                  variant="outlined" />
              </VCol>
            </VRow>
          </VContainer>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="btn-auditoriumevent-dialog-cancel" color="primary" variant="outlined" class="mr-4"
          :disabled="saving" @click="closeDialog">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="btn-auditoriumevent-dialog-save" color="primary" variant="elevated"
          :loading="saving" @click="saveEvent">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface AuditoriumEventItem {
  id?: number | string
  event_date?: string | null
  time?: string | null
  auditorium_id?: number | string | null
  org_id?: number | string | null
  config?: string
  [key: string]: unknown
}

const props = defineProps<{
  auditoriumEvent?: AuditoriumEventItem | null
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', val: Record<string, unknown>): void
  (e: 'close'): void
}>()

const dialog = ref(false)
const saving = ref(false)
const loadingAuditoriums = ref(false)
const orgSelectHidden = ref(false)
const eventForm = ref<{ resetValidation: () => void; validate: () => Promise<{ valid: boolean }> } | null>(null)

const timeOptions = [
  { text: "09:45 AM", value: "09:45" },
  { text: "12:00 PM", value: "12:00" },
  { text: "08:00 PM", value: "20:00" },
]

const localEvent = ref<AuditoriumEventItem>({
  event_date: null,
  time: null,
  auditorium_id: null,
  org_id: null,
  config: "",
})

const dateRules = [(v: unknown) => !!v || "La fecha es requerida"]
const timeRules = [(v: unknown) => !!v || "La hora es requerida"]
const auditoriumRules = [(v: unknown) => !!v || "El auditorio es requerido"]
const organizationRules = [(v: unknown) => !!v || "La organización es requerida"]

const isEditing = computed(() => !!(props.auditoriumEvent && props.auditoriumEvent.id))

watch(() => props.modelValue, (newVal) => {
  dialog.value = !!newVal
  if (newVal) {
    orgSelectHidden.value = false
    localEvent.value = {
      event_date: null,
      time: null,
      auditorium_id: null,
      org_id: null,
      config: "",
    }
    if (!isEditing.value) {
      nextTick(() => {
        localEvent.value.org_id = null
      })
    }
    initializeForm()
    nextTick(() => {
      eventForm.value?.resetValidation()
    })
  }
}, { immediate: true })

watch(dialog, (newVal) => {
  if (!newVal) {
    emit("update:modelValue", false)
  }
})

watch(() => props.auditoriumEvent, () => {
  initializeForm()
}, { immediate: true, deep: true })

function initializeForm() {
  if (props.auditoriumEvent && Object.keys(props.auditoriumEvent).length > 0) {
    localEvent.value = {
      ...props.auditoriumEvent,
      event_date: props.auditoriumEvent.event_date || null,
      time: props.auditoriumEvent.time || null,
      config: props.auditoriumEvent.config || "",
    }
  } else {
    localEvent.value = {
      event_date: null,
      time: null,
      auditorium_id: null,
      org_id: null,
      config: "",
    }
  }
}

async function saveEvent() {
  const form = eventForm.value
  if (form) {
    const { valid } = await form.validate()
    if (!valid) return
  }

  saving.value = true

  try {
    const eventData = { ...localEvent.value }
    emit("save", eventData)
  } catch (error) {
    /* ignore */
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  dialog.value = false
  emit("close")
}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
}
</style>
