<template>
  <div id="cmp-my-uploadimage-crop">
    <input
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg, image/bmp"
      style="display: none"
      @change="onFileSelected"
    />

    <VBtn id="my-uploadimagecrop-pick-btn" size="small" color="primary" :loading="loading" @click="triggerFilePicker">
      <VIcon start>mdi-camera</VIcon>
      {{ label || 'Subir foto' }}
    </VBtn>

    <div v-if="loading" class="d-flex align-center justify-center mt-2 bg-grey-lighten-3 rounded" style="min-height: 80px">
      <VProgressCircular indeterminate color="primary" size="24" />
    </div>
    <div v-else-if="filename" class="d-flex align-center mt-2">
      <VChip size="small" label color="primary" variant="outlined" class="mr-2">
        <VIcon start size="x-small">mdi-file-image</VIcon>
        {{ filename }}
      </VChip>
      <VBtn id="my-uploadimagecrop-clear-btn" size="small" variant="outlined" color="error" @click="clearImage">
        <VIcon start size="x-small">mdi-close</VIcon>
        Limpiar
      </VBtn>
    </div>
    <div
      v-else
      class="d-flex flex-column align-center justify-center mt-2 rounded drop-zone"
      :class="{ 'drop-zone--active': dragOver }"
      style="min-height: 80px; cursor: pointer; border: 2px dashed #bdbdbd;"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop.prevent="onDrop"
      @click="triggerFilePicker"
    >
      <VIcon :color="dragOver ? 'primary' : 'grey-lighten-1'">mdi-cloud-upload-outline</VIcon>
      <span class="text-caption mt-1" :class="dragOver ? 'text-primary' : 'text-grey'">Arrastra el archivo aquí</span>
    </div>

    <VDialog id="my-uploa-dlg-1" v-model="dialog" persistent max-width="520px">
      <VCard>
        <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
          <VIcon start size="small" color="primary">mdi-crop</VIcon>
          {{ label || 'Recortar foto' }}
          <VSpacer />
          <VBtn id="my-uploadimagecrop-close-btn" icon size="x-small" @click="cancel()">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCardTitle>

        <VCardText>
          <VRow density="comfortable">
            <VCol cols="6">
              <Cropper v-if="uri" :stencil-component="CircleStencil" :src="uri" @change="changeCropper" />
              <div v-else class="d-flex align-center justify-center bg-grey-lighten-3 rounded" style="height: 160px">
                <VIcon size="large" color="grey-lighten-1">mdi-image-plus</VIcon>
              </div>
            </VCol>
            <VCol cols="6">
              <div v-if="imageToUpload" class="d-flex align-center justify-center bg-grey-lighten-4 rounded-circle" style="width: 160px; height: 160px; overflow: hidden;">
                <img style="max-width: 100%; min-height: 120px; border-radius: 50%;" :src="imageToUpload" />
              </div>
              <div v-else class="d-flex align-center justify-center bg-grey-lighten-3 rounded-circle" style="width: 160px; height: 160px;">
                <VIcon size="large" color="grey-lighten-1">mdi-image-off-outline</VIcon>
              </div>
            </VCol>
          </VRow>
        </VCardText>

        <div class="d-flex justify-end px-4 pb-4">
          <VBtn id="my-uploadimagecrop-cancel-btn" color="primary" variant="outlined" class="mr-4" @click="cancel()">
            <VIcon start>mdi-close</VIcon>
            Cancelar
          </VBtn>
          <VBtn id="my-uploadimagecrop-save-btn" color="primary" variant="elevated" @click="save()">
            <VIcon start>mdi-content-save</VIcon>
            Guardar
          </VBtn>
        </div>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { Cropper, CircleStencil } from "vue-advanced-cropper"
import "vue-advanced-cropper/dist/style.css"
import loadImage from "blueimp-load-image"

const props = withDefaults(defineProps<{
  modelValue?: unknown
  url?: string | null
  size?: number
  label?: string
}>(), {
  modelValue: null,
  url: null,
  size: 750,
  label: "",
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: unknown): void
  (e: 'update:url', val: string | null): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const blobCropped = ref<unknown>(null)
const dialog = ref(false)
const uri = ref<string | null>(null)
const imageToUpload = ref<string>("")
const savedBlob = ref<unknown>(null)
const savedImageToUpload = ref("")
const filename = ref("")
const loading = ref(false)
const maxSize = ref(props.size || 750)
const dragOver = ref(false)

watch(dialog, (val) => {
  if (val) {
    savedBlob.value = blobCropped.value
    savedImageToUpload.value = imageToUpload.value
  }
})

watch(
  () => props.modelValue,
  (val) => {
    if (val == null) clearImage()
  },
)

function save() {
  emit("update:modelValue", blobCropped.value)
  emit("update:url", imageToUpload.value)
  dialog.value = false
}

function triggerFilePicker() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fileInputChange(file)
  // Reset input so selecting the same file triggers change
  input.value = ""
}

function onDragOver() {
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  if (!file.type.match(/^image\/(png|jpeg|bmp)$/)) return
  fileInputChange(file)
}

function cancel() {
  uri.value = null
  imageToUpload.value = savedImageToUpload.value
  blobCropped.value = savedBlob.value
  dialog.value = false
}

function clearImage() {
  uri.value = null
  imageToUpload.value = ""
  blobCropped.value = null
  filename.value = ""
  if (fileInput.value) fileInput.value.value = ""
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1])
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

function changeCropper({ canvas }: { canvas: HTMLCanvasElement }) {
  imageToUpload.value = canvas.toDataURL()
  blobCropped.value = dataURItoBlob(imageToUpload.value)
}

function fileInputChange(file: File) {
  if (!file) {
    uri.value = null
    imageToUpload.value = ""
    blobCropped.value = null
    filename.value = ""
    return
  }

  loading.value = true
  filename.value = file.name

  const _URL = window.URL || window.webkitURL
  const imgLoader = new Image()
  imgLoader.onload = function () {
    const ratio = Math.sqrt((imgLoader.width * imgLoader.height) / (maxSize.value * maxSize.value))
    let _maxSize = imgLoader.width > imgLoader.height ? imgLoader.width / ratio : imgLoader.height / ratio
    _maxSize = Math.round(_maxSize)

    loadImage(
      file,
      function (img) {
        uri.value = (img as HTMLCanvasElement).toDataURL()
        dialog.value = true
        loading.value = false
      },
      {
        maxWidth: _maxSize,
        maxHeight: _maxSize,
        orientation: true,
        canvas: true,
      },
    )
  }
  const objectUrl = _URL.createObjectURL(file)
  imgLoader.src = objectUrl
  imgLoader.onloadend = () => _URL.revokeObjectURL(objectUrl)
}
</script>

<style scoped>
.drop-zone {
  transition: background-color 0.2s, border-color 0.2s;
  background-color: #f5f5f5;
}
.drop-zone:hover {
  background-color: #eeeeee;
  border-color: #1976d2 !important;
}
.drop-zone--active {
  background-color: #e3f2fd !important;
  border-color: #1976d2 !important;
}
</style>
