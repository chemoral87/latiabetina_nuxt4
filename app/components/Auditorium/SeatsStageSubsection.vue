<template>
  <v-group
    :config="{ x: 0, y: 0, id: 'cmp-auditorium-seats-stage-subsection' }"
  >
    <v-rect
      :config="{
        x: 1,
        y: 3,
        width: subsectionWidth + 18,
        height: subsectionHeight + 31,
        fill: 'black',
        stroke: 'red',
        strokeWidth: 1,
      }"
    />

    <!-- Row labels -->
    <v-text
      v-for="rowIdx in seatRowCount"
      :key="`row-label-${rowIdx}`"
      :config="getRowLabelConfig(rowIdx - 1)"
    />

    <!-- Column labels -->
    <v-text
      v-for="colIdx in maxColumns"
      :key="`col-label-${colIdx}`"
      :config="getColLabelConfig(colIdx - 1)"
    />

    <!-- Subsection title -->
    <v-text :config="subsectionTitleConfig" />

    <!-- Stats: Count -->
    <v-text
      :config="{
        x: 2,
        y: -7,
        text: `${stats.withStatus}/${stats.total}`,
        fontSize: 10,
        fill: 'white',
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }"
    />

    <!-- Stats: Percentage -->
    <v-text
      :config="{
        x: 36,
        y: -7,
        text: `${stats.percent}%`,
        fontSize: 10,
        fill: percentageColor,
        fontStyle: 'bold',
        fontFamily: 'Arial',
      }"
    />

    <!-- Seats -->
    <v-group
      v-for="seat in seats"
      :key="seat.id"
      :config="{ x: seat.x, y: seat.y, listening: true }"
    >
      <v-circle
        :config="
          Object.assign({}, seat.config, {
            x: 0,
            y: 0,
            listening: true,
            onClick: (evt) => handleSeatClick(seat, evt),
            onTap: (evt) => handleSeatClick(seat, evt),
          })
        "
      />
      <v-path v-if="seat.iconPath" :config="seat.iconPathConfig" />
      <!-- Loading spinner – comet tail arcs -->
      <template v-if="seat.isLoading">
        <v-arc
          v-for="(arc, i) in seat.spinnerArcs"
          :key="'sp-' + seat.id + '-' + i"
          :config="arc"
        />
      </template>
    </v-group>
  </v-group>
</template>

<script setup lang="ts">
import {
  STATUS_COLORS,
  STATUS_ICONS,
  STATUS_CONFIG,
  COLORS,
  getPercentageColor,
  DEFAULT_SETTINGS,
} from "~/constants/auditorium";
import { useUAParser } from "~/utils/userAgent";

interface SeatItem {
  id: string;
  row?: number;
  col?: number;
  state?: string;
  status?: string | null;
  [key: string]: unknown;
}

interface Subsection {
  i?: string;
  id?: string;
  n?: string;
  name?: string;
  s?: (SeatItem | null)[][];
  seats?: (SeatItem | null)[][];
  [key: string]: unknown;
}

const props = defineProps<{
  subsection: Subsection;
  categories?: { label: string; value: string | null; fill: string }[];
  selectedSeatsArray?: string[];
  blinkState?: boolean;
  loadingSeats?: string[];
}>();

const emit = defineEmits<{
  (e: "seat-click", payload: { seat: SeatItem; event: unknown }): void;
}>();

const ua = useUAParser();

const spinAngle = ref(0);
let spinInterval: ReturnType<typeof setInterval> | null = null;

const seatSpacing = computed(
  () => DEFAULT_SETTINGS.SEAT_SIZE + DEFAULT_SETTINGS.SEATS_DISTANCE,
);

const seatsSource = computed<(SeatItem | null)[][]>(() => {
  const s = props.subsection.s || props.subsection.seats;
  return Array.isArray(s) ? (s as (SeatItem | null)[][]) : [];
});

const subsectionWidth = computed(() => {
  if (!seatsSource.value?.length) return 0;
  const maxCols = Math.max(
    ...seatsSource.value.map((row) => (row ? row.length : 0)),
  );
  return maxCols * seatSpacing.value - DEFAULT_SETTINGS.SEATS_DISTANCE;
});

