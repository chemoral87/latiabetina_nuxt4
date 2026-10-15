<template>
  <VContainer class="" :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol cols="12">
          <div class="d-flex align-center justify-space-between py-2 px-2">
            <span class="text-h6">Publicar Servicio Profesional</span>
            <VBtn
              id="pron-back-btn"
              color="primary"
              variant="outlined"
              @click="navigateTo('/professional')"
            >
              <VIcon start>mdi-arrow-left</VIcon>
              Volver
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VSheet>

    <ProfessionalDialog
      v-if="dialog"
      :loading="saving"
      @close="closeDialog"
      @save="saveProfessional"
    />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Publicar Servicio",
  icon: "mdi-account-plus",
  middleware: ["authenticated"],
});

const { Professional } = useRepository();

const dialog = ref(true);
const saving = ref(false);

async function saveProfessional(item: Record<string, unknown>) {
  try {
    saving.value = true;
    await Professional.create<Record<string, unknown>>(item);
    dialog.value = false;
    await navigateTo("/professional");
  } catch (e) {
    console.error("Error al publicar el servicio", e);
  } finally {
    saving.value = false;
  }
}

function closeDialog() {
  dialog.value = false;
  navigateTo("/professional");
}
</script>
