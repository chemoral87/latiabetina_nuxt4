<template>
  <VDialog :id="id" persistent max-width="500px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-medal-outline</VIcon>
        Agregar Medalla
        <VSpacer />
        <VBtn id="cm-medal-close-btn" icon size="x-small" :disabled="saving" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="pt-0">
        <div class="text-body-2 font-weight-bold text-grey-darken-2 mb-3">
          {{ memberName }}
        </div>

        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="comfortable">
            <VCol cols="12">
              <VSelect
                id="cm-medal-type"
                v-model="form.medal"
                required
                density="compact"
                :disabled="saving"
                variant="outlined"
                :items="medalOptions"
                label="Tipo de medalla"
                :rules="[vrules.requiredField('Medalla')]"
              />
            </VCol>

            <template v-if="form.medal">
              <VCol sm="6" cols="6">
                <VSelect
                  id="cm-medal-month"
                  v-model="form.description.month"
                  label="Mes"
                  density="compact"
                  :disabled="saving"
                  variant="outlined"
                  :items="monthOptions"
                  :rules="[vrules.requiredField('Mes')]"
                />
              </VCol>
              <VCol sm="6" cols="6">
                <VTextField
                  id="cm-medal-year"
                  v-model="form.description.year"
                  label="Año"
                  type="number"
                  density="compact"
                  :disabled="saving"
                  variant="outlined"
                  :rules="[vrules.requiredField('Año')]"
                />
              </VCol>

              <VCol v-if="form.medal === 'edin'" cols="12">
                <VTextField
                  id="cm-medal-level"
                  v-model.number="form.description.level"
                  min="1"
                  label="Nivel"
                  type="number"
                  density="compact"
                  :disabled="saving"
                  variant="outlined"
                  :rules="[vrules.requiredField('Nivel')]"
                />
              </VCol>

              <VCol v-if="form.medal === 'servicio'" cols="12">
                <VTextField
                  id="cm-medal-area"
                  v-model="form.description.area"
                  density="compact"
                  :disabled="saving"
                  variant="outlined"
                  label="Área de servicio"
                  :rules="[vrules.requiredField('Área')]"
                  placeholder="Ej. servidores, alabanza, multimedia"
                />
              </VCol>
            </template>

            <VCol cols="12" class="d-flex justify-end pt-2">
              <VBtn
                id="cm-medal-cancel-btn"
                class="mr-2"
                color="primary"
                :disabled="saving"
                variant="outlined"
                @click="close"
              >
                Cancelar
              </VBtn>
              <VBtn
                id="cm-medal-save-btn"
                color="primary"
                :loading="saving"
                :disabled="saving"
                variant="elevated"
                @click="save"
              >
                <VIcon start>mdi-plus</VIcon>
                Agregar
              </VBtn>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useVrules } from "~/composables/useVrules"

const props = withDefaults(defineProps<{
  id?: string
  member?: Record<string, unknown>
}>(), {
  id: "cm-medal-dlg",
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const { ChurchMember } = useRepository()
const notify = useNotifyStore()
const { vrules } = useVrules()

const formRef = ref()
const saving = ref(false)

const memberName = computed(() => {
  const m = props.member as Record<string, unknown> | undefined
  return `${m?.name ?? ""} ${m?.last_name ?? ""}`.trim() || "Miembro"
})

const medalOptions = [
  { title: "Bautizo", value: "bautizo" },
  { title: "EDIN", value: "edin" },
  { title: "Servicio", value: "servicio" },
]

const monthOptions = [
  { title: "Enero", value: "01" },
  { title: "Febrero", value: "02" },
  { title: "Marzo", value: "03" },
  { title: "Abril", value: "04" },
  { title: "Mayo", value: "05" },
  { title: "Junio", value: "06" },
  { title: "Julio", value: "07" },
  { title: "Agosto", value: "08" },
  { title: "Septiembre", value: "09" },
  { title: "Octubre", value: "10" },
  { title: "Noviembre", value: "11" },
  { title: "Diciembre", value: "12" },
]

const form = ref<{
  medal: string
  description: { month?: string; year?: number | string; level?: number; area?: string }
}>({
  medal: "",
  description: { month: "", year: new Date().getFullYear() },
})

watch(() => form.value.medal, () => {
  form.value.description = { month: "", year: new Date().getFullYear() }
})

async function save() {
  if (saving.value) return
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) return
  if (saving.value) return
  const memberId = (props.member as Record<string, unknown> | undefined)?.id
  if (memberId == null) return

  saving.value = true
  try {
    await ChurchMember.createMedal<Record<string, unknown>>(memberId, {
      medal: form.value.medal,
      description: { ...form.value.description },
    })
    notify.notify({ success: "Medalla agregada exitosamente" })
    emit("saved")
    emit("close")
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
