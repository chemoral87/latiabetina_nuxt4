<template>
  <VDialog id="aud-dialo-dialog-dlg-1" v-model="dialog" persistent max-width="600px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-theater</VIcon>
        {{ isEditing ? "Editar" : "Nuevo" }} Evento de Auditorio
        <VSpacer />
        <VBtn id="auev-dialog-close-btn" icon size="x-small" @click="closeDialog">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VForm ref="eventForm">
          <VContainer>
            <VRow>
              <VCol v-if="!orgSelectHidden" md="6" cols="12">
                <OrganizationSelect id="cmp-organization-select" v-model="localEvent.org_id" v-model:hidden="orgSelectHidden" hide-one
                  required density="compact" variant="outlined" label="Organización"
                  :rules="organizationRules" :permission="'auditorium-event-index'" />
              </VCol>
              <VCol md="6" cols="12">
                <MyDatePicker id="cmp-my-date-picker" v-model="localEvent.event_date" required density="compact"
                  :rules="dateRules" variant="outlined" label="Fecha del Evento" />
              </VCol>
              <VCol md="6" cols="12">
                <VSelect id="auev-dialog-time-sel" v-model="localEvent.time" required density="compact" item-title="text"
                  item-value="value" :rules="timeRules" variant="outlined" :items="timeOptions" label="Hora del Evento" />
              </VCol>
              <VCol md="6" cols="12">
                <AuditoriumSelect id="cmp-auditorium-select" v-model="localEvent.auditorium_id" required
                  density="compact" label="Auditorio" variant="outlined" :rules="auditoriumRules" :org-id="localEvent.org_id"
                  :loading="loadingAuditoriums"
                  :selected-name="(localEvent.auditorium_name as string) ?? null" />
              </VCol>
            </VRow>
          </VContainer>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="auev-dialog-cancel-btn" class="mr-4" color="primary" :disabled="saving"
          variant="outlined" @click="closeDialog">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="auev-dialog-save-btn" color="primary" :loading="saving"
          variant="elevated" @click="saveEvent">
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
  auditorium_name?: string | null
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

const auth = useAuthStore()

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

// When the org selector is hidden (single org granted for this permission),
// fill org_id from the permission so AuditoriumSelect can filter correctly.
watch(orgSelectHidden, (hidden) => {
  if (hidden) {
    const orgPermission = auth.permissionsOrg["auditorium-event-index"] ?? []
    if (orgPermission.length === 1) {
      localEvent.value.org_id = orgPermission[0]
    }
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
    // When the org selector is hidden (single org), ensure org_id is set so
    // the POST includes it — the backend requires it.
    if (orgSelectHidden.value && !localEvent.value.org_id) {
      const orgPermission = auth.permissionsOrg["auditorium-event-index"] ?? []
      if (orgPermission.length === 1) {
        localEvent.value.org_id = orgPermission[0]
      }
    }
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
