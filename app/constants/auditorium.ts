export interface StageCategory {
  label: string;
  value: string | null;
  fill: string;
}

// ── Stage categories ──────────────────────────────────────────────────────────
export const STAGE_CATEGORIES: StageCategory[] = [
  { label: "Servidores", value: "Servidores", fill: "#9e9e9e" },
  { label: "Nuevos", value: "Nuevos", fill: "#1976d2" },
  { label: "Discapacitados", value: "Discapacitados", fill: "#ffff00" },
  { label: "Carriolas", value: "Carriolas", fill: "#008f39" },
  { label: "Lideres", value: "Lideres", fill: "#f44336" },
  { label: "Embarazadas", value: "Embarazadas", fill: "#9c27b0" },
  { label: "Silla Ruedas", value: "SillaRuedas", fill: "#FFFFFF" },
  { label: "Ninguno", value: null, fill: "#000" },
];

export const CLASS_STROKE_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  STAGE_CATEGORIES.forEach((category) => {
    if (category.value && category.value !== null) {
      map[category.value.toLowerCase()] = category.fill;
    }
  });
  return map;
})();

// ── Status configuration ──────────────────────────────────────────────────────
export interface StatusConfig {
  active: boolean;
  label?: string;
  color: string;
  icon?: string;
  mdi?: string;
  icon_scale?: number;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  e: {
    active: true,
    label: "Vacío",
    color: "#ffeb3b",
    icon: "M12,20A8,8 0 1,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 1,0 22,12A10,10 0 0,0 12,2Z",
    mdi: "mdi-circle-outline",
    icon_scale: 1.7,
  },
  h: {
    color: "#1976D2",
    icon: "M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M10.5,7H13.5A2,2 0 0,1 15.5,9V14.5H14V22H10V14.5H8.5V9A2,2 0 0,1 10.5,7Z",
    label: "Hombre",
    mdi: "mdi-human-male",
    active: true,
    icon_scale: 1.7,
  },
  m: {
    color: "#E91E63",
    icon: "M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M10.5,22V16H7.5L10.09,8.41C10.34,7.59 11.1,7 12,7C12.9,7 13.66,7.59 13.91,8.41L16.5,16H13.5V22H10.5Z",
    label: "Mujer",
    mdi: "mdi-human-female",
    active: true,
    icon_scale: 1.7,
  },
  i: {
    active: true,
    label: "Nuevo",
    mdi: "mdi-face-man-shimmer",
    color: "#2E7D32",
    icon: "M18.41 3.41L16 4.5L18.41 5.59L19.5 8L20.6 5.59L23 4.5L20.6 3.41L19.5 1M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 10.53 21.67 9.13 21.1 7.87L19.86 10.59C19.94 11.05 20 11.5 20 12C20 16.43 16.43 20 12 20C7.57 20 4 16.43 4 12C4 11.96 4 11.91 4 11.87A10 10 0 0 0 9.74 6.31A10 10 0 0 0 17.5 10A10 10 0 0 0 18.83 9.91L17.35 6.65L12.6 4.5L16.13 2.9C14.87 2.33 13.47 2 12 2M9 11.75A1.25 1.25 0 0 0 7.75 13A1.25 1.25 0 0 0 9 14.25A1.25 1.25 0 0 0 10.25 13A1.25 1.25 0 0 0 9 11.75M15 11.75A1.25 1.25 0 0 0 13.75 13A1.25 1.25 0 0 0 15 14.25A1.25 1.25 0 0 0 16.25 13A1.25 1.25 0 0 0 15 11.75Z",
    icon_scale: 1.6,
  },
  n: {
    active: true,
    color: "#CE93D8",
    icon: "M19.5 1L18.41 3.41L16 4.5L18.41 5.59L19.5 8L20.6 5.59L23 4.5L20.6 3.41L19.5 1M12 2C6.5 2 2 6.5 2 12V22H22V12C22 10.53 21.67 9.13 21.1 7.87L19.86 10.59C19.94 11.05 20 11.5 20 12C20 16.43 16.43 20 12 20C7.57 20 4 16.43 4 12C4 11.96 4 11.91 4 11.87A10 10 0 0 0 9.74 6.31A10 10 0 0 0 17.5 10A10 10 0 0 0 18.83 9.91L17.35 6.65L12.6 4.5L16.13 2.9C14.87 2.33 13.47 2 12 2M9 11.75A1.25 1.25 0 0 0 7.75 13A1.25 1.25 0 0 0 9 14.25A1.25 1.25 0 0 0 10.25 13A1.25 1.25 0 0 0 9 11.75M15 11.75A1.25 1.25 0 0 0 13.75 13A1.25 1.25 0 0 0 15 14.25A1.25 1.25 0 0 0 16.25 13A1.25 1.25 0 0 0 15 11.75Z",
    label: "Nueva",
    mdi: "mdi-face-woman-shimmer",
    icon_scale: 1.6,
  },
  t: {
    color: "#F57C00",
    icon: "M16.5 2.25C17.33 2.25 18 2.92 18 3.75C18 4.58 17.33 5.25 16.5 5.25C15.67 5.25 15 4.58 15 3.75C15 2.92 15.67 2.25 16.5 2.25M20 18C21.11 18 22 18.9 22 20C22 21.11 21.11 22 20 22C19.26 22 18.61 21.6 18.27 21H8.73C8.39 21.6 7.74 22 7 22C5.9 22 5 21.11 5 20C5 18.9 5.9 18 7 18C7.74 18 8.39 18.4 8.73 19H13V13.5L9.73 11.23L6.77 14C6.36 14.37 5.73 14.34 5.35 13.94L2.28 10.65C1.91 10.24 1.93 9.61 2.33 9.23C2.74 8.86 3.37 8.88 3.74 9.28L6.13 11.84L13.26 5.2L13.3 5.18C13.72 4.82 14.35 4.88 14.71 5.3L16.97 8H20C20.55 8 21 8.45 21 9C21 9.55 20.55 10 20 10H16.5C16.15 10 15.85 9.82 15.67 9.56L14.17 7.77L11.64 10.13L14.57 12.18H14.57C14.83 12.36 15 12.66 15 13V19H15.61C16.04 17.13 17.63 15.7 19.58 15.5L18.81 11H20.31L21.39 17.34C20.97 17.12 20.5 17 20 17C18.69 17 17.58 17.84 17.17 19H18.27C18.61 18.4 19.26 18 20 18Z",
    label: "Teen (ados)",
    mdi: "mdi-human-scooter",
    active: true,
    icon_scale: 1.7,
  },
  c: {
    color: "#00BCD4",
    icon: "M12,2A3,3 0 0,1 15,5A3,3 0 0,1 12,8A3,3 0 0,1 9,5A3,3 0 0,1 12,2M11,22H8V16H6V9H18V16H16V22H13V18H11V22Z",
    label: "Niño",
    mdi: "mdi-human-child",
    active: true,
    icon_scale: 1.7,
  },
  por: {
    color: "#7B1FA2",
    icon: "M7 2C5.9 2 5 2.9 5 4S5.9 6 7 6 9 5.11 9 4 8.11 2 7 2M5 7C3.89 7 3 7.89 3 9V15H5V22H10V11.6L12.53 16H14.97L16 14.66V22H20V17H21V14C21 12.89 20.11 12 19 12H16.5C15.9 12 15.37 12.26 15 12.68C14.67 13.1 14.32 13.56 14 14H13.69L10 7.66C9.84 7.38 9.22 7 8.5 7H5M18 8C17.17 8 16.5 8.67 16.5 9.5S17.17 11 18 11 19.5 10.33 19.5 9.5 18.83 8 18 8Z",
    label: "Porteador",
    mdi: "mdi-human-male-child",
    active: false,
    icon_scale: 1.7,
  },
};

