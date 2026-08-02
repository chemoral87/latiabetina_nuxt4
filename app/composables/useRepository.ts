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

  const OrganizationConfig = {
    index<T = unknown>(orgId: string | number) {
      return $api<T>(`/organization/${orgId}/config`)
    },
    create<T = unknown>(orgId: string | number, payload: Record<string, unknown>) {
      return $api<T>(`/organization/${orgId}/config`, { method: "POST", body: payload })
    },
  }

  return {
    Organization: createCommonRepository($api, "/organization"),
    OrganizationConfig,
    Auditorium: createCommonRepository($api, "/auditorium"),
    AuditoriumEvent: createCommonRepository($api, "/auditorium-event"),
    AuditoriumEventSeat: createCommonRepository($api, "/auditorium-event-seat"),
    AuditoriumEventSeatLog: createCommonRepository($api, "/auditorium-event-seat-log"),
    User: createCommonRepository($api, "/user"),
    Role: createRoleRepository($api, "/role"),
    Permission: {
      ...createCommonRepository($api, "/permission"),
      distribution<T = unknown>(id: number | string) {
        return $api<T>(`/permission/${id}/distribution`)
      },
    },
    Profile,
  }
}
