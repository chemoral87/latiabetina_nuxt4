<template>
  <VContainer class="" :fluid="true">
    <!-- Page header -->
    <VRow class="mb-4" density="compact">
      <VCol cols="12">
        <div class="d-flex align-center mb-1">
          <VIcon class="mr-3" size="x-large" color="primary">mdi-flask</VIcon>
          <div>
            <h1 class="text-h4 font-weight-bold mb-0">Componentes My</h1>
            <span class="text-subtitle-1 text-grey-darken-1">Banco de pruebas &mdash; 8 componentes para testear y comparar</span>
          </div>
        </div>
        <VDivider class="mt-2" />
      </VCol>
    </VRow>

    <!-- ─── Row 1 – Date & Time ─────────────────────────────────── -->
    <VRow density="compact">
      <VCol cols="12">
        <h2 class="text-h5 mb-3 text-primary">
          <VIcon start color="primary">mdi-calendar-clock</VIcon>
          Fecha y Hora
        </h2>
      </VCol>

      <!-- DatePicker -->
      <VCol md="4" cols="12">
        <VCard id="my-index-card-1" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="blue">mdi-calendar</VIcon>
            MyDatePicker
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyDatePicker v-model="date" dense outlined label="Selecciona una fecha" />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption text-grey mr-2">Valor:</span>
              <VChip id="my-date-value-chip" label size="small" variant="elevated" class="font-weight-mono" :color="date ? 'success' : 'grey-lighten-3'">
                {{ date || "null" }}
              </VChip>
            </div>
            <div class="mt-2 d-flex align-center">
              <span class="text-caption text-grey mr-2">Mostrar:</span>
              <VChip id="my-date-formatted-chip" label size="small" color="primary" variant="outlined">
                {{ formattedDate || "—" }}
              </VChip>
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="my-date-clear-btn" class="mr-4" size="small" color="error" variant="outlined" @click="date = null">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
            <VBtn id="my-date-today-btn" size="small" color="primary" variant="outlined" @click="date = '2026-07-21'">
              <VIcon start size="x-small">mdi-calendar-today</VIcon>
              Hoy
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- DateRange -->
      <VCol md="4" cols="12">
        <VCard id="my-index-card-2" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="blue">mdi-calendar-range</VIcon>
            MyDateRange
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyDateRange v-model="dateRange" dense outlined label="Rango de fechas" />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption text-grey mr-2">Valor:</span>
              <VChip id="my-daterange-value-chip" label size="small" variant="elevated" class="font-weight-mono" :color="dateRange.length ? 'success' : 'grey-lighten-3'">
                {{ dateRange.length ? dateRange.join(" ~ ") : "[]" }}
              </VChip>
            </div>
            <div class="mt-2 d-flex align-center">
              <span class="text-caption text-grey mr-2">Mostrar:</span>
              <VChip id="my-daterange-formatted-chip" label size="small" color="primary" variant="outlined">
                {{ formattedDateRange || "—" }}
              </VChip>
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="my-daterange-clear-btn" size="small" color="error" variant="outlined" @click="dateRange = []">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- TimePicker -->
      <VCol md="4" cols="12">
        <VCard id="my-index-card-3" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="blue">mdi-clock-outline</VIcon>
            MyTimePicker
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyTimePicker v-model="time" dense outlined label="Selecciona hora" />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption text-grey mr-2">Valor (24h):</span>
              <VChip id="my-time-value-chip" label size="small" variant="elevated" class="font-weight-mono" :color="time ? 'success' : 'grey-lighten-3'">
                {{ time || "null" }}
              </VChip>
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="my-time-clear-btn" class="mr-4" size="small" color="error" variant="outlined" @click="time = null">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
            <VBtn id="my-time-set-btn" size="small" color="primary" variant="outlined" @click="time = '14:30'">
              <VIcon start size="x-small">mdi-clock</VIcon>
              14:30
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>

    <!-- ─── Row 2 – Image & Upload ──────────────────────────────── -->
    <VRow class="mt-2" density="compact">
      <VCol cols="12">
        <h2 class="text-h5 mb-3 text-primary">
          <VIcon start color="primary">mdi-image</VIcon>
          Imágenes y Subida
        </h2>
      </VCol>

      <!-- PreviewImage -->
      <VCol md="4" cols="12">
        <VCard id="my-index-card-4" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="green">mdi-image-eye</VIcon>
            MyPreviewImage
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <MyPreviewImage max-height="160" :src="previewSrc" :loading="previewLoading" :delay-seconds="previewDelay" />
            <div class="mt-3">
              <VTextField
                id="my-index-previewsrc-tf-1"
                v-model="previewSrc"
                hide-details
                density="compact"
                variant="outlined"
                label="URL de imagen"
                placeholder="https://..."
              />
            </div>
            <div class="mt-2 d-flex align-center">
              <VSwitch id="my-preview-loading-sw" v-model="previewLoading" hide-details density="compact" class="mt-0 pt-0 mr-3" label="Forzar loading" />
              <VTextField
                id="my-index-delay-s-tf-2"
                v-model.number="previewDelay"
                min="0"
                max="10"
                hide-details
                type="number"
                density="compact"
                label="Delay (s)"
                variant="outlined"
                style="max-width: 100px"
              />
            </div>
          </VCardText>
          <div class="d-flex px-4 pb-3">
            <VBtn id="my-preview-load-btn" class="mr-4" size="small" color="primary" variant="outlined" @click="previewSrc = 'https://picsum.photos/seed/test/400/300'">
              <VIcon start size="x-small">mdi-image</VIcon>
              Cargar ejemplo
            </VBtn>
            <VBtn id="my-preview-clear-btn" size="small" color="error" variant="outlined" @click="previewSrc = ''">
              <VIcon start size="x-small">mdi-close</VIcon>
              Limpiar
            </VBtn>
          </div>
        </VCard>
      </VCol>

      <!-- Uploadimage -->
      <VCol md="4" cols="12">
        <VCard id="my-index-card-5" hover :elevation="4" class="rounded-lg h-100">
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
              v-model:file="uploadFile"
              v-model:filename="uploadFilename"
              :size="750"
              @loading="uploadLoading = true"
            />
            <div v-if="uploadUrl" class="mt-2">
              <VImg contain rounded class="mb-2" max-height="80" :src="uploadUrl" />
            </div>
            <div v-if="uploadBlob && !uploadUrl" class="mt-2 text-caption text-grey">
              <VProgressCircular size="16" width="2" class="mr-2" indeterminate />
              Procesando...
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- UploadimageCrop -->
      <VCol md="4" cols="12">
        <VCard id="my-index-card-6" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="green">mdi-image-crop</VIcon>
            MyUploadimageCrop
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-1">Sube y recorta en círculo</p>
            <MyUploadimageCrop v-model="cropBlob" v-model:url="cropUrl" label="Seleccionar foto" />
            <div v-if="cropUrl" class="mt-2">
              <VImg width="80" height="80" class="mb-2" :src="cropUrl" rounded="circle" />
            </div>
            <div v-if="cropBlob && !cropUrl" class="mt-2 text-caption text-grey">
              <VProgressCircular size="16" width="2" class="mr-2" indeterminate />
              Procesando...
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ─── Row 3 – Panel & Overlay ─────────────────────────────── -->
    <VRow class="mt-2" density="compact">
      <VCol cols="12">
        <h2 class="text-h5 mb-3 text-primary">
          <VIcon start color="primary">mdi-layers</VIcon>
          Paneles y Diálogos
        </h2>
      </VCol>

      <!-- DragPanel -->
      <VCol md="6" cols="12">
        <VCard id="my-index-card-7" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="orange">mdi-drag</VIcon>
            MyDragPanel
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-3">Panel flotante que se puede arrastrar. Aparece animado desde abajo.</p>
            <VRow density="compact">
              <VCol cols="auto">
                <VBtn id="my-drag-open-btn" color="primary" @click="dragPanelVisible = true">
                  <VIcon start>mdi-window-maximize</VIcon>
                  Abrir panel
                </VBtn>
              </VCol>
              <VCol cols="auto">
                <VBtn id="my-drag-close-btn" color="error" variant="outlined" @click="dragPanelVisible = false">
                  <VIcon start>mdi-close</VIcon>
                  Cerrar
                </VBtn>
              </VCol>
            </VRow>
            <div class="mt-2 text-caption">
              Estado:
              <VChip id="my-drag-state-chip" label size="x-small" variant="elevated" :color="dragPanelVisible ? 'success' : 'grey'">
                {{ dragPanelVisible ? "Visible" : "Oculto" }}
              </VChip>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Loading -->
      <VCol md="6" cols="12">
        <VCard id="my-index-card-8" hover :elevation="4" class="rounded-lg h-100">
          <VCardTitle class="py-3 text-subtitle-1 font-weight-bold">
            <VIcon start color="orange">mdi-loading</VIcon>
            MyLoading
          </VCardTitle>
          <VDivider />
          <VCardText class="pt-4">
            <p class="text-caption text-grey mb-3">Overlay de carga con spinner y mensaje personalizable.</p>
            <VRow density="compact">
              <VCol cols="auto">
                <VBtn id="my-loading-show-btn" color="primary" @click="triggerLoading">
                  <VIcon start>mdi-play</VIcon>
                  Mostrar 3s
                </VBtn>
              </VCol>
              <VCol cols="auto">
                <VBtn id="my-loading-close-btn" color="error" variant="outlined" @click="loadingVisible = false">
                  <VIcon start>mdi-stop</VIcon>
                  Cerrar
                </VBtn>
              </VCol>
            </VRow>
            <VTextField
              id="my-index-loadingmessage-tf-3"
              v-model="loadingMessage"
              class="mt-2"
              hide-details
              label="Mensaje"
              density="compact"
              variant="outlined"
            />
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ═══════════════ Floating components ═══════════════ -->

    <!-- DragPanel instance -->
    <MyDragPanel v-model="dragPanelVisible" right="20px" bottom="80px" title="Panel de prueba">
      <div class="pa-4">
        <p class="text-body-2 mb-2">
          <strong>¡Puedes arrastrarme!</strong>
          Tira de la barra azul para moverme por la pantalla.
        </p>
        <VDivider class="mb-2" />
        <div class="d-flex align-center mb-2">
          <VIcon class="mr-2" size="small">mdi-calendar</VIcon>
          <span class="text-caption">Fecha: {{ formattedDate || "—" }}</span>
        </div>
        <div class="d-flex align-center mb-2">
          <VIcon class="mr-2" size="small">mdi-clock</VIcon>
          <span class="text-caption">Hora: {{ time || "—" }}</span>
        </div>
        <VBtn id="my-dragpanel-close-btn" block class="mt-2" size="small" color="error" variant="outlined" @click="dragPanelVisible = false">
          <VIcon start size="x-small">mdi-close</VIcon>
          Cerrar panel
        </VBtn>
      </div>
    </MyDragPanel>

    <!-- Loading overlay -->
    <MyLoading progress-color="white" :message="loadingMessage" :model-value="loadingVisible" />

    <!-- ─── State Observer (debug panel) ──────────────────────── -->
    <VRow class="mt-4" density="compact">
      <VCol cols="12">
        <VCard id="my-index-card-9" :elevation="2" class="rounded-lg">
          <VCardTitle class="py-2 text-subtitle-2 font-weight-bold bg-grey-lighten-3">
            <VIcon start size="small">mdi-code-json</VIcon>
            Estado global de los componentes
            <VSpacer />
            <VBtn id="my-reset-all-btn" size="x-small" variant="outlined" @click="resetAll">
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
