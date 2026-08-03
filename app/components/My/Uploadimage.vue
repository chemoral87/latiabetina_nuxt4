<template>
  <div id="cmp-my-uploadimage">
    <input
      ref="fileInput"
      type="file"
      accept="image/png, image/jpeg, image/bmp"
      style="display: none"
      @change="onFileSelected"
    />

    <VBtn size="small" color="primary" :loading="loading" id="btn-my-uploadimage-pick" @click="triggerFilePicker">
      <VIcon start>mdi-camera</VIcon>
      {{ label || 'Seleccionar foto' }}
    </VBtn>

    <div v-if="loading" class="d-flex align-center justify-center mt-2 bg-grey-lighten-3 rounded" style="min-height: 80px">
      <VProgressCircular indeterminate color="primary" size="24" />
    </div>
    <div v-else-if="selectedFilename" class="d-flex align-center mt-2">
      <VChip size="small" label color="primary" variant="outlined" class="mr-2">
        <VIcon start size="x-small">mdi-file-image</VIcon>
        {{ selectedFilename }}
      </VChip>
      <VBtn size="small" variant="outlined" color="error" id="btn-my-uploadimage-clear" @click="clearImage">
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
  </div>
</template>

<script setup lang="ts">
import loadImage from "blueimp-load-image"

const props = withDefaults(defineProps<{
  modelValue?: unknown
  img?: unknown
  url?: string | null
  encoded?: string
  size?: number
  label?: string
  placeholder?: string
  filename?: string
  file?: File | null
}>(), {
  modelValue: null,
  img: null,
  url: null,
  encoded: "blob",
  size: 750,
  label: "",
  placeholder: "",
  filename: "",
  file: null,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: unknown): void
  (e: 'update:url', val: string | null): void
  (e: 'update:filename', val: string): void
  (e: 'update:file', val: File | null): void
  (e: 'loading'): void
  (e: 'change'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const dataUri = ref<string | null>(null)
const outputBlob = ref<unknown>(null)
const selectedFile = ref<File | null>(null)
const selectedFilename = ref("")
const maxSize = ref(props.size || 750)
const loading = ref(false)
const dragOver = ref(false)

watch(outputBlob, () => {
  emit("update:url", dataUri.value)
  emit("update:filename", selectedFilename.value)
  emit("update:file", selectedFile.value)
  emit("update:modelValue", outputBlob.value)
  emit("change")
})

watch(
  () => props.modelValue,
  (val) => {
    if (val == null) {
      selectedFile.value = null
      selectedFilename.value = ""
      dataUri.value = null
      outputBlob.value = null
      if (fileInput.value) fileInput.value.value = ""
    }
  },
)

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

function triggerFilePicker() {
  fileInput.value?.click()
}

function processFile(file: File) {
  loading.value = true
  selectedFilename.value = file.name
  selectedFile.value = file
  emit("loading")

  const _URL = window.URL || window.webkitURL
  const imgLoader = new Image()
  imgLoader.onload = function () {
    const ratio = Math.sqrt((imgLoader.width * imgLoader.height) / (maxSize.value * maxSize.value))
    let _maxSize = imgLoader.width > imgLoader.height ? imgLoader.width / ratio : imgLoader.height / ratio
    _maxSize = Math.round(_maxSize)

    loadImage(
      file,
      function (img) {
        const canvas = img as HTMLCanvasElement
        if (props.encoded == null || props.encoded === "blob") {
          outputBlob.value = dataURItoBlob(canvas.toDataURL())
        }
        if (props.encoded === "base_64") {
          outputBlob.value = canvas.toDataURL()
        }
        dataUri.value = canvas.toDataURL()
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

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  processFile(file)
  // Reset input so selecting the same file again triggers change
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
  processFile(file)
}

function clearImage() {
  dataUri.value = null
  outputBlob.value = null
  selectedFilename.value = ""
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ""
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
