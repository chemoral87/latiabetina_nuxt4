<template>
  <VDialog id="eve-copyd-dlg-1" persistent max-width="560px" :model-value="true">
    <VCard rounded="lg">
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-content-copy</VIcon>
        Copiar Evento
        <VSpacer />
        <VBtn id="eve-copydialog-close-btn" icon size="x-small" :disabled="loading" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <p class="mb-2 text-grey-darken-1">
          Elige cómo deseas copiar <strong>{{ churchEvent.name }}</strong>:
        </p>

        <VBtnToggle
          v-model="mode"
          mandatory
          rounded="pill"
          density="compact"
          class="mode-toggle mb-4">
          <VBtn id="eve-copydialog-mode-dates-btn" size="small" value="dates" rounded="pill">POR CALENDARIO</VBtn>
          <VBtn id="eve-copydialog-mode-recurrence-btn" size="small" rounded="pill" value="recurrence">POR RANGO Y DÍAS</VBtn>
        </VBtnToggle>

        <template v-if="mode === 'dates'">
          <VDatePicker
            v-model="selectedDates"
            v-model:year="pickerYear"
            v-model:month="pickerMonth"
            multiple
            color="primary"
            :disabled="loading"
            event-color="#fb8c00"
            :first-day-of-week="1"
            control-variant="modal"
            class="copy-date-picker"
            :events="eventDateArray"
            weeks-in-month="dynamic"
            :show-adjacent-months="false"
            :allowed-dates="isAllowedDate"
          />

          <div v-if="selectedDates.length" class="mt-2">
            <VChip
              v-for="date in sortedDates"
              :key="date"
              closable
              size="small"
              class="mr-1 mb-1"
              :disabled="loading"
              @click:close="removeDate(date)"
            >
              {{ formatShortDate(date) }}
            </VChip>
          </div>
        </template>

        <template v-else>
          <VRow density="compact">
            <VCol sm="6" cols="12">
              <VMenu v-model="startDateMenu" offset-y min-width="auto" transition="scale-transition" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                  <VTextField
                    id="eve-copydialog-start-date"
                    v-model="recurrence.start_date"
                    readonly
                    hide-details
                    density="compact"
                    variant="outlined"
                    label="Fecha inicial"
                    prepend-inner-icon="mdi-calendar"
                    v-bind="menuProps"
                  />
                </template>
                <VDatePicker v-model="recurrence.start_date" @update:model-value="startDateMenu = false" />
              </VMenu>
            </VCol>
            <VCol sm="6" cols="12">
              <VMenu v-model="endDateMenu" offset-y min-width="auto" transition="scale-transition" :close-on-content-click="false">
                <template #activator="{ props: menuProps }">
                  <VTextField
                    id="eve-copydialog-end-date"
                    v-model="recurrence.end_date"
                    readonly
                    hide-details
                    density="compact"
                    variant="outlined"
                    label="Fecha final"
                    prepend-inner-icon="mdi-calendar"
                    v-bind="menuProps"
                  />
                </template>
                <VDatePicker v-model="recurrence.end_date" @update:model-value="endDateMenu = false" />
              </VMenu>
            </VCol>
          </VRow>

          <VChipGroup v-model="recurrence.days_of_week" column multiple aria-label="Días de la semana">
            <VChip v-for="(day, index) in weekDays" :key="day" filter :value="index" variant="outlined">
              {{ day }}
            </VChip>
          </VChipGroup>
        </template>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="eve-copydialog-cancel-btn" variant="text" color="primary" :disabled="loading" @click="close">
          Cancelar
        </VBtn>
        <VBtn id="eve-copydialog-copy-btn" color="primary" :loading="loading" variant="elevated" :disabled="!canCopy" @click="copy">
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

/* Segmented pill toggle to match mockup */
.mode-toggle {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 4px;
}

.mode-toggle :deep(.v-btn) {
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.03em;
  box-shadow: none;
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
}

.mode-toggle :deep(.v-btn--active) {
  background: rgb(var(--v-theme-surface));
  color: rgba(0, 0, 0, 0.87);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Custom two-letter weekday labels (Lu, Ma, Mi, Ju, Vi, Sa, Do), Monday first */
.copy-date-picker :deep(.v-date-picker-month__weekday) {
  font-size: 0;
}

.copy-date-picker :deep(.v-date-picker-month__weekday)::before {
  font-size: 0.75rem;
}

.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(1))::before { content: "Lu"; }
.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(2))::before { content: "Ma"; }
.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(3))::before { content: "Mi"; }
.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(4))::before { content: "Ju"; }
.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(5))::before { content: "Vi"; }
.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(6))::before { content: "Sa"; }
.copy-date-picker :deep(.v-date-picker-month__weekday:nth-child(7))::before { content: "Do"; }
</style>
