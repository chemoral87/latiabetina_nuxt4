import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createChurchEventRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/church-event"),
    copy<T = unknown>(id: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`/church-event/${id}/copy`, { method: "POST", body: payload }))
    },
    calendar<T = unknown>(params: Record<string, unknown>) {
      return withNotify(api<T>("/church-event/calendar", { params }))
    },
  }
}
