<template>
  <VRow id="cmp-church-event-calendar-view" justify="center" class="mb-2" density="comfortable">
    <VCol cols="12">
      <VCard id="card-churc-calen-1" elevation="1">
        <div class="d-flex align-center justify-space-between px-4 py-1 calendar-toolbar">
          <button class="month-nav-btn" aria-label="Mes anterior" @click="emit('prev-month')">
            <VIcon size="22" color="white">mdi-chevron-left</VIcon>
          </button>
          <span class="text-body-1 font-weight-medium text-capitalize calendar-toolbar-title">
            {{ monthNames[calMonth] }} {{ calYear }}
          </span>
          <button class="month-nav-btn" aria-label="Mes siguiente" @click="emit('next-month')">
            <VIcon size="22" color="white">mdi-chevron-right</VIcon>
          </button>
        </div>

        <div class="big-cal-grid">
          <div v-for="day in currentWeekdayNames" :key="day" class="big-cal-header text-caption font-weight-bold">
            {{ day }}
          </div>

          <div
            v-for="cell in allCells"
            :key="cell.iso"
            class="big-cal-cell"
            :class="{
              'big-cal-today': cell.isToday,
              'big-cal-other-month': cell.otherMonth,
              'big-cal-has-events': cell.events.length,
              'big-cal-selected': selectedDayIso === cell.iso,
            }"
            role="button"
            tabindex="0"
            @click="selectDay(cell)"
            @keydown.enter="selectDay(cell)"
          >
            <div class="big-cal-day-header">
              <div class="big-cal-day-number font-weight-bold" :class="{ 'today-badge': cell.isToday }">
                {{ cell.day }}
              </div>
              <VTooltip text="Nuevo evento" location="bottom">
                <template #activator="{ props: tooltipProps }">
                  <button class="cell-add-btn" aria-label="Nuevo evento" v-bind="tooltipProps" @click.stop="emit('new', cell.iso)">
                    <VIcon size="20" color="success">mdi-plus-circle</VIcon>
                  </button>
                </template>
              </VTooltip>
            </div>

            <div
              v-for="event in cell.events"
              :key="event.id"
              class="event-pill text-caption d-none d-sm-flex"
              :style="{ borderColor: classificationColor(event.classification) }"
              :title="event.name"
            >
              <div v-if="event.url_image_s3 || event.url_image" class="event-pill-thumb" @click.stop="emit('edit', event)">
                <img :src="event.url_image_s3 || event.url_image" class="event-thumb-img" alt="" />
              </div>
              <div class="event-pill-main" @click.stop="emit('edit', event)">
                <span class="event-pill-name">{{ event.name }}</span>
                <span v-if="event.time_start" class="event-pill-time">{{ formatEventTime(event.time_start) }}</span>
                <div class="event-actions">
                  <VTooltip text="Editar" location="bottom">
                    <template #activator="{ props: tooltipProps }">
                      <VBtn v-bind="tooltipProps" id="btn-churchevent-calendar-edit" icon size="small" color="primary" @click.stop="emit('edit', event)">
                        <VIcon size="18">mdi-pencil</VIcon>
                      </VBtn>
                    </template>
                  </VTooltip>
                  <VTooltip text="Copiar" location="bottom">
                    <template #activator="{ props: tooltipProps }">
                      <VBtn v-bind="tooltipProps" id="btn-churchevent-calendar-copy" icon size="small" color="orange" @click.stop="emit('copy', event)">
                        <VIcon size="18">mdi-content-copy</VIcon>
                      </VBtn>
                    </template>
                  </VTooltip>
                  <VTooltip text="Eliminar" location="bottom">
                    <template #activator="{ props: tooltipProps }">
                      <VBtn v-bind="tooltipProps" id="btn-churchevent-calendar-delete" icon size="small" color="error" @click.stop="emit('delete', event)">
                        <VIcon size="18">mdi-delete</VIcon>
                      </VBtn>
                    </template>
                  </VTooltip>
                </div>
              </div>
            </div>

            <div v-if="cell.events.length" class="event-dots d-flex d-sm-none">
              <span
                v-for="event in cell.events"
                :key="event.id"
                class="event-dot"
                :style="{ backgroundColor: classificationColor(event.classification) }"
              ></span>
            </div>
          </div>
        </div>

        <div v-if="!selectedDayIso" class="d-flex d-sm-none align-center justify-center px-4 py-3 mobile-hint">
          <VIcon size="16" class="mr-1 calendar-hint-icon">mdi-calendar-cursor</VIcon>
          <span class="text-caption text-center">Seleccione una fecha con punto para ver los eventos</span>
        </div>

        <div v-if="selectedDayEvents.length" class="d-flex d-sm-none flex-column px-3 pb-3 pt-2 mobile-events">
          <div
            v-for="event in selectedDayEvents"
            :key="event.id"
            class="mobile-event-card"
            :style="{ borderColor: classificationColor(event.classification) }"
          >
            <div class="d-flex align-start justify-space-between">
              <div class="mobile-event-main" @click="emit('edit', event)">
                <div class="font-weight-bold text-body-2 calendar-primary-text">{{ event.name }}</div>
                <div v-if="event.time_start" class="text-caption text-grey">
                  {{ formatEventTime(event.time_start) }}
                </div>
              </div>
              <div class="d-flex flex-nowrap ml-2">
                <VBtn id="btn-churchevent-calendar-mobile-edit" icon size="small" color="primary" aria-label="Editar" @click.stop="emit('edit', event)">
                  <VIcon size="16">mdi-pencil</VIcon>
                </VBtn>
                <VBtn id="btn-churchevent-calendar-mobile-copy" icon size="small" color="orange" aria-label="Copiar" @click.stop="emit('copy', event)">
                  <VIcon size="16">mdi-content-copy</VIcon>
                </VBtn>
                <VBtn id="btn-churchevent-calendar-mobile-delete" icon size="small" color="error" aria-label="Eliminar" @click.stop="emit('delete', event)">
                  <VIcon size="16">mdi-delete</VIcon>
                </VBtn>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeClassifications.length" class="d-flex align-center flex-wrap px-4 pb-3 pt-2 legend-row">
          <span v-for="classification in activeClassifications" :key="classification.value" class="d-flex align-center legend-item">
            <span class="legend-dot" :style="{ borderColor: classification.hex }"></span>
            <span class="text-caption text-grey-darken-1">{{ classification.label }}</span>
          </span>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<script setup lang="ts">
