<template>
  <div id="cmp-auditorium-seats-stage-op">
    <AuditoriumSeatsStageOpControls
      ref="controlsRef"
      :selected-subsection="selectedSubsection"
      @history="openHistory"
      @next="nextSubsection"
      @fit-width="fitToWidth"
      @main="goBackToFullView"
      @fit-height="fitToHeight"
      @prev="previousSubsection"
    />

    <div style="display: flex; gap: 2px">
      <AuditoriumSeatsStageCanvas
        ref="canvasRef"
        :sections="sections"
        :categories="categories"
        :blink-state="blinkState"
        :stage-config="stageConfig"
        :loading-seats="loadingSeats"
        :container-width="containerWidth"
        :container-height-px="containerHeightPx"
        :selected-subsection="selectedSubsection"
        :selected-seats-array="selectedSeatsArray"
        :container-outer-height="containerOuterHeight"
        @seat-click="handleSeatClick"
        @subsection-click="handleSubsectionClick"
      />
    </div>

    <AuditoriumSeatsStageMarkPanel
      v-model="showMarkPanel"
      :panel-top="panelVerticalPos.top"
      :count="selectedSeatsArray.length"
      :status-config="activeStatusConfig"
      :panel-bottom="panelVerticalPos.bottom"
      @set-status="setEventSeat"
    />

    <AuditoriumSeatsHistory
      id="cmp-auditorium-seats-history"
      v-model="historyDialog"
      :history-log="historyLog"
      :history-users="historyUsers"
      :history-loading="historyLoading"
    />
  </div>
</template>

<script setup lang="ts">
import { STATUS_CONFIG } from "~/constants/auditorium";
import { useLayout } from "vuetify";
import type { Seat, Section, Subsection } from "~/types/auditorium";

const props = defineProps<{
  sections: Section[];
  stageConfig: Record<string, unknown>;
  auditoriumEventId?: number | string | null;
  sectionPrefix?: string | null;
  categories?: unknown[];
  loadingSeats?: unknown[];
  // Height (px) of any fixed page header rendered above this component. It is
  // reserved in-flow by the page (a spacer div) but is NOT part of the
  // viewport space the stage can fill, so it must be subtracted here or the
  // stage overflows the viewport bottom and the page shows a scrollbar.
  topOffset?: number;
}>();

const emit = defineEmits<{
  (
    e: "setEventSeat",
    payload: { seatIds: (number | string)[]; status: string | null },
  ): void;
}>();

const { mainRect } = useLayout();
const { AuditoriumEventSeatLog } = useRepository();

const canvasRef = ref<InstanceType<typeof AuditoriumSeatsStageCanvas> | null>(
  null,
);
const controlsRef = ref<InstanceType<typeof AuditoriumSeatsStageOpControls> | null>(
  null,
);

const selectedSubsection = ref<Subsection | null>(null);
const cachedControlHeight = ref(50);
const selectedSeatsArray = ref<(number | string)[]>([]);
const lastClickClientY = ref<number | null>(null);
const blinkState = ref(false);
const blinkInterval = ref<ReturnType<typeof setInterval> | null>(null);
const markPanelVisible = ref(false);
const historyDialog = ref(false);
const historyLog = ref<Record<string, unknown>[]>([]);
const historyUsers = ref<Record<string, unknown>[]>([]);
const historyLoading = ref(false);

const activeStatusConfig = computed(() => {
  const order = ["e", "h", "i", "t", "_", "m", "n", "c"];
  return order
    .filter(
      (key) =>
        key === "_" ||
        (STATUS_CONFIG[key] && STATUS_CONFIG[key].active !== false),
    )
    .reduce(
      (acc, key) => {
        acc[key] = key === "_" ? null : STATUS_CONFIG[key];
        return acc;
      },
      {} as Record<
        string,
        (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG] | null
      >,
    );
});

const showMarkPanel = computed({
  get: () => markPanelVisible.value,
  set: (val: boolean) => {
    if (!val) {
      markPanelVisible.value = false;
      selectedSeatsArray.value = [];
      lastClickClientY.value = null;
    }
  },
});