// Backwards-compat derived maps
export const STATUS_COLORS: Record<string, string> = Object.keys(
  STATUS_CONFIG,
).reduce(
  (acc, key) => {
    acc[key] = STATUS_CONFIG[key].color;
    return acc;
  },
  {} as Record<string, string>,
);

export const STATUS_ICONS: Record<string, string> = Object.keys(
  STATUS_CONFIG,
).reduce(
  (acc, key) => {
    acc[key] = STATUS_CONFIG[key].icon ?? "";
    return acc;
  },
  {} as Record<string, string>,
);

// ── Color palettes ────────────────────────────────────────────────────────────
export const COLORS = {
  SEAT_SELECTED: "#1976d2",
  SEAT_FREE: "#ffeb3b",
  SEAT_RESERVED: "lightgrey",
  SECTION_BG: "#222d3b",
  SUBSECTION_BG: "#e0e0e0",
  LABEL_TEXT: "#ff9800",
};

// ── Percentage colour helper ──────────────────────────────────────────────────
export const getPercentageColor = (percent: number): string => {
  if (percent >= 86) return "#F44336"; // red
  if (percent >= 57) return "#FF9800"; // orange
  return "#4CAF50"; // green
};

// ── Default stage layout settings ────────────────────────────────────────────
export const DEFAULT_SETTINGS = {
  SEAT_SIZE: 12,
  SEATS_DISTANCE: 2,
  SUBSECTION_SPACING: 30,
  SECTION_TOP_MARGIN: 0,
  SECTION_BOTTOM_MARGIN: 15,
  SECTION_TOP_PADDING: 32,
  SECTION_SIDE_PADDING: 0,
  SECTION_BOTTOM_PADDING: 0,
  DRAG_THRESHOLD: 18, // px to differentiate drag from click/tap
};

// ── Subsection border palette ────────────────────────────────────────────────
// Distinct border colors used to tell subsections apart on the stage. When
// there are more subsections than colors, the palette cycles back from index 0.
export const SUBSECTION_BORDER_COLORS = [
  "#f44336", // red
  "#2196f3", // blue
  "#4caf50", // green
  "#ff9800", // orange
  "#9c27b0", // purple
  "#00bcd4", // cyan
];

export const SUBSECTION_BORDER_WIDTH = 2;

// ── Default export for auto-import compatibility ──────────────────────────────
export default {
  STAGE_CATEGORIES,
  CLASS_STROKE_MAP,
  STATUS_CONFIG,
  STATUS_COLORS,
  STATUS_ICONS,
  COLORS,
  getPercentageColor,
  DEFAULT_SETTINGS,
};
