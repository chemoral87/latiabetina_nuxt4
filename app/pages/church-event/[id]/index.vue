<template>
  <VContainer fluid>
    <VRow justify="center">
      <VCol cols="12" md="8">
        <div v-if="loadingItem" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </div>
        <ChurchEventForm
          v-else
          :church-event="churchEvent"
          :loading="saving"
          permission="church-event-update"
          @close="close"
          @save="saveChurchEvent"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Evento de Iglesia",
  icon: "mdi-calendar-edit",
  permission: "church-event-index",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { ChurchEvent } = useRepository()
const notify = useNotifyStore()

const saving = ref(false)
const loadingItem = ref(true)
const churchEvent = ref<Record<string, unknown>>({})

// Initial load (asyncData equivalent)
{
  try {
    const dbItem = await ChurchEvent.show<Record<string, unknown>>(route.params.id as string)
    churchEvent.value = dbItem as Record<string, unknown>
  } catch (e) {
    throw createError({ statusCode: 404, statusMessage: "Evento no encontrado" })
  } finally {
    loadingItem.value = false
  }
}

onMounted(() => {
  route.meta.back = backRoute.value
})

const backRoute = computed(() => {
  if (route.query.from === "calendar") {
    const q: Record<string, string> = {}
    if (route.query.cal_year) q.cal_year = String(route.query.cal_year)
    if (route.query.cal_month !== undefined) q.cal_month = String(route.query.cal_month)
    const queryString = new URLSearchParams(q).toString()
    return queryString ? `/church-event/calendar?${queryString}` : "/church-event/calendar"
  }
  return "/church-event"
})

function close() {
  navigateTo(backRoute.value)
}

async function saveChurchEvent(item: Record<string, unknown>) {
  const payload = { ...item }
  delete payload.org_id

  try {
    saving.value = true
    await ChurchEvent.update(payload.id as number, payload)

    navigateTo(backRoute.value)
  } catch (error) {
    notify.notify({ error: "Error al actualizar el evento" })
    console.error(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped></style>
