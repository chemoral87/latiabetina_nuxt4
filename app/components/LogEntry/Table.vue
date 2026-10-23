<template>
  <div id="cmp-log-entry-table">
    <VDataTableServer
      id="le-table"
      v-model="selected"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      must-sort
      show-select
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      :items-length="total"
      :mobile-breakpoint="0"
      class="elevation-1 xwidth-1200"
      @update:options="onUpdateOptions"
    >
      <template #top>
        <div class="d-flex justify-end pa-2">
          <VBtn v-if="selectedIds.length" id="le-delete-selected-btn" color="error" variant="flat" @click="openDeleteDialog">
            <VIcon start>mdi-delete</VIcon>
            Eliminar ({{ selectedIds.length }})
          </VBtn>
        </div>
      </template>

      <template #header.level>Nivel</template>
      <template #item.level="{ item }">
        <VChip size="small" variant="elevated" :color="levelColor(item.level)">{{ item.level }}</VChip>
      </template>
      <template #header.channel>Canal</template>
      <template #item.channel="{ item }">{{ item.channel || '-' }}</template>
      <template #header.message>Mensaje</template>
      <template #item.message="{ item }">{{ item.message || '-' }}</template>
      <template #header.context>Contexto</template>
      <template #item.context="{ item }">
        <div v-if="item.context" class="context-cell">{{ formatContext(item.context) }}</div>
        <div v-else>—</div>
      </template>
      <template #header.created_at>Fecha</template>
      <template #item.created_at="{ item }">{{ formatCreated(item.created_at) || '—' }}</template>
      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-alert-circle-outline</VIcon>
          <span class="text-body-1 text-grey ml-1">No hay errores registrados</span>
        </div>
      </template>
    </VDataTableServer>

    <DialogDelete v-if="deleteDialog" :dialog="deleteDialogData" @ok="confirmDelete" @close="deleteDialog = false" />
  </div>
</template>

<script setup lang="ts">
  import { formatShortDateTime } from '~/utils/date'
  import type { DataTableSortItem } from 'vuetify'

  const props = withDefaults(
    defineProps<{
      items?: Record<string, unknown>[]
      total?: number
      loading?: boolean
    }>(),
    {
      items: () => [],
      total: 0,
      loading: false,
    }
  )

  const emit = defineEmits<{
    (e: 'sorting', val: Record<string, unknown>): void
    (e: 'delete', ids: number[]): void
  }>()

  const headers = [
    { title: 'Nivel', value: 'level', sortable: true },
    { title: 'Canal', value: 'channel' },
    { title: 'Mensaje', value: 'message' },
    { title: 'Fecha', value: 'created_at', sortable: true },
    { title: 'Contexto', value: 'context' },
  ]

  const selected = ref<number[]>([])
  const page = ref(1)
  const itemsPerPage = ref(10)
  const sortBy = ref<DataTableSortItem[]>([{ key: 'created_at', order: 'desc' }])
  const deleteDialog = ref(false)
  const deleteDialogData = computed(() => ({
    title: selected.value.length === 1 ? '¿Eliminar Registro?' : '¿Eliminar Registros?',
    text: selected.value.length === 1 ? 'Se eliminará 1 registro: ' : `Se eliminarán ${selected.value.length} registros: `,
    strong: `${selected.value.length} registro${selected.value.length === 1 ? '' : 's'} seleccionado${selected.value.length === 1 ? '' : 's'}`,
    payload: selected.value,
  }))

  const selectedIds = computed(() => selected.value.map(Number))

  // Al recargar, descarta seleccionados que ya no existen en la página actual.
  watch(
    () => props.items,
    rows => {
      const ids = new Set(rows.map(row => Number(row.id)))
      selected.value = selected.value.filter(id => ids.has(id))
    }
  )

  function onUpdateOptions(opts: Record<string, unknown>) {
    emit('sorting', opts)
  }

  function levelColor(level: unknown): string {
    const l = String(level ?? '').toLowerCase()
    const map: Record<string, string> = {
      debug: 'info',
      info: 'info',
      notice: 'info',
      warning: 'warning',
      error: 'error',
      critical: 'error',
      alert: 'error',
      emergency: 'error',
    }
    return map[l] ?? 'grey'
  }

  function formatCreated(value: unknown): string {
    if (!value) return ''
    return formatShortDateTime(String(value)) || ''
  }

  function formatContext(context: unknown): string {
    return typeof context === 'string' ? context : JSON.stringify(context)
  }

  function openDeleteDialog() {
    deleteDialog.value = true
  }

  function confirmDelete() {
    emit('delete', selectedIds.value)
    deleteDialog.value = false
  }

  function clearSelection() {
    selected.value = []
  }

  defineExpose({ clearSelection })
</script>

<style scoped>
  .context-cell {
    max-width: 480px;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.75rem;
    line-height: 1.2;
  }
</style>
