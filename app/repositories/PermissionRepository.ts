import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createPermissionRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/permission"),
    distribution<T = unknown>(id: number | string) {
      return api<T>(`/permission/${id}/distribution`)
    },
  }
}
