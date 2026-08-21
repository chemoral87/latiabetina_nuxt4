<template>
  <VSheet
    id="cmp-auditorium-seats"
    elevation="2"
    class="pa-2 stage-container"
    style="
      background: #f5f5f5;
      min-height: 500px;
      overflow-x: auto;
      overflow-y: hidden;
    "
  >
    <v-stage
      :config="stageConfig"
      @tap="handleStageClick"
      @click="handleStageClick"
    >
      <v-layer>
        <v-group
          v-for="(section, sIdx) in sections"
          :key="`section-${sIdx}`"
          :config="getSectionConfig(sIdx)"
        >
          <v-rect
            v-if="!section.isLabel"
            :config="getSectionBgConfig(section)"
          />
          <v-text :config="getSectionTitleConfig(section)" />

          <template v-if="!section.isLabel">
            <v-group
              v-for="(sub, subIdx) in section.subsections"
              :key="`sub-${sIdx}-${subIdx}`"
              :config="getSubsectionPosition(section, subIdx)"
            >
              <template v-if="sub.isLabel">
                <v-rect :config="getSubsectionLabelBgConfig(sub, section)" />
                <v-text :config="getSubsectionLabelTextConfig(sub, section)" />
              </template>

              <template v-else>
                <v-text
                  v-for="rowIdx in getRowCount(sub)"
                  :key="`row-label-${rowIdx}`"
                  :config="getRowLabelConfig(rowIdx - 1)"
                />
                <v-text
                  v-for="colIdx in getMaxColumns(sub)"
                  :key="`col-label-${colIdx}`"
                  :config="getColLabelConfig(colIdx - 1, sub)"
                />
                <v-rect :config="getSubsectionRectConfig(sub)" />
                <v-text :config="getSubsectionTitleConfig(sub)" />

                <template
                  v-for="seat in getSubsectionSeats(sub)"
                  :key="seat.id"
                >
                  <v-group :config="{ x: seat.x, y: seat.y }">
                    <v-circle
                      :config="
                        Object.assign({}, getSeatConfig(seat), {
                          x: 0,
                          y: 0,
                          onMouseenter: handleSeatHover,
                          onMouseleave: handleSeatLeave,
                          onClick: (e) => handleSeatClick(seat, e),
                          onTap: (e) => handleSeatClick(seat, e),
                        })
                      "
                    />
                  </v-group>
                </template>
              </template>
            </v-group>
          </template>
        </v-group>
      </v-layer>

      <v-layer>
        <v-group
          v-if="activeSeat"
          :config="{ x: tooltipPos.x, y: tooltipPos.y }"
        >
          <v-rect
            :config="{
              width: tooltipWidth,
              height: tooltipHeight,
              fill: '#333',
              cornerRadius: 6,
              opacity: 0.95,
            }"
          />
          <v-text
            :config="{
              x: 8,
              y: 6,
              text: 'Clasificación:',
              fontSize: 11,
              fill: '#fff',
              fontStyle: 'bold',
            }"
          />

          <template v-for="(cat, ci) in categories" :key="`cat-${ci}`">
            <v-text
              :config="{
                x: 8,
                y: 24 + ci * 16,
                text: '-> ' + cat.label,
                fontSize: 12,
                fill: '#fff',
                onClick: () => setSeatCategory(activeSeat, cat.value),
                onTap: () => setSeatCategory(activeSeat, cat.value),
                onMouseenter: handleTooltipHover,
                onMouseleave: handleTooltipLeave,
              }"
            />
            <v-rect
              :config="
                Object.assign({}, getUnderlineConfig(cat, ci), {
                  onClick: () => setSeatCategory(activeSeat, cat.value),
                  onTap: () => setSeatCategory(activeSeat, cat.value),
                })
              "
            />
          </template>
        </v-group>
      </v-layer>
    </v-stage>
  </VSheet>
</template>

<script setup lang="ts">
import {
  CLASS_STROKE_MAP,
  COLORS,
  type StageCategory,
} from "~/constants/auditorium";

interface Seat {
  id: string;
  row: number;
  col: number;
  state?: string;
  category?: string | null;
  x?: number;
  y?: number;
  isAbsolute?: boolean;
}

