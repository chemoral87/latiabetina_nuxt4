import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createConsoSheetRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/conso-sheet"),
    consolidators<T = unknown>(params: Record<string, unknown>) {
      return withNotify(api<T>("/conso-sheet/consolidators", { params }))
    },
  }
}
