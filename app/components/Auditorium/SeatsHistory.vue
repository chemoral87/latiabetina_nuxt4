<template>
  <VDialog id="dlg-audit-seats-index-localvisible-1" v-model="localVisible" max-width="700" scrollable>
    <VCard>
      <VCardTitle class="d-flex align-center">
        <VIcon start color="info">mdi-history</VIcon>
        Historial de asientos
        <VSpacer />
        <VBtn icon id="btn-aushi-close" @click="localVisible = false">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VCardText style="max-height: 60vh; padding: 0">
        <div v-if="historyLoading" class="d-flex justify-center align-center pa-8">
          <VProgressCircular indeterminate color="info" />
        </div>

        <VTable v-else-if="seatTransitions.length" density="compact">
          <thead>
            <tr>
              <th colspan="2" style="padding: 6px 16px 4px">
                <div class="d-flex align-center" style="gap: 8px">
                  <VSelect
                    v-model="historyIconFilter"
                    :items="historyFilterOptions"
                    label="Filtrar por estado"
                    item-title="text"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    flat
                    style="max-width: 220px; font-size: 11px"
                    class="history-filter-select"
                  >
                    <template #selection="{ item }">
                      <VIcon x-small :color="item.raw.color" class="mr-2">{{ item.raw.mdi }}</VIcon>
                      <span style="font-size: 11px">{{ item.raw.text }}</span>
                    </template>
                    <template #item="{ item }">
                      <VIcon x-small :color="item.raw.color" class="mr-2">{{ item.raw.mdi }}</VIcon>
                      <span style="font-size: 11px">{{ item.raw.text }}</span>
                    </template>
                  </VSelect>
                </div>
              </th>
            </tr>
            <tr>
              <th>Seat</th>
              <th>Transiciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="seat in filteredSeatTransitions" :key="seat.id">
              <td class="text-caption" style="white-space: nowrap; font-family: monospace">
                {{ seat.label }}
              </td>
              <td>
                <div class="d-flex align-center flex-wrap" style="gap: 0px; row-gap: 6px">
                  <div v-for="(step, si) in seat.transitions" :key="`t-${seat.id}-${si}`" style="display: contents">
                    <div
                      class="d-flex align-center"
                      :style="{
                        gap: '1px',
                        border: '1.5px solid ' + step.color,
                        borderRadius: '4px',
                        padding: '2px 2px',
                        background: 'transparent',
                        marginRight: '2px',
                      }"
                      :title="`${getHistoryUser(step.createdBy).name}\n${getHistoryUser(step.createdBy).email}`"
                    >
                      <VIcon :color="step.color" style="margin-top: -2px">{{ step.mdi }}</VIcon>
                      <div class="d-flex flex-column">
                        <span style="line-height: 1; font-weight: 700; color: #333; font-size: 8px">
                          {{ getHistoryUser(step.createdBy).first_name }}
                          <br>
                          {{ getHistoryUser(step.createdBy).last_name }}
                        </span>
                        <span class="text-grey" style="font-size: 7px;">
                          {{ step.time }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>

        <div v-else class="pa-6 text-center text-grey">
          <VIcon large>mdi-clipboard-text-off-outline</VIcon>
          <div class="mt-2">Sin historial disponible</div>
        </div>
      </VCardText>

      <VDivider />
      <VCardActions>
        <VSpacer />
        <VBtn text id="btn-aushi-close-btn" @click="localVisible = false">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { STATUS_CONFIG } from "~/constants/auditorium"

const props = defineProps<{
  modelValue?: boolean
  historyLoading?: boolean
  historyLog?: Record<string, unknown>[]
  historyUsers?: Record<string, unknown>[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

interface Transition {
  status: string
  color: string
  mdi: string
  label: string
  date: string
  time: string
  createdBy: number
}

interface SeatTransition {
  id: string
  label: string
  transitions: Transition[]
}

const historyIconFilter = ref<string | null>(null)

const localVisible = computed({
  get: () => props.modelValue ?? false,
  set: (val: boolean) => emit('update:modelValue', val),
})

const activeStatusConfig = computed(() => {
  return Object.keys(STATUS_CONFIG)
    .filter((key) => STATUS_CONFIG[key].active !== false)
    .reduce((acc, key) => {
      acc[key] = STATUS_CONFIG[key]
      return acc
    }, {} as Record<string, { label: string; mdi?: string; color: string }>)
})

const historyFilterConfig = computed(() => {
  const config = { ...activeStatusConfig.value }
  delete (config as Record<string, unknown>).e
  return config
})

const historyFilterOptions = computed(() => {
  return Object.keys(historyFilterConfig.value).map((key) => ({
    value: key,
    text: historyFilterConfig.value[key].label,
    mdi: historyFilterConfig.value[key].mdi || "mdi-circle",
    color: historyFilterConfig.value[key].color,
  }))
})

const seatTransitions = computed<SeatTransition[]>(() => {
  const map: Record<string, Transition[]> = {}
  ;(props.historyLog ?? []).forEach((entry) => {
    const seats = (entry.seat_ids as string[]) || []
    const cfg = STATUS_CONFIG[(entry.status as string) || ""] || {}
    const step: Transition = {
      status: entry.status as string,
      color: cfg.color || '#ffeb3b',
      mdi: cfg.mdi || 'mdi-circle',
      label: cfg.label || (entry.status as string) || '—',
      date: new Date(entry.created_at as string).toLocaleString(),
      time: new Date(entry.created_at as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: entry.created_by as number,
    }
    seats.forEach((seatId) => {
      if (!map[seatId]) map[seatId] = []
      map[seatId].push(step)
    })
  })
  return Object.keys(map).sort().map((id) => ({ id, label: formatSeatId(id), transitions: map[id] }))
})

const filteredSeatTransitions = computed(() => {
  if (!historyIconFilter.value) return seatTransitions.value
  return seatTransitions.value.filter((seat) =>
    seat.transitions.some((step) => step.status === historyIconFilter.value)
  )
})

watch(() => props.modelValue, (val) => {
  if (val) historyIconFilter.value = null
})

function formatSeatId(seatId: string) {
  if (!seatId) return seatId
  const parts = seatId.split('-')
  if (parts.length < 4) return seatId
  const row = parts[parts.length - 2]
  const col = parseInt(parts[parts.length - 1], 10)
  if (isNaN(col)) return seatId
  const letter = String.fromCharCode(64 + col)
  return `${row}${letter}`
}

function getHistoryUser(createdBy: number) {
  const user = (props.historyUsers ?? []).find((u) => u.id === createdBy)
  if (!user) return { name: `#${createdBy}`, first_name: `#${createdBy}`, last_name: '', email: '' }
  return {
    name: `${user.name} ${user.last_name}`,
    first_name: (user.name as string) || '',
    last_name: (user.last_name as string) || '',
    email: (user.email as string) || '',
  }
}
</script>