interface Subsection {
  id: string;
  name: string;
  isLabel: boolean;
  width?: number;
  tempRows?: number;
  tempCols?: number;
  seats?: (Seat | null)[][];
}

interface Section {
  id: string;
  name: string;
  isLabel: boolean;
  subsections: Subsection[];
}

interface StageSettings {
  SEAT_SIZE: number;
  SEATS_DISTANCE: number;
  SUBSECTION_SPACING: number;
  SECTIONS_MARGIN: number;
  SECTION_TOP_PADDING: number;
  SECTION_SIDE_PADDING: number;
  SECTION_BOTTOM_PADDING: number;
}

interface KonvaEvent {
  target?: any;
  evt?: { stopPropagation?: () => void };
  cancelBubble?: boolean;
}

const props = defineProps<{
  sections: Section[];
  settings: StageSettings;
  stageConfig: { width: number; height: number };
  categories?: StageCategory[];
}>();

const categories = computed(() => props.categories ?? []);

const activeSeat = ref<{
  id: string;
  x: number;
  y: number;
  isAbsolute?: boolean;
} | null>(null);

const seatSpacing = computed(
  () => props.settings.SEAT_SIZE + props.settings.SEATS_DISTANCE,
);

const tooltipPos = computed(() => {
  if (!activeSeat.value) return { x: 0, y: 0 };
  try {
    // If click handler already computed absolute tooltip position, use it
    if (
      activeSeat.value.isAbsolute &&
      typeof activeSeat.value.x === "number" &&
      typeof activeSeat.value.y === "number"
    ) {
      return { x: activeSeat.value.x, y: activeSeat.value.y };
    }

    const parts = String(activeSeat.value.id).split("-");
    const sectionIdx = Math.max(0, parseInt(parts[1], 10) - 1);
    const subIdx = Math.max(0, parseInt(parts[2], 10) - 1);
    const section = props.sections[sectionIdx];
    if (!section) return { x: activeSeat.value.x, y: activeSeat.value.y };

    const sectionPos = getSectionConfig(sectionIdx);
    const subPos = getSubsectionPosition(section, subIdx);
    const x =
      sectionPos.x +
      subPos.x +
      activeSeat.value.x +
      (props.settings.SEAT_SIZE / 2 + 6);
    const y =
      sectionPos.y +
      subPos.y +
      activeSeat.value.y -
      (props.settings.SEAT_SIZE / 2 + 8);
    return { x, y };
  } catch (err) {
    return { x: activeSeat.value.x, y: activeSeat.value.y };
  }
});

const tooltipWidth = computed(() => {
  const base = 110;
  try {
    if (!categories.value || categories.value.length === 0) return base;
    const maxText = Math.max(
      ...categories.value.map((cat) => getTextWidth("-> " + cat.label, 12)),
    );
    return Math.max(base, Math.ceil(maxText) + 16);
  } catch (err) {
    return base;
  }
});

const tooltipHeight = computed(() => {
  const header = 20;
  const optionHeight = 16;
  const bottomPad = 12;
  const count = categories.value ? categories.value.length : 0;
  return Math.max(40, header + count * optionHeight + bottomPad);
});

function getSectionConfig(sIdx: number) {
  const section = props.sections[sIdx];
  const y = props.sections
    .slice(0, sIdx)
    .reduce(
      (acc, s) => acc + getSectionHeight(s) + props.settings.SECTIONS_MARGIN,
      props.settings.SECTION_TOP_PADDING,
    );
  return { x: (props.stageConfig.width - getSectionWidth(section)) / 2, y };
}

function getSectionBgConfig(section: Section) {
  return {
    width: getSectionWidth(section),
    height: getSectionHeight(section),
    fill: COLORS.SECTION_BG,
    strokeWidth: 1,
    stroke: "lightgrey",
    cornerRadius: 5,
  };
}

function getSectionTitleConfig(section: Section) {
  return {
    x: 0,
    y: section.isLabel ? 0 : props.settings.SECTION_TOP_PADDING / 4,
    text: section.name,
    fontSize: section.isLabel ? 24 : 20,
    fill: section.isLabel ? "#1976d2" : "#fff",
    fontStyle: "bold",
    fontFamily: "Arial",
    align: section.isLabel ? "left" : "center",
    width: section.isLabel ? undefined : getSectionWidth(section),
  };
}

