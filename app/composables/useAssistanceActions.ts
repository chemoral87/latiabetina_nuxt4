import { useRepository } from '~/composables/useRepository'
import { useNotifyStore } from '~/composables/useNotify'
import { formatShortDate } from '~/utils/date'

export function useAssistanceActions(opts: {
  loadAssistances: (overrides?: Record<string, unknown>) => Promise<void>
  routeQuery: () => Record<string, unknown>
  deleteReloadOverrides: () => Record<string, unknown>
  assistanceDialogDelete: Ref<boolean>
  dialogDelete: Ref<Record<string, unknown>>
  deleting: Ref<boolean>
  skipFilterWatch: Ref<boolean>
  filterAssistances: Ref<string>
}) {
  const { Assistance } = useRepository()
  const notify = useNotifyStore()

  function beforeDeleteAssistance(item: unknown) {
    const assistance = item as Record<string, unknown>
    opts.dialogDelete.value = {
      text: 'Desea eliminar la Asistencia ',
      strong: `${assistance.assistance_date} - ${assistance.service_time}`,
      payload: item,
    }
    opts.assistanceDialogDelete.value = true
  }

  async function deleteAssistance(item: unknown) {
    const assistance = item as Record<string, unknown>
    try {
      opts.deleting.value = true
      await Assistance.delete(assistance.id as number)

      opts.skipFilterWatch.value = true
      opts.filterAssistances.value = ''
      await opts.loadAssistances({ filter: '', ...opts.deleteReloadOverrides() })

      notify.notify({ success: 'Asistencia eliminada correctamente.' })

      opts.assistanceDialogDelete.value = false
    } catch (error) {
      console.error('Error al eliminar asistencia', error)
      notify.notify({ error: 'Error al eliminar la asistencia' })
    } finally {
      opts.deleting.value = false
    }
  }

  function editAssistance(item: unknown) {
    const assistance = item as Record<string, unknown>
    navigateTo({
      path: `/assistance/${assistance.id}`,
      query: opts.routeQuery(),
    })
  }

  return {
    beforeDeleteAssistance,
    deleteAssistance,
    editAssistance,
  }
}
