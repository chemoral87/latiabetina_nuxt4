import { createCommonRepository } from "~/repositories/factory/createCommonRepository"
import { createParentRepository } from "~/repositories/factory/createParentRepository"
import { createRoleRepository } from "~/repositories/RoleRepository"

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
    Role: createRoleRepository($api, "/role"),
    Permission: createCommonRepository($api, "/permission"),
    Profile,
  }
}
