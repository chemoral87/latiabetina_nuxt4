<template>
  <div id="cmp-song-viewer">
    <div v-if="hasContent" class="song-viewer">
      <div v-for="section in content.sections" :key="section.id" class="mb-4">
        <div class="text-subtitle-1 font-weight-bold mb-1 section-name">
          [{{ section.name }}]
        </div>
        <div v-for="line in section.lines" :key="line.id" class="song-line">
          <div class="syllables">
            <span v-for="syllable in line.syllables" :key="syllable.id" class="syllable">
              <span v-if="syllable.chords.length" class="chord">{{ syllable.chords.join(" ") }}</span>
              <span class="text">{{ syllable.text }}</span>
              <span v-if="syllable.notes.length" class="note">{{ syllable.notes.join(" ") }}</span>
            </span>
          </div>
        </div>
      </div>

      <div v-for="tab in content.tabs" :key="tab.id" class="mb-4">
        <div v-if="tab.title" class="text-subtitle-1 font-weight-bold mb-1">
          {{ tab.title }}
        </div>
        <pre class="tablature">{{ tab.tablature }}</pre>
      </div>
    </div>

    <div v-else class="text-center text-grey py-6">
      <VIcon size="48" class="mb-2">mdi-music-note-off</VIcon>
      <div>Esta canción aún no tiene contenido.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeContent, type SongContent } from "~/types/song"

const props = defineProps<{
  content?: SongContent | null
}>()

const content = computed<SongContent>(() => normalizeContent(props.content))
const hasContent = computed(
  () => content.value.sections.length > 0 || content.value.tabs.length > 0,
)
</script>

<style scoped>
.song-line {
  margin-bottom: 4px;
}

.syllables {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
}

.syllable {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 2px;
  min-width: 12px;
}

.chord {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1e88e5;
}

.text {
  font-size: 1rem;
  line-height: 1.3;
}

.note {
  font-size: 0.7rem;
  line-height: 1.1;
  color: #43a047;
}

.section-name {
  color: #1e88e5;
}

.tablature {
  margin: 0;
  padding: 8px;
  overflow-x: auto;
  border-radius: 4px;
  background: #f5f5f5;
  font-family: "Consolas", "Monaco", monospace;
  font-size: 12px;
  line-height: 1.25;
  white-space: pre;
}
</style>