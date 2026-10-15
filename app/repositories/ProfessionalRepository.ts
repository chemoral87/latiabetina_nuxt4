import { createCommonRepository } from './factory/createCommonRepository'
import { withNotify } from './factory/withNotify'
import type { ApiFn } from './factory/types'

export function createProfessionalRepository(api: ApiFn) {
  return {
    search<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>('/professionals/public', { params }))
    },
    create<T = unknown>(payload: Record<string, unknown>) {
      return withNotify(api<T>('/professionals', { method: 'POST', body: payload }))
    },
    mine<T = unknown>() {
      return withNotify(api<T>('/professionals/mine'))
    },
    ...createCommonRepository(api, '/professionals'),
  }
}
