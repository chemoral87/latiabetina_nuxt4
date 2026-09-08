import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createChurchMemberRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/church-member"),
    updateStatus<T = unknown>(memberId: number | string, status: string, reason?: string) {
      const payload: Record<string, unknown> = { status }
      if (reason) payload.reason = reason
      return withNotify(api<T>(`/church-member/${memberId}/status`, { method: "PUT", body: payload }))
    },
    statusLogs<T = unknown>(memberId: number | string) {
      return withNotify(api<T>(`/church-member/${memberId}/status-logs`))
    },
    medals<T = unknown>(memberId: number | string) {
      return withNotify(api<T>(`/church-member/${memberId}/medals`))
    },
    createMedal<T = unknown>(memberId: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`/church-member/${memberId}/medals`, { method: "POST", body: payload }))
    },
    consolidators<T = unknown>(memberId: number | string) {
      return withNotify(api<T>(`/church-member/${memberId}/consolidators`))
    },
    syncConsolidators<T = unknown>(memberId: number | string, consolidatorIds: (number | string)[]) {
      return withNotify(api<T>(`/church-member/${memberId}/consolidators`, { method: "PUT", body: { consolidator_ids: consolidatorIds } }))
    },
    consolidatorLogs<T = unknown>(memberId: number | string) {
      return withNotify(api<T>(`/church-member/${memberId}/consolidator-logs`))
    },
    consolidatorLogsIndex<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>("/church-member/consolidator-logs", { params }))
    },
  }
}

export function createChurchMemberTrackingLogRepository(api: ApiFn) {
  return {
    index<T = unknown>(memberId: number | string, params?: Record<string, unknown>) {
      return withNotify(api<T>(`/church-member/${memberId}/tracking-logs`, { params }))
    },
    create<T = unknown>(memberId: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`/church-member/${memberId}/tracking-logs`, { method: "POST", body: payload }))
    },
    update<T = unknown>(memberId: number | string, logId: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`/church-member/${memberId}/tracking-logs/${logId}`, { method: "PUT", body: payload }))
    },
    delete<T = unknown>(memberId: number | string, logId: number | string) {
      return withNotify(api<T>(`/church-member/${memberId}/tracking-logs/${logId}`, { method: "DELETE" }))
    },
    logsIndex<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>("/church-member/tracking-logs", { params }))
    },
    allLogs<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>("/church-member/tracking-logs/all", { params }))
    },
    allLogsSummary<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>("/church-member/tracking-logs/all/summary", { params }))
    },
  }
}
