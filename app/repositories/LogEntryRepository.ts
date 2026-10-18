import { createCommonRepository } from './factory/createCommonRepository'
import { withNotify } from './factory/withNotify'
import type { ApiFn } from './factory/types'

export function createLogEntryRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, '/log-entry'),
    testError<T = unknown>() {
      return withNotify(api<T>('/log-entry/test-error', { method: 'POST' }))
    },
  }
}
