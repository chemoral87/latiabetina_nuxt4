import { useRepository } from "~/composables/useRepository"
import { useNotifyStore } from "~/composables/useNotify"
import { formatShortDate } from "~/utils/date"

/**
 * Shared actions for the ChurchEvent pages (index & calendar).
 *
 * Each page must provide:
 *   - loadChurchEvents(overrides)  — triggers a data reload
 *   - routeQuery()                 — returns extra route query params for edit/new navigation
 *   - deleteReloadOverrides()      — returns extra overrides passed to loadChurchEvents after delete
 *   - the dialog state refs (copy + delete)
 */
export function useChurchEventActions(opts: {
  loadChurchEvents: (overrides?: Record<string, unknown>) => Promise<void>
  routeQuery: () => Record<string, unknown>
  deleteReloadOverrides: () => Record<string, unknown>
  churchEventDialogCopy: Ref<boolean>
  copyingChurchEvent: Ref<Record<string, unknown>>
  copying: Ref<boolean>
  churchEventDialogDelete: Ref<boolean>
  dialogDelete: Ref<Record<string, unknown>>
  deleting: Ref<boolean>
  skipFilterWatch: Ref<boolean>
  filterChurchEvent: Ref<string>
}) {
  const { ChurchEvent } = useRepository()
  const notify = useNotifyStore()

  // ── Copy ────────────────────────────────────────────────────────────────

  function openCopyDialog(item: unknown) {
    opts.copyingChurchEvent.value = item as Record<string, unknown>
    opts.churchEventDialogCopy.value = true
  }

  async function copyChurchEvent({ churchEvent, dates, recurrence }: { churchEvent: Record<string, unknown>; dates?: string[]; recurrence?: Record<string, unknown> }) {
    try {
      opts.copying.value = true
      const payload = dates ? { dates } : { recurrence }
      const result = await ChurchEvent.copy<{ created?: unknown[]; skipped?: string[] }>(churchEvent.id as number, payload as Record<string, unknown>)

      opts.churchEventDialogCopy.value = false

      const created = result?.created ?? []
      const skipped = result?.skipped ?? []

      if (created.length > 0) {
        notify.notify({ success: `${created.length} evento(s) copiado(s) correctamente.` })
      }

      if (skipped.length > 0) {
        const dateList = skipped.map((d) => formatShortDate(String(d))).join(", ")
        notify.notify({ warning: `Las siguientes fechas no se copiaron porque ya existe un evento con el mismo nombre: ${dateList}` })
      }

      if (created.length === 0 && skipped.length === 0) {
        notify.notify({ warning: "No se copiaron eventos." })
      }

      await opts.loadChurchEvents()
    } catch (error) {
      console.error("Error al copiar evento", error)
    } finally {
      opts.copying.value = false
    }
  }

  // ── Edit ────────────────────────────────────────────────────────────────

  function editChurchEvent(item: unknown) {
    const event = item as Record<string, unknown>
    navigateTo({
      path: `/church-event/${event.id}`,
      query: opts.routeQuery(),
    })
  }

  // ── Delete ──────────────────────────────────────────────────────────────

  function beforeDeleteChurchEvent(item: unknown) {
    const event = item as Record<string, unknown>
    opts.dialogDelete.value = {
      text: "Desea eliminar el Evento ",
      strong: event.name as string,
      payload: item,
    }
    opts.churchEventDialogDelete.value = true
  }

  async function deleteChurchEvent(item: unknown) {
    const event = item as Record<string, unknown>
    try {
      opts.deleting.value = true
      await ChurchEvent.delete(event.id as number)

      opts.skipFilterWatch.value = true
      opts.filterChurchEvent.value = ""
      await opts.loadChurchEvents({ filter: "", ...opts.deleteReloadOverrides() })

      opts.churchEventDialogDelete.value = false
    } catch (error) {
      console.error("Error al eliminar evento", error)
    } finally {
      opts.deleting.value = false
    }
  }

  return {
    openCopyDialog,
    copyChurchEvent,
    editChurchEvent,
    beforeDeleteChurchEvent,
    deleteChurchEvent,
  }
}
