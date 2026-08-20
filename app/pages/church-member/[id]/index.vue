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
            <VIcon start color="primary">mdi-account</VIcon>
            {{ fullName }}
            <VSpacer />
            <VChip size="small" :color="statusColor(member.status)">
              {{ statusLabel(member.status) }}
            </VChip>
            <VBtn
              id="cmm-status-edit-btn"
              icon
              size="x-small"
              variant="text"
              color="primary"
              rounded="circle"
              title="Cambiar estado"
              @click="statusDialog = true"
            >
              <VIcon size="small">mdi-pencil</VIcon>
            </VBtn>
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
                  @click="editDialog = true"
                >
                  <VIcon start>mdi-pencil</VIcon>
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
            <VDataTableServer
              id="cmm-interactions-dt"
              v-model:page="logsPage"
              v-model:items-per-page="logsItemsPerPage"
              v-model:sort-by="logsSortBy"
              :headers="logsHeaders"
              :items="logsResponse.data"
              :items-length="logsResponse.total"
              :loading="loadingLogs"
              density="compact"
              class="elevation-1"
              :items-per-page-options="[10, 15, 25]"
              items-per-page-text="Filas por página"
              @update:options="onLogsUpdateOptions"
            >
              <template #[`item.medium`]="{ item }">
                <VChip size="small" variant="tonal" :color="mediumColor(item.medium)">
                  {{ mediumLabel(item.medium) }}
                </VChip>
              </template>

              <template #[`item.contact_date`]="{ item }">
                {{ formatShortDate(item.contact_date) }}
              </template>

              <template #[`item.creator`]="{ item }">
                {{ (item.creator as Record<string, unknown> | undefined)?.name || "N/A" }}
              </template>

              <template #[`item.classification`]="{ item }">
                <VChip v-if="item.classification" size="small" variant="tonal" :color="classificationColor(item.classification)">
                  {{ item.classification }}
                </VChip>
              </template>

              <template #[`item.description`]="{ item }">
                <span v-if="item.description">{{ item.description }}</span>
                <span v-else class="text-grey">—</span>
              </template>

              <template #no-data>
                <div class="text-center pa-4">
                  <VIcon color="grey-lighten-1">mdi-history</VIcon>
                  <div class="text-body-2 mt-1">Sin interacciones registradas</div>
                </div>
              </template>
            </VDataTableServer>
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
  </VContainer>
</template>

<script setup lang="ts">
import { formatShortDate } from "~/utils/date"

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
const trackingLogs = ref<Record<string, unknown>[]>([]);

const logsPage = ref(1);
const logsItemsPerPage = ref(10);
const logsSortBy = ref<{ key: string; order: string }[]>([{ key: "contact_date", order: "desc" }]);
const logsResponse = ref({ data: [], total: 0 });
const logsHeaders = [
  { title: "Medio", value: "medium", sortable: false, align: "center" },
  { title: "Clasificación", value: "classification", sortable: false, align: "center" },
  { title: "Fecha", value: "contact_date", sortable: true },
  { title: "Usuario", value: "creator", sortable: false },
  { title: "Descripción", value: "description", sortable: false },
];

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
  } catch {
    // log failure should not block the action
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
    const params: Record<string, unknown> = {
      page: logsPage.value,
      itemsPerPage: logsItemsPerPage.value,
    }
    if (logsSortBy.value.length > 0) {
      params.sortBy = [logsSortBy.value[0].key]
      params.sortDesc = [logsSortBy.value[0].order === "desc"]
    }
    const data = await ChurchMember.trackingLogs<Record<string, unknown>>(id, params)
    logsResponse.value = data as { data: unknown[]; total: number }
  } catch {
    logsResponse.value = { data: [], total: 0 }
  } finally {
    loadingLogs.value = false
  }
}

function onLogsUpdateOptions(opts: Record<string, unknown>) {
  logsPage.value = (opts.page as number) ?? 1
  logsItemsPerPage.value = (opts.itemsPerPage as number) ?? 10
  if (Array.isArray(opts.sortBy)) {
    const sb = opts.sortBy as ({ key: string; order: string } | string)[]
    logsSortBy.value = sb.map((s) =>
      typeof s === "string" ? { key: s, order: "asc" } : s,
    )
  }
  fetchTrackingLogs()
}

function mediumLabel(medium: unknown): string {
  const labels: Record<string, string> = {
    whatsapp: "WhatsApp",
    sms: "Mensaje",
    llamada: "Llamada",
    presencial: "Presencial",
  }
  return labels[String(medium)] || String(medium ?? "—")
}

function mediumColor(medium: unknown): string {
  const colors: Record<string, string> = {
    whatsapp: "green",
    sms: "teal",
    llamada: "primary",
    presencial: "amber",
  }
  return colors[String(medium)] ?? "grey"
}

function classificationColor(classification: unknown): string {
  const colors: Record<string, string> = {
    CONTESTA: "green",
    "NO CONTESTA": "amber",
  }
  return colors[String(classification)] ?? "grey"
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
