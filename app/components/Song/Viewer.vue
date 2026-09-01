<template>
  <div id="cmp-song-viewer">
    <div v-if="hasContent" class="song-viewer">
      <div v-for="section in displayContent.sections" :key="section.id" class="mb-4">
        <div class="text-subtitle-1 font-weight-bold mb-1 section-name">
          [{{ section.name }}]<span
            v-if="!expandRepeats && (section.times ?? 1) > 1"
            class="ml-2 text-primary"
            >×{{ section.times }}</span
          >
        </div>
        <div
          v-for="line in section.lines"
          :key="line.id"
          class="song-line d-flex align-center"
        >
          <div class="syllables flex-grow-1">
            <span
              v-for="syllable in line.syllables"
              :key="syllable.id"
              :class="[
                'syllable',
                {
                  'is-space': !syllable.text.trim(),
                  'has-chord': syllable.chords.length,
                },
              ]"
            >
              <span v-if="syllable.chords.length" class="chord">{{
                syllable.chords.join(" ")
              }}</span>
              <span class="text">{{
                syllable.text.trim() === "" ? "\u00A0" : syllable.text
              }}</span>
              <span v-if="syllable.notes.length" class="note">{{
                syllable.notes.join(" ")
              }}</span>
            </span>
          </div>
          <span
            v-if="!expandRepeats && ((line as unknown as { times?: number }).times ?? 1) > 1"
            class="ml-2 text-caption text-primary font-weight-bold"
            >×{{ (line as unknown as { times?: number }).times }}</span
          >
        </div>
      </div>

      <div v-for="tab in displayContent.tabs" :key="tab.id" class="mb-4">
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
import { normalizeContent, type SongContent } from "~/types/song";
import { uid } from "~/utils/syllables";

const props = defineProps<{
  content?: SongContent | null;
  expandRepeats?: boolean;
}>();

const content = computed<SongContent>(() => normalizeContent(props.content));
const hasContent = computed(
  () => content.value.sections.length > 0 || content.value.tabs.length > 0,
);

const displayContent = computed<SongContent>(() => {
  if (!props.expandRepeats) return content.value;
  const expandedSections = content.value.sections.map((sec) => {
    const secTimes = (sec as unknown as { times?: number }).times ?? 1;
    const expandedLines = (sec.lines as unknown as Array<Record<string, unknown>>).flatMap(
      (line) => {
        const lineTimes = (line as unknown as { times?: number }).times ?? 1;
        if (lineTimes <= 1) return [line];
        return Array.from({ length: lineTimes }, (_, i) => ({
          ...(line as object),
          id: `${(line as unknown as { id: string }).id}-lr${i}-${uid()}`,
        }));
      },
    );
    if (secTimes > 1) {
      const repeated: typeof expandedLines = [];
      for (let r = 0; r < secTimes; r++) {
        for (const l of expandedLines) {
          repeated.push({
            ...(l as object),
            id: `${(l as unknown as { id: string }).id}-sr${r}-${uid()}`,
          } as unknown as (typeof expandedLines)[number]);
        }
      }
      return { ...sec, lines: repeated as unknown as typeof sec.lines };
    }
    return { ...sec, lines: expandedLines as unknown as typeof sec.lines };
  });
  return { sections: expandedSections, tabs: content.value.tabs };
});
</script>

<style scoped>
.song-line {
  margin-bottom: 4px;
}

.syllables {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 0;
}

.syllable {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 0;
  min-width: unset;
  padding: 0;
}

.syllable.is-space {
  min-width: 0.3em;
  flex-shrink: 0;
}

.syllable.is-space .text {
  /* preserve single blank as visible gap */
  white-space: pre;
}

.chord {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1e88e5;
  align-self: flex-start;
  text-align: left;
  white-space: nowrap;
}

.text {
  font-size: 1rem;
  line-height: 1.3;
  text-align: left;
}

.note {
  font-size: 0.7rem;
  line-height: 1.1;
  color: #43a047;
  align-self: flex-start;
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
