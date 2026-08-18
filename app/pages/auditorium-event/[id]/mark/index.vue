<template>
  <VContainer fluid class="pa-0">
    <div v-if="eventAuditorium && eventAuditorium.id">
      <div
        ref="headerBar"
        class="pa-2 bg-grey-lighten-4 d-flex align-center"
        :style="{
          position: 'fixed',
          top: headerTop,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 20,
        }"
      >
        <span class="text-subtitle-2">{{
          eventAuditorium.auditorium_name
        }}</span>
        |<span class="text-subtitle-2">{{
          formatShortDate(eventAuditorium.event_date)
        }}</span>

        <VSpacer />
        <span class="text-subtitle-2"
          >{{ totalSeatsWithStatus }}/{{ totalSeats }}</span
        >
        <span class="text-subtitle-2 ml-1" :style="{ color: percentageColor }"
          >{{ percentajeTotalSeats }}%</span
        >

        <AuditoriumEventMarkStatsPanel :sections="sections" />
      </div>

      <!-- Spacer to offset the fixed header above. Height is measured from
           the real header element (see headerBar ref) instead of guessed,
           so it can never be shorter than the actual rendered header and
           clip the control row underneath it. -->
      <div :style="{ height: `${headerHeight}px` }"></div>

      <div>
        <AuditoriumSeatsStageOp
          :sections="sections"
          :top-offset="headerHeight"
          :categories="stageCategories"
          :loading-seats="loadingSeats"
          :auditorium-event-id="eventAuditorium.id"
          @setEventSeat="handleSetEventSeat"
        />
      </div>
    </div>
  </VContainer>
</template>

<script setup lang="ts">
import { STAGE_CATEGORIES } from "~/constants/auditorium";
import { formatShortDate } from "~/utils/date";
import { useLayout } from "vuetify";
import { useAuditoriumEventMark } from "~/composables/useAuditoriumEventMark";
import { useAuditoriumEventStats } from "~/composables/useAuditoriumEventStats";

definePageMeta({
  title: "Evento Auditorio",
  icon: "mdi-theater",
  middleware: ["authenticated", "permission"],
  permission: "auditorium-event-mark",
});

const route = useRoute();
const { mainRect } = useLayout();

route.meta.showDrawer = false;
route.meta.back = `/auditorium-event`;

// Pin the custom info bar just below the real VAppBar (whose height Vuetify
// reports via useLayout().mainRect.top), instead of a hardcoded top: 0 which
// would overlap the app bar.
const headerTop = computed(() => `${mainRect.value?.top ?? 0}px`);

const { eventAuditorium, sections, loadingSeats, handleSetEventSeat } =
  useAuditoriumEventMark(String(route.params.id));

const stats = useAuditoriumEventStats(sections);
const { totalSeats, totalSeatsWithStatus, percentajeTotalSeats, percentageColor } =
  stats;
const stageCategories = STAGE_CATEGORIES;

// Measure the header's real rendered height (instead of guessing a constant)
// so the spacer div below it is never too short and never clips the
// SeatsStageOp control row that follows.
const headerBar = ref<HTMLElement | null>(null);
const headerHeight = ref(44);
function measureHeaderHeight() {
  if (headerBar.value?.offsetHeight) {
    headerHeight.value = headerBar.value.offsetHeight;
  }
}
watch(
  () => eventAuditorium.value?.auditorium_name,
  () => nextTick(measureHeaderHeight),
);

onMounted(() => {
  nextTick(measureHeaderHeight);
  window.addEventListener("resize", measureHeaderHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", measureHeaderHeight);
});
</script>