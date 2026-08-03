<template>
  <v-group :config="{ y: 3, id: 'cmp-auditorium-seats-stage-subsection-label' }">
    <v-rect :config="labelBgConfig" />
    <v-text :config="labelTextConfig" />
  </v-group>
</template>

<script setup lang="ts">
import { DEFAULT_SETTINGS } from "~/constants/auditorium"

const LABEL_TEXT = "#ff9800"

interface LabelSubsection {
  w?: number
  width?: number
  n?: string
  name?: string
  [key: string]: unknown
}

const props = defineProps<{
  subsection: LabelSubsection
  sectionHeight: number
}>()

const labelBgConfig = computed(() => {
  return {
    x: 0,
    y: 0,
    width: props.subsection.w || props.subsection.width || 40,
    height: props.sectionHeight - DEFAULT_SETTINGS.SECTION_TOP_PADDING - 30,
    fill: "#424242",
    opacity: 0.3,
    strokeWidth: 2,
    stroke: LABEL_TEXT,
    strokeDashArray: [5, 5],
  }
})

const labelTextConfig = computed(() => {
  const width = props.subsection.w || props.subsection.width || 40
  const height = props.sectionHeight - DEFAULT_SETTINGS.SECTION_TOP_PADDING - DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
  return {
    x: width / 2,
    y: height / 2,
    text: props.subsection.n || props.subsection.name,
    fontSize: 14,
    fill: LABEL_TEXT,
    fontStyle: "bold",
    align: "center",
    offsetX: width / 2 - 5,
    offsetY: 7,
  }
})
</script>