import { classifications, classificationColor } from "./classifications"

interface CalendarEvent {
  id: number | string
  name?: string
  event_date?: string
  end_date?: string
  start_date?: string
  publish_date?: string
  time_start?: string
  classification?: string
  url_image_s3?: string
  url_image?: string
}

interface CalendarCell {
  day: number
  iso: string
  isToday: boolean
  otherMonth: boolean
  events: CalendarEvent[]
}

const props = defineProps<{
  calYear: number
  calMonth: number
  events?: CalendarEvent[]
  weekStartsOnMonday?: boolean
}>()

const emit = defineEmits<{
  (e: 'prev-month'): void
  (e: 'next-month'): void
  (e: 'new', dateIso: string): void
  (e: 'edit', event: CalendarEvent): void
  (e: 'copy', event: CalendarEvent): void
  (e: 'delete', event: CalendarEvent): void
}>()

const monthNames = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

const weekdayNamesSundayFirst = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const weekdayNamesMondayFirst = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

const selectedDayIso = ref<string | null>(null)
const isMobile = ref(false)
const today = new Date()

const activeClassifications = computed(() => {
  const usedValues = new Set((props.events ?? []).map((event) => event.classification).filter(Boolean))
  return classifications.filter((classification) => usedValues.has(classification.value))
})

const currentWeekdayNames = computed(() =>
  props.weekStartsOnMonday ? weekdayNamesMondayFirst : weekdayNamesSundayFirst,
)

const eventsByDate = computed<Record<string, CalendarEvent[]>>(() => {
  return (props.events ?? []).reduce<Record<string, CalendarEvent[]>>((map, event) => {
    const eventDate = event.event_date || event.end_date || event.start_date || event.publish_date
    if (!eventDate) return map

    const key = eventDate.slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(event)
    return map
  }, {})
})

const selectedDayEvents = computed(() => {
  if (!selectedDayIso.value) return []
  return eventsByDate.value[selectedDayIso.value] || []
})

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function toWeekColumn(jsDay: number): number {
  return props.weekStartsOnMonday ? (jsDay + 6) % 7 : jsDay
}

const leadingCells = computed<CalendarCell[]>(() => {
  const firstDayOfWeek = toWeekColumn(new Date(props.calYear, props.calMonth, 1).getDay())
  if (firstDayOfWeek === 0) return []

  const prevMonth = props.calMonth === 0 ? 11 : props.calMonth - 1
  const prevYear = props.calMonth === 0 ? props.calYear - 1 : props.calYear
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()

  return Array.from({ length: firstDayOfWeek }, (_, index) => {
    const day = daysInPrevMonth - (firstDayOfWeek - 1 - index)
    const iso = toIso(prevYear, prevMonth, day)
    return {
      day,
      iso,
      isToday: false,
      otherMonth: true,
      events: eventsByDate.value[iso] || [],
    }
  })
})

