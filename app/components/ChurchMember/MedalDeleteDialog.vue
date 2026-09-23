<template>
  <VDialog
    max-width="400"
    role="alertdialog"
    :model-value="modelValue"
    aria-describedby="cmm-medal-delete-desc"
    aria-labelledby="cmm-medal-delete-title"
    @update:model-value="close"
  >
    <VCard>
      <VCardTitle id="cmm-medal-delete-title" class="text-subtitle-1 font-weight-medium">
        <VIcon start color="warning">mdi-alert-outline</VIcon>
        Confirmar eliminación
      </VCardTitle>
      <VCardText id="cmm-medal-delete-desc">
        ¿Desea remover la medalla <strong>{{ medalLabel }}</strong>?
      </VCardText>
      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="cmm-medal-delete-cancel-btn" class="mr-4" variant="outlined" :disabled="loading" @click="close">
          Cancelar
        </VBtn>
        <VBtn id="cmm-medal-delete-confirm-btn" color="error" variant="flat" :loading="loading" :disabled="loading" @click="remove">
          Eliminar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { MEDAL_OPTIONS } from '~/constants/churchMember'

const props = defineProps<{
  modelValue: boolean
  memberId: string | number
  medal: { id: number; medal: string } | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleted'): void
}>()

const { ChurchMember } = useRepository()
const loading = ref(false)

const medalLabel = computed(() => MEDAL_OPTIONS.find(({ value }) => value === props.medal?.medal)?.title ?? props.medal?.medal ?? '')

function close() {
  if (!loading.value) emit('update:modelValue', false)
}

async function remove() {
  if (loading.value || !props.medal) return
  loading.value = true
  try {
    await ChurchMember.deleteMedal(props.memberId, props.medal.id)
    emit('update:modelValue', false)
    emit('deleted')
  } finally {
    loading.value = false
  }
}
</script>
