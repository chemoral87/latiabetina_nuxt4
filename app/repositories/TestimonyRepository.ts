import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createTestimonyRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/testimony"),
    updateStatus<T = unknown>(id: number | string, status: string) {
      return withNotify(api<T>(`/testimony/${id}/status`, { method: "PUT", body: { status } }))
    },
  }
}
