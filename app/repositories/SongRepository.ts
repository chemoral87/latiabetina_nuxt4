import { createCommonRepository } from "./factory/createCommonRepository"
import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createSongRepository(api: ApiFn) {
  return {
    ...createCommonRepository(api, "/song"),
  }
}