const subsectionHeight = computed(() => {
  if (!seatsSource.value?.length) return 40;
  return (
    seatsSource.value.length * seatSpacing.value -
    DEFAULT_SETTINGS.SEATS_DISTANCE
  );
});

const seatRowCount = computed(() => seatsSource.value.length);

const maxColumns = computed(() => {
  if (!props.subsection || seatsSource.value.length === 0) return 0;
  return Math.max(...seatsSource.value.map((row) => (row ? row.length : 0)));
});

const subsectionTitleConfig = computed(() => {
  return {
    x: 4,
    y: 5,
    text: props.subsection.n || props.subsection.name,
    fontSize: 11,
    fill: "#fff",
    fontFamily: "Arial",
    align: "left",
    width: subsectionWidth.value + 13,
  };
});

const stats = computed(() => {
  if (!props.subsection || !seatsSource.value) {
    return { withStatus: 0, total: 0, percent: 0 };
  }

  let total = 0;
  let withStatus = 0;

  seatsSource.value.forEach((row) => {
    row.forEach((seat) => {
      if (seat) {
        total++;
        if (seat.status && seat.status !== null) {
          withStatus++;
        }
      }
    });
  });

  const percent = total > 0 ? Math.round((withStatus / total) * 100) : 0;
  return { withStatus, total, percent };
});

const percentageColor = computed(() => getPercentageColor(stats.value.percent));

interface SeatRender {
  id: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
  iconPath?: string;
  iconPathConfig?: Record<string, unknown>;
  isLoading?: boolean;
  spinnerArcs?: Record<string, unknown>[];
  [key: string]: unknown;
}

const seats = computed<SeatRender[]>(() => {
  const allSeats: SeatRender[] = [];
  if (seatsSource.value) {
    seatsSource.value.forEach((row, rowIdx) => {
      row.forEach((seat, colIdx) => {
        if (seat && seat.state !== "invisible") {
          const seatData: SeatRender = {
            ...seat,
            id: seat.i || seat.id,
            row: seat.r !== undefined ? seat.r : seat.row,
            col: seat.c !== undefined ? seat.c : seat.col,
            category: seat.k || seat.category,
            x: colIdx * seatSpacing.value + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 14,
            y: rowIdx * seatSpacing.value + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 20,
            config: getSeatConfig(seat),
          };

          const status = seat.status ? String(seat.status).toLowerCase() : null;
          if (status && STATUS_ICONS[status]) {
            seatData.iconPath = STATUS_ICONS[status];
            seatData.iconPathConfig = getIconPathConfig(seat);
          }

          const seatId = seat.i || seat.id;
          if ((props.loadingSeats ?? []).includes(seatId)) {
            seatData.isLoading = true;
            const radius = DEFAULT_SETTINGS.SEAT_SIZE / 2;
            const SEGMENTS = [
              {
                sweep: 30,
                opacity: 1.0,
                offset: 0,
                inner: radius - 1.5,
                outer: radius + 1.5,
              },
              {
                sweep: 40,
                opacity: 0.89,
                offset: -30,
                inner: radius - 1.3,
                outer: radius + 1.5,
              },
              {
                sweep: 50,
                opacity: 0.78,
                offset: -65,
                inner: radius - 1.1,
                outer: radius + 1.5,
              },
              {
                sweep: 55,
                opacity: 0.67,
                offset: -108,
                inner: radius - 0.9,
                outer: radius + 1.5,
              },
              {
                sweep: 55,
                opacity: 0.56,
                offset: -155,
                inner: radius - 0.6,
                outer: radius + 1.5,
              },
              {
                sweep: 50,
                opacity: 0.45,
                offset: -200,
                inner: radius - 0.3,
                outer: radius + 1.5,
              },
            ];
            seatData.spinnerArcs = SEGMENTS.map((seg) => ({
              x: 0,
              y: 0,
              innerRadius: seg.inner,
              outerRadius: seg.outer,
              angle: seg.sweep,
              rotation: (spinAngle.value + seg.offset + 360) % 360,
              fill: "#ffffff",
              opacity: seg.opacity,
              listening: false,
            }));
          }

          allSeats.push(seatData);
        }
      });
    });
  }
  return allSeats;
});

onMounted(() => {
  spinInterval = setInterval(() => {
    spinAngle.value = (spinAngle.value + 10) % 360;
  }, 50);
});

