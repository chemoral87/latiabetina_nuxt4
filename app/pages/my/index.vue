<template>
  <VContainer :fluid="true" class="pa-6">
    <!-- Page header -->
    <VRow class="mb-4">
      <VCol cols="12">
        <div class="d-flex align-center mb-1">
          <VIcon size="x-large" color="primary" class="mr-3">mdi-flask</VIcon>
          <div>
            <h1 class="text-h4 font-weight-bold mb-0">Componentes My</h1>
            <span class="text-subtitle-1 text-grey-darken-1">Banco de pruebas &mdash; 8 componentes para testear y comparar</span>
          </div>
        </div>
        <VDivider class="mt-2" />
      </VCol>
    </VRow>

    <!-- ─── Row 1 – Date & Time ─────────────────────────────────── -->
    <VRow>
      <VCol cols="12">
        <h2 class="text-h5 mb-3 text-primary">
          <VIcon start color="primary">mdi-calendar-clock</VIcon>
          Fecha y Hora
        </h2>
      </VCol>

      <!-- DatePicker -->
      <VCol cols="12" md="4">
        <VCard id="card-my-index-1" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="blue">mdi-calendar</VIcon>
            MyDatePicker
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyDatePicker v-model="date" label="Selecciona una fecha" dense outlined />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption text-grey mr-2">Valor:</span>
              <VChip id="chip-my-date-value" size="small" :color="date ? 'success' : 'grey-lighten-3'" variant="elevated" label class="font-weight-mono">
                {{ date || "null" }}
              </VChip>
            </div>
            <div class="mt-2 d-flex align-center">
              <span class="text-caption text-grey mr-2">Mostrar:</span>
              <VChip id="chip-my-date-formatted" size="small" color="primary" variant="outlined" label>
                {{ formattedDate || "—" }}
              </VChip>
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="btn-my-date-clear" size="small" variant="outlined" color="error" class="mr-4" @click="date = null">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
            <VBtn id="btn-my-date-today" size="small" variant="outlined" color="primary" @click="date = '2026-07-21'">
              <VIcon start size="x-small">mdi-calendar-today</VIcon>
              Hoy
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- DateRange -->
      <VCol cols="12" md="4">
        <VCard id="card-my-index-2" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="blue">mdi-calendar-range</VIcon>
            MyDateRange
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyDateRange v-model="dateRange" label="Rango de fechas" dense outlined />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption text-grey mr-2">Valor:</span>
              <VChip id="chip-my-daterange-value" size="small" :color="dateRange.length ? 'success' : 'grey-lighten-3'" variant="elevated" label class="font-weight-mono">
                {{ dateRange.length ? dateRange.join(" ~ ") : "[]" }}
              </VChip>
            </div>
            <div class="mt-2 d-flex align-center">
              <span class="text-caption text-grey mr-2">Mostrar:</span>
              <VChip id="chip-my-daterange-formatted" size="small" color="primary" variant="outlined" label>
                {{ formattedDateRange || "—" }}
              </VChip>
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="btn-my-daterange-clear" size="small" variant="outlined" color="error" @click="dateRange = []">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- TimePicker -->
      <VCol cols="12" md="4">
        <VCard id="card-my-index-3" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="blue">mdi-clock-outline</VIcon>
            MyTimePicker
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyTimePicker v-model="time" label="Selecciona hora" dense outlined />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption text-grey mr-2">Valor (24h):</span>
              <VChip id="chip-my-time-value" size="small" :color="time ? 'success' : 'grey-lighten-3'" variant="elevated" label class="font-weight-mono">
                {{ time || "null" }}
              </VChip>
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="btn-my-time-clear" size="small" variant="outlined" color="error" class="mr-4" @click="time = null">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
            <VBtn id="btn-my-time-set" size="small" variant="outlined" color="primary" @click="time = '14:30'">
              <VIcon start size="x-small">mdi-clock</VIcon>
              14:30
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- ─── Row 2 – Image & Upload ──────────────────────────────── -->
    <VRow class="mt-2">
      <VCol cols="12">
        <h2 class="text-h5 mb-3 text-primary">
          <VIcon start color="primary">mdi-image</VIcon>
          Imágenes y Subida
        </h2>
      </VCol>

      <!-- PreviewImage -->
      <VCol cols="12" md="4">
        <VCard id="card-my-index-4" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="green">mdi-image-eye</VIcon>
            MyPreviewImage
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyPreviewImage :src="previewSrc" :loading="previewLoading" :delay-seconds="previewDelay" max-height="160" />
            <div class="mt-3">
              <VTextField
                id="tf-my-index-previewsrc-1"
                v-model="previewSrc"
                label="URL de imagen"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="https://..."
              />
            </div>
            <div class="mt-2 d-flex align-center">
              <VSwitch id="sw-my-preview-loading" v-model="previewLoading" density="compact" hide-details label="Forzar loading" class="mt-0 pt-0 mr-3" />
              <VTextField
                id="tf-my-index-delay-s-2"
                v-model.number="previewDelay"
                label="Delay (s)"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 100px"
                type="number"
                min="0"
                max="10"
              />
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="btn-my-preview-load" size="small" variant="outlined" color="primary" class="mr-4" @click="previewSrc = 'https://picsum.photos/seed/test/400/300'">
              <VIcon start size="x-small">mdi-image</VIcon>
              Cargar ejemplo
            </VBtn>
            <VBtn id="btn-my-preview-clear" size="small" variant="outlined" color="error" @click="previewSrc = ''">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- Uploadimage -->
      <VCol cols="12" md="4">
        <VCard id="card-my-index-5" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="info">mdi-camera</VIcon>
            MyUploadimage
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-1">Sube una imagen (se redimensiona automáticamente)</p>
            <MyUploadimage
              v-model="uploadBlob"
              v-model:url="uploadUrl"
              v-model:filename="uploadFilename"
              v-model:file="uploadFile"
              :size="750"
              @loading="uploadLoading = true"
            />
            <div v-if="uploadUrl" class="mt-2">
              <VImg :src="uploadUrl" max-height="80" contain rounded class="mb-2" />
            </div>
            <div v-if="uploadBlob && !uploadUrl" class="mt-2 text-caption text-grey">
              <VProgressCircular indeterminate size="16" width="2" class="mr-2" />
              Procesando...
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- UploadimageCrop -->
      <VCol cols="12" md="4">
        <VCard id="card-my-index-6" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="green">mdi-image-crop</VIcon>
            MyUploadimageCrop
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-1">Sube y recorta en círculo</p>
            <MyUploadimageCrop v-model="cropBlob" v-model:url="cropUrl" label="Seleccionar foto" />
            <div v-if="cropUrl" class="mt-2">
              <VImg :src="cropUrl" height="80" width="80" rounded="circle" class="mb-2" />
            </div>
            <div v-if="cropBlob && !cropUrl" class="mt-2 text-caption text-grey">
              <VProgressCircular indeterminate size="16" width="2" class="mr-2" />
              Procesando...
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ─── Row 3 – Panel & Overlay ─────────────────────────────── -->
    <VRow class="mt-2">
      <VCol cols="12">
        <h2 class="text-h5 mb-3 text-primary">
          <VIcon start color="primary">mdi-layers</VIcon>
          Paneles y Diálogos
        </h2>
      </VCol>

      <!-- DragPanel -->
      <VCol cols="12" md="6">
        <VCard id="card-my-index-7" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="orange">mdi-drag</VIcon>
            MyDragPanel
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-3">Panel flotante que se puede arrastrar. Aparece animado desde abajo.</p>
            <VRow density="comfortable">
              <VCol cols="auto">
                <VBtn id="btn-my-drag-open" color="primary" @click="dragPanelVisible = true">
                  <VIcon start>mdi-window-maximize</VIcon>
                  Abrir panel
                </VBtn>
              </VCol>
              <VCol cols="auto">
                <VBtn id="btn-my-drag-close" color="error" variant="outlined" @click="dragPanelVisible = false">
                  <VIcon start>mdi-close</VIcon>
                  Cerrar
                </VBtn>
              </VCol>
            </VRow>
            <div class="mt-2 text-caption">
              Estado:
              <VChip id="chip-my-drag-state" size="x-small" :color="dragPanelVisible ? 'success' : 'grey'" variant="elevated" label>
                {{ dragPanelVisible ? "Visible" : "Oculto" }}
              </VChip>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Loading -->
      <VCol cols="12" md="6">
        <VCard id="card-my-index-8" :elevation="4" hover class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="orange">mdi-loading</VIcon>
            MyLoading
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-3">Overlay de carga con spinner y mensaje personalizable.</p>
            <VRow density="comfortable">
              <VCol cols="auto">
                <VBtn id="btn-my-loading-show" color="primary" @click="triggerLoading">
                  <VIcon start>mdi-play</VIcon>
                  Mostrar 3s
                </VBtn>
              </VCol>
              <VCol cols="auto">
                <VBtn id="btn-my-loading-close" color="error" variant="outlined" @click="loadingVisible = false">
                  <VIcon start>mdi-stop</VIcon>
                  Cerrar
                </VBtn>
              </VCol>
            </VRow>
            <VTextField
              id="tf-my-index-loadingmessage-3"
              v-model="loadingMessage"
              label="Mensaje"
              variant="outlined"
              density="compact"
              hide-details
              class="mt-2"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ═══════════════ Floating components ═══════════════ -->

    <!-- DragPanel instance -->
    <MyDragPanel v-model="dragPanelVisible" title="Panel de prueba" right="20px" bottom="80px">
      <div class="pa-4">
        <p class="text-body-2 mb-2">
          <strong>¡Puedes arrastrarme!</strong>
          Tira de la barra azul para moverme por la pantalla.
        </p>
        <VDivider class="mb-2" />
        <div class="d-flex align-center mb-2">
          <VIcon size="small" class="mr-2">mdi-calendar</VIcon>
          <span class="text-caption">Fecha: {{ formattedDate || "—" }}</span>
        </div>
        <div class="d-flex align-center mb-2">
          <VIcon size="small" class="mr-2">mdi-clock</VIcon>
          <span class="text-caption">Hora: {{ time || "—" }}</span>
        </div>
        <VBtn id="btn-my-dragpanel-close" block size="small" variant="outlined" color="error" class="mt-2" @click="dragPanelVisible = false">
          <VIcon start size="x-small">mdi-close</VIcon>
          Cerrar panel
        </VBtn>
      </div>
    </MyDragPanel>

    <!-- Loading overlay -->
    <MyLoading :model-value="loadingVisible" :message="loadingMessage" progress-color="white" />

    <!-- ─── State Observer (debug panel) ──────────────────────── -->
    <VRow class="mt-4">
      <VCol cols="12">
        <VCard id="card-my-index-9" :elevation="2" class="rounded-lg">
          <VCardTitle class="py-2 text-subtitle-2 font-weight-bold bg-grey-lighten-3">
            <VIcon start size="small">mdi-code-json</VIcon>
            Estado global de los componentes
            <VSpacer />
            <VBtn id="btn-my-reset-all" size="x-small" variant="outlined" @click="resetAll">
              <VIcon start size="x-small">mdi-restore</VIcon>
              Resetear todo
            </VBtn>
          </VCardTitle>
          <VCardText class="pa-3">
            <pre class="mb-0" style="font-size: 0.8rem; max-height: 240px; overflow-y: auto">{{ stateDump }}</pre>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { formatShortDateSlash } from "~/utils/date"

