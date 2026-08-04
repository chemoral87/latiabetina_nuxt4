<template>
  <VCard id="card-jsonconfig-1" variant="outlined" class="mb-4 pa-2">
    <div class="text-caption mb-2 font-weight-bold">Importar / Exportar</div>
    <VBtn id="btn-jsonconfig-export" size="x-small" color="success" block class="mb-2" @click="exportConfiguration">
      <VIcon start size="x-small">{{ saveFormat === 'csv' ? 'mdi-file-delimited' : 'mdi-code-json' }}</VIcon>
      Exportar {{ saveFormat === 'csv' ? 'CSV' : 'JSON' }}
    </VBtn>
    <VBtn id="btn-jsonconfig-import" size="x-small" color="info" block @click="triggerImport">
      <VIcon start size="x-small">mdi-upload</VIcon>
      Importar {{ saveFormat === 'csv' ? 'CSV' : 'JSON' }}
    </VBtn>
    <input ref="fileInput" type="file" :accept="fileAccept" style="display: none" @change="onFileChange" />
  </VCard>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  configData: Record<string, unknown>
  configDataCsv?: string
  saveFormat?: 'json' | 'csv'
}>(), {
  configDataCsv: "",
  saveFormat: "json",
})

const emit = defineEmits<{
  (e: 'imported', data: unknown): void
  (e: 'import-error', err: Error): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const fileAccept = computed(() => {
  return props.saveFormat === "csv" ? ".csv,text/csv,text/plain" : ".json,application/json"
})

function exportConfiguration() {
  if (props.saveFormat === "csv") {
    _exportCsv()
  } else {
    _exportJson()
  }
}

function _exportCsv() {
  const csvStr = props.configDataCsv
  if (!csvStr) {
    emit("import-error", new Error("No CSV data available"))
    return
  }
  const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" })
  _downloadBlob(blob, `auditorio-config-${Date.now()}.csv`)
}

function _exportJson() {
  // Deep clone and remove transient metadata
  const cleaned = JSON.parse(JSON.stringify(props.configData)) as Record<string, unknown>
  delete cleaned.version
  delete cleaned.timestamp
  delete cleaned.settings

  // Strip category: "Ninguno" from seats
  if (Array.isArray(cleaned.s)) {
    ;(cleaned.s as Record<string, unknown>[]).forEach((section) => {
      if (!Array.isArray(section.ss)) return
      ;(section.ss as Record<string, unknown>[]).forEach((sub) => {
        if (!Array.isArray(sub.s)) return
        ;(sub.s as Record<string, unknown>[][]).forEach((row) => {
          if (!Array.isArray(row)) return
          row.forEach((seat) => {
            if (seat && seat.k === "Ninguno") delete seat.k
          })
        })
      })
    })
  }

  const jsonStr = JSON.stringify(cleaned, null, 2)
  const blob = new Blob([jsonStr], { type: "application/json" })
  _downloadBlob(blob, `auditorio-config-${Date.now()}.json`)
}

function _downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function triggerImport() {
  // Reset so re-selecting the same file fires the change event
  if (fileInput.value) {
    fileInput.value.value = ""
    fileInput.value.click()
  }
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string

      if (props.saveFormat === "csv") {
        // Emit the raw CSV string — editor handles parsing
        emit("imported", text)
      } else {
        const config = JSON.parse(text)
        emit("imported", config)
      }
    } catch (err) {
      emit("import-error", err as Error)
    } finally {
      if (input) input.value = ""
    }
  }
  reader.readAsText(file)
}
</script>

<style scoped></style>
