<template>
  <VDialog id="dlg-churc-copyd-1" :model-value="true" persistent max-width="560px">
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon class="mr-2">mdi-content-copy</VIcon>
        <span class="text-h5">Copiar Evento</span>
        <VSpacer />
        <VBtn icon :disabled="loading" id="btn-churchevent-copydialog-close" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <p class="mb-2 text-grey-darken-1">
          Elige cómo deseas copiar <strong>{{ churchEvent.name }}</strong>:
        </p>

        <VBtnToggle v-model="mode" mandatory density="compact" class="mb-4">
          <VBtn value="dates" size="small" id="btn-churchevent-copydialog-mode-dates">Por calendario</VBtn>
          <VBtn value="recurrence" size="small" id="btn-churchevent-copydialog-mode-recurrence">Por rango y días</VBtn>
        </VBtnToggle>

        <template v-if="mode === 'dates'">
          <VDatePicker
            v-model="selectedDates"
            multiple
            full-width
            :disabled="loading"
            :events="eventDateArray"
            event-color="#fb8c00"
            :allowed-dates="isAllowedDate"
            v-model:month="pickerMonth"
            v-model:year="pickerYear"
          />

          <div v-if="selectedDates.length" class="mt-2">
            <VChip
              v-for="date in sortedDates"
              :key="date"
              size="small"
              class="mr-1 mb-1"
              closable
              :disabled="loading"
              @click:close="removeDate(date)"
            >
              {{ formatShortDate(date) }}
            </VChip>
          </div>
        </template>

        <template v-else>
          <VRow density="comfortable">
            <VCol cols="12" sm="6">
              <VMenu v-model="startDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                <template #activator="{ props: menuProps }">
                  <VTextField
                    id="tf-churc-copyd-recurrence-start_date-1"
                    v-model="recurrence.start_date"
                    label="Fecha inicial"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    variant="outlined"
                    density="compact"
                    hide-details
                    v-bind="menuProps"
                  />
                </template>
                <VDatePicker v-model="recurrence.start_date" @update:model-value="startDateMenu = false" />
              </VMenu>
            </VCol>
            <VCol cols="12" sm="6">
              <VMenu v-model="endDateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
                <template #activator="{ props: menuProps }">
                  <VTextField
                    id="tf-churc-copyd-recurrence-end_date-2"
                    v-model="recurrence.end_date"
                    label="Fecha final"
                    prepend-inner-icon="mdi-calendar"
                    readonly
                    variant="outlined"
                    density="compact"
                    hide-details
                    v-bind="menuProps"
                  />
                </template>
                <VDatePicker v-model="recurrence.end_date" @update:model-value="endDateMenu = false" />
              </VMenu>
            </VCol>
          </VRow>

          <label class="text-caption text-grey-darken-1">Días de la semana</label>
          <VChipGroup v-model="recurrence.days_of_week" multiple column>
            <VChip v-for="(day, index) in weekDays" :key="day" filter variant="outlined" :value="index">
              {{ day }}
            </VChip>
          </VChipGroup>
        </template>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn color="primary" variant="text" :disabled="loading" id="btn-churchevent-copydialog-cancel" @click="close">
          Cancelar
        </VBtn>
        <VBtn color="primary" variant="elevated" :loading="loading" :disabled="!canCopy" id="btn-churchevent-copydialog-copy" @click="copy">
          <VIcon start size="small">mdi-content-copy</VIcon>
          Copiar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { formatShortDate } from "~/utils/date"

const props = defineProps<{
  churchEvent: Record<string, unknown>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'copy', val: Record<string, unknown>): void
}>()

function isoToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const eventDate = (props.churchEvent.event_date as string | undefined) || ""
const mode = ref<'dates' | 'recurrence'>('dates')
const selectedDates = ref<string[]>([])
const recurrence = ref<{ start_date: string | null; end_date: string | null; days_of_week: number[] }>({
  start_date: isoToday(),
  end_date: null,
  days_of_week: [],
})
const startDateMenu = ref(false)
const endDateMenu = ref(false)
const pickerMonth = ref(eventDate ? Number(eventDate.substring(5, 7)) - 1 : new Date().getMonth())
const pickerYear = ref(eventDate ? Number(eventDate.substring(0, 4)) : new Date().getFullYear())
const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const sortedDates = computed(() => [...selectedDates.value].sort())

const eventDateArray = computed(() => (eventDate ? [eventDate] : []))

const canCopy = computed(() => {
  if (mode.value === 'dates') {
    return selectedDates.value.length > 0
  }
  return !!recurrence.value.start_date && !!recurrence.value.end_date && recurrence.value.days_of_week.length > 0
})

function isAllowedDate(date: string): boolean {
  return date !== eventDate
}

function removeDate(date: string) {
  selectedDates.value = selectedDates.value.filter((d) => d !== date)
}

function close() {
  emit("close")
}

function copy() {
  if (props.loading) return

  if (mode.value === 'dates') {
    if (!selectedDates.value.length) return
    emit("copy", {
      churchEvent: props.churchEvent,
      dates: sortedDates.value,
    })
    return
  }

  if (!canCopy.value) return

  emit("copy", {
    churchEvent: props.churchEvent,
    recurrence: {
      start_date: recurrence.value.start_date,
      end_date: recurrence.value.end_date,
      days_of_week: recurrence.value.days_of_week,
    },
  })
}
</script>

<style scoped>
:deep(.v-date-picker-month .v-event),
:deep(.v-date-picker-table .v-event) {
  border: 2px solid #fb8c00 !important;
  background-color: transparent !important;
}
</style>
