<template>
  <VContainer :fluid="true">
    <VRow justify="center">
      <VCol md="8" cols="12">
        <VCard v-if="loadingItem" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </VCard>

        <VCard v-else>
          <VCardTitle
            class="text-subtitle-1 font-weight-medium d-flex align-center"
          >
            <VAvatar
              v-if="member.url_image_s3"
              size="48"
              class="mr-3"
              tile
            >
              <VImg
                :src="member.url_image_s3"
                alt="Foto del miembro"
                contain
              />
            </VAvatar>
            <VIcon v-else start color="primary" size="large">mdi-account</VIcon>
            {{ fullName }}
            <VSpacer />
            <VChip size="small" :color="statusColor(member.status)">
              {{ statusLabel(member.status) }}
            </VChip>
            <VBtn
              id="cmm-status-edit-btn"
              icon="mdi-pencil"
              size="x-small"
              variant="text"
              color="primary"
              rounded="circle"
              title="Cambiar estado"
              @click="statusDialog = true"
            />
          </VCardTitle>
          <VDivider />

          <VCardText>
            <VRow density="compact">
              <VCol md="3" sm="6" cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1"
                  >mdi-phone</VIcon
                >
                <span class="font-weight-medium">Celular:</span>
                {{ member.cellphone || "—" }}
              </VCol>
              <VCol md="3" sm="6" cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1"
                  >mdi-calendar-account</VIcon
                >
                <span class="font-weight-medium">Edad:</span>
                {{ member.years_old ?? "—" }}
              </VCol>
              <VCol md="3" sm="6" cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1"
                  >mdi-account-multiple</VIcon
                >
                <span class="font-weight-medium">Hijos:</span>
                {{ member.number_of_children ?? "—" }}
              </VCol>
              <VCol md="3" sm="6" cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1">mdi-ring</VIcon>
                <span class="font-weight-medium">Estado civil:</span>
                {{ member.marriage_status || "—" }}
              </VCol>
              <VCol cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1"
                  >mdi-map-marker</VIcon
                >
                <span class="font-weight-medium">Dirección:</span>
                {{ member.address || "—" }}
              </VCol>
              <VCol cols="12">
                <VBtn
                  id="cmm-edit-btn"
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-pencil"
                  @click="editDialog = true"
                >
                  Editar
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>

          <VDivider />

          <VCardActions>
            <VRow density="comfortable" class="w-100 align-center">
              <VCol v-if="phoneDigits" cols="12" sm="auto" class="flex-grow-1">
                <VTextField
                  id="cmm-message-input"
                  v-model="message"
                  clearable
                  hide-details
                  density="compact"
                  variant="outlined"
                  placeholder="Mensaje para WhatsApp / SMS"
                  append-inner-icon="mdi-message-text-outline"
                />
              </VCol>
              <VCol v-if="phoneDigits" cols="12" sm="auto" class="d-flex flex-wrap justify-center justify-sm-end">
                <VBtn
                  id="cmm-whatsapp-btn"
                  class="ma-1"
                  color="green"
                  variant="outlined"
                  @click="openContact('whatsapp', whatsappHref)"
                >
                  <VIcon start>mdi-whatsapp</VIcon>
                  WhatsApp
                </VBtn>
                <VBtn
                  id="cmm-sms-btn"
                  class="ma-1"
                  color="teal"
                  variant="outlined"
                  @click="openContact('sms', smsHref)"
                >
                  <VIcon start>mdi-message-text</VIcon>
                  Mensaje
                </VBtn>
                <VBtn
                  id="cmm-call-btn"
                  class="ma-1"
                  color="primary"
                  variant="outlined"
                  @click="openContact('llamada', telHref)"
                >
                  <VIcon start>mdi-phone</VIcon>
                  Llamar
                </VBtn>
              </VCol>
              <VCol cols="12" sm="auto" class="ml-sm-auto d-flex justify-center justify-sm-end">
                <VBtn color="primary" variant="outlined" @click="goBack">
                  <VIcon start>mdi-arrow-left</VIcon>
                  Volver
                </VBtn>
              </VCol>
            </VRow>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VRow justify="center">
      <VCol md="8" cols="12">
        <VCard v-if="!loadingItem">
          <VCardTitle class="text-subtitle-1 font-weight-medium">
            <VIcon start color="primary">mdi-history</VIcon>
            Interacciones
          </VCardTitle>
          <VDivider />
          <VCardText>
            <ChurchMemberTrackingLogTable
              id="cmm-tracking-log-table"
              :response="logsResponse"
              :loading="loadingLogs"
              @sorting="onLogsUpdateOptions"
              @edit="editTrackingLog"
              @delete="deleteTrackingLog"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <ConsolidationStatusLogDialog
      v-if="statusDialog"
      id="det-status-dlg"
      :member="member"
      :show-history="false"
      @close="statusDialog = false"
      @status-changed="onStatusChanged"
    />

    <ChurchMemberDialog
      v-if="editDialog"
      id="cmm-dialog-dlg"
      :member="member"
      :loading="saving"
      @save="saveMember"
      @close="editDialog = false"
    />

    <ChurchMemberTrackingLogDialog
      v-if="trackingLogDialog"
      id="cmm-tracking-log-dlg"
      :log="editingLog"
      :loading="saving"
      @close="trackingLogDialog = false"
      @save="saveTrackingLog"
    />
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Detalle del Consolidado",
  icon: "mdi-account",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
  showDrawer: false,
});

const route = useRoute();
const { ChurchMember } = useRepository();
const notify = useNotifyStore();

