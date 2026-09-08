import { createParentRepository } from "./factory/createParentRepository"
import type { ApiFn } from "./factory/types"

export function createProfileRepository(api: ApiFn) {
  return {
    ...createParentRepository(api, "/profile"),
    favorite<T = unknown>(parentId: number | string, id: number | string) {
      return api<T>(`/profile/${parentId}/${id}/favorite`, { method: "POST" })
    },
  }
}