definePageMeta({
  title: "Componentes My",
  icon: "mdi-flask-outline",
  middleware: "authenticated",
})

// ── Date & Time ──
const date = ref<string | null>(null)
const dateRange = ref<string[]>([])
const time = ref<string | null>(null)

// ── Images & Upload ──
const previewSrc = ref("")
const previewLoading = ref(false)
const previewDelay = ref(0)
const uploadBlob = ref<Blob | string | null>(null)
const uploadUrl = ref<string | null>(null)
const uploadFilename = ref("")
const uploadFile = ref<File | null>(null)
const uploadLoading = ref(false)
const cropBlob = ref<Blob | null>(null)
const cropUrl = ref<string | null>(null)

// ── Panels & Overlays ──
const dragPanelVisible = ref(false)
const loadingVisible = ref(false)
const loadingMessage = ref("Cargando…")
const loadingTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const formattedDate = computed(() => formatShortDateSlash(date.value))

const formattedDateRange = computed(() => {
  if (!dateRange.value || dateRange.value.length === 0) return ""
  return [...dateRange.value]
    .map((d) => formatShortDateSlash(d))
    .sort()
    .join(" ~ ")
})

const stateDump = computed(() => {
  const dump = {
    date: date.value,
    dateRange: dateRange.value,
    time: time.value,
    previewSrc: previewSrc.value ? previewSrc.value.substring(0, 60) + "…" : null,
    previewLoading: previewLoading.value,
    uploadFilename: uploadFilename.value,
    uploadBlobSize: (uploadBlob.value as Blob | null)?.size ?? null,
    cropBlobSize: (cropBlob.value as Blob | null)?.size ?? null,
    dragPanelVisible: dragPanelVisible.value,
    loadingVisible: loadingVisible.value,
  }
  return JSON.stringify(dump, null, 2)
})

function triggerLoading() {
  loadingVisible.value = true
  loadingTimer.value = setTimeout(() => {
    loadingVisible.value = false
  }, 3000)
}

function resetAll() {
  date.value = null
  dateRange.value = []
  time.value = null
  previewSrc.value = ""
  previewLoading.value = false
  previewDelay.value = 0
  uploadBlob.value = null
  uploadUrl.value = null
  uploadFilename.value = ""
  uploadFile.value = null
  uploadLoading.value = false
  cropBlob.value = null
  cropUrl.value = null
  dragPanelVisible.value = false
  loadingVisible.value = false
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value)
    loadingTimer.value = null
  }
}

onBeforeUnmount(() => {
  if (loadingTimer.value) {
    clearTimeout(loadingTimer.value)
    loadingTimer.value = null
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.font-weight-mono {
  font-family: "SF Mono", "Consolas", "Liberation Mono", monospace;
  font-size: 0.75rem;
}

pre {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e9ecef;
}
</style>