const panelVerticalPos = computed(() => {
  if (lastClickClientY.value === null || typeof window === "undefined") {
    return { bottom: "90px", top: null as string | null };
  }
  const viewportMid = window.innerHeight / 2;
  if (lastClickClientY.value < viewportMid) {
    return { bottom: "20px", top: null as string | null };
  }
  return { top: "60px", bottom: null as string | null };
});

const allSubsections = computed(() => {
  const subsections: Subsection[] = [];
  props.sections.forEach((section) => {
    const isLabel = section.l || section.isLabel;
    const rawSubs = section.ss || section.subsections;
    if (!isLabel && rawSubs) {
      rawSubs.forEach((sub) => {
        const isSubLabel = sub.l || sub.isLabel;
        const seatsSource = sub.s || sub.seats;
        if (!isSubLabel && seatsSource) {
          subsections.push(sub);
        }
      });
    }
  });
  return subsections;
});

const currentSubsectionIndex = computed(() => {
  if (!selectedSubsection.value || allSubsections.value.length === 0) return -1;
  const selectedId = selectedSubsection.value.i || selectedSubsection.value.id;
  return allSubsections.value.findIndex(
    (sub) => (sub.i || sub.id) === selectedId,
  );
});

const controlHeight = computed(() => cachedControlHeight.value);

const appBarHeight = computed(() => {
  return mainRect.value?.top ?? 0;
});

const containerOuterHeight = computed(() => {
  const controlH = controlHeight.value;
  const appBarH = appBarHeight.value;
  const offset = props.topOffset ?? 0;
  // The page's fixed info bar reserves its real, measured height in-flow via
  // a spacer div before this component mounts. That height is part of the
  // page's vertical budget but not usable stage space, so it must be
  // subtracted alongside the control row and the real VAppBar.
  return `calc(100dvh - ${controlH}px - ${appBarH}px - ${offset}px - env(safe-area-inset-bottom, 10px))`;
});

const containerWidth = computed(() => {
  if (typeof window === "undefined") return 800;
  return window.innerWidth;
});

const containerHeightPx = computed(() => {
  if (typeof window === "undefined") return 600;
  const controlH = controlHeight.value;
  const appBarH = appBarHeight.value;
  const offset = props.topOffset ?? 0;
  const baseHeight =
    window.innerHeight || document.documentElement.clientHeight;
  return baseHeight - controlH - appBarH - offset - 10;
});

watch(selectedSubsection, () => {
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight();
    }, 100);
  });
});

watch(selectedSeatsArray, (arr) => {
  markPanelVisible.value = arr.length > 0;
});

// Vuetify 3's layout system (useLayout) can report `mainRect.top` as 0 on the
// very first render, before the VAppBar has registered its height with the
// layout provider. If we size/fit the Konva stage against that stale 0, the
// stage ends up taller than the actual space below the app bar and visually
// overlaps it (cropped/overlapping header). Re-run the fit once the real
// app-bar height comes through.
watch(appBarHeight, () => {
  nextTick(() => {
    cachedControlHeight.value = getControlRowHeight();
    applyCurrentFit();
  });
});

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight();
      fitToHeight();
    }, 100);
  });

  blinkInterval.value = setInterval(() => {
    blinkState.value = !blinkState.value;
  }, 330);
});

onBeforeUnmount(() => {
  if (blinkInterval.value) {
    clearInterval(blinkInterval.value);
  }
});

function getControlRowHeight() {
  const element = controlsRef.value?.rootEl;
  if (element && element.offsetHeight) {
    const height = element.offsetHeight;
    return height > 0 ? height : 50;
  }
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const fallback = isMobile ? 52 : 48;
  return fallback;
}

function handleSubsectionClick(subSection: Subsection) {
  selectedSubsection.value = subSection;
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight();
      canvasRef.value?.enterSubsection();
    }, 100);
  });
}

function goBackToFullView() {
  selectedSubsection.value = null;
  nextTick(() => {
    setTimeout(() => {
      cachedControlHeight.value = getControlRowHeight();
      applyCurrentFit();
    }, 100);
  });
}

function nextSubsection() {
  if (!selectedSubsection.value || allSubsections.value.length === 0) return;
  const currentIndex = currentSubsectionIndex.value;
  const nextIndex = (currentIndex + 1) % allSubsections.value.length;
  selectedSubsection.value = allSubsections.value[nextIndex];
  nextTick(() => {
    setTimeout(() => {
      applyCurrentFit();
    }, 100);
  });
}

