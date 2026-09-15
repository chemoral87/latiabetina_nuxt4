import { createCommonRepository } from './factory/createCommonRepository'
import type { ApiFn } from './factory/types'

export function createAssistanceRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, '/assistance'),
  }
}
