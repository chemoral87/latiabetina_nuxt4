<template>
  <VContainer :fluid="true" class="pa-0 pa-sm-2">
    <VRow>
      <VCol cols="12">
        <VSheet rounded color="white" class="pa-2 pa-sm-3">
          <div class="text-subtitle-1 font-weight-medium d-flex align-center">
            <VIcon start size="small" color="primary">mdi-account</VIcon>
            <span class="text-subtitle-2 text-truncate">{{ member.name }}</span>
            <VSpacer />
            <VChip
              size="small"
              variant="elevated"
              :color="statusColor(member.status)"
            >
              {{ statusLabel(member.status) }}
            </VChip>
            <VBtn
              id="cmm-status-edit-btn"
              size="small"
              variant="text"
              color="primary"
              rounded="circle"
              icon="mdi-pencil"
              title="Cambiar estado"
              aria-label="Cambiar estado del miembro"
              @click="statusDialog = true"
            />
          </div>
          <VDivider class="my-2" />

          <div>
            <VRow v-if="medals.length > 0" density="compact">
              <VCol cols="12" class="d-flex flex-wrap align-center">
                <VIcon size="small" color="primary">mdi-medal-outline</VIcon>
                <template v-for="medal in medals" :key="medal.id">
                  <VTooltip location="top">
                    <template #activator="{ props: tp }">
                      <VChip
                        v-bind="tp"
                        size="small"
                        variant="tonal"
                        class="cursor-pointer"
                        :color="medalColor(medal.medal)"
                      >
                        <VIcon start size="small">{{
                          medalIcon(medal.medal)
                        }}</VIcon>
                        {{ medalLabel(medal.medal) }}
                        <template #append>
                          <VBtn
                            :id="'medal-info-' + medal.id"
                            icon
                            color="grey"
                            size="small"
                            variant="text"
                            :aria-label="
                              'Información de ' + medalLabel(medal.medal)
                            "
                          >
                            <VIcon size="small">mdi-help-circle-outline</VIcon>
                          </VBtn>
                          <VBtn
                            icon
                            size="small"
                            color="error"
                            variant="text"
                            :aria-label="
                              'Eliminar medalla ' + medalLabel(medal.medal)
                            "
                            @click.stop="confirmDeleteMedal(medal)"
                          >
                            <VIcon size="small">mdi-close</VIcon>
                          </VBtn>
                        </template>
                      </VChip>
                    </template>
                    <span
                      >{{ medalLabel(medal.medal) }}
                      {{ medalDetail(medal) }}</span
                    >
                  </VTooltip>
                  <VMenu location="top" :activator="'#medal-info-' + medal.id">
                    <VCard class="pa-2" max-width="220">
                      <div class="text-caption">
                        {{ medalLabel(medal.medal) }} {{ medalDetail(medal) }}
                      </div>
                    </VCard>
                  </VMenu>
                </template>
                <VBtn
                  id="cmm-medal-add-btn"
                  icon
                  size="x-small"
                  variant="text"
                  color="primary"
                  title="Agregar medalla"
                  aria-label="Agregar medalla"
                  @click="medalDialog = true"
                >
                  <VIcon size="x-small">mdi-plus</VIcon>
                </VBtn>
              </VCol>
            </VRow>
            <VRow v-else density="compact">
              <VCol cols="12" class="d-flex align-center">
                <VBtn
                  id="cmm-medal-add-btn"
                  size="x-small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-medal-outline"
                  @click="medalDialog = true"
                >
                  Agregar medalla
                </VBtn>
              </VCol>
            </VRow>
            <VRow density="compact">
              <VCol md="7" cols="12">
                <VRow density="compact">
                  <VCol sm="6" cols="12" class="text-body-2 py-1">
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-account</VIcon
                    >
                    <span class="font-weight-medium">Nombre:</span>
                    {{ fullName }}
                  </VCol>
                  <VCol
                    v-if="member.cellphone"
                    sm="6"
                    cols="12"
                    class="text-body-2 py-1"
                  >
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-phone</VIcon
                    >
                    <span class="font-weight-medium">Celular:</span>
                    {{ member.cellphone }}
                  </VCol>
                  <VCol
                    v-if="member.years_old != null"
                    sm="6"
                    cols="12"
                    class="text-body-2 py-1"
                  >
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-calendar-account</VIcon
                    >
                    <span class="font-weight-medium">Edad:</span>
                    {{ member.years_old }}
                  </VCol>
                  <VCol
                    v-if="member.number_of_children != null"
                    sm="6"
                    cols="12"
                    class="text-body-2 py-1"
                  >
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-account-multiple</VIcon
                    >
                    <span class="font-weight-medium">Hijos:</span>
                    {{ member.number_of_children }}
                  </VCol>
                  <VCol
                    v-if="member.marriage_status"
                    sm="6"
                    cols="12"
                    class="text-body-2 py-1"
                  >
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-ring</VIcon
                    >
                    <span class="font-weight-medium">Estado civil:</span>
                    {{ member.marriage_status }}
                  </VCol>
                  <VCol
                    v-if="creatorName"
                    sm="6"
                    cols="12"
                    class="text-body-2 py-1"
                  >
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-account-check</VIcon
                    >
                    <span class="font-weight-medium">Creado por:</span>
                    {{ creatorName }}
                  </VCol>
                  <VCol
                    v-if="member.address"
                    cols="12"
                    class="text-body-2 py-1 d-none d-sm-flex"
                  >
                    <VIcon start size="x-small" color="grey-darken-1"
                      >mdi-map-marker</VIcon
                    >
                    <span class="font-weight-medium">Dirección:</span>
                    {{ member.address }}
                  </VCol>
                </VRow>
              </VCol>
              <VCol md="5" cols="12" class="d-flex justify-center align-center">
                <VAvatar
                  v-if="member.url_image_s3"
                  size="80"
                  rounded="circle"
                  class="cursor-pointer"
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
                  size="64"
                  class="cursor-pointer"
                  color="grey-lighten-1"
                  @click="editDialog = true"
                  >mdi-account-circle</VIcon
                >
              </VCol>
            </VRow>

            <VRow
              v-if="member.address"
              density="compact"
              class="d-flex d-sm-none"
            >
              <VCol cols="12" class="text-body-2 py-1">
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-map-marker</VIcon
                >
                <span class="font-weight-medium">Dirección:</span>
                {{ member.address }}
              </VCol>
            </VRow>
            <VRow class="mt-1" density="compact">
              <VCol cols="12" class="d-flex justify-end">
                <VBtn
                  id="cmm-edit-btn"
                  size="small"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-pencil"
                  @click="editDialog = true"
                >
                  Editar
                </VBtn>
              </VCol>
            </VRow>
          </div>

          <VDivider class="my-2" />
        </VSheet>
      </VCol>
    </VRow>

    <VRow class="mt-2">
      <VCol cols="12">
        <VSheet rounded color="white" class="pa-2 pa-sm-3">
          <div class="text-subtitle-1 font-weight-medium d-flex align-center">
            <VIcon start size="small" color="primary">mdi-history</VIcon>
            Interacciones
          </div>
          <VDivider class="my-2" />
          <div>
            <VRow density="comfortable" class="w-100 align-center">
              <VCol cols="12" sm="auto">
                <VBtn
                  id="cmm-refresh-logs-btn"
                  size="small"
                  color="primary"
                  variant="outlined"
                  :loading="loadingLogs"
                  @click="fetchTrackingLogs"
                >
                  <VIcon start size="small">mdi-reload</VIcon>
                  Refrescar
                </VBtn>
              </VCol>
              <VCol v-if="phoneDigits" sm="4" cols="12">
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
                cols="12"
                sm="auto"
                class="d-flex justify-center justify-sm-end ga-2"
              >
                <VTooltip location="top">
                  <template #activator="{ props }">
                    <VBtn
                      v-if="phoneDigits"
                      id="cmm-whatsapp-btn"
                      icon
                      size="small"
                      color="green"
                      variant="outlined"
                      v-bind="props"
                      @click="openContact('whatsapp', whatsappHref)"
                    >
                      <VIcon size="small">mdi-whatsapp</VIcon>
                    </VBtn>
                  </template>
                  <span>WhatsApp</span>
                </VTooltip>
                <VTooltip location="top">
                  <template #activator="{ props }">
                    <VBtn
                      v-if="phoneDigits"
                      id="cmm-sms-btn"
                      icon
                      color="teal"
                      size="small"
                      variant="outlined"
                      v-bind="props"
                      @click="openContact('sms', smsHref)"
                    >
                      <VIcon size="small">mdi-message-text</VIcon>
                    </VBtn>
                  </template>
                  <span>Mensaje</span>
                </VTooltip>
                <VTooltip location="top">
                  <template #activator="{ props }">
                    <VBtn
                      v-if="phoneDigits"
                      id="cmm-call-btn"
                      icon
                      size="small"
                      color="primary"
                      variant="outlined"
                      v-bind="props"
                      @click="openContact('llamada', telHref)"
                    >
                      <VIcon size="small">mdi-phone</VIcon>
                    </VBtn>
                  </template>
                  <span>Llamar</span>
                </VTooltip>
                <VTooltip location="top">
                  <template #activator="{ props }">
                    <VBtn
                      id="cmm-face-to-face-btn"
                      icon
                      size="small"
                      variant="outlined"
                      color="deep-orange"
                      v-bind="props"
                      @click="openContact('presencial')"
                    >
                      <VIcon size="small">mdi-account-group</VIcon>
                    </VBtn>
                  </template>
                  <span>Presencial</span>
                </VTooltip>
              </VCol>
            </VRow>
          </div>
          <div>
            <ChurchMemberTrackingLogTable
              id="cmm-tracking-log-table"
              :loading="loadingLogs"
              :response="logsResponse"
              @edit="editTrackingLog"
              @delete="deleteTrackingLog"
              @sorting="onLogsUpdateOptions"
            />
          </div>
        </VSheet>
      </VCol>
    </VRow>

    <VRow
      v-if="
        currentConsolidators.length > 0 ||
        auth.hasPermission('church-member-consolidator-assign')
      "
      class="mt-2"
    >
      <VCol cols="12">
        <VSheet rounded color="white" class="pa-2 pa-sm-3">
          <div class="text-subtitle-1 font-weight-medium d-flex align-center">
            <VIcon start size="small" color="primary"
              >mdi-account-multiple</VIcon
            >
            Consolidadores
          </div>
          <VDivider class="my-2" />
          <div>
            <template
              v-if="auth.hasPermission('church-member-consolidator-assign')"
            >
              <ConsolidationConsolidatorCombobox
                id="cmm-consolidator-combobox"
                :org-id="member.org_id"
                label="Asignar consolidadores"
                :disabled="savingConsolidators"
                :consolidatorsx="currentConsolidators"
                @model-change="onPendingConsolidatorsChange"
              />
              <div class="d-flex justify-end mt-2">
                <VBtn
                  v-if="hasConsolidatorChanges"
                  id="cmm-consolidator-save-btn"
                  size="small"
                  color="primary"
                  variant="elevated"
                  :loading="savingConsolidators"
                  @click="saveConsolidators"
                >
                  <VIcon start size="small">mdi-content-save</VIcon>
                  Guardar
                </VBtn>
              </div>
            </template>
            <template v-else>
              <div class="text-body-2 d-flex flex-wrap ga-1">
                <VChip
                  v-for="c in currentConsolidators"
                  :key="c.id"
                  size="small"
                  color="primary"
                  variant="outlined"
                >
                  <VIcon start size="x-small">mdi-account</VIcon>
                  {{ c.name }} {{ c.last_name }}
                  <span
                    v-if="c.assigned_by"
                    class="text-caption text-medium-emphasis ms-1"
                  >
                    — por {{ c.assigned_by }}
                  </span>
                </VChip>
              </div>
            </template>
          </div>
        </VSheet>
      </VCol>
    </VRow>

    <VRow
      v-if="
        consolidatorLogs.length > 0 &&
        auth.hasPermission('church-member-consolidator-assign')
      "
      class="mt-2"
    >
      <VCol cols="12">
        <VSheet rounded color="white" class="pa-2 pa-sm-3">
          <div class="text-subtitle-1 font-weight-medium d-flex align-center">
            <VIcon start size="small" color="primary">mdi-history</VIcon>
            Historial de Consolidadores
          </div>
          <VDivider class="my-2" />
          <div>
            <VTimeline side="end" align="start" density="compact">
              <VTimelineItem
                v-for="log in consolidatorLogs"
                :key="log.id"
                size="small"
                :dot-color="log.action === 'assigned' ? 'success' : 'error'"
                :icon="
                  log.action === 'assigned'
                    ? 'mdi-account-plus'
                    : 'mdi-account-minus'
                "
              >
                <div class="text-body-2">
                  <strong
                    >{{ log.consolidator?.name }}
                    {{ log.consolidator?.last_name }}</strong
                  >
                  <VChip
                    class="ms-1"
                    size="x-small"
                    variant="flat"
                    :color="log.action === 'assigned' ? 'success' : 'error'"
                  >
                    {{ log.action === "assigned" ? "Asignado" : "Desasignado" }}
                  </VChip>
                  <span class="text-medium-emphasis ms-1">
                    por {{ log.changer?.name }} {{ log.changer?.last_name }}
                  </span>
                </div>
                <div
                  v-if="log.created_at"
                  class="text-caption text-medium-emphasis"
                >
                  {{ new Date(log.created_at).toLocaleString() }}
                </div>
              </VTimelineItem>
            </VTimeline>
          </div>
        </VSheet>
      </VCol>
    </VRow>

    <VRow class="mt-2">
      <VCol cols="12">
        <VSheet rounded color="white" class="pa-2 pa-sm-3 d-flex justify-end">
          <VBtn
            id="cmm-back-btn"
            size="small"
            color="primary"
            variant="outlined"
            @click="goBack"
          >
            <VIcon start size="small">mdi-arrow-left</VIcon>
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
      :log="editingLog"
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

    <VDialog
      v-model="medalDeleteDialog"
      max-width="400"
      role="alertdialog"
      aria-describedby="medal-delete-desc"
      aria-labelledby="medal-delete-title"
    >
      <VCard>
        <VCardTitle
          id="medal-delete-title"
          class="text-subtitle-1 font-weight-medium"
        >
          <VIcon start color="warning">mdi-alert-outline</VIcon>
          Confirmar eliminación
        </VCardTitle>
        <VCardText id="medal-delete-desc">
          ¿Desea remover la medalla
          <strong v-if="medalToDelete">{{
            medalLabel(medalToDelete.medal)
          }}</strong
          >?
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn variant="text" @click="medalDeleteDialog = false"
            >Cancelar</VBtn
          >
          <VBtn color="error" variant="flat" @click="removeMedal"
            >Eliminar</VBtn
          >
        </VCardActions>
      </VCard>
    </VDialog>
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
});

