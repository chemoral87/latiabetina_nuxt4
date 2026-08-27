<template>
  <VContainer :fluid="true">
    <VCol v-if="loading" cols="12" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </VCol>
        <VCol v-else cols="12">
          <VCard>
          <VCardTitle
            class="text-subtitle-1 font-weight-medium d-flex align-center"
          >
            <VIcon start size="large" color="primary">mdi-account</VIcon>
            <span class="text-subtitle-2 member-name">{{ fullName }}</span>
            <VSpacer />
            <VChip size="small" :color="statusColor(member.status)">
              {{ statusLabel(member.status) }}
            </VChip>
            <VBtn
              id="cmm-status-edit-btn"
              size="x-small"
              variant="text"
              color="primary"
              rounded="circle"
              icon="mdi-pencil"
              title="Cambiar estado"
              @click="statusDialog = true"
            />
          </VCardTitle>
          <VDivider />

          <VCardText>
            <VRow density="compact">
              <VCol cols="7">
                <VRow density="compact">
                  <VCol sm="6" cols="12" class="text-body-2">
                    <VIcon start size="small" color="grey-darken-1"
                      >mdi-phone</VIcon
                    >
                    <span class="font-weight-medium">Celular:</span>
                    {{ member.cellphone || "—" }}
                  </VCol>
                  <VCol sm="6" cols="12" class="text-body-2">
                    <VIcon start size="small" color="grey-darken-1"
                      >mdi-calendar-account</VIcon
                    >
                    <span class="font-weight-medium">Edad:</span>
                    {{ member.years_old ?? "—" }}
                  </VCol>
                  <VCol sm="6" cols="12" class="text-body-2">
                    <VIcon start size="small" color="grey-darken-1"
                      >mdi-account-multiple</VIcon
                    >
                    <span class="font-weight-medium">Hijos:</span>
                    {{ member.number_of_children ?? "—" }}
                  </VCol>
                  <VCol sm="6" cols="12" class="text-body-2">
                    <VIcon start size="small" color="grey-darken-1"
                      >mdi-ring</VIcon
                    >
                    <span class="font-weight-medium">Estado civil:</span>
                    {{ member.marriage_status || "—" }}
                  </VCol>
                  <VCol cols="12" class="text-body-2 d-none d-sm-flex">
                    <VIcon start size="small" color="grey-darken-1"
                      >mdi-map-marker</VIcon
                    >
                    <span class="font-weight-medium">Dirección: </span>
                    {{ member.address || "—" }}
                  </VCol>
                </VRow>
              </VCol>
              <VCol cols="5" class="d-flex justify-center align-center">
                <VAvatar
                  v-if="member.url_image_s3"
                  size="110"
                  rounded="circle"
                  style="cursor: pointer"
                  @click="editDialog = true"
                >
                  <VImg
                    cover
                    alt="Foto del miembro"
                    :src="member.url_image_s3"
                  />
                </VAvatar>
                <VIcon
                  v-else
                  size="80"
                  color="grey-lighten-1"
                  style="cursor: pointer"
                  @click="editDialog = true"
                  >mdi-account-circle</VIcon
                >
              </VCol>
            </VRow>

            <VRow density="compact" class="d-flex d-sm-none">
              <VCol cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1"
                  >mdi-map-marker</VIcon
                >
                <span class="font-weight-medium">Dirección: </span>
                {{ member.address || "—" }}
              </VCol>
            </VRow>
            <VRow density="compact">
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
              <VCol
                v-if="phoneDigits"
                cols="12"
                sm="auto"
                class="d-flex flex-wrap justify-center justify-sm-end"
              >
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
            </VRow>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VRow justify="center">
      <VCol md="8" cols="12">
        <VCard>
          <VCardTitle class="text-subtitle-1 font-weight-medium">
            <VIcon start color="primary">mdi-history</VIcon>
            Interacciones
          </VCardTitle>
          <VDivider />
          <VCardText>
            <ChurchMemberTrackingLogTable
              id="cmm-tracking-log-table"
              :loading="loading"
              :response="logsResponse"
              @edit="editTrackingLog"
              @delete="deleteTrackingLog"
              @sorting="onLogsUpdateOptions"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow justify="center">
      <VCol md="8" cols="12" class="d-flex justify-end">
        <VBtn
          id="cmm-back-btn"
          color="primary"
          variant="outlined"
          @click="goBack"
        >
          <VIcon start>mdi-arrow-left</VIcon>
          Volver
        </VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>

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
      :loading="saving"
      :log="editingLog"
      @save="saveTrackingLog"
      @close="trackingLogDialog = false"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useAsyncData } from '#app'