const loadingItem = ref(true);
const member = ref<Record<string, unknown>>({});
const statusDialog = ref(false);
const editDialog = ref(false);
const saving = ref(false);
const loadingLogs = ref(false);
const logsResponse = ref({ data: [], total: 0 });
const trackingLogDialog = ref(false);
const editingLog = ref<Record<string, unknown> | null>(null);

{
  try {
    const dbItem = await ChurchMember.show<Record<string, unknown>>(
      route.params.id as string,
    );
    member.value = dbItem as Record<string, unknown>;
    await fetchTrackingLogs();
  } catch (e) {
    throw createError({ statusCode: 404, message: "Miembro no encontrado" });
  } finally {
    loadingItem.value = false;
  }
}

const statusOptions = [
  { title: "Activo", value: "ACTIVO" },
  { title: "No contesta", value: "NO CONTESTA" },
  { title: "No molestar", value: "NO MOLESTAR" },
  { title: "Visita", value: "VISITA" },
];

const statusColors: Record<string, string> = {
  ACTIVO: "green",
  "NO CONTESTA": "amber",
  "NO MOLESTAR": "red",
  VISITA: "blue",
};

const fullName = computed(
  () =>
    [member.value.name, member.value.last_name, member.value.second_last_name]
      .filter(Boolean)
      .join(" ") || "Miembro",
);

function statusLabel(status: unknown): string {
  const found = statusOptions.find((s) => s.value === status);
  return found ? found.title : String(status ?? "—");
}

function statusColor(status: unknown): string {
  return statusColors[String(status)] ?? "grey";
}

const phoneDigits = computed(() =>
  String(member.value.cellphone || "").replace(/\D/g, ""),
);
const message = ref("");
const whatsappHref = computed(() => {
  if (!phoneDigits.value) return null;
  const msg = encodeURIComponent(message.value.trim());
  return msg
    ? `https://wa.me/${phoneDigits.value}?text=${msg}`
    : `https://wa.me/${phoneDigits.value}`;
});
const smsHref = computed(() => {
  if (!phoneDigits.value) return null;
  const msg = encodeURIComponent(message.value.trim());
  return msg
    ? `sms:${phoneDigits.value}?body=${msg}`
    : `sms:${phoneDigits.value}`;
});
const telHref = computed(() =>
  phoneDigits.value ? `tel:${phoneDigits.value}` : null,
);

async function openContact(
  medium: "whatsapp" | "sms" | "llamada",
  url: string | null,
) {
  if (!url) return
  const id = route.params.id as string
  try {
    await ChurchMember.createTrackingLog<Record<string, unknown>>(id, {
      contact_date: new Date().toISOString().slice(0, 10),
      medium,
      description: message.value.trim() || undefined,
    })
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al registrar la interacción",
    })
  } finally {
    if (medium === "whatsapp") {
      window.open(url, "_blank", "noopener")
    } else {
      window.location.href = url
    }
  }
  await fetchTrackingLogs()
}

async function fetchTrackingLogs() {
  const id = route.params.id as string
  if (!id) return
  loadingLogs.value = true
  try {
    const data = await ChurchMember.trackingLogs<Record<string, unknown>>(id, {
      page: 1,
      itemsPerPage: 10,
      sortBy: ["contact_date"],
      sortDesc: [true],
    })
    logsResponse.value = data as { data: unknown[]; total: number }
  } catch {
    logsResponse.value = { data: [], total: 0 }
  } finally {
    loadingLogs.value = false
  }
}

function onLogsUpdateOptions(opts: Record<string, unknown>) {
  fetchTrackingLogs()
}

function editTrackingLog(log: Record<string, unknown>) {
  editingLog.value = { ...log }
  trackingLogDialog.value = true
}

async function saveTrackingLog(payload: Record<string, unknown>) {
  const id = route.params.id as string
  const logId = editingLog.value?.id
  if (!id || !logId) return
  try {
    saving.value = true
    await ChurchMember.updateTrackingLog<Record<string, unknown>>(id, logId, payload)
    editingLog.value = null
    trackingLogDialog.value = false
    await fetchTrackingLogs()
    notify.notify({ success: "Interacción actualizada exitosamente" })
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al actualizar la interacción",
    })
  } finally {
    saving.value = false
  }
}

async function deleteTrackingLog(log: Record<string, unknown>) {
  const id = route.params.id as string
  const logId = (log as Record<string, unknown> | undefined)?.id
  if (!id || !logId) return
  if (!confirm("¿Desea eliminar esta interacción?")) return
  try {
    saving.value = true
    await ChurchMember.deleteTrackingLog<Record<string, unknown>>(id, logId)
    await fetchTrackingLogs()
    notify.notify({ success: "Interacción eliminada exitosamente" })
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al eliminar la interacción",
    })
  } finally {
    saving.value = false
  }
}



onMounted(() => {
  route.meta.back = backRoute.value;
});

const backRoute = computed(() => {
  if (route.query.from === "tracking") return "/tracking";
  return "/tracking";
});

function goBack() {
  navigateTo(backRoute.value);
}

function onStatusChanged(updated: Record<string, unknown>) {
  if (updated && updated.status) {
    member.value = { ...member.value, ...updated };
  }
}

async function saveMember(payload: Record<string, unknown>) {
  const id = route.params.id as string;
  if (!id) return;
  try {
    saving.value = true;
    const updated = await ChurchMember.update<Record<string, unknown>>(
      id,
      payload,
    );
    member.value = {
      ...member.value,
      ...((updated as Record<string, unknown>)?.data ?? payload),
    };
    editDialog.value = false;
    notify.notify({ success: "Miembro actualizado exitosamente" });
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al actualizar el miembro",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped></style>
