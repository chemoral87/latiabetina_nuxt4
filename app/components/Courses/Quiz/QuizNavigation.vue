<template>
  <VCard id="quiz-navigation" elevation="1" class="rounded-lg">
    <!-- VCardActions replacement per ai_rule: plain flex div -->
    <div style="gap: 8px" class="pa-4 d-flex justify-space-between align-center flex-wrap">
      <VBtn
        id="btn-crsqi-prev"
        color="primary"
        variant="outlined"
        :disabled="currentIndex === 0"
        @click="emit('previous')"
      >
        <VIcon start>mdi-chevron-left</VIcon>
        {{ t("previous") }}
      </VBtn>

      <span id="crsqi-counter" class="text-body-2 text-grey mr-2">
        {{ answered }}/{{ total }}
      </span>

      <div class="d-flex" style="gap: 8px">
        <VBtn
          v-if="currentIndex < total - 1"
          id="btn-crsqi-next"
          color="primary"
          @click="emit('next')"
        >
          {{ t("next") }}
          <VIcon end>mdi-chevron-right</VIcon>
        </VBtn>

        <VBtn
          v-if="allAnswered"
          id="btn-crsqi-finish"
          color="success"
          @click="emit('finish')"
        >
          <VIcon start>mdi-check-all</VIcon>
          {{ t("finish") }}
        </VBtn>
      </div>
    </div>
  </VCard>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentIndex: number
    total: number
    answered?: number
    allAnswered?: boolean
    translations?: Record<string, string>
  }>(),
  {
    answered: 0,
    allAnswered: false,
    translations: () => ({}),
  },
)

const emit = defineEmits<{
  (e: "previous"): void
  (e: "next"): void
  (e: "finish"): void
}>()

function t(key: string) {
  return props.translations[key] || key
}
</script>