import { buildApiParams } from "~/utils/buildApiParams"
import { computed } from 'vue'

definePageMeta({
  title: "Detalle Consolidado",
  icon: "mdi-account",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
  showDrawer: false,
});

const route = useRoute();
const { ChurchMember } = useRepository();
const notify = useNotifyStore();
const { statusLabel, statusColor } = useChurchMemberStatus();

const member = ref<Record<string, unknown>>({});
const statusDialog = ref(false);
const editDialog = ref(false);
const saving = ref(false);
const trackingLogDialog = ref(false);
const editingLog = ref<Record<string, unknown> | null>(null);

// Initial member data and tracking logs are loaded during SSR via useAsyncData
const { data: memberData, pending: memberPending } = await useAsyncData(
  `church-member-${route.params.id}`,
  async () => {
    return await ChurchMember.show<Record<string, unknown>>(
      route.params.id as string,
    )
  },
  { default: () => ({}) as Record<string, unknown> },
)

const { data: logsData, pending: logsPending } = await useAsyncData(
  `church-member-tracking-logs-${route.params.id}`,
  async () => {
    return await ChurchMember.trackingLogs<{ data: unknown[]; total: number }>(
      route.params.id as string,
      {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["contact_datetime"],
        sortDesc: [true],
      }
    )
  },
  { default: () => ({ data: [], total: 0 }) },
)

member.value = memberData.value
logsResponse.value = logsData.value

const loading = computed(() => memberPending.value || logsPending.value)

const fullName = computed(
  () =>
    [member.value.name, member.value.last_name, member.value.second_last_name]
      .filter(Boolean)
      .join(" ") || "Miembro",
);

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
  if (!url) return;
  const id = route.params.id as string;
  try {
    await ChurchMember.createTrackingLog<Record<string, unknown>>(id, {
      contact_datetime: localDateTimeString(),
      medium,
      description: message.value.trim() || undefined,
    });
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al registrar la interacción",
    });
  } finally {
    if (medium === "whatsapp") {
      window.open(url, "_blank", "noopener");
    } else {
      window.location.href = url;
    }
  }
  await fetchTrackingLogs();
}

function localDateTimeString(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

async function fetchTrackingLogs() {
  const id = route.params.id as string;
  if (!id) return;
  loadingLogs.value = true;
  try {
    const data = await ChurchMember.trackingLogs<Record<string, unknown>>(id, {
      page: 1,
      itemsPerPage: 10,
      sortBy: ["contact_datetime"],
      sortDesc: [true],
    });
    logsResponse.value = data as { data: unknown[]; total: number };
  } catch {
    logsResponse.value = { data: [], total: 0 };
  } finally {
    loadingLogs.value = false;
  }
}

function onLogsUpdateOptions(opts: Record<string, unknown>) {
  fetchTrackingLogs();
}

function editTrackingLog(log: Record<string, unknown>) {
  editingLog.value = { ...log };
  trackingLogDialog.value = true;
}

async function saveTrackingLog(payload: Record<string, unknown>) {
  const id = route.params.id as string;
  const logId = editingLog.value?.id;
  if (!id || !logId) return;
  try {
    saving.value = true;
    await ChurchMember.updateTrackingLog<Record<string, unknown>>(
      id,
      logId,
      payload,
    );
    editingLog.value = null;
    trackingLogDialog.value = false;
    await fetchTrackingLogs();
    notify.notify({ success: "Interacción actualizada exitosamente" });
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al actualizar la interacción",
    });
  } finally {
    saving.value = false;
  }
}

async function deleteTrackingLog(log: Record<string, unknown>) {
  const id = route.params.id as string;
  const logId = (log as Record<string, unknown> | undefined)?.id;
  if (!id || !logId) return;
  if (!confirm("¿Desea eliminar esta interacción?")) return;
  try {
    saving.value = true;
    await ChurchMember.deleteTrackingLog<Record<string, unknown>>(id, logId);
    await fetchTrackingLogs();
    notify.notify({ success: "Interacción eliminada exitosamente" });
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al eliminar la interacción",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  route.meta.back = backRoute.value;
});

const backRoute = computed(() => {
  const from = route.query.from as string | undefined
  if (from === "tracking") return "/tracking"
  if (typeof from === "string" && from.startsWith("/")) {
    return safeInternalRedirect(from, "/tracking")
  }
  return "/tracking"
})

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

<style scoped>
.member-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
