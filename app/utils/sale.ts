const STATUS_LABELS: Record<string, string> = {
  completed: "Completada",
  cancelled: "Cancelada",
  refunded: "Reembolsada",
  pending: "Pendiente",
  preparing: "Preparando",
  COM: "Completada",
  PEN: "Pendiente",
  PRE: "Preparando",
  CAN: "Cancelada",
  REF: "Reembolsada",
  REA: "Listo",
}

const STATUS_COLORS: Record<string, string> = {
  completed: "success",
  cancelled: "error",
  refunded: "warning",
  pending: "orange",
  preparing: "deep-orange",
  COM: "success",
  PEN: "orange",
  PRE: "deep-orange",
  CAN: "error",
  REF: "warning",
  REA: "info",
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
}

const PAYMENT_COLORS: Record<string, string> = {
  cash: "success",
  card: "primary",
  transfer: "info",
}

/** Human label for a sale status code/name, e.g. "PRE" -> "Preparando". */
export function saleStatusLabel(status?: string | null): string {
  if (!status) return "—"
  return STATUS_LABELS[status] || STATUS_LABELS[status.toLowerCase()] || status
}

/** Vuetify color for a sale status code/name. */
export function saleStatusColor(status?: string | null): string {
  if (!status) return "grey"
  return STATUS_COLORS[status] || STATUS_COLORS[status.toLowerCase()] || "grey"
}

/** Human label for a payment method, e.g. "cash" -> "Efectivo". */
export function salePaymentLabel(method?: string | null): string {
  if (!method) return "—"
  return PAYMENT_LABELS[method] || method
}

/** Vuetify color for a payment method. */
export function salePaymentColor(method?: string | null): string {
  if (!method) return "grey"
  return PAYMENT_COLORS[method] || "grey"
}
