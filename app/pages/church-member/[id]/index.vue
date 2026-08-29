<template>
  <VContainer :fluid="true">
    <VRow>
      <VCol cols="12">
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
                  <VCol sm="6" cols="12" class="text-body-2">
                    <VIcon start size="small" color="grey-darken-1"
                      >mdi-account-check</VIcon
                    >
                    <span class="font-weight-medium">Creado por:</span>
                    {{ creatorName || "—" }}
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
              <VCol cols="12" sm="auto">
                <VBtn
                  id="cmm-face-to-face-btn"
                  class="ma-1"
                  variant="outlined"
                  color="deep-orange"
                  @click="openContact('presencial')"
                >
                  <VIcon start>mdi-account-group</VIcon>
                  Presencial
                </VBtn>
              </VCol>
            </VRow>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12">
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
    <VRow v-if="auth.hasPermission('church-member-consolidator-assign')">
      <VCol cols="12">
        <VCard>
          <VCardTitle class="text-subtitle-1 font-weight-medium">
            <VIcon start color="primary">mdi-account-multiple</VIcon>
            Consolidadores
          </VCardTitle>
          <VDivider />
          <VCardText>
            <ConsolidationConsolidatorCombobox
              id="cmm-consolidator-combobox"
              :org-id="member.org_id"
              label="Asignar consolidadores"
              :disabled="savingConsolidators"
              :consolidatorsx="currentConsolidators"
              @model-change="onConsolidatorsChange"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" class="d-flex justify-end">
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
import { useAsyncData } from "#app";
import { buildApiParams } from "~/utils/buildApiParams";
import { computed } from "vue";

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
const auth = useAuthStore();
const { statusLabel, statusColor } = useChurchMemberStatus();

const member = ref<Record<string, unknown>>({});
const statusDialog = ref(false);
const editDialog = ref(false);
const saving = ref(false);
const trackingLogDialog = ref(false);
const editingLog = ref<Record<string, unknown> | null>(null);
const logsResponse = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const loadingLogs = ref(false);
const currentConsolidators = ref<{ id: number | string; name: string }[]>([]);
const savingConsolidators = ref(false);

// Resolved early (before the member fetch) so the "not found / no access" redirect
// below can reuse it without depending on later declarations.
const backRoute = computed(() => {
  const from = route.query.from as string | undefined;
  if (from === "tracking") return "/tracking";
  if (typeof from === "string" && from.startsWith("/")) {
    return safeInternalRedirect(from, "/tracking");
  }
  return "/tracking";
});

// Initial member data and tracking logs are loaded during SSR via useAsyncData
// so the payload is reused on the client (no double fetch, no hydration mismatch).
// See ai_rule/nuxt4_ssr_hydration.md.
{
  const { data: initialMember, error: memberError } = await useAsyncData(
    `church-member-${route.params.id}`,
    () => ChurchMember.show<Record<string, unknown>>(route.params.id as string),
    { default: () => ({}) as Record<string, unknown> },
  );

  // The API scopes church-member/:id to the caller's orgs and returns 404 for
  // out-of-scope or non-existent members. Surface that as a real error page
  // instead of silently redirecting via the (spoofable) ?from= query param.
  if (memberError.value) {
    const err = memberError.value as unknown as {
      statusCode?: number;
      status?: number;
      data?: { message?: string };
      statusMessage?: string;
    };
    throw createError({
      statusCode: err.statusCode || err.status || 404,
      statusMessage:
        err.data?.message ||
        err.statusMessage ||
        "Miembro no encontrado o sin acceso a esta organización",
      fatal: true,
    });
  }

  member.value = initialMember.value;
}

{
  const { data: initialLogs } = await useAsyncData(
    `church-member-tracking-logs-${route.params.id}`,
    async () => {
      return await ChurchMember.trackingLogs<{
        data: unknown[];
        total: number;
      }>(route.params.id as string, {
        page: 1,
        itemsPerPage: 10,
        sortBy: ["contact_datetime"],
        sortDesc: [true],
      }).catch(() => ({ data: [] as unknown[], total: 0 }));
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  );
  logsResponse.value = initialLogs.value;

  const { data: initialConsolidators } = await useAsyncData(
    `church-member-consolidators-${route.params.id}`,
    async () => {
      if (!auth.hasPermission("church-member-consolidator-assign")) return [];
      return await ChurchMember.consolidators<
        { id: number | string; name: string }[]
      >(route.params.id as string).catch(() => []);
    },
    { default: () => [] as { id: number | string; name: string }[] },
  );
  currentConsolidators.value = initialConsolidators.value;
}

const loading = ref(false);

const fullName = computed(
  () =>
    [member.value.name, member.value.last_name, member.value.second_last_name]
      .filter(Boolean)
      .join(" ") || "Miembro",
);

const creatorName = computed(() => {
  const creator = member.value.creator as
    | { name?: string; last_name?: string }
    | undefined;
  if (!creator) return null;
  return [creator.name, creator.last_name].filter(Boolean).join(" ") || null;
});

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
  medium: "whatsapp" | "sms" | "llamada" | "presencial",
  url?: string | null,
) {
  const id = route.params.id as string;
  try {
    const newLog = await ChurchMember.createTrackingLog<
      Record<string, unknown>
    >(id, {
      contact_datetime: localDateTimeString(),
      medium,
      description: message.value.trim() || undefined,
    });
    logsResponse.value.data.unshift(newLog);
    logsResponse.value.total += 1;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al registrar la interacción",
    });
  } finally {
    if (medium === "presencial") return;
    if (!url) return;
    if (medium === "whatsapp") {
      window.open(url, "_blank", "noopener");
    } else {
      window.location.href = url;
    }
  }
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

let initialLogsLoaded = false;

function onLogsUpdateOptions(opts: Record<string, unknown>) {
  if (!initialLogsLoaded) {
    initialLogsLoaded = true;
    return;
  }
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

async function onConsolidatorsChange(
  consolidators: { id: number | string; name: string }[],
) {
  const id = route.params.id as string;
  if (!id) return;
  try {
    savingConsolidators.value = true;
    const ids = consolidators.map((c) => c.id);
    const updated = await ChurchMember.syncConsolidators<{
      data: { id: number | string; name: string }[];
    }>(id, { consolidator_ids: ids });
    currentConsolidators.value = updated.data;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al actualizar consolidadores",
    });
  } finally {
    savingConsolidators.value = false;
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
