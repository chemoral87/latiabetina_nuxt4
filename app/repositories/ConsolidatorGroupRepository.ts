import { createCommonRepository } from './factory/createCommonRepository'
import { withNotify } from './factory/withNotify'
import type { ApiFn } from './factory/types'

export function createConsolidatorGroupRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, '/consolidator-group'),
    updateWithoutNotify<T = unknown>(id: number | string, payload: Record<string, unknown>) {
      return api<T>(`/consolidator-group/${id}`, { method: 'PUT', body: payload })
    },
    syncMembers<T = unknown>(id: number | string, userIds: (number | string)[]) {
      return withNotify(
        api<T>(`/consolidator-group/${id}/members`, {
          method: 'PUT',
          body: { user_ids: userIds },
        })
      )
    },
  }
}
