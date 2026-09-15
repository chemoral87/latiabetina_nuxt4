<template>
  <VContainer fluid>
    <VRow justify="center" density="compact">
      <VCol md="8" cols="12">
        <AssistanceForm
          :loading="saving"
          :permission="permission"
          @close="close"
          @save="saveAssistance"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Nueva Asistencia",
  icon: "mdi-account-multiple-plus",
  permission: "assistance-create",
  middleware: ["authenticated", "permission"],
});

const route = useRoute();
const { Assistance } = useRepository();
const notify = useNotifyStore();

const saving = ref(false);

onMounted(() => {
  route.meta.back = backRoute.value;
});

const backRoute = computed(() => {
  if (route.query.from === "table") {
    return "/assistance";
  }
  return "/assistance";
});

function close() {
  navigateTo(backRoute.value);
}

async function saveAssistance(item: Record<string, unknown>) {
  const payload = { ...item };
  if (payload.org_id && typeof payload.org_id === "object") {
    payload.org_id = (payload.org_id as { id?: unknown }).id;
  }

  try {
    saving.value = true;
    await Assistance.create<Record<string, unknown>>(payload);
    notify.notify({ success: "Asistencia creada correctamente." });
    navigateTo(backRoute.value);
  } catch (error) {
    if (error && typeof error === "object" && (error as { response?: { status?: number; _data?: { errors?: Record<string, string[]> } } }).response?.status === 422) {
      const err = error as { response: { _data: { errors: Record<string, string[]> } } };
      notify.notify({ error: "Error de validación" });
      console.error(err.response._data.errors);
    } else {
      notify.notify({ error: "Error al crear la asistencia" });
    }
    console.error(error);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped></style>
