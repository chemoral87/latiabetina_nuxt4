import { createCommonRepository } from "~/repositories/factory/createCommonRepository"
import { createParentRepository } from "~/repositories/factory/createParentRepository"

export function useRepository() {
  const { $api } = useApi()

  const Profile = {
    ...createParentRepository($api, "/profile"),
    favorite<T = unknown>(parentId: number | string, id: number | string) {
      return $api<T>(`/profile/${parentId}/${id}/favorite`, { method: "POST" })
    },
  }

  return {
    Organization: createCommonRepository($api, "/organization"),
    User: createCommonRepository($api, "/user"),
    Role: createCommonRepository($api, "/role"),
    Permission: createCommonRepository($api, "/permission"),
    Profile,
  }
}