function previousSubsection() {
  if (!selectedSubsection.value || allSubsections.value.length === 0) return;
  const currentIndex = currentSubsectionIndex.value;
  const prevIndex =
    currentIndex === 0 ? allSubsections.value.length - 1 : currentIndex - 1;
  selectedSubsection.value = allSubsections.value[prevIndex];
  nextTick(() => {
    setTimeout(() => {
      applyCurrentFit();
    }, 100);
  });
}

function applyCurrentFit() {
  canvasRef.value?.applyCurrentFit();
}

function fitToWidth() {
  canvasRef.value?.fitToWidth();
}

function fitToHeight() {
  canvasRef.value?.fitToHeight();
}

function handleSeatClick(payload: { seat: Seat; event?: unknown }) {
  const { seat, event } = payload;

  let clickY: number | null = null;
  if (event) {
    const evt = (event as any).evt;
    if (evt && typeof evt.clientY === "number") {
      clickY = evt.clientY;
    }
    if (clickY === null && evt) {
      const touches = evt.changedTouches || evt.touches;
      if (touches && touches[0] && typeof touches[0].clientY === "number") {
        clickY = touches[0].clientY;
      }
    }
    if (clickY === null && (event as any).target) {
      try {
        const stage = (event as any).target.getStage();
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            const stageRect = stage.container().getBoundingClientRect();
            clickY = stageRect.top + pointer.y;
          }
        }
      } catch (_) {
        /* ignore */
      }
    }
  }
  if (clickY !== null) {
    lastClickClientY.value = clickY;
  }

  if (!selectedSubsection.value) {
    // Seats are only selectable inside a subsection. In the full view, tapping
    // a seat does nothing here (the event bubbles up and zooms the subsection
    // via handleSubsectionClick). Selected seats keep blinking in the full view
    // through selectedSeatsArray/blinkState.
    return;
  }

  const seatId = seat.i || seat.id;
  const index = selectedSeatsArray.value.indexOf(seatId);

  selectedSeatsArray.value =
    index > -1
      ? selectedSeatsArray.value.filter((id) => id !== seatId)
      : [...selectedSeatsArray.value, seatId];
}

function setEventSeat(status: string | null) {
  if (selectedSeatsArray.value.length === 0) {
    return;
  }

  const seatIdsToSend = selectedSeatsArray.value.filter((seatId) => {
    const seat = findSeatById(seatId);
    if (!seat) return true;
    const currentStatus = seat.status || null;
    return currentStatus !== status;
  });

  selectedSeatsArray.value = selectedSeatsArray.value.filter((id) =>
    seatIdsToSend.includes(id),
  );

  if (seatIdsToSend.length === 0) {
    selectedSeatsArray.value = [];
    return;
  }

  emit("setEventSeat", {
    seatIds: seatIdsToSend,
    status,
  });

  selectedSeatsArray.value = [];
}

function findSeatById(seatId: number | string) {
  for (const section of props.sections) {
    const rawSubs = section.ss || section.subsections;
    if (!rawSubs) continue;
    for (const sub of rawSubs) {
      const seatsSource = sub.s || sub.seats;
      if (!seatsSource) continue;
      for (const row of seatsSource) {
        for (const seat of row) {
          if (seat && (seat.i || seat.id) === seatId) return seat;
        }
      }
    }
  }
  return null;
}

async function openHistory() {
  historyDialog.value = true;
  historyLoading.value = true;
  historyLog.value = [];
  const prefix =
    props.sectionPrefix ||
    (selectedSubsection.value
      ? selectedSubsection.value.i || selectedSubsection.value.id
      : null);
  try {
    const response = await AuditoriumEventSeatLog.index({
      auditorium_event_id: props.auditoriumEventId,
      section_prefix: prefix + "-",
    });
    historyLog.value = (response as any)?.seatsLog || [];
    historyUsers.value = (response as any)?.users || [];
  } catch (e) {
    /* ignore */
  } finally {
    historyLoading.value = false;
  }
}
</script>

<style scoped>
</style>
