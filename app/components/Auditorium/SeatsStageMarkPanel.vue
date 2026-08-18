<template>
  <MyDragPanel
    id="cmp-my-drag-panel-mark"
    v-model="showMarkPanel"
    mode="fixed"
    :top="panelTop"
    :bottom="panelBottom"
    left="calc(50% - 95px)"
    :title="'Asientos: ' + count"
  >
    <div class="mark-grid">
      <template v-for="(config, key) in statusConfig" :key="key">
        <div v-if="key === '_'" class="mark-item mark-spacer"></div>
        <div v-else class="mark-item">
          <VBtn
            :id="'aud-stageop-mark-' + key"
            icon
            class="mb-1"
            :title="config?.label"
            :style="`background-color: ${config?.color} !important; color: white`"
            @click="emit('set-status', key == 'e' ? null : key)"
          >
            <svg
              v-if="config?.icon"
              viewBox="0 0 24 24"
              style="width: 32px; height: 32px; fill: currentColor"
            >
              <path :d="config.icon" />
            </svg>
            <VIcon v-else>{{ getIconName(key) }}</VIcon>
          </VBtn>
          <span class="mark-label">{{ config?.label }}</span>
        </div>
      </template>
    </div>
  </MyDragPanel>
</template>

<script setup lang="ts">
import { STATUS_CONFIG } from "~/constants/auditorium"

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    count?: number
    statusConfig?: Record<string, unknown>
    panelTop?: string | null
    panelBottom?: string | null
  }>(),
  {
    modelValue: false,
    count: 0,
    statusConfig: () => ({}),
    panelTop: null,
    panelBottom: null,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'set-status', status: string | null): void
}>()

const showMarkPanel = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

function getIconName(key: string) {
  return (STATUS_CONFIG as Record<string, { mdi?: string }>)[key]?.mdi || ""
}
</script>

<style scoped>
.mark-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px 8px;
  padding: 8px 6px 6px;
  justify-items: center;
}

.mark-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mark-label {
  font-size: 9px;
  text-align: center;
  line-height: 1.1;
  color: #333;
}
</style>