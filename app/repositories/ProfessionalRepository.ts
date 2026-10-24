import { createCommonRepository } from './factory/createCommonRepository'
import { withNotify } from './factory/withNotify'
import type { ApiFn } from './factory/types'

export function createProfessionalRepository(api: ApiFn) {
  return {
    search<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>('/professionals/public', { params }))
    },
    mine<T = unknown>() {
      return withNotify(api<T>('/professionals/mine'))
    },
    // ponytail: explicit `create` removed — the spread below already defines it and was overwriting this one
    ...createCommonRepository(api, '/professionals'),
  }
}
