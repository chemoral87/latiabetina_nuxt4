<template>
  <VContainer :fluid="true" class="pa-0 pa-sm-2">
    <VRow id="cmm-header-row" density="compact">
      <VCol cols="12">
        <ChurchMemberHeader
          :medals="medals"
          :member="member"
          @edit="editDialog = true"
          @medal-add="medalDialog = true"
          @medal-delete="confirmDeleteMedal"
          @status-edit="statusDialog = true"
        />
      </VCol>
    </VRow>

    <VRow id="cmm-interactions-section" class="mt-2" density="compact">
      <VCol cols="12">
        <ChurchMemberInteractions
          :member="member"
          :loading-logs="loadingLogs"
          :logs-response="logsResponse"
          @contact="onContact"
          @edit-log="editTrackingLog"
          @refresh="fetchTrackingLogs"
          @sorting="onLogsUpdateOptions"
          @delete-log="deleteTrackingLog"
        />
      </VCol>
    </VRow>

    <VRow
      v-if="
        currentConsolidators.length > 0 ||
        auth.hasPermission('church-member-consolidator-assign')
      "
      id="cmm-consolidators-section"
      class="mt-2"
      density="compact"
    >
      <VCol cols="12">
        <ChurchMemberConsolidators
          :member="member"
          :saving="savingConsolidators"
          :consolidators="currentConsolidators"
          :has-changes="hasConsolidatorChanges"
          :can-assign="auth.hasPermission('church-member-consolidator-assign')"
          @save="saveConsolidators"
          @update:consolidators="onPendingConsolidatorsChange"
        />
      </VCol>
    </VRow>

    <VRow
      v-if="
        consolidatorLogs.length > 0 &&
        auth.hasPermission('church-member-consolidator-assign')
      "
      id="cmm-consolidator-logs-section"
      class="mt-2"
      density="compact"
    >
      <VCol cols="12">
        <ChurchMemberConsolidatorHistory :logs="consolidatorLogs" />
      </VCol>
    </VRow>

    <VRow id="cmm-back-row" class="mt-2" density="compact">
      <VCol cols="12">
        <VSheet rounded color="white" class="pa-2 pa-sm-3 d-flex justify-end">
          <VBtn
            id="cmm-back-btn"
            color="primary"
            variant="outlined"
            @click="goBack"
          >
            <VIcon start>mdi-arrow-left</VIcon>
            Volver
          </VBtn>
        </VSheet>
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
      :log="editingLog ?? undefined"
      @save="saveTrackingLog"
      @close="trackingLogDialog = false"
    />

    <ChurchMemberMedalDialog
      v-if="medalDialog"
      id="cmm-medal-dlg"
      :member="member"
      @saved="onMedalSaved"
      @close="medalDialog = false"
    />

    <ChurchMemberMedalDeleteDialog
      v-if="medalDeleteDialog"
      v-model="medalDeleteDialog"
      :medal="medalToDelete"
      :member-id="route.params.id as string"
      @deleted="onMedalSaved"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useAsyncData } from "#app";
import { buildApiParams } from "~/utils/buildApiParams";
import { localDateTimeString } from "~/utils/date";

definePageMeta({
  title: "Detalle Consolidado",
  icon: "mdi-account",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
});

const route = useRoute();
const { ChurchMember, ChurchMemberTrackingLog } = useRepository();
const notify = useNotifyStore();
const auth = useAuthStore();

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
const lastLogOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 10,
  sortBy: [{ key: "contact_datetime", order: "desc" }],
});

const currentConsolidators = computed<
  {
    id: number | string;
    name: string;
    last_name?: string;
    assigned_by?: string;
  }[]
>(() => {
  const consolidators =
    (member.value.consolidators as {
      id: number | string;
      name: string;
      last_name?: string;
    }[]) || [];
  return consolidators.map((c) => {
    const lastLog = consolidatorLogs.value.find(
      (l) =>
        (l.consolidator_id === c.id || l.consolidator?.id === c.id) &&
        l.action === "assigned",
    );
    const assignedBy = lastLog?.changer
      ? `${lastLog.changer.name} ${lastLog.changer.last_name}`
      : undefined;
    return { ...c, assigned_by: assignedBy };
  });
});
const savingConsolidators = ref(false);
const pendingConsolidators = ref<
  { id: number | string; name: string; last_name?: string }[] | null
>(null);
const consolidatorLogs = ref<
  {
    id: number;
    consolidator_id: number;
    action: string;
    consolidator?: { id: number; name: string; last_name?: string };
    changer?: { id: number; name: string; last_name?: string };
    created_at?: string;
  }[]
>([]);

const medalDialog = ref(false);
const medalDeleteDialog = ref(false);
const medalToDelete = ref<{ id: number; medal: string } | null>(null);
const medals = ref<
  {
    id: number;
    medal: string;
    description: Record<string, unknown> | string | null;
    creator?: { id: number; name: string; last_name?: string };
    created_at?: string;
  }[]
>([]);
const hasConsolidatorChanges = computed(() => {
  if (pendingConsolidators.value === null) return false;
  const currentIds = currentConsolidators.value
    .map((c) => c.id)
    .sort()
    .join(",");
  const pendingIds = pendingConsolidators.value
    .map((c) => c.id)
    .sort()
    .join(",");
  return currentIds !== pendingIds;
});


