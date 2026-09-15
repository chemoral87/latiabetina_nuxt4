<template>
  <VContainer fluid>
    <VRow justify="center" density="compact">
      <VCol md="8" cols="12">
        <AssistanceForm
          v-if="loadingItem"
          :loading="saving"
          :assistance="assistance"
          permission="assistance-update"
          @close="close"
          @save="saveAssistance"
        />
        <div v-else class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </div>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Editar Asistencia",
  icon: "mdi-account-multiple",
  permission: "assistance-update",
  middleware: ["authenticated", "permission"],
});

const route = useRoute();
const { Assistance } = useRepository();
const notify = useNotifyStore();

const saving = ref(false);
const loadingItem = ref(true);
const assistance = ref<Record<string, unknown>>({});

const backRoute = computed(() => {
  if (route.query.from === "table") {
    return "/assistance";
  }
  return "/assistance";
});

function close() {
  navigateTo(backRoute.value);
}

try {
  const dbItem = await Assistance.show<Record<string, unknown>>(route.params.id as string);
  assistance.value = dbItem as Record<string, unknown>;
} catch (e) {
  throw createError({ statusCode: 404, message: "Asistencia no encontrada" });
} finally {
  loadingItem.value = false;
}

async function saveAssistance(item: Record<string, unknown>) {
  const payload = { ...item };
  delete payload.org_id;

  try {
    saving.value = true;
    await Assistance.update(payload.id as number, payload);
    notify.notify({ success: "Asistencia actualizada correctamente." });
    navigateTo(backRoute.value);
  } catch (error) {
    notify.notify({ error: "Error al actualizar la asistencia" });
    console.error(error);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped></style>