function getSubsectionPosition(section: Section, subIdx: number) {
  const x =
    section.subsections
      .slice(0, subIdx)
      .reduce(
        (acc, s) => acc + (s.isLabel ? s.width || 100 : getSubsectionWidth(s)),
        0,
      ) +
    subIdx * props.settings.SUBSECTION_SPACING +
    props.settings.SECTION_SIDE_PADDING;
  return { x, y: props.settings.SECTION_TOP_PADDING };
}

function getSubsectionRectConfig(sub: Subsection) {
  return {
    width: getSubsectionWidth(sub),
    height: getSubsectionHeight(sub),
    fill: COLORS.SUBSECTION_BG,
    stroke: "green",
    strokeWidth: 2,
  };
}

function getSubsectionTitleConfig(sub: Subsection) {
  return {
    x: 0,
    y: -15,
    text: sub.name,
    fontSize: 11,
    fill: "#fff",
    fontFamily: "Arial",
    align: "left",
    width: getSubsectionWidth(sub),
  };
}

function getSubsectionLabelBgConfig(sub: Subsection, section: Section) {
  return {
    width: sub.width || 100,
    height:
      getSectionHeight(section) -
      props.settings.SECTION_TOP_PADDING -
      props.settings.SECTION_BOTTOM_PADDING,
    fill: "#424242",
    opacity: 0.3,
    strokeWidth: 2,
    stroke: COLORS.LABEL_TEXT,
    strokeDashArray: [5, 5],
  };
}

function getSubsectionLabelTextConfig(sub: Subsection, section: Section) {
  const width = sub.width || 100;
  const height =
    getSectionHeight(section) -
    props.settings.SECTION_TOP_PADDING -
    props.settings.SECTION_BOTTOM_PADDING;
  return {
    x: width / 2,
    y: height / 2,
    text: sub.name,
    fontSize: 14,
    fill: COLORS.LABEL_TEXT,
    fontStyle: "bold",
    fontFamily: "Arial",
    align: "center",
    offsetX: width / 2 - 5,
    offsetY: 7,
  };
}

function getRowLabelConfig(rowIdx: number) {
  return {
    x: -12,
    y: rowIdx * seatSpacing.value + props.settings.SEAT_SIZE / 2,
    text: (rowIdx + 1).toString(),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "right",
    verticalAlign: "middle",
    offsetY: 3,
  };
}

function getRowCount(sub: Subsection) {
  return sub.seats?.length ?? 0;
}

function getMaxColumns(sub: Subsection) {
  if (!sub || !Array.isArray(sub.seats) || sub.seats.length === 0) return 0;
  return Math.max(...sub.seats.map((row) => (row ? row.length : 0)));
}

function getColLabelConfig(colIdx: number, sub: Subsection) {
  const labelSpacing = seatSpacing.value; // small extra gap between column letters
  return {
    x: colIdx * labelSpacing + props.settings.SEAT_SIZE / 2,
    y: getSubsectionHeight(sub) + 5,
    text: String.fromCharCode(65 + colIdx),
    fontSize: 8,
    fill: "yellow",
    fontFamily: "Arial",
    align: "center",
    offsetX: 3,
  };
}

function getSubsectionSeats(sub: Subsection) {
  const allSeats: Seat[] = [];
  sub.seats?.forEach((row, rowIdx) => {
    row.forEach((seat, colIdx) => {
      if (seat && seat.state !== "invisible") {
        allSeats.push({
          ...seat,
          x: colIdx * seatSpacing.value + props.settings.SEAT_SIZE / 2,
          y: rowIdx * seatSpacing.value + props.settings.SEAT_SIZE / 2,
        });
      }
    });
  });
  return allSeats;
}

