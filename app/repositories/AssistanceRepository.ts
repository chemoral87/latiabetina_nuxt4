import { createCommonRepository } from './factory/createCommonRepository'
import type { ApiFn } from './factory/types'

export function createAssistanceRepository(api: ApiFn) {
  const common = createCommonRepository(api, '/assistance')

  return {
    ...common,
    chart<T = unknown>(params?: Record<string, unknown>) {
      return api<T>('/assistance/chart', { params })
    },
  }
}