const backRoute = computed(() => {
  const from = route.query.from as string | undefined;
  if (from === "tracking") return "/tracking";
  if (from === "tracking-logs") return "/church-member/tracking-logs";
  if (typeof from === "string" && from.startsWith("/")) {
    return safeInternalRedirect(from, "/church-member/tracking-logs");
  }
  return "/church-member/tracking-logs";
});

{
  const { data: initialMember, error: memberError } = await useAsyncData(
    `church-member-${route.params.id}`,
    () =>
      ChurchMember.show<Record<string, unknown>>(route.params.id as string),
    { default: () => ({}) as Record<string, unknown> },
  );

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
      const params = buildApiParams(lastLogOptions.value);
      return await ChurchMemberTrackingLog.index<{
        data: unknown[];
        total: number;
      }>(route.params.id as string, params).catch(() => ({
        data: [] as unknown[],
        total: 0,
      }));
    },
    { default: () => ({ data: [] as unknown[], total: 0 }) },
  );
  logsResponse.value = initialLogs.value;

  const { data: initialConsolidatorLogs } = await useAsyncData(
    `church-member-consolidator-logs-${route.params.id}`,
    async () => {
      return await ChurchMember.consolidatorLogs<
        {
          id: number;
          consolidator_id: number;
          action: string;
          consolidator?: { id: number; name: string; last_name?: string };
          changer?: { id: number; name: string; last_name?: string };
          created_at?: string;
        }[]
      >(route.params.id as string).catch(() => []);
    },
    {
      default: () =>
        [] as {
          id: number;
          consolidator_id: number;
          action: string;
          consolidator?: { id: number; name: string; last_name?: string };
          changer?: { id: number; name: string; last_name?: string };
          created_at?: string;
        }[],
    },
  );
  consolidatorLogs.value = initialConsolidatorLogs.value;

  const { data: initialMedals } = await useAsyncData(
    `church-member-medals-${route.params.id}`,
    async () => {
      return await ChurchMember.medals<
        {
          id: number;
          medal: string;
          description: Record<string, unknown> | string | null;
          creator?: { id: number; name: string; last_name?: string };
          created_at?: string;
        }[]
      >(route.params.id as string).catch(() => []);
    },
    {
      default: () =>
        [] as {
          id: number;
          medal: string;
          description: Record<string, unknown> | string | null;
          creator?: { id: number; name: string; last_name?: string };
          created_at?: string;
        }[],
    },
  );
  medals.value = initialMedals.value;

}

async function fetchTrackingLogs(overrides: Record<string, unknown> = {}) {
  const id = route.params.id as string;
  if (!id) return;
  loadingLogs.value = true;
  try {
    const requestOptions = { ...lastLogOptions.value, ...overrides };
    const params = buildApiParams(requestOptions);
    const data = await ChurchMemberTrackingLog.index<Record<string, unknown>>(
      id,
      params,
    );
    logsResponse.value = data as { data: unknown[]; total: number };
    lastLogOptions.value = requestOptions;
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
  fetchTrackingLogs(opts);
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
    await ChurchMemberTrackingLog.update<Record<string, unknown>>(
      id,
      logId as string | number,
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
    await ChurchMemberTrackingLog.delete<Record<string, unknown>>(id, logId as string | number);
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

async function onContact(payload: {
  medium: string;
  url?: string | null;
  message: string;
}) {
  const id = route.params.id as string;
  try {
    const res = await ChurchMemberTrackingLog.create<Record<string, unknown>>(
      id,
      {
        contact_datetime: localDateTimeString(),
        medium: payload.medium,
        classification: payload.medium === "presencial" ? "CONTESTA" : null,
        description: payload.message || undefined,
      },
    );
    const newLog = res?.data ?? res;
    logsResponse.value.data.unshift(newLog);
    logsResponse.value.total += 1;
  } catch (error) {
    notify.notify({
      error:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Error al registrar la interacción",
    });
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

function onPendingConsolidatorsChange(
  consolidators: { id: number | string; name: string; last_name?: string }[],
) {
  pendingConsolidators.value = consolidators;
}

async function saveConsolidators() {
  const id = route.params.id as string;
  if (!id || !pendingConsolidators.value) return;
  try {
    savingConsolidators.value = true;
    const ids = pendingConsolidators.value.map((c) => c.id);
    const updated = await ChurchMember.syncConsolidators<{
      data: { id: number | string; name: string; last_name?: string }[];
    }>(id, ids);
    member.value = { ...member.value, consolidators: updated.data };
    pendingConsolidators.value = null;
    const logs = await ChurchMember.consolidatorLogs<
      {
        id: number;
        consolidator_id: number;
        action: string;
        consolidator?: { id: number; name: string; last_name?: string };
        changer?: { id: number; name: string; last_name?: string };
        created_at?: string;
      }[]
    >(id).catch(() => []);
    consolidatorLogs.value = logs;
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

async function onMedalSaved() {
  const id = route.params.id as string;
  if (!id) return;
  try {
    medals.value = await ChurchMember.medals<typeof medals.value>(id).catch(
      () => [],
    );
  } catch {
    // errors already surfaced by withNotify
  }
}

function confirmDeleteMedal(medal: { id: number; medal: string }) {
  medalToDelete.value = medal;
  medalDeleteDialog.value = true;
}
</script>
