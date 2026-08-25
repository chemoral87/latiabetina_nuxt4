<template>
  <div id="cmp-whatsapp-logs-table">
    <VDataTableServer
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      class="elevation-1"
      :items-length="total"
      items-per-page-text="Filas por página"
      :items-per-page-options="[10, 15, 25, 50]"
      @update:options="onUpdateOptions"
    >
      <template #[`item.sender`]="{ item }">
        <span class="text-body-2">{{ (item as any).sender || '—' }}</span>
      </template>

      <template #[`item.receiver`]="{ item }">
        <VChip size="small" color="primary" variant="tonal">
          {{ (item as any).receiver || '—' }}
        </VChip>
      </template>

      <template #[`item.body`]="{ item }">
        <span
          class="text-body-2"
          :title="(item as any).body"
          style="display:inline-block; max-width: 360px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        >
          {{ (item as any).body || '—' }}
        </span>
      </template>

      <template #[`item.media_url`]="{ item }">
        <a
          v-if="(item as any).media_url"
          rel="noopener"
          target="_blank"
          :href="(item as any).media_url"
          class="text-primary text-caption"
        >
          <VIcon size="small">mdi-link</VIcon> ver
        </a>
        <span v-else class="text-grey">—</span>
      </template>

      <template #[`item.success`]="{ item }">
        <VChip
          size="small"
          variant="tonal"
          :color="(item as any).success ? 'green' : 'red'"
        >
          <VIcon start size="small">{{ (item as any).success ? 'mdi-check-circle' : 'mdi-close-circle' }}</VIcon>
          {{ (item as any).success ? 'Enviado' : 'Fallido' }}
        </VChip>
      </template>

      <template #[`item.error_message`]="{ item }">
        <span
          v-if="(item as any).error_message"
          class="text-caption text-red"
          :title="(item as any).error_message"
          style="display:inline-block; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        >
          {{ (item as any).error_message }}
        </span>
        <span v-else class="text-grey">—</span>
      </template>

      <template #[`item.created_at`]="{ item }">
        {{ formatShortDateTime12h(String((item as any).created_at ?? '')) || '—' }}
      </template>

      <template #[`item.creator`]="{ item }">
        {{ ((item as any).creator as any)?.name || 'Sistema' }}
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          size="small"
          variant="tonal"
          :color="isResent(item) ? 'grey' : (item as any).success ? 'grey' : 'primary'"
          :disabled="isResent(item)"
          :title="isResent(item) ? 'Ya reenviado (solo 1 vez)' : (item as any).success ? 'Reenviar de nuevo' : 'Reenviar mensaje fallido'"
          @click="emit('resend', item as Record<string, unknown>)"
        >
          <VIcon size="small">{{ isResent(item) ? 'mdi-check' : 'mdi-send' }}</VIcon>
          <span class="ml-1 d-none d-md-inline">{{ isResent(item) ? 'Enviado' : 'Reenviar' }}</span>
        </VBtn>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-whatsapp</VIcon>
          <div class="text-body-2 mt-1">Sin mensajes registrados</div>
          <div class="text-caption text-grey">Los envíos via POST /whatsapp/send se guardan en whatsapp_message_logs (WhatsAppController.php:70 / SendWhatsAppMessageJob.php:90)</div>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { formatShortDateTime12h } from '~/utils/date'

interface Header {
  title: string
  value: string
  sortable?: boolean
  align?: string
  width?: string
}

const props = withDefaults(defineProps<{
  response?: { data?: unknown[]; total?: number; current_page?: number; last_page?: number } | null
  loading?: boolean
}>(), {
  response: () => ({ data: [], total: 0 }),
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:options', val: Record<string, unknown>): void
  (e: 'resend', val: Record<string, unknown>): void
}>()

const page = ref(1)
const itemsPerPage = ref(15)
const sortBy = ref<{ key: string; order: string }[]>([{ key: 'created_at', order: 'desc' }])

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => (props.response as any)?.data ?? [])

const headers = computed<Header[]>(() => [
  { title: 'ID', value: 'id', sortable: true, width: '70px' },
  { title: 'Remitente', value: 'sender', sortable: false },
  { title: 'Destinatario', value: 'receiver', sortable: false },
  { title: 'Mensaje', value: 'body', sortable: false },
  { title: 'Media', value: 'media_url', sortable: false, align: 'center', width: '80px' },
  { title: 'Estado', value: 'success', sortable: false, align: 'center', width: '120px' },
  { title: 'Error', value: 'error_message', sortable: false },
  { title: 'Fecha', value: 'created_at', sortable: true, width: '155px' },
  { title: 'Usuario', value: 'creator', sortable: false, width: '120px' },
  { title: 'Acciones', value: 'actions', sortable: false, align: 'center', width: '110px' },
])

function isResent(item: unknown): boolean {
  const r = item as Record<string, unknown>
  return Boolean(r.original_log_id) || Number(r.resend_count ?? 0) >= 1
}

function onUpdateOptions(opts: Record<string, unknown>) {
  emit('update:options', opts)
}
</script>
