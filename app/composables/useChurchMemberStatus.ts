export const churchMemberStatuses = [
  { title: "Activo", value: "ACTIVO" },
  { title: "No contesta", value: "NO CONTESTA" },
  { title: "No molestar", value: "NO MOLESTAR" },
  { title: "Visita", value: "VISITA" },
] as const

export const churchMemberStatusColors: Record<string, string> = {
  ACTIVO: "green",
  "NO CONTESTA": "amber",
  "NO MOLESTAR": "red",
  VISITA: "blue",
}

export const churchMemberStatusBgClassMap: Record<string, string> = {
  ACTIVO: "status-bg-activo",
  "NO CONTESTA": "status-bg-no-contesta",
  "NO MOLESTAR": "status-bg-no-molestar",
  VISITA: "status-bg-visita",
}

export function useChurchMemberStatus() {
  function statusLabel(status: unknown): string {
    const found = churchMemberStatuses.find((s) => s.value === status)
    return found ? found.title : String(status ?? "Sin estado")
  }

  function statusColor(status: unknown): string {
    return churchMemberStatusColors[String(status)] ?? "grey"
  }

  function statusBgClass(status: unknown): string {
    return churchMemberStatusBgClassMap[String(status)] ?? ""
  }

  return {
    statuses: churchMemberStatuses,
    statusColors: churchMemberStatusColors,
    statusBgClassMap: churchMemberStatusBgClassMap,
    statusLabel,
    statusColor,
    statusBgClass,
  }
}