function getSeatConfig(seat: Seat) {
  const isReserved = seat.state === "reserved";
  const isSelected = seat.state === "selected";
  const category = seat.category ? String(seat.category).toLowerCase() : null;
  const classStrokeMap = CLASS_STROKE_MAP;

  let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575";
  let strokeWidth = 1;

  if (category) {
    // prefer category color from passed `categories` prop when available
    try {
      const def = categories.value.find(
        (c) =>
          String(c.label).toLowerCase() === category ||
          String(c.value).toLowerCase() === category,
      );
      // Do NOT apply border when the matched category represents "Ninguno" (value === null)
      if (
        def &&
        typeof def.value !== "undefined" &&
        def.value !== null &&
        def.fill
      ) {
        stroke = def.fill;
        strokeWidth = 4;
      } else if (classStrokeMap[category]) {
        stroke = classStrokeMap[category];
        strokeWidth = 4;
      }
    } catch (err) {
      if (classStrokeMap[category]) {
        stroke = classStrokeMap[category];
        strokeWidth = 4;
      }
    }
  }

  return {
    x: seat.x,
    y: seat.y,
    radius: props.settings.SEAT_SIZE / 2,
    fill: isSelected
      ? COLORS.SEAT_SELECTED
      : isReserved
        ? COLORS.SEAT_RESERVED
        : COLORS.SEAT_FREE,
    stroke,
    strokeWidth,
    opacity: isReserved ? 0.6 : 1,
  };
}

function getSubsectionWidth(sub: Subsection) {
  if (sub.isLabel) return sub.width || 100;
  if (!sub.seats?.length) return 0;
  const maxCols = Math.max(...sub.seats.map((row) => row.length));
  return maxCols * seatSpacing.value - props.settings.SEATS_DISTANCE;
}

function getSubsectionHeight(sub: Subsection) {
  if (sub.isLabel) return 0;
  if (!sub.seats?.length) return 40;
  return sub.seats.length * seatSpacing.value - props.settings.SEATS_DISTANCE;
}

function getSectionWidth(section: Section) {
  if (section.isLabel) return 0;
  if (!section.subsections.length) return 0;
  return (
    section.subsections.reduce(
      (acc, s) => acc + (s.isLabel ? s.width || 100 : getSubsectionWidth(s)),
      0,
    ) +
    (section.subsections.length - 1) * props.settings.SUBSECTION_SPACING +
    props.settings.SECTION_SIDE_PADDING * 2
  );
}

function getSectionHeight(section: Section) {
  if (section.isLabel) return 30;
  if (!section.subsections?.length)
    return (
      props.settings.SECTION_TOP_PADDING + props.settings.SECTION_BOTTOM_PADDING
    );
  const maxRows = Math.max(
    ...section.subsections.map((sub) =>
      sub.isLabel ? 0 : sub.seats?.length || 0,
    ),
  );
  if (maxRows === 0)
    return (
      props.settings.SECTION_TOP_PADDING +
      props.settings.SECTION_BOTTOM_PADDING +
      40
    );
  return (
    maxRows * seatSpacing.value -
    props.settings.SEATS_DISTANCE +
    props.settings.SECTION_TOP_PADDING +
    props.settings.SECTION_BOTTOM_PADDING
  );
}

// Events & interactions
function handleSeatClick(seat: Seat, e: KonvaEvent) {
  // stop Konva/native event propagation so stage click doesn't immediately close the tooltip
  try {
    if (e && e.evt && typeof e.evt.stopPropagation === "function") {
      e.evt.stopPropagation();
    } else if (e && typeof e.cancelBubble !== "undefined") {
      e.cancelBubble = true;
    }
  } catch (err) {
    // ignore
  }

  // compute absolute tooltip position so it remains accurate even if seat objects are re-created
  try {
    const { sectionIdx, subIdx } = parseSeatId(seat.id);
    const section = props.sections[sectionIdx];
    if (section) {
      const sectionPos = getSectionConfig(sectionIdx);
      const subPos = getSubsectionPosition(section, subIdx);
      const absX =
        sectionPos.x +
        subPos.x +
        (seat.x ?? 0) +
        (props.settings.SEAT_SIZE / 2 + 6);
      const absY =
        sectionPos.y +
        subPos.y +
        (seat.y ?? 0) -
        (props.settings.SEAT_SIZE / 2 + 8);
      activeSeat.value = { id: seat.id, x: absX, y: absY, isAbsolute: true };
    } else {
      activeSeat.value = {
        id: seat.id,
        x: seat.x ?? 0,
        y: seat.y ?? 0,
        isAbsolute: false,
      };
    }
  } catch (err) {
    activeSeat.value = {
      id: seat.id,
      x: seat.x ?? 0,
      y: seat.y ?? 0,
      isAbsolute: false,
    };
  }
}

