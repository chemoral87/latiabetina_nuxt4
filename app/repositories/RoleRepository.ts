import { createCommonRepository } from "./factory/createCommonRepository"
import type { ApiFn } from "./factory/createCommonRepository"

export interface RoleItem {
  id: number
  name: string
}

export function createRoleRepository(api: ApiFn, resource: string) {
  const common = createCommonRepository(api, resource)
  function distribution<T = unknown>(id: number | string, params?: Record<string, unknown>) {
    return api<T>(`${resource}/${id}/distribution`, { params })
  }
  function children<T = unknown>(id: number | string, payload: Record<string, unknown>) {
    return api<T>(`${resource}/${id}`, { method: "PUT", body: payload })
  }
  return { ...common, distribution, children }
}

export type RoleRepository = ReturnType<typeof createRoleRepository>
