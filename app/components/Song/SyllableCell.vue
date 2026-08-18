<template>
  <div class="syllable-cell">
    <input
      :value="chordsText"
      placeholder="Acordes"
      class="syllable-input chord-input"
      title="Acordes (separados por coma o espacio)"
      @change="onChords"
    />
    <input
      v-model="syllable.text"
      placeholder="sílaba"
      class="syllable-input text-input"
    />
    <input
      :value="notesText"
      placeholder="Notas"
      class="syllable-input note-input"
      title="Melodía (notas separadas por coma o espacio)"
      @change="onNotes"
    />
    <VBtn
      icon
      color="error"
      size="x-small"
      variant="text"
      rounded="circle"
      class="remove-btn"
      title="Quitar sílaba"
      @click="emit('remove')"
    >
      <VIcon size="small">mdi-close</VIcon>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import type { SongSyllable } from "~/types/song"

const props = defineProps<{ syllable: SongSyllable }>()

const emit = defineEmits<{
  (e: "remove"): void
}>()

const chordsText = ref(props.syllable.chords.join(", "))
const notesText = ref(props.syllable.notes.join(", "))

function parseList(value: string): string[] {
  return value
    .split(/[, ]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function onChords() {
  props.syllable.chords = parseList(chordsText.value)
}

function onNotes() {
  props.syllable.notes = parseList(notesText.value)
}
</script>

<style scoped>
.syllable-cell {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 72px;
  margin-right: 4px;
  padding: 4px 6px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  background: #fafafa;
}

.syllable-input {
  width: 100%;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-family: inherit;
}

.chord-input {
  margin-bottom: 1px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e88e5;
}

.text-input {
  margin-bottom: 1px;
  font-size: 0.95rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.25);
}

.note-input {
  font-size: 0.7rem;
  color: #43a047;
}

.remove-btn {
  position: absolute;
  top: -9px;
  right: -9px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>