const route = useRoute();
const { ChurchMember, ChurchMemberTrackingLog } = useRepository();
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
const medalLogs = ref<
  {
    id: number;
    medal: string;
    description: Record<string, unknown> | null;
    action: string;
    changer?: { id: number; name: string; last_name?: string };
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

const medalOptions = [
  { title: "Bautizo", value: "bautizo" },
  { title: "EDIN", value: "edin" },
  { title: "Servicio", value: "servicio" },
];
const medalColors: Record<string, string> = {
  bautizo: "blue",
  edin: "green",
  servicio: "orange",
};
const medalIcons: Record<string, string> = {
  bautizo: "mdi-water",
  edin: "mdi-school",
  servicio: "mdi-hand-heart",
};
const monthNames: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

function medalLabel(medal: unknown): string {
  const found = medalOptions.find((m) => m.value === medal);
  return found ? found.title : String(medal ?? "");
}
function medalColor(medal: unknown): string {
  return medalColors[String(medal)] ?? "grey";
}
function medalIcon(medal: unknown): string {
  return medalIcons[String(medal)] ?? "mdi-medal";
}
function medalMonthLabel(month: unknown): string {
  return monthNames[String(month)] ?? String(month);
}
function medalDetail(medal: {
  medal: string;
  description: Record<string, unknown> | string | null;
}): string {
  const d = medal.description;
  if (!d) return medalLabel(medal.medal);
  if (typeof d === "string") return d;
  if (medal.medal === "bautizo" && (d.month || d.year))
    return `${medalMonthLabel(d.month)} ${d.year ?? ""}`.trim();
  if (medal.medal === "edin") {
    const level = d.level != null ? `Nivel ${d.level}` : "";
    const date =
      d.month || d.year
        ? `${medalMonthLabel(d.month)} ${d.year ?? ""}`.trim()
        : "";
    return [level, date].filter(Boolean).join(" ") || medalLabel(medal.medal);
  }
  if (medal.medal === "servicio") {
    const area = d.area != null ? String(d.area) : "";
    const date =
      d.month || d.year
        ? `${medalMonthLabel(d.month)} ${d.year ?? ""}`.trim()
        : "";
    return [area, date].filter(Boolean).join(" ") || medalLabel(medal.medal);
  }
  return medalLabel(medal.medal);
}

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
    () => ChurchMember.show<Record<string, unknown>>(route.params.id as string),
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

  const { data: initialMedalLogs } = await useAsyncData(
    `church-member-medal-logs-${route.params.id}`,
    async () => {
      return await ChurchMember.medalLogs<
        {
          id: number;
          medal: string;
          description: Record<string, unknown> | null;
          action: string;
          changer?: { id: number; name: string; last_name?: string };
          created_at?: string;
        }[]
      >(route.params.id as string).catch(() => []);
    },
    {
      default: () =>
        [] as {
          id: number;
          medal: string;
          description: Record<string, unknown> | null;
          action: string;
          changer?: { id: number; name: string; last_name?: string };
          created_at?: string;
        }[],
    },
  );
  medalLogs.value = initialMedalLogs.value;
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

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPad|iPhone|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  );
}
const smsHref = computed(() => {
  if (!phoneDigits.value) return null;
  const msg = encodeURIComponent(message.value.trim());
  if (!msg) return `sms:${phoneDigits.value}`;
  const separator = isIOSDevice() ? "&" : "?";
  return `sms:${phoneDigits.value}${separator}body=${msg}`;
});
const telHref = computed(() =>
  phoneDigits.value ? `tel:${phoneDigits.value}` : null,
);

