import { createCommonRepository } from './factory/createCommonRepository'
import { withNotify } from './factory/withNotify'
import type { ApiFn } from './factory/types'

export function createScoreRepository(api: ApiFn) {
  const common = createCommonRepository(api, '/music-scores')

  function importFile<T = unknown>(file: File) {
    const body = new FormData()
    body.append('file', file)
    return withNotify(api<T>('/music-scores/import', { method: 'POST', body }))
  }

  return { ...common, importFile }
}
