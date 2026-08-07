<template>
  <VCard id="quiz-config" elevation="2" class="pa-6 rounded-lg">
    <VCardTitle class="justify-center text-h5 pb-4">
      <VIcon start color="primary">mdi-tune-variant</VIcon>
      {{ t("configTitle") }}
    </VCardTitle>

    <VCardText>
      <!-- Levels Selection -->
      <p class="text-subtitle-1 font-weight-medium mb-2">{{ t("selectLevels") }}</p>
      <VRow class="mb-4">
        <VCol v-for="lv in levels" :key="lv.key" sm="4" cols="12">
          <VCheckbox
            :id="`crsqi-level-${lv.key}`"
            hide-details
            :color="lv.color"
            class="level-checkbox"
            :model-value="selectedLevels.includes(lv.key)"
            @change="toggleLevel(lv.key)"
          >
            <template #label>
              <span>
                <VIcon class="mr-1" size="small" :color="lv.color">{{ lv.icon }}</VIcon>
                {{ lv.label }} ({{ lv.count }})
              </span>
            </template>
          </VCheckbox>
        </VCol>
      </VRow>

      <!-- Question Count -->
      <p class="text-subtitle-1 font-weight-medium mb-2">{{ t("numQuestions") }}</p>
      <VRow class="align-center mb-2">
        <VCol sm="6" cols="12">
          <VSlider
            id="crsqi-count-1"
            :min="1"
            thumb-label
            color="primary"
            :max="maxQuestions"
            thumb-color="primary"
            :model-value="questionCount"
            :disabled="maxQuestions === 0"
            track-color="primary-lighten-3"
            :label="`${questionCount} ${t('questions')}`"
            @update:model-value="emit('update:questionCount', $event)"
          />
        </VCol>
        <VCol sm="3" cols="12">
          <VTextField
            id="crsqi-count-2"
            :min="1"
            class="mx-2"
            hide-details
            type="number"
            density="compact"
            variant="outlined"
            :max="maxQuestions"
            :model-value="questionCount"
            :disabled="maxQuestions === 0"
            @update:model-value="emit('update:questionCount', Number($event))"
          />
        </VCol>
      </VRow>
      <p class="text-caption text-grey mb-0">
        {{ t("available") }}: <strong>{{ maxQuestions }}</strong> {{ t("questions") }}
      </p>
    </VCardText>

    <!-- VCardActions replacement per ai_rule: plain flex div -->
    <div class="d-flex justify-center pb-4">
      <VBtn
        id="btn-crsqi-start"
        elevation="4"
        size="x-large"
        color="primary"
        :loading="starting"
        class="px-10 rounded-lg"
        :disabled="selectedLevels.length === 0 || maxQuestions === 0"
        @click="emit('start')"
      >
        <VIcon start>mdi-play-circle-outline</VIcon>
        {{ t("startQuiz") }}
      </VBtn>
    </div>
  </VCard>
</template>

<script setup lang="ts">
interface LevelOption {
  key: string
  icon: string
  color: string
  label: string
  count: number
}

const props = withDefaults(
  defineProps<{
    selectedLevels: string[]
    questionCount: number
    maxQuestions?: number
    starting?: boolean
    levels: LevelOption[]
    translations?: Record<string, string>
  }>(),
  {
    maxQuestions: 0,
    starting: false,
    translations: () => ({}),
  },
)

const emit = defineEmits<{
  (e: "update:selectedLevels", val: string[]): void
  (e: "update:questionCount", val: number): void
  (e: "start"): void
}>()

function toggleLevel(key: string) {
  const levels = [...props.selectedLevels]
  const idx = levels.indexOf(key)
  if (idx >= 0) {
    levels.splice(idx, 1)
  } else {
    levels.push(key)
  }
  emit("update:selectedLevels", levels)
}

function t(key: string) {
  return props.translations[key] || key
}
</script>

<style scoped>
.level-checkbox {
  margin-top: 0;
  padding-top: 0;
}
</style>
