import { createCommonRepository } from "~/repositories/factory/createCommonRepository"
import { createParentRepository } from "~/repositories/factory/createParentRepository"
import { createRoleRepository } from "~/repositories/RoleRepository"
import { withNotify } from "~/repositories/factory/withNotify"

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

  const Sale = {
    ...createCommonRepository($api, "/sale"),
    // Daily summary for cash close: GET /sale/daily?date=YYYY-MM-DD&org_id=X
    daily<T = unknown>(date: string, orgId: number | string | null = null) {
      const params: Record<string, unknown> = { date }
      if (orgId) params.org_id = orgId
      return withNotify($api<T>("/sale/daily", { params }))
    },
    // KDS kitchen display: all sales with preparation items (GET /sale/kds)
    kds<T = unknown>() {
      return withNotify($api<T>("/sale/kds"))
    },
    updateItem<T = unknown>(saleId: number | string, itemId: number | string, status: string) {
      return withNotify($api<T>(`/sale/${saleId}/item/${itemId}`, { method: "PATCH", body: { status } }))
    },
  }

  const Product = {
    ...createCommonRepository($api, "/product"),
    // POS catalog: GET /product/pos (optionally filtered by org)
    pos<T = unknown>(orgId: number | string | null = null) {
      const params: Record<string, unknown> = orgId ? { org_id: orgId } : {}
      return withNotify($api<T>("/product/pos", { params }))
    },
    // Persist card drag order: POST /product/reorder with { ids }
    reorder<T = unknown>(ids: (number | string)[]) {
      return withNotify($api<T>("/product/reorder", { method: "POST", body: { ids } }))
    },
  }

  const Testimony = {
    ...createCommonRepository($api, "/testimony"),
    updateStatus<T = unknown>(id: number | string, status: string) {
      return withNotify($api<T>(`/testimony/${id}/status`, { method: "PUT", body: { status } }))
    },
  }

  const ChurchEvent = {
    ...createCommonRepository($api, "/church-event"),
    copy<T = unknown>(id: number | string, payload: Record<string, unknown>) {
      return withNotify($api<T>(`/church-event/${id}/copy`, { method: "POST", body: payload }))
    },
    calendar<T = unknown>(params: Record<string, unknown>) {
      return withNotify($api<T>("/church-event/calendar", { params }))
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
    Testimony,
    ChurchEvent,
    Sale,
    Product,
    ConsoSheet: createCommonRepository($api, "/conso-sheet"),
    ChurchMember: createCommonRepository($api, "/church-member"),
  }
}
