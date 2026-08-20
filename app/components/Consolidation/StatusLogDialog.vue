<template>
  <VDialog :id="id" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-account-cog-outline</VIcon>
        Clasificación del miembro
        <VSpacer />
        <VBtn id="con-status-close-btn" icon size="x-small" :disabled="saving" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pt-0">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="text-body-2 font-weight-bold text-grey-darken-2">
            {{ memberName }}
          </div>
          <VChip :color="statusColor(member?.status)">{{ statusLabel(member?.status) }}</VChip>
        </div>

        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol sm="8" cols="12">
              <VSelect
                id="con-status-select"
                v-model="selectedStatus"
                required
                label="Estado"
                density="compact"
                :items="statuses"
                :disabled="saving"
                variant="outlined"
                :rules="[vrules.requiredField('Estado')]"
              />
            </VCol>
            <VCol sm="4" cols="12" class="d-flex align-center justify-end">
              <VBtn
                id="con-status-save-btn"
                color="primary"
                :loading="saving"
                :disabled="saving"
                variant="elevated"
                @click="save"
              >
                <VIcon start>mdi-content-save</VIcon>
                Guardar
              </VBtn>
            </VCol>
            <VCol cols="12">
              <VTextField
                id="con-status-reason"
                v-model="reason"
                density="compact"
                :disabled="saving"
                variant="outlined"
                label="Motivo (opcional)"
                placeholder="Razón del cambio de estado"
              />
            </VCol>
          </VRow>
        </VForm>

        <VDivider class="my-3" />

        <div class="text-subtitle-2 font-weight-bold mb-1">Historial de cambios</div>

        <VList v-if="logs.length" id="con-status-list" max-height="320" density="compact" class="overflow-y-auto">
<template v-for="(log, i) in logs" :key="log.id">
            <VListItem>
              <div class="d-flex align-center">
                <VChip size="small" variant="tonal" :color="statusColor(log.old_status)">
                  {{ statusLabel(log.old_status) }}
                </VChip>
                <VIcon class="mx-1" size="small">mdi-arrow-right</VIcon>
                <VChip size="small" :color="statusColor(log.new_status)">
                  {{ statusLabel(log.new_status) }}
                </VChip>
              </div>
              <div class="text-caption text-grey-darken-1 mt-1">
                <VIcon start size="x-small">mdi-account</VIcon>
                {{ (log.changer as Record<string, unknown> | undefined)?.name || "N/A" }}
                · {{ formatShortDate(log.created_at) }}
              </div>
              <div v-if="log.reason" class="text-caption mt-1">
                <VIcon start size="x-small" color="primary">mdi-note-text-outline</VIcon>
                {{ log.reason }}
              </div>
            </VListItem>
            <VDivider v-if="i < logs.length - 1" />
          </template>
        </VList>

        <div v-else class="text-center pa-4 text-grey">
          <VIcon color="grey-lighten-1">mdi-history</VIcon>
          <div class="text-body-2 mt-1">Sin cambios de estado registrados</div>
        </div>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="con-status-cancel-btn" color="primary" :disabled="saving" variant="outlined" @click="close">
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
  id: "con-status-dlg-1",
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'statusChanged', val: Record<string, unknown>): void
}>()

const { ChurchMember } = useRepository()
const notify = useNotifyStore()
const { vrules } = useVrules()

const formRef = ref()
const saving = ref(false)
const loading = ref(false)
const logs = ref<Record<string, unknown>[]>([])
const selectedStatus = ref("ACTIVO")
const reason = ref("")

const statuses = [
  { title: "Activo", value: "ACTIVO" },
  { title: "No contesta", value: "NO CONTESTA" },
  { title: "No molestar", value: "NO MOLESTAR" },
  { title: "Visita", value: "VISITA" },
]

const statusColors: Record<string, string> = {
  ACTIVO: "green",
  "NO CONTESTA": "amber",
  "NO MOLESTAR": "red",
  VISITA: "blue",
}

function statusLabel(status: unknown): string {
  const found = statuses.find((s) => s.value === status)
  return found ? found.title : String(status ?? "Sin estado")
}

function statusColor(status: unknown): string {
  return statusColors[String(status)] ?? "grey"
}

const memberId = computed(() => (props.member as Record<string, unknown> | undefined)?.id as number | undefined)
const memberName = computed(() => {
  const m = props.member as Record<string, unknown> | undefined
  return `${m?.name ?? ""} ${m?.last_name ?? ""}`.trim() || "Miembro"
})

async function fetchLogs() {
  if (memberId.value == null) return
  loading.value = true
  try {
    const data = await ChurchMember.statusLogs<unknown>(memberId.value)
    logs.value = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  selectedStatus.value = String((props.member?.status as string) || "ACTIVO")
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
    const updated = await ChurchMember.updateStatus<Record<string, unknown>>(memberId.value, selectedStatus.value, reason.value || undefined)
    notify.notify({ success: "Estado actualizado exitosamente" })
    reason.value = ""
    await fetchLogs()
    emit("statusChanged", updated)
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