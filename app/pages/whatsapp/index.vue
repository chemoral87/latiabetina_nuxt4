<template>
  <VContainer fluid>
    <VRow align="center" density="comfortable">
      <VCol md="3" sm="6" cols="12">
        <VTextField
          id="wa-logs-filter-receiver"
          v-model="filterReceiverModel"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          prepend-inner-icon="mdi-phone"
          placeholder="Destinatario (receiver)"
        />
      </VCol>
      <VCol md="3" sm="6" cols="12">
        <VTextField
          id="wa-logs-filter-sender"
          v-model="filterSenderModel"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Remitente (sender)"
          prepend-inner-icon="mdi-account"
        />
      </VCol>
      <VCol md="2" sm="4" cols="12">
        <VSelect
          id="wa-logs-filter-success"
          v-model="filterSuccess"
          clearable
          hide-details
          label="Estado"
          density="compact"
          variant="outlined"
          :items="successOptions"
        />
      </VCol>
      <VCol cols="auto" class="d-flex align-center">
        <VBtn
          id="wa-logs-refresh"
          color="primary"
          :loading="loading"
          @click="fetchLogs()"
        >
          <VIcon start>mdi-reload</VIcon> Refrescar
        </VBtn>
        <VBtn
          id="wa-logs-bot-status"
          class="ml-2"
          variant="outlined"
          :loading="loadingStatus"
          @click="checkBotStatus"
        >
          <VIcon start>mdi-robot</VIcon> Estado Bot
        </VBtn>
      </VCol>
      <VCol v-if="botStatus" cols="12">
        <VAlert
          closable
          variant="tonal"
          density="compact"
          :type="botStatusAlert"
        >
          <span class="text-caption">Bot: {{ botStatusText }}</span>
        </VAlert>
      </VCol>
      <VCol cols="12">
        <WhatsAppLogsTable
          :loading="loading"
          :response="response"
          @resend="onResend"
          @update:options="onUpdateOptions"
        />
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Mensajes WhatsApp',
  icon: 'mdi-whatsapp',
  permission: 'whatsapp-index',
  middleware: ['authenticated', 'permission'],
})

const { WhatsApp } = useRepository()
const notify = useNotifyStore()

const filterReceiverModel = ref('')
const filterSenderModel = ref('')
const filterSuccess = ref<number | boolean | null>(null)
const loading = ref(false)
const loadingStatus = ref(false)
const botStatus = ref<Record<string, unknown> | null>(null)

const successOptions = [
  { title: 'Todos', value: null },
  { title: 'Enviados', value: 1 },
  { title: 'Fallidos', value: 0 },
]

const botStatusText = computed(() => {
  if (!botStatus.value) return ''
  return JSON.stringify(botStatus.value, null, 2)
})
const botStatusAlert = computed(() => {
  const s = (botStatus.value as any)?.status
  if (s === 'READY') return 'success'
  if (s === 'OFFLINE') return 'error'
  return 'info'
})

const response = ref<{ data: unknown[]; total: number; current_page?: number; last_page?: number }>({
  data: [],
  total: 0,
})

const lastOptions = ref<Record<string, unknown>>({
  page: 1,
  itemsPerPage: 15,
  sortBy: [{ key: 'created_at', order: 'desc' }],
})

// Debounced text filters
let debounceTimer: ReturnType<typeof setTimeout> | null = null
function debounceFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchLogs({ page: 1 }), 400)
}
watch(filterReceiverModel, debounceFetch)
watch(filterSenderModel, debounceFetch)
watch(filterSuccess, () => fetchLogs({ page: 1 }))

// Initial load via SSR (useAsyncData) — avoids double fetch
{
  const initial = await WhatsApp.logs<Record<string, unknown>>({
    page: 1,
    per_page: 15,
  }).catch(() => ({ data: [], total: 0 } as any))
  // Controller returns Laravel paginator: { data, current_page, last_page, per_page, total, ... } (WhatsAppController.php:91)
  // normalize to { data, total }
  if (Array.isArray((initial as any).data)) {
    response.value = initial as any
  } else if (Array.isArray(initial as unknown as unknown[])) {
    response.value = { data: initial as unknown as unknown[], total: (initial as unknown as unknown[]).length }
  }
}

async function fetchLogs(overrides: Record<string, unknown> = {}) {
  loading.value = true
  const opts = { ...lastOptions.value, ...overrides } as Record<string, unknown>
  // carry current text filters if not overridden
  if (!('receiver' in overrides) && filterReceiverModel.value) opts.receiver = filterReceiverModel.value
  else if (!filterReceiverModel.value) delete opts.receiver
  if (!('sender' in overrides) && filterSenderModel.value) opts.sender = filterSenderModel.value
  else if (!filterSenderModel.value) delete opts.sender
  if (!('success' in overrides) && filterSuccess.value !== null && filterSuccess.value !== '') opts.success = filterSuccess.value
  else if (filterSuccess.value === null) delete opts.success

  const params: Record<string, unknown> = {
    page: opts.page ?? 1,
    per_page: opts.itemsPerPage ?? 15,
  }
  if (opts.receiver) params.receiver = opts.receiver
  if (opts.sender) params.sender = opts.sender
  if (opts.success !== undefined && opts.success !== null && opts.success !== '') params.success = opts.success

  // Optional sort forwarding (WhatsApp logs currently orderByDesc created_at, but keep)
  const sortBy = opts.sortBy as { key: string; order: string }[] | undefined
  if (sortBy?.length) {
    params.sortBy = sortBy[0].key
    params.sortDesc = sortBy[0].order === 'desc'
  }

  try {
    const res = await WhatsApp.logs<Record<string, unknown>>(params)
    response.value = res as any
    lastOptions.value = opts
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al cargar logs de WhatsApp'
    notify.notify({ error: msg })
  } finally {
    loading.value = false
  }
}

function onUpdateOptions(opts: Record<string, unknown>) {
  // VDataTableServer emits { page, itemsPerPage, sortBy }
  // avoid double fetch on first mount if initial data already loaded
  const page = (opts.page as number) ?? 1
  const itemsPerPage = (opts.itemsPerPage as number) ?? 15
  const sortBy = (opts.sortBy as unknown[]) ?? []
  fetchLogs({ page, itemsPerPage, sortBy })
}

async function checkBotStatus() {
  loadingStatus.value = true
  try {
    const res = await WhatsApp.status<Record<string, unknown>>()
    botStatus.value = res as Record<string, unknown>
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'No se pudo conectar al bot'
    notify.notify({ error: msg })
    botStatus.value = { status: 'OFFLINE', error: msg }
  } finally {
    loadingStatus.value = false
  }
}

async function onResend(item: Record<string, unknown>) {
  const id = (item as any).id
  if (!id) return
  const receiver = (item as any).receiver
  const preview = String((item as any).body || '').slice(0, 60)
  if (!confirm(`¿Reenviar mensaje #${id} a ${receiver}?\n"${preview}"`)) return
  try {
    await WhatsApp.resend<{ message: string }>(id as number | string)
    notify.notify({ success: `Reenvío #${id} encolado` })
    // refrescar tras 1s para ver nuevo log
    setTimeout(() => fetchLogs(), 1200)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message
      || (e as { response?: { data?: { error?: string } } })?.response?.data?.error
      || 'Error al reenviar'
    notify.notify({ error: msg })
  }
}
</script>

<style scoped></style>
