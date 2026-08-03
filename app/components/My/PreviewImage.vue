<template>
  <VExpandTransition>
    <div v-if="loading || isWaiting" class="image-loading-wrapper">
      <VProgressCircular indeterminate color="primary" :size="size" />
      <span v-if="loadingText" class="ml-3 text-grey-darken-1">{{ loadingText }}</span>
    </div>
    <VImg v-else-if="imageReady && src" :src="src" :max-height="maxHeight" contain>
      <template #placeholder>
        <VRow class="fill-height ma-0" align="center" justify="center">
          <VProgressCircular indeterminate color="primary" />
        </VRow>
      </template>
    </VImg>
  </VExpandTransition>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  loading?: boolean
  loadingText?: string
  maxHeight?: string | number
  size?: string | number
  delaySeconds?: number
}>(), {
  src: "",
  loading: false,
  loadingText: "Procesando imagen…",
  maxHeight: 200,
  size: 48,
  delaySeconds: 0,
})

const imageReady = ref(false)
let previewTimer: ReturnType<typeof setTimeout> | null = null

const isWaiting = computed(() => !!props.src && !imageReady.value)

watch(
  [() => props.src, () => props.loading, () => props.delaySeconds],
  () => scheduleImagePreview(),
  { immediate: true },
)

onBeforeUnmount(() => {
  clearPreviewTimer()
})

function clearPreviewTimer() {
  if (previewTimer) {
    clearTimeout(previewTimer)
    previewTimer = null
  }
}

function scheduleImagePreview() {
  clearPreviewTimer()
  imageReady.value = false

  if (props.loading || !props.src) return

  const delay = Math.max(Number(props.delaySeconds) || 0, 0) * 1000
  if (delay === 0) {
    imageReady.value = true
    return
  }

  previewTimer = setTimeout(() => {
    imageReady.value = true
    previewTimer = null
  }, delay)
}
</script>

<style scoped>
.image-loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}
</style>
