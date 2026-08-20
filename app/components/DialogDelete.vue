<template>
  <VDialog :id="id" v-model="dialogVisible" persistent max-width="400px">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="error">mdi-alert</VIcon>
        {{ item.title }}
        <VSpacer />
        <VBtn id="dialog-delete-close-btn" icon size="x-small" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText class="py-1">
        <div class="text-body-1 text-grey-darken-4">
          {{ item.text }}
          <strong v-if="item.strong">{{ item.strong }}</strong>
          ?
        </div>
        <div class="text-caption text-grey mt-2">Esta acción no se puede deshacer</div>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="dialog-delete-no-btn" class="mr-4" color="error" variant="outlined" :disabled="loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          NO
        </VBtn>
        <VBtn id="dialog-delete-yes-btn" color="primary" :loading="loading" variant="elevated" @click="ok">
          <VIcon start>mdi-check</VIcon>
          SI
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
interface DialogData {
  title?: string
  text?: string
  strong?: string
  payload?: unknown
}

const props = withDefaults(defineProps<{
  id?: string
  dialog: DialogData
  loading?: boolean
}>(), {
  id: "dialo-delet-dlg-1",
  loading: false,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'ok', payload?: unknown): void
}>()

const dialogVisible = ref(true)
const item = ref<DialogData>({ title: "Confirmación", text: "Confirmación", strong: "", payload: null })

const hasPayload = computed(() => item.value.payload !== null && item.value.payload !== undefined)

watch(() => props.dialog, (val) => {
  initializeDialog(val)
}, { immediate: true, deep: true })

onMounted(() => {
  initializeDialog(props.dialog)
})

function initializeDialog(dialogData?: DialogData) {
  if (!dialogData) return
  item.value = {
    title: dialogData.title || "Confirmación",
    text: dialogData.text || "Confirmación",
    strong: dialogData.strong || "",
    payload: dialogData.payload !== undefined ? dialogData.payload : null,
  }
}

function close() {
  if (props.loading) return
  emit("close")
}

function ok() {
  if (props.loading) return
  if (hasPayload.value) {
    emit("ok", item.value.payload)
  } else {
    emit("ok")
  }
}
</script>