async function openContact(
  medium: "whatsapp" | "sms" | "llamada" | "presencial",
  url?: string | null,
) {
  const id = route.params.id as string;
  const currentMessage = message.value.trim();
  if (medium === "whatsapp" && url) {
    triggerWhatsApp(currentMessage);
  } else if ((medium === "sms" || medium === "llamada") && url) {
    window.location.href = url;
  }
  try {
    const res = await ChurchMemberTrackingLog.create<Record<string, unknown>>(
      id,
      {
        contact_datetime: localDateTimeString(),
        medium,
        classification: medium === "presencial" ? "CONTESTA" : null,
        description: currentMessage || undefined,
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

function triggerWhatsApp(currentMessage: string) {
  const digits = phoneDigits.value;
  if (!digits) return;
  const encoded = encodeURIComponent(currentMessage);
  const appUrl = encoded
    ? `whatsapp://send?phone=${digits}&text=${encoded}`
    : `whatsapp://send?phone=${digits}`;
  const webUrl = encoded
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/${digits}`;

  let fallback: ReturnType<typeof window.setTimeout> | null = null;
  function cancelFallback() {
    if (fallback !== null) {
      window.clearTimeout(fallback);
      fallback = null;
    }
    window.removeEventListener("pagehide", onHide);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("blur", onHide);
  }
  function onHide() {
    cancelFallback();
  }
  function onVis() {
    if (document.hidden) cancelFallback();
  }
  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("blur", onHide);

  window.location.href = appUrl;

  fallback = window.setTimeout(() => {
    fallback = null;
    cancelFallback();
    if (!document.hidden) window.open(webUrl, "_blank", "noopener");
  }, 1200);
}

function localDateTimeString(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
    await ChurchMemberTrackingLog.delete<Record<string, unknown>>(id, logId);
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
    }>(id, { consolidator_ids: ids });
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
    const [updatedMedals, updatedLogs] = await Promise.all([
      ChurchMember.medals<typeof medals.value>(id).catch(() => []),
      ChurchMember.medalLogs<typeof medalLogs.value>(id).catch(() => []),
    ]);
    medals.value = updatedMedals;
    medalLogs.value = updatedLogs;
  } catch {
    // errors already surfaced by withNotify
  }
}

function confirmDeleteMedal(medal: { id: number; medal: string }) {
  medalToDelete.value = medal;
  medalDeleteDialog.value = true;
}
async function removeMedal() {
  const id = route.params.id as string;
  const medal = medalToDelete.value;
  if (!id || !medal) return;
  medalDeleteDialog.value = false;
  try {
    await ChurchMember.deleteMedal(id, medal.id);
    notify.notify({ success: "Medalla removida exitosamente" });
    await onMedalSaved();
  } catch {
    // withNotify already surfaced the error
  } finally {
    medalToDelete.value = null;
  }
}
</script>