function setSeatCategory(seat: Seat | null, category: string | null) {
  if (!seat) return;
  const original = findSeatById(seat.id);
  const value = category == null ? "Ninguno" : category;
  if (original) {
    original.category = value;
  } else {
    seat.category = value;
  }
  activeSeat.value = null;
}

function findSeatById(id: string) {
  if (!id) return null;
  for (let s = 0; s < props.sections.length; s++) {
    const section = props.sections[s];
    for (
      let subIdx = 0;
      subIdx < (section.subsections?.length || 0);
      subIdx++
    ) {
      const sub = section.subsections[subIdx];
      if (!sub.seats) continue;
      for (let r = 0; r < sub.seats.length; r++) {
        const row = sub.seats[r];
        for (let c = 0; c < row.length; c++) {
          const seat = row[c];
          if (seat && seat.id === id) return seat;
        }
      }
    }
  }
  return null;
}

function handleStageClick(e: KonvaEvent) {
  let node = e.target;
  while (node) {
    const cls = node.getClassName && node.getClassName();
    if (cls === "Circle") return;
    if (cls === "Stage") break;
    node = node.getParent();
  }
  activeSeat.value = null;
}

function handleSeatHover(e: KonvaEvent) {
  const container = e.target.getStage().container();
  container.style.cursor =
    e.target.attrs.opacity < 1 ? "not-allowed" : "pointer";
}

function handleSeatLeave(e: KonvaEvent) {
  e.target.getStage().container().style.cursor = "default";
}

function handleTooltipHover(e: KonvaEvent) {
  try {
    const container = e.target.getStage().container();
    container.style.cursor = "pointer";
  } catch (err) {
    // ignore
  }
}

function handleTooltipLeave(e: KonvaEvent) {
  try {
    const container = e.target.getStage().container();
    container.style.cursor = "default";
  } catch (err) {
    // ignore
  }
}

let _textMeasureCtx: CanvasRenderingContext2D | null = null;

function getTextWidth(text: string, fontSize = 12, fontFamily = "Arial") {
  try {
    if (typeof document === "undefined") return text.length * (fontSize * 0.6);
    if (!_textMeasureCtx) {
      const canvas = document.createElement("canvas");
      _textMeasureCtx = canvas.getContext("2d");
    }
    if (!_textMeasureCtx) return text.length * (fontSize * 0.6);
    _textMeasureCtx.font = `${fontSize}px ${fontFamily}`;
    return _textMeasureCtx.measureText(text).width;
  } catch (err) {
    return text.length * (fontSize * 0.6);
  }
}

function getUnderlineConfig(cat: StageCategory, ci: number) {
  const text = "-> " + cat.label;
  const fontSize = 12;
  const width = getTextWidth(text, fontSize);
  return {
    x: 8,
    y: 26 + ci * 16 + fontSize - 2,
    width,
    height: 2,
    fill: cat.fill,
    cornerRadius: 1,
  };
}

// Parse seat id robustly: extract numeric parts and map to section/sub indexes
function parseSeatId(id: string) {
  if (!id) return { sectionIdx: 0, subIdx: 0 };
  const nums = String(id).match(/\d+/g);
  if (!nums || nums.length === 0) return { sectionIdx: 0, subIdx: 0 };
  // Expecting at least [section, subsection, row, col] or ['section','1','2','3'] formats
  const sectionIdx = Math.max(0, parseInt(nums[0], 10) - 1);
  const subIdx = Math.max(0, parseInt(nums[1] || 1, 10) - 1);
  return { sectionIdx, subIdx };
}
</script>

<style scoped>
.stage-container {
  position: relative;
  width: 100%;
}

/* Mejorar scroll en mobile */
@media (max-width: 600px) {
  .stage-container {
    -webkit-overflow-scrolling: touch;
  }
}
</style>
