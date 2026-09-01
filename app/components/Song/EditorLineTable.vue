<template>
  <div class="line-table-wrap">
    <table class="line-table">
      <tbody>
        <tr class="row-chords">
          <th class="row-label">Acordes</th>
          <td
            v-for="syllable in line.syllables"
            :key="'c-' + syllable.id"
            :class="['cell-chord', { 'is-active': activeSyllableId === syllable.id }]"
            :style="{ width: Math.max(1, chordsText(syllable).length) + 0.69 + 'ch' }"
            @click.stop="emit('set-active', syllable.id)"
          >
            <input
              :value="chordsText(syllable)"
              class="cell-input chord-input"
              title="Acordes (separados por coma o espacio)"
              @focus="emit('set-active', syllable.id)"
              @change="emit('chords-change', syllable, $event)"
              @keydown="emit('keydown', $event, line, syllable)"
            />
          </td>
        </tr>
        <tr class="row-lyrics">
          <th class="row-label">Letra</th>
          <td
            v-for="syllable in line.syllables"
            :key="'t-' + syllable.id"
            :style="{ width: Math.max(1, (syllable.text || ' ').length) + 0.69 + 'ch' }"
            :class="['cell-lyric', { 'cell-bottom-border': !isNotesVisible, 'is-active': activeSyllableId === syllable.id }]"
            @click.stop="emit('set-active', syllable.id)"
          >
            <input
              :value="syllable.text"
              class="cell-input text-input"
              @focus="emit('set-active', syllable.id)"
              @keydown="emit('keydown', $event, line, syllable)"
              @input="emit('text-input', syllable, ($event.target as HTMLInputElement).value)"
            />
          </td>
        </tr>
        <tr v-if="isNotesVisible" class="row-notes">
          <th class="row-label">Notas</th>
          <td
            v-for="syllable in line.syllables"
            :key="'n-' + syllable.id"
            :class="['cell-note', { 'is-active': activeSyllableId === syllable.id }]"
            :style="{ width: Math.max(1, notesText(syllable).length) + 0.69 + 'ch' }"
            @click.stop="emit('set-active', syllable.id)"
          >
            <input
              :value="notesText(syllable)"
              class="cell-input note-input"
              title="Melodía (notas separadas por coma o espacio)"
              @focus="emit('set-active', syllable.id)"
              @change="emit('notes-change', syllable, $event)"
              @keydown="emit('keydown', $event, line, syllable)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { SongLine, SongSyllable } from "~/types/song"

defineProps<{
  line: SongLine
  activeSyllableId: string | null
  isNotesVisible: boolean
  chordsText: (s: SongSyllable) => string
  notesText: (s: SongSyllable) => string
}>()

const emit = defineEmits<{
  (e: "set-active", id: string): void
  (e: "keydown", ev: KeyboardEvent, line: SongLine, syllable: SongSyllable): void
  (e: "chords-change", syllable: SongSyllable, ev: Event): void
  (e: "notes-change", syllable: SongSyllable, ev: Event): void
  (e: "text-input", syllable: SongSyllable, value: string): void
}>()
</script>

<style scoped>
.line-table-wrap {
  overflow-x: auto;
  overflow-y: visible;
  padding: 10px 8px 12px;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  background: #fff9c4;
}

.line-table {
  border-collapse: separate;
  border-spacing: 0;
  width: max-content;
  font-family: "Consolas", "SFMono-Regular", "Monaco", "Courier New", monospace;
  font-variant-ligatures: none;
}

.line-table .row-label {
  padding: 1px 8px 1px 2px;
  font-size: 0.65rem;
  font-weight: 600;
  text-align: right;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.5);
}

.line-table td {
  padding: 1px;
  vertical-align: bottom;
  border-left: 1px dashed rgba(0, 0, 0, 0.3);
  border-right: 1px dashed rgba(0, 0, 0, 0.3);
}

.row-chords td.cell-chord {
  border-top: 1px dashed rgba(0, 0, 0, 0.3);
}

.cell-lyric.cell-bottom-border {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.3);
}

.row-notes td.cell-note {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.3);
}

.cell-input {
  box-sizing: content-box;
  width: 100%;
  min-width: 0;
  border: 0;
  margin: 0;
  padding: 0;
  outline: none;
  background: transparent;
  text-align: center;
  font-family: inherit;
}

.chord-input {
  font-size: 0.75rem;
  font-weight: 700;
  color: #1e88e5;
}

.text-input {
  font-size: 0.95rem;
}

.note-input {
  font-size: 0.7rem;
  color: #43a047;
}

.cell-lyric,
.cell-chord,
.cell-note {
  position: relative;
  overflow: visible;
  transition:
    background 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
}

.cell-lyric.is-active,
.cell-chord.is-active,
.cell-note.is-active {
  background: #e3f2fd !important;
  border: 1.5px solid #1e88e5 !important;
  border-radius: 6px;
  box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.18);
}

.cell-lyric.is-active .text-input {
  color: #0d47a1;
  font-weight: 600;
}

.cell-chord.is-active .chord-input {
  color: #0d47a1;
}

.cell-note.is-active .note-input {
  color: #1b5e20;
  font-weight: 600;
}
</style>
