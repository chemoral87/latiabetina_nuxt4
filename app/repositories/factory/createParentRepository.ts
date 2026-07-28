import { withNotify } from "./withNotify"

export type ApiFn = <T = unknown>(path: string, opts?: Record<string, unknown>) => Promise<T>

export function createParentRepository(api: ApiFn, resource: string) {
  return {
    index<T = unknown>(parentId: number | string) {
      return withNotify(api<T>(`${resource}/${parentId}`))
    },

    show<T = unknown>(parentId: number | string, id: number | string) {
      return withNotify(api<T>(`${resource}/${parentId}/${id}`))
    },

    filter<T = unknown>(parentId: number | string, params?: Record<string, unknown>) {
      return withNotify(api<T>(`${resource}/${parentId}/filter`, { params }))
    },

    create<T = unknown>(parentId: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`${resource}/${parentId}`, { method: "POST", body: payload }))
    },

    update<T = unknown>(parentId: number | string, id: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`${resource}/${parentId}/${id}`, { method: "PUT", body: payload }))
    },

    delete<T = unknown>(parentId: number | string, id: number | string) {
      return withNotify(api<T>(`${resource}/${parentId}/${id}`, { method: "DELETE" }))
    },
  }
}

export type ParentRepository = ReturnType<typeof createParentRepository>
