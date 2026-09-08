import { withNotify } from "./withNotify"
import type { ApiFn } from "./types"

export function createCommonRepository(api: ApiFn, resource: string) {
  return {
    index<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>(resource, { params }))
    },

    show<T = unknown>(id: number | string) {
      return withNotify(api<T>(`${resource}/${id}`))
    },

    filter<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>(`${resource}/filter`, { params }))
    },

    create<T = unknown>(payload: Record<string, unknown>) {
      return withNotify(api<T>(resource, { method: "POST", body: payload }))
    },

    update<T = unknown>(id: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`${resource}/${id}`, { method: "PUT", body: payload }))
    },

    delete<T = unknown>(id: number | string) {
      return withNotify(api<T>(`${resource}/${id}`, { method: "DELETE" }))
    },
  }
}

export type CommonRepository = ReturnType<typeof createCommonRepository>
