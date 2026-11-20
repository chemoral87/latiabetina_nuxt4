import { createCommonRepository } from './factory/createCommonRepository'
import { withNotify } from './factory/withNotify'
import type { ApiFn } from './factory/types'

export function createConsoSheetRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, '/conso-sheet'),
    consolidators<T = unknown>(params: Record<string, unknown>) {
      return withNotify(api<T>('/conso-sheet/consolidators', { params }))
    },
    myIndex<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>('/conso-sheet/my', { params }))
    },
    myShow<T = unknown>(id: number | string) {
      return withNotify(api<T>(`/conso-sheet/my/${id}`))
    },
    myCreate<T = unknown>(payload: Record<string, unknown>) {
      return withNotify(api<T>('/conso-sheet/my', { method: 'POST', body: payload }))
    },
    myUpdate<T = unknown>(id: number | string, payload: Record<string, unknown>) {
      return withNotify(api<T>(`/conso-sheet/my/${id}`, { method: 'PUT', body: payload }))
    },
    myDelete<T = unknown>(id: number | string) {
      return withNotify(api<T>(`/conso-sheet/my/${id}`, { method: 'DELETE' }))
    },
  }
}
