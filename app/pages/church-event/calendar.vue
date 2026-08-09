<template>
  <VContainer :fluid="true">
    <VRow density="comfortable">
      <!-- Filtro de busqueda -->
      <VCol md="2" cols="12">
        <VTextField
          id="eve-calen-filter"
          v-model="filterInput"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Buscar evento..."
          append-inner-icon="mdi-magnify"
        />
      </VCol>

      <!-- Botones de accion -->
      <VCol cols="auto">
        <VBtn
          id="chrcev-refresh-btn"
          class="mr-2"
          color="primary"
          :loading="loading"
          @click="refreshChurchEvents"
        >
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
        <VBtn
          id="chrcev-new-btn"
          class="mr-2"
          color="success"
          @click="newChurchEvent"
        >
          <VIcon start>mdi-plus</VIcon>
          Nuevo
        </VBtn>
        <VBtn
          id="chrcev-table-btn"
          color="primary"
          to="/church-event"
          variant="outlined"
        >
          <VIcon start>mdi-table</VIcon>
          Tabla
        </VBtn>
      </VCol>
      <VCol v-if="!orgFilterHidden" lg="1" md="2" sm="3" cols="6">
        <OrganizationSelect
          v-model="filterOrgId"
          v-model:hidden="orgFilterHidden"
          hide-one
          clearable
          hide-details
          density="compact"
          variant="outlined"
          prevent-auto-select
          permission="church-event-index"
        />
      </VCol>

      <VCol cols="auto">
        <VBtnToggle
          v-model="weekStartsOnMonday"
          mandatory
          density="compact"
          @update:model-value="changeWeekStart"
        >
          <VBtn id="chrcev-sun-btn" :value="false">Dom</VBtn>
          <VBtn id="chrcev-mon-btn" :value="true">Lun</VBtn>
        </VBtnToggle>
      </VCol>

      <!-- Calendario de eventos -->
      <VCol cols="12">
        <ChurchEventCalendarView
          :cal-year="calYear"
          :cal-month="calMonth"
          :events="churchEvents"
          :week-starts-on-monday="weekStartsOnMonday"
          @copy="openCopyDialog"
          @edit="editChurchEvent"
          @next-month="nextMonth"
          @prev-month="prevMonth"
          @new="newChurchEventOnDate"
          @delete="beforeDeleteChurchEvent"
        />
      </VCol>
    </VRow>

    <!-- Dialogo de copiar evento en varias fechas -->
    <ChurchEventCopyDialog
      v-if="churchEventDialogCopy"
      :loading="copying"
      :church-event="copyingChurchEvent"
      @copy="copyChurchEvent"
      @close="churchEventDialogCopy = false"
    />

    <!-- Dialogo de confirmacion de eliminacion -->
    <DialogDelete
      v-if="churchEventDialogDelete"
      :loading="deleting"
      :dialog="dialogDelete"
      @ok="deleteChurchEvent"
      @close="churchEventDialogDelete = false"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useChurchEventActions } from "~/composables/useChurchEventActions";

definePageMeta({
  title: "Calendario de Eventos",
  icon: "mdi-calendar-month",
  permission: "church-event-index",
  middleware: ["authenticated", "permission"],
});

const route = useRoute();
const { ChurchEvent } = useRepository();
const notify = useNotifyStore();
const auth = useAuthStore();

const toIso = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const toWeekColumn = (jsDay: number, weekStartsOnMonday: boolean) =>
  weekStartsOnMonday ? (jsDay + 6) % 7 : jsDay;

const buildDateRange = (
  year: number,
  month: number,
  weekStartsOnMonday: boolean,
) => {
  const firstDayOfWeek = toWeekColumn(
    new Date(year, month, 1).getDay(),
    weekStartsOnMonday,
  );
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const firstVisibleDay =
    firstDayOfWeek === 0 ? 1 : daysInPrevMonth - (firstDayOfWeek - 1);
  const firstVisibleMonth = firstDayOfWeek === 0 ? month : prevMonth;
  const firstVisibleYear = firstDayOfWeek === 0 ? year : prevYear;
  const startDate = toIso(firstVisibleYear, firstVisibleMonth, firstVisibleDay);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastDayOfWeek = toWeekColumn(
    new Date(year, month, daysInMonth).getDay(),
    weekStartsOnMonday,
  );
  const trailingDays = lastDayOfWeek < 6 ? 6 - lastDayOfWeek : 0;
  const end = new Date(year, month, daysInMonth + trailingDays);
  const endDate = toIso(end.getFullYear(), end.getMonth(), end.getDate());

  return { start_date: startDate, end_date: endDate };
};

const filterInput = ref("");
const filterChurchEvent = ref("");
const filterOrgId = ref<string | number | null>(null);
const orgFilterHidden = ref(false);
const weekStartsOnMonday = ref(true);
const calYear = ref(new Date().getFullYear());
const calMonth = ref(new Date().getMonth());
const response = ref<{ data: unknown[]; total: number }>({
  data: [],
  total: 0,
});
const churchEventDialogDelete = ref(false);
const dialogDelete = ref<Record<string, unknown>>({});
const churchEventDialogCopy = ref(false);
const copyingChurchEvent = ref<Record<string, unknown>>({});
const copying = ref(false);
const loading = ref(false);
const deleting = ref(false);
const skipFilterWatch = ref(false);

