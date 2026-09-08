import { withNotify } from "./factory/withNotify"
import type { ApiFn } from "./factory/types"

export function createWhatsAppRepository(api: ApiFn) {
  return {
    logs<T = unknown>(params?: Record<string, unknown>) {
      return withNotify(api<T>("/whatsapp/logs", { params }))
    },
    status<T = unknown>() {
      return withNotify(api<T>("/whatsapp/status"))
    },
    send<T = unknown>(payload: Record<string, unknown>) {
      return withNotify(api<T>("/whatsapp/send", { method: "POST", body: payload }))
    },
    resend<T = unknown>(id: number | string) {
      return withNotify(api<T>(`/whatsapp/logs/${id}/resend`, { method: "POST" }))
    },
  }
}
