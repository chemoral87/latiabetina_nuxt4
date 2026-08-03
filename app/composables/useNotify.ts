export interface Snack {
  id: number
  text: string
  color: string
}

export interface NotifyPayload {
  success?: string
  warning?: string
  error?: string
  info?: string
}

export const useNotifyStore = defineStore("notify", () => {
  const snacks = ref<Snack[]>([])
  const snackbarTimeout = 4000
  let nextId = 0

  function notify(data: NotifyPayload) {
    let text: string | undefined
    let color = "primary"

    if (data.success) {
      text = data.success
      color = "primary"
    } else if (data.info) {
      text = data.info
      color = "info"
    } else if (data.warning) {
      text = data.warning
      color = "warning"
    } else if (data.error) {
      text = data.error
      color = "error"
    }

    if (!text) return

    const id = ++nextId
    snacks.value.push({ id, text, color })

    setTimeout(() => closeSnackbar(id), snackbarTimeout)
  }

  function closeSnackbar(id: number) {
    snacks.value = snacks.value.filter((s) => s.id !== id)
  }

  return { snacks, notify, closeSnackbar }
})
