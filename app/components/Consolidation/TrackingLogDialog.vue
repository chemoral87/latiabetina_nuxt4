<template>
  <VDialog :id="id" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-notebook-outline</VIcon>
        Bitácora de seguimiento
        <VSpacer />
        <VBtn id="con-track-close-btn" icon size="x-small" :disabled="saving" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pt-0">
        <div class="text-body-2 font-weight-bold text-grey-darken-2 mb-2">
          {{ memberName }}
        </div>

        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol sm="5" cols="12">
              <MyDatePicker
                id="con-track-date"
                v-model="contactDate"
                required
                density="compact"
                :disabled="saving"
                variant="outlined"
                label="Fecha de contacto"
                :rules="[vrules.requiredField('Fecha de contacto')]"
              />
            </VCol>
            <VCol sm="3" cols="6">
              <VTextField
                id="con-track-time"
                v-model="contactTime"
                label="Hora"
                type="time"
                density="compact"
                :disabled="saving"
                variant="outlined"
              />
            </VCol>
            <VCol sm="4" cols="6">
              <VSelect
                id="con-track-medium"
                v-model="form.medium"
                required
                label="Medio"
                :items="mediums"
                density="compact"
                :disabled="saving"
                variant="outlined"
                :rules="[vrules.requiredField('Medio')]"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                id="con-track-description"
                v-model="form.description"
                rows="2"
                auto-grow
                density="compact"
                :disabled="saving"
                variant="outlined"
                label="Descripción"
              />
            </VCol>
            <VCol cols="12" class="d-flex justify-end">
              <VBtn
                id="con-track-save-btn"
                color="primary"
                :loading="saving"
                :disabled="saving"
                variant="elevated"
                @click="save"
              >
                <VIcon start>mdi-plus</VIcon>
                Agregar registro
              </VBtn>
            </VCol>
          </VRow>
        </VForm>

        <VDivider class="my-3" />

        <div class="text-subtitle-2 font-weight-bold mb-1">Registros</div>

        <VList v-if="logs.length" id="con-track-list" max-height="320" density="compact" class="overflow-y-auto">
<template v-for="(log, i) in logs" :key="log.id">
            <VListItem>
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-bold">{{ formatShortDate(log.contact_datetime) }}</span>
                <VChip class="ml-2" size="small" :color="mediumColor(log.medium)">
                  {{ mediumLabel(log.medium) }}
                </VChip>
              </div>
              <div v-if="log.description" class="text-body-2 mt-1">{{ log.description }}</div>
              <div class="text-caption text-grey-darken-1 mt-1">
                <VIcon start size="x-small">mdi-account</VIcon>
                {{ (log.creator as Record<string, unknown> | undefined)?.name || "N/A" }}
              </div>
            </VListItem>
            <VDivider v-if="i < logs.length - 1" />
          </template>
        </VList>

        <div v-else class="text-center pa-4 text-grey">
          <VIcon color="grey-lighten-1">mdi-notebook-outline</VIcon>
          <div class="text-body-2 mt-1">Sin registros de seguimiento</div>
        </div>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="con-track-cancel-btn" color="primary" :disabled="saving" variant="outlined" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cerrar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useVrules } from "~/composables/useVrules"
import { formatShortDate } from "~/utils/date"

const props = withDefaults(defineProps<{
  id?: string
  member?: Record<string, unknown>
}>(), {
  id: "con-track-dlg-1",
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { ChurchMember } = useRepository()
const notify = useNotifyStore()
const { vrules } = useVrules()

const formRef = ref()
const saving = ref(false)
const loading = ref(false)
const logs = ref<Record<string, unknown>[]>([])

const memberId = computed(() => (props.member as Record<string, unknown> | undefined)?.id as number | undefined)
const memberName = computed(() => {
  const m = props.member as Record<string, unknown> | undefined
  return `${m?.name ?? ""} ${m?.last_name ?? ""}`.trim() || "Miembro"
})

const mediums = [
  { title: "WhatsApp", value: "whatsapp" },
  { title: "Llamada", value: "llamada" },
  { title: "Presencial", value: "presencial" },
  { title: "SMS", value: "sms" },
]

const mediumColors: Record<string, string> = {
  whatsapp: "green",
  llamada: "blue",
  presencial: "purple",
  sms: "teal",
}

function mediumLabel(medium: unknown): string {
  const found = mediums.find((m) => m.value === medium)
  return found ? found.title : String(medium ?? "")
}

function mediumColor(medium: unknown): string {
  return mediumColors[String(medium)] ?? "grey"
}

const form = ref<{
  contact_datetime: string
  medium: string
  description: string
}>({
  contact_datetime: "",
  medium: "",
  description: "",
})

const contactDate = ref<string | null>(new Date().toISOString().substr(0, 10))
const contactTime = ref("")

async function fetchLogs() {
  if (memberId.value == null) return
  loading.value = true
  try {
    const data = await ChurchMember.trackingLogs<unknown>(memberId.value)
    logs.value = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

async function save() {
  if (saving.value) return
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  if (saving.value) return
  if (memberId.value == null) return
  saving.value = true
  try {
    const created = await ChurchMember.createTrackingLog<Record<string, unknown>>(memberId.value, {
      contact_datetime: contactTime.value
        ? `${contactDate.value} ${contactTime.value}:00`
        : `${contactDate.value} 00:00:00`,
      medium: form.value.medium,
      description: form.value.description,
    })
    logs.value = [created, ...logs.value]
    form.value.medium = ""
    form.value.description = ""
    notify.notify({ success: "Registro de seguimiento agregado exitosamente" })
  } catch {
    // withNotify already surfaced the error
  } finally {
    saving.value = false
  }
}

function close() {
  emit("close")
}
</script>