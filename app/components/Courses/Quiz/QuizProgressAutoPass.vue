<template>
  <div class="d-flex flex-column">
    <!-- Row 1: AutoPass toggle -->
    <div class="d-flex align-center">
      <VSwitch
        id="crsqi-autopass"
        hide-details
        color="primary"
        density="compact"
        :label="t('autoPass')"
        :model-value="autoPass"
        class="auto-pass-switch mt-0 pt-0"
        @update:model-value="emit('toggleAutopass', $event)"
      />
      <VIcon v-if="autoPass" class="ml-1" size="small" color="primary">mdi-auto-fix</VIcon>
    </div>

    <!-- Row 2: Delay slider -->
    <div v-if="autoPass" class="d-flex align-center mt-1">
      <VSlider
        id="crsqi-delay"
        :min="1"
        :max="10"
        :step="1"
        hide-details
        density="compact"
        class="delay-slider"
        :model-value="delay"
        @update:model-value="emit('update:delay', $event)"
      />
      <span style="min-width: 28px" class="text-caption font-weight-bold ml-1">{{ delay }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    autoPass?: boolean
    delay?: number
    translations?: Record<string, string>
  }>(),
  {
    autoPass: false,
    delay: 3,
    translations: () => ({}),
  },
)

const emit = defineEmits<{
  (e: "toggleAutopass", val: boolean): void
  (e: "update:delay", val: number): void
}>()

function t(key: string) {
  return props.translations[key] || key
}
</script>

<style scoped>
.auto-pass-switch {
  margin: 0;
}
.auto-pass-switch :deep(.v-label) {
  font-size: 12px;
}

.delay-slider {
  flex: 1;
  min-width: 60px;
}
.delay-slider :deep(.v-slider__thumb) {
  width: 14px;
  height: 14px;
}
.delay-slider :deep(.v-slider__track-container) {
  height: 4px;
}
</style>
