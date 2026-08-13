import { useNotifyStore } from "~/composables/useNotify"
import { useValidationErrors } from "~/composables/useValidationErrors"

const NETWORK_ERROR_MESSAGE = "Error de conexión, verifique su conexión a Internet."
const UNKNOWN_ERROR_MESSAGE = "Ha ocurrido un error inesperado"

// Status codes that carry a user-facing message worth notifying (matches
// the old axios.js MESSAGE_ERROR_CODES: 401, 404, 405). 422 is intentionally
// excluded — validation errors are field-level, not a toast, same as before.
// 403 is included so backend permission denials surface as a danger snackbar.
const MESSAGE_ERROR_STATUSES = [401, 403, 404, 405]

function notifySuccess(res: unknown) {
  if (!import.meta.client || !res || typeof res !== "object") return
  const data = res as Record<string, unknown>
  if (data.success || data.warning || data.error) {
    useNotifyStore().notify(data as { success?: string; warning?: string; error?: string })
  }
}

function notifyError(err: unknown) {
  if (!import.meta.client) return

  if (err && typeof err === "object" && "code" in err) {
    const codeErr = err as { code?: string }
    if (codeErr.code === "UNAUTHENTICATED") {
      // Session expired / token unavailable: useApi already cleared the
      // session and is redirecting to /login. Don't stack a toast on top.
      return
    }
  }

  if (err && typeof err === "object" && "status" in err) {
    const fetchErr = err as { status?: number; data?: { message?: string } }
    const status = fetchErr.status

    if (status === undefined) {
      useNotifyStore().notify({ error: NETWORK_ERROR_MESSAGE })
      return
    }

    if (MESSAGE_ERROR_STATUSES.includes(status)) {
      const message = fetchErr.data?.message ?? fetchErr.data?.error
      if (message) {
        useNotifyStore().notify({ error: message })
      }
    }
    return
  }

  useNotifyStore().notify({ error: UNKNOWN_ERROR_MESSAGE })
}

export async function withNotify<T>(promise: Promise<T>): Promise<T> {
  try {
    const res = await promise
    notifySuccess(res)
    return res
  } catch (err) {
    notifyError(err)
    useValidationErrors().extractFromError(err)
    throw err
  }
}
