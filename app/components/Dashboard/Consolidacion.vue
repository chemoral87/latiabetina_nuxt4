<template>
  <div>
    <VCard
      v-for="event in events"
      :id="`card-dashb-conso-${event.id}`"
      :key="event.id"
      hover
      variant="outlined"
      class="mb-3 text-center"
      :style="{ cursor: 'pointer', border: `6px solid ${getEventColor(event.time)}` }"
      @click="goToEvent(event.id)"
    >
      <VCardText v-if="event.auditorium_name" class="d-flex flex-column align-center">
        <VIcon large class="mb-2">mdi-theater</VIcon>
        <div>{{ event.auditorium_name }}</div>
      </VCardText>
      <VCardTitle v-if="event.event_date" class="justify-center text-body-1">
        Evento {{ formatShortDate(event.event_date) }}
        <span v-if="event.time" class="ml-2">- {{ formatHourTime(event.time) }}</span>
      </VCardTitle>
    </VCard>
  </div>
</template>

<script setup lang="ts">
const { AuditoriumEvent } = useRepository()

const response = ref<{ data: Array<Record<string, unknown>> }>({ data: [] })

const events = computed(() => response.value?.data || [])

onMounted(async () => {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  const options: Record<string, unknown> = {
    sortBy: ["event_date"],
    sortDesc: [true],
    itemsPerPage: 10,
    date,
  }
  response.value = await AuditoriumEvent.index<{ data: Array<Record<string, unknown>> }>(options).catch(
    () => ({ data: [] }),
  )
})

function getEventColor(time?: string | null) {
  if (time === "09:45") return "green"
  if (time === "12:00") return "orange"
  return "#87ceeb"
}

function goToEvent(eventId: number | string) {
  navigateTo(`/auditorium-event/${eventId}/mark`)
}
</script>