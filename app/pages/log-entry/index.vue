<template>
  <VContainer :fluid="true">
    <VSheet rounded color="white">
      <VRow density="compact">
        <VCol md="2" cols="12">
          <VSelect id="le-index-level" v-model="filterLevel" hide-details label="Nivel" density="compact" variant="outlined" :items="levelOptions" />
        </VCol>
        <VCol md="2" sm="4" cols="6">
          <VTextField
            id="le-index-filter"
            v-model="filterInput"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            placeholder="Buscar..."
            append-inner-icon="mdi-magnify"
          />
        </VCol>
        <VCol cols="auto" class="d-flex align-center">
          <VBtn id="le-refresh-btn" color="primary" :loading="loading" variant="outlined" @click="fetchLogs">
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
          <VBtn id="le-test-error-btn" class="ml-2" color="error" variant="outlined" @click="testError">
            <VIcon start>mdi-alert-outline</VIcon>
            Probar Error
          </VBtn>
        </VCol>
      </VRow>

      <VRow density="compact">
        <VCol cols="12">
          <LogEntryTable :items="logs" :total="total" :loading="loading" @delete="deleteSelected" @sorting="handleSorting" />
        </VCol>
      </VRow>
    </VSheet>
  </VContainer>
</template>

<script setup lang="ts">
  definePageMeta({
    title: 'Errores',
    icon: 'mdi-alert-circle-outline',
    permission: 'log-entry-index',
    middleware: ['authenticated', 'permission'],
  })

  const { LogEntry } = useRepository()

  const filterInput = ref('')
  const filterLevel = ref('')
  const loading = ref(false)
  const logs = ref<Record<string, unknown>[]>([])
  const total = ref(0)
  const sortBy = ref<{ key: string; order: string }[]>([{ key: 'created_at', order: 'desc' }])
  const lastOptions = ref<Record<string, unknown>>({
    page: 1,
    itemsPerPage: 10,
  })

  const levelOptions = [
    { title: 'DEBUG', value: 'debug' },
    { title: 'INFO', value: 'info' },
    { title: 'NOTICE', value: 'notice' },
    { title: 'WARNING', value: 'warning' },
    { title: 'ERROR', value: 'error' },
    { title: 'CRITICAL', value: 'critical' },
    { title: 'ALERT', value: 'alert' },
    { title: 'EMERGENCY', value: 'emergency' },
  ]

  async function fetchLogs() {
    loading.value = true
    const params: Record<string, unknown> = {
      page: lastOptions.value.page,
      itemsPerPage: lastOptions.value.itemsPerPage,
    }
    if (sortBy.value.length) {
      params['sortBy'] = sortBy.value.map(s => s.key)
      params['sortDesc'] = sortBy.value.map(s => (s.order === 'desc' ? 'true' : 'false'))
    }
    if (filterLevel.value) params.level = filterLevel.value
    if (filterInput.value) params.filter = filterInput.value

    try {
      const res = await LogEntry.index<{ data: Record<string, unknown>[]; total: number }>(params)
      logs.value = Array.isArray(res?.data) ? res.data : []
      total.value = Number(res?.total ?? 0)
    } catch (error) {
      console.error('Error al cargar registros de error', error)
      logs.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  let initialLoaded = false

  function onUpdateOptions(opts: Record<string, unknown>) {
    lastOptions.value = { ...lastOptions.value, ...opts }
    const newSortBy = (opts.sortBy as { key: string; order: string }[]) ?? []
    if (newSortBy.length) sortBy.value = newSortBy
    fetchLogs()
  }

  function handleSorting(opts: Record<string, unknown>) {
    if (!initialLoaded) {
      initialLoaded = true
      return
    }
    onUpdateOptions(opts)
  }

  watch(filterLevel, fetchLogs)

  async function testError() {
    try {
      await LogEntry.testError<{ success: boolean }>()
      await fetchLogs()
    } catch (error) {
      console.error('Error al disparar prueba de error', error)
    }
  }

  async function deleteSelected(ids: number[]) {
    if (!ids.length) return
    try {
      loading.value = true
      await LogEntry.destroyMany(ids)
      await fetchLogs()
    } catch (error) {
      console.error('Error al eliminar registros de error', error)
    } finally {
      loading.value = false
    }
  }

  {
    await fetchLogs()
  }
</script>

<style scoped></style>