// Computed: the org id when the user has exactly 1 org, else null. The
// backend resolves the org from the auth context — never send org_id for
// single-org users (see index_page_table_pattern.md).
const effectiveOrgId = computed(() => {
  const orgPermission = auth.permissionsOrg["church-event-index"] ?? [];
  const orgs = auth.user?.orgs ?? [];
  if (
    orgs.length === 1 &&
    orgPermission.includes((orgs[0] as { id: unknown }).id)
  ) {
    return (orgs[0] as { id: unknown }).id;
  }
  return null;
});

// SSR initial load — honor query params, first paint contains the data (see
// nuxt4_ssr_hydration.md). Scoped key so different cal_year/cal_month/
// week_start payloads don't collide on client-side navigation.
{
  const today = new Date();
  calYear.value = route.query.cal_year
    ? parseInt(String(route.query.cal_year))
    : today.getFullYear();
  calMonth.value =
    route.query.cal_month !== undefined
      ? parseInt(String(route.query.cal_month))
      : today.getMonth();
  weekStartsOnMonday.value = route.query.week_start !== "sunday";

  const { data: initialData } = await useAsyncData(
    `church-event-calendar-${calYear.value}-${calMonth.value}-${weekStartsOnMonday.value ? "mon" : "sun"}`,
    async () => {
      const params: Record<string, unknown> = {
        ...buildDateRange(
          calYear.value,
          calMonth.value,
          weekStartsOnMonday.value,
        ),
      };
      return await ChurchEvent.calendar<{ data?: unknown[] }>(params).catch(
        () => ({ data: [] }),
      );
    },
    { default: () => ({ data: [] as unknown[] }) },
  );
  response.value = {
    data: initialData.value?.data ?? [],
    total: initialData.value?.data?.length ?? 0,
  };
}

const churchEvents = computed(() => response.value?.data || []);

// Debounced filter (300ms): the input ref feeds the API-driving ref, and the
// clear is immediate (never debounced) — see index_page_table_pattern.md.
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(filterInput, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val) {
    filterChurchEvent.value = "";
    return;
  }
  debounceTimer = setTimeout(() => {
    filterChurchEvent.value = val;
  }, 300);
});

watch(filterChurchEvent, (val) => {
  if (skipFilterWatch.value) {
    skipFilterWatch.value = false;
    // External clear (e.g. after delete) — mirror it back to the input
    if (val === "" && filterInput.value !== "") {
      filterInput.value = "";
    }
    return;
  }
  loadChurchEvents({ filter: val || "" });
});

watch(filterOrgId, (value) => {
  // When user has only 1 org, never send org_id — backend resolves it.
  if (effectiveOrgId.value) return;
  const overrides: Record<string, unknown> = {};
  overrides.org_id = value ?? undefined;
  loadChurchEvents(overrides);
});

async function changeWeekStart() {
  await loadChurchEvents();
  navigateTo({
    query: {
      ...route.query,
      week_start: weekStartsOnMonday.value ? "monday" : "sunday",
    },
    replace: true,
  });
}

async function loadChurchEvents(overrides: Record<string, unknown> = {}) {
  try {
    loading.value = true;

    const params: Record<string, unknown> = {
      ...buildDateRange(
        calYear.value,
        calMonth.value,
        weekStartsOnMonday.value,
      ),
      ...overrides,
    };

    if (
      filterChurchEvent.value &&
      !Object.prototype.hasOwnProperty.call(overrides, "filter")
    ) {
      params.filter = filterChurchEvent.value;
    }

    // org_id comes only from overrides (explicit user selection) — never
    // from filterOrgId.value (see index_page_table_pattern.md).

    const res = await ChurchEvent.calendar<{ data?: unknown[] }>(params);
    response.value = { data: res?.data ?? [], total: res?.data?.length ?? 0 };
  } catch (error) {
    console.error(error);
    notify.notify({ error: "Error al cargar el calendario" });
  } finally {
    loading.value = false;
  }
}

async function refreshChurchEvents() {
  await loadChurchEvents();
}

async function prevMonth() {
  if (calMonth.value === 0) {
    calMonth.value = 11;
    calYear.value -= 1;
  } else {
    calMonth.value -= 1;
  }
  await loadChurchEvents();
}

async function nextMonth() {
  if (calMonth.value === 11) {
    calMonth.value = 0;
    calYear.value += 1;
  } else {
    calMonth.value += 1;
  }
  await loadChurchEvents();
}

function newChurchEvent() {
  navigateTo({
    path: "/church-event/new",
    query: {
      from: "calendar",
      cal_year: String(calYear.value),
      cal_month: String(calMonth.value),
    },
  });
}

function newChurchEventOnDate(dateIso: string) {
  navigateTo({
    path: "/church-event/new",
    query: {
      from: "calendar",
      event_date: dateIso,
      cal_year: String(calYear.value),
      cal_month: String(calMonth.value),
    },
  });
}

// ── Shared actions (copy/edit/delete) ─────────────────────────────────

const {
  openCopyDialog,
  copyChurchEvent,
  editChurchEvent,
  beforeDeleteChurchEvent,
  deleteChurchEvent,
} = useChurchEventActions({
  loadChurchEvents,
  routeQuery: () => ({
    from: "calendar",
    cal_year: String(calYear.value),
    cal_month: String(calMonth.value),
  }),
  deleteReloadOverrides: () => ({}),
  churchEventDialogCopy,
  copyingChurchEvent,
  copying,
  churchEventDialogDelete,
  dialogDelete,
  deleting,
  skipFilterWatch,
  filterChurchEvent,
});
</script>

<style scoped></style>
