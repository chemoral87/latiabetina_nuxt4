<template>
  <VContainer :fluid="true">
    <VRow justify="center">
      <VCol cols="12" md="8">
        <ChurchEventForm
          :loading="saving"
          :initial-event-date="
            (route.query.event_date as string | undefined) || null
          "
          permission="church-event-insert"
          @close="close"
          @save="saveChurchEvent"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Nuevo Evento de Iglesia",
  icon: "mdi-calendar-plus",
  permission: "church-event-index",
  middleware: ["authenticated", "permission"],
});

const route = useRoute();
const { ChurchEvent } = useRepository();
const notify = useNotifyStore();

const saving = ref(false);

onMounted(() => {
  route.meta.back = backRoute.value;
});

const backRoute = computed(() => {
  if (route.query.from === "calendar") {
    const q: Record<string, string> = {};
    if (route.query.cal_year) q.cal_year = String(route.query.cal_year);
    if (route.query.cal_month !== undefined)
      q.cal_month = String(route.query.cal_month);
    const queryString = new URLSearchParams(q).toString();
    return queryString
      ? `/church-event/calendar?${queryString}`
      : "/church-event/calendar";
  }
  return "/church-event";
});

function close() {
  navigateTo(backRoute.value);
}

async function saveChurchEvent(item: Record<string, unknown>) {
  const payload = { ...item };
  if (payload.org_id && typeof payload.org_id === "object") {
    payload.org_id = (payload.org_id as { id?: unknown }).id;
  }

  try {
    saving.value = true;
    await ChurchEvent.create<Record<string, unknown>>(payload);

    navigateTo(backRoute.value);
  } catch (error) {
    notify.notify({ error: "Error al crear el evento" });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped></style>
