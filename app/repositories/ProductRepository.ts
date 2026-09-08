import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createProductRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/product"),
    pos<T = unknown>(orgId: number | string | null = null) {
      const params: Record<string, unknown> = orgId ? { org_id: orgId } : {}
      return withNotify(api<T>("/product/pos", { params }))
    },
    reorder<T = unknown>(ids: (number | string)[]) {
      return withNotify(api<T>("/product/reorder", { method: "POST", body: { ids } }))
    },
  }
}
