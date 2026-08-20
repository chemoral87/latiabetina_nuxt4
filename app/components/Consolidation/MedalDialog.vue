<template>
  <VDialog :id="id" persistent max-width="600px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-medal-outline</VIcon>
        Medallas
        <VSpacer />
        <VBtn id="con-medal-close-btn" icon size="x-small" :disabled="saving" @click="close">
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
              <VSelect
                id="con-medal-type"
                v-model="form.medal"
                required
                label="Medalla"
                density="compact"
                :disabled="saving"
                variant="outlined"
                :items="medalOptions"
                :rules="[vrules.requiredField('Medalla')]"
              />
            </VCol>
            <VCol sm="7" cols="12">
              <VTextField
                id="con-medal-description"
                v-model="form.description"
                density="compact"
                :disabled="saving"
                variant="outlined"
                label="Descripción"
                placeholder="Ej. marzo-2026"
              />
            </VCol>
            <VCol cols="12" class="d-flex justify-end">
              <VBtn
                id="con-medal-save-btn"
                color="primary"
                :loading="saving"
                :disabled="saving"
                variant="elevated"
                @click="save"
              >
                <VIcon start>mdi-plus</VIcon>
                Agregar medalla
              </VBtn>
            </VCol>
          </VRow>
        </VForm>

        <VDivider class="my-3" />

        <div class="text-subtitle-2 font-weight-bold mb-1">Medallas obtenidas</div>

        <VList v-if="medals.length" id="con-medal-list" max-height="320" density="compact" class="overflow-y-auto">
          <template v-for="(medal, i) in medals" :key="medal.id">
            <VListItem>
              <div class="d-flex align-center">
                <VChip class="ml-2" size="small" :color="medalColor(medal.medal)">
                  {{ medalLabel(medal.medal) }}
                </VChip>
                <span v-if="medal.description" class="text-body-2 text-grey-darken-1 ml-2">{{ medal.description }}</span>
              </div>
              <div class="text-caption text-grey-darken-1 mt-1">
                <VIcon start size="x-small">mdi-account</VIcon>
                {{ (medal.creator as Record<string, unknown> | undefined)?.name || "N/A" }}
              </div>
            </VListItem>
            <VDivider v-if="i < medals.length - 1" />
          </template>
        </VList>

        <div v-else class="text-center pa-4 text-grey">
          <VIcon color="grey-lighten-1">mdi-medal-outline</VIcon>
          <div class="text-body-2 mt-1">Sin medallas registradas</div>
        </div>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="con-medal-cancel-btn" color="primary" :disabled="saving" variant="outlined" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cerrar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useVrules } from "~/composables/useVrules"

const props = withDefaults(defineProps<{
  id?: string
  member?: Record<string, unknown>
}>(), {
  id: "con-medal-dlg-1",
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
const medals = ref<Record<string, unknown>[]>([])

const memberId = computed(() => (props.member as Record<string, unknown> | undefined)?.id as number | undefined)
const memberName = computed(() => {
  const m = props.member as Record<string, unknown> | undefined
  return `${m?.name ?? ""} ${m?.last_name ?? ""}`.trim() || "Miembro"
})

const medalOptions = [
  { title: "Bautizado", value: "baptized" },
  { title: "EDIN 1", value: "edin1" },
  { title: "EDIN 2", value: "edin2" },
  { title: "Servicio 1", value: "service1" },
]

const medalColors: Record<string, string> = {
  baptized: "blue",
  edin1: "green",
  edin2: "teal",
  service1: "orange",
}

function medalLabel(medal: unknown): string {
  const found = medalOptions.find((m) => m.value === medal)
  return found ? found.title : String(medal ?? "")
}

function medalColor(medal: unknown): string {
  return medalColors[String(medal)] ?? "grey"
}

const form = ref<{
  medal: string
  description: string
}>({
  medal: "",
  description: "",
})

async function fetchMedals() {
  if (memberId.value == null) return
  loading.value = true
  try {
    const data = await ChurchMember.medals<unknown>(memberId.value)
    medals.value = Array.isArray(data) ? (data as Record<string, unknown>[]) : []
  } catch {
    medals.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMedals()
})

async function save() {
  if (saving.value) return
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  if (saving.value) return
  if (memberId.value == null) return
  saving.value = true
  try {
    const created = await ChurchMember.createMedal<Record<string, unknown>>(memberId.value, {
      medal: form.value.medal,
      description: form.value.description,
    })
    medals.value = [created, ...medals.value]
    form.value.medal = ""
    form.value.description = ""
    notify.notify({ success: "Medalla agregada exitosamente" })
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