onBeforeUnmount(() => {
  if (spinInterval) clearInterval(spinInterval);
});

function getRowLabelConfig(rowIdx: number) {
  return {
    x: 3,
    y: rowIdx * seatSpacing.value + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 20,
    text: (rowIdx + 1).toString(),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "right",
    verticalAlign: "middle",
    offsetY: 3,
  };
}

function getColLabelConfig(colIdx: number) {
  const labelSpacing = seatSpacing.value;
  return {
    x: colIdx * labelSpacing + DEFAULT_SETTINGS.SEAT_SIZE / 2 + 11,
    y: subsectionHeight.value + 25,
    text: String.fromCharCode(65 + colIdx),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "center",
    offsetX: 0,
  };
}

function getSeatConfig(seat: SeatItem) {
  const statusColors = STATUS_COLORS;

  const isReserved = seat.state === "reserved";
  const isSelected = seat.state === "selected";
  const seatId = seat.i || seat.id;
  const isInSelectedArray = (props.selectedSeatsArray ?? []).includes(seatId);
  const category =
    seat.k || seat.category
      ? String(seat.k || seat.category).toLowerCase()
      : null;
  const status = seat.status ? String(seat.status).toLowerCase() : null;

  let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575";
  let strokeWidth = 0.3;

  if (category) {
    try {
      const def = (props.categories || []).find(
        (c) =>
          String(c.label).toLowerCase() === category ||
          String(c.value).toLowerCase() === category,
      );
      if (
        def &&
        typeof def.value !== "undefined" &&
        def.value !== null &&
        def.fill
      ) {
        stroke = def.fill;
        strokeWidth = 2;
      }
    } catch (err) {}
  }

  let fill = isSelected
    ? COLORS.SEAT_SELECTED
    : isReserved
      ? COLORS.SEAT_RESERVED
      : COLORS.SEAT_FREE;
  if (isInSelectedArray) {
    let baseColor = "#ffeb3b";
    if (status) {
      baseColor = statusColors[status] || "#ffeb3b";
    }
    fill = props.blinkState ? baseColor : "#808080";
    strokeWidth = 0;
  } else if (status) {
    fill = statusColors[status] || fill;
  }

  return {
    radius: DEFAULT_SETTINGS.SEAT_SIZE / 2,
    fill,
    stroke,
    strokeWidth,
    opacity: isReserved ? 0.6 : 1,
  };
}

function getIconPathConfig(seat: SeatItem) {
  const status = seat.status ? String(seat.status).toLowerCase() : null;
  const seatId = seat.i || seat.id;
  const isInSelectedArray = (props.selectedSeatsArray ?? []).includes(seatId);

  let iconColor = "#FFFFFF";

  if (!status) {
    iconColor = "#000000";
  }

  if (isInSelectedArray && !props.blinkState) {
    iconColor = "#FFFFFF";
  }

  const radius = DEFAULT_SETTINGS.SEAT_SIZE / 2;
  const iconScale = status ? STATUS_CONFIG[status]?.icon_scale || 1.8 : 1.8;
  const scale = (radius * iconScale) / 24;
  const offset = (24 * scale) / 2;

  return {
    data: status ? STATUS_ICONS[status] || "" : "",
    fill: iconColor,
    scaleX: scale,
    scaleY: scale,
    x: -offset,
    y: -offset,
    listening: false,
  };
}

let _lastSeatTap: { seatId: string; time: number } | null = null;

function handleSeatClick(seat: SeatItem, event: unknown) {
  // Konva 10 enables pointer events by default, so a single physical tap can
  // deliver 'pointerclick' (pointer events) plus 'click'/'tap' (compat/touch
  // events). Collapse near-simultaneous duplicates so a seat toggles once.
  const seatId = String(seat.i ?? seat.id ?? "");
  const now = Date.now();
  if (
    _lastSeatTap &&
    _lastSeatTap.seatId === seatId &&
    now - _lastSeatTap.time < 300
  ) {
    return;
  }
  _lastSeatTap = { seatId, time: now };
  emit("seat-click", { seat, event });
}
</script>

<style scoped>
/* Deshabilitar selección de texto y comportamientos táctiles por defecto */
* {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

/* Para el contenedor de Konva */
:deep(canvas) {
  display: block;
  touch-action: none;
}
</style>
