import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createSaleRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/sale"),
    daily<T = unknown>(date: string, orgId: number | string | null = null) {
      const params: Record<string, unknown> = { date }
      if (orgId) params.org_id = orgId
      return withNotify(api<T>("/sale/daily", { params }))
    },
    kds<T = unknown>() {
      return withNotify(api<T>("/sale/kds"))
    },
    complete<T = unknown>(saleId: number | string) {
      return withNotify(api<T>(`/sale/${saleId}/complete`, { method: "PATCH" }))
    },
    updateItem<T = unknown>(saleId: number | string, itemId: number | string, status: string) {
      return withNotify(api<T>(`/sale/${saleId}/item/${itemId}`, { method: "PATCH", body: { status } }))
    },
  }
}