const monthCells = computed<CalendarCell[]>(() => {
  const daysInMonth = new Date(props.calYear, props.calMonth + 1, 0).getDate()
  const result: CalendarCell[] = []

  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = toIso(props.calYear, props.calMonth, day)
    result.push({
      day,
      iso,
      isToday:
        props.calYear === today.getFullYear() &&
        props.calMonth === today.getMonth() &&
        day === today.getDate(),
      otherMonth: false,
      events: eventsByDate.value[iso] || [],
    })
  }

  const lastDayOfWeek = toWeekColumn(new Date(props.calYear, props.calMonth, daysInMonth).getDay())
  if (lastDayOfWeek < 6) {
    const nextMonth = props.calMonth === 11 ? 0 : props.calMonth + 1
    const nextYear = props.calMonth === 11 ? props.calYear + 1 : props.calYear

    for (let day = 1; day <= 6 - lastDayOfWeek; day += 1) {
      const iso = toIso(nextYear, nextMonth, day)
      result.push({
        day,
        iso,
        isToday: false,
        otherMonth: true,
        events: eventsByDate.value[iso] || [],
      })
    }
  }

  return result
})

const allCells = computed<CalendarCell[]>(() => [...leadingCells.value, ...monthCells.value])

function updateIsMobile() {
  isMobile.value = window.innerWidth < 600
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener("resize", updateIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateIsMobile)
})

function selectDay(cell: CalendarCell) {
  if (!isMobile.value) return

  if (!cell.events.length) {
    selectedDayIso.value = null
    return
  }

  selectedDayIso.value = selectedDayIso.value === cell.iso ? null : cell.iso
}

function formatEventTime(value?: string): string {
  if (!value) return ""
  const [hour = "0", minute = "00"] = String(value).split(":")
  const date = new Date()
  date.setHours(Number(hour), Number(minute), 0, 0)
  return date.toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}
</script>

<style scoped>
.calendar-toolbar {
  background: #041845;
}

.calendar-toolbar-title {
  color: #ffffff !important;
}

.big-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 28px;
  grid-auto-rows: minmax(92px, auto);
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
}

.big-cal-header {
  padding: 3px 4px;
  line-height: 22px;
  text-align: center;
  color: #444;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.big-cal-cell {
  min-height: 0;
  padding: 4px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.big-cal-today {
  background: #f5f7fc;
  box-shadow: inset 0 0 0 2px orange;
}

.big-cal-other-month .big-cal-day-number {
  color: #bbb;
}

.big-cal-day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.big-cal-day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  color: #444;
  flex-shrink: 0;
}

.today-badge {
  background: #041845;
  color: #fff !important;
}

.cell-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 1;
  line-height: 1;
}

.event-pill {
  align-items: stretch;
  background: transparent;
  color: #333;
  border-radius: 3px;
  padding: 2px 4px;
  margin-bottom: 2px;
  font-size: 10px;
  line-height: 1.3;
  overflow: hidden;
  border-width: 3px;
  border-style: solid;
  display: flex;
  gap: 4px;
}

.event-pill-thumb {
  flex: 0 0 28%;
  max-width: 28%;
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  border-radius: 2px;
}

.event-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 2px;
}

.event-pill-main {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding-right: 4px;
  padding-bottom: 24px;
  cursor: pointer;
}

.event-pill-name {
  display: block;
  width: 100%;
  font-weight: 600;
  word-break: break-word;
}

.event-pill-time {
  display: block;
  font-size: 11px;
  opacity: 0.8;
}

.event-actions {
  position: absolute;
  right: 2px;
  bottom: 2px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 4px 0 0 0;
}

.legend-row {
  gap: 12px;
}

.legend-item {
  gap: 5px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 2px solid;
  background: transparent;
  flex-shrink: 0;
}

.mobile-hint,
.mobile-events {
  border-top: 1px solid #f0f0f0;
}

.calendar-hint-icon {
  color: #041845;
  opacity: 0.6;
}

.calendar-primary-text {
  color: #041845;
}

.event-dots {
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mobile-event-card {
  border: 2px solid;
  border-radius: 6px;
  padding: 8px 10px;
  background: #fff;
}

.mobile-event-main {
  min-width: 0;
  flex: 1 1 auto;
  cursor: pointer;
}

.month-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
}

.month-nav-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #fff;
  transform: scale(1.08);
}

.month-nav-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.35);
}

@media (max-width: 600px) {
  .big-cal-grid {
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: 20px;
    grid-auto-rows: 40px;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }

  .big-cal-header {
    padding: 0;
    line-height: 20px;
    height: 20px;
    font-size: 10px;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  .big-cal-cell {
    padding: 1px;
    min-height: 0;
    cursor: pointer;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  .big-cal-has-events {
    cursor: pointer;
  }

  .cell-add-btn {
    display: none;
  }
}

.big-cal-selected {
  background: #eef1fa;
  box-shadow: inset 0 0 0 2px #041845;
}
</style>
