import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createOrganizationRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/organization"),
    config<T = unknown>(orgId: string | number) {
      return api<T>(`/organization/${orgId}/config`)
    },
    createConfig<T = unknown>(orgId: string | number, payload: Record<string, unknown>) {
      return api<T>(`/organization/${orgId}/config`, { method: "POST", body: payload })
    },
  }
}
