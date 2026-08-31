<template>
  <VCard id="cmp-song-editor">
    <VCardTitle class="d-flex align-center">
      <VIcon class="mr-2" color="primary">{{
        isEditMode ? "mdi-pencil" : "mdi-music-note-plus"
      }}</VIcon>
      <span class="text-h5">{{ formTitle }}</span>
    </VCardTitle>

    <VCardText class="py-1">
      <VForm ref="formRef" @submit.prevent="save">
        <VRow>
          <VCol md="4" cols="12">
            <VTextField
              v-model="item.title"
              required
              autofocus
              label="Título"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              :error-messages="errors?.title"
              :rules="[vrules.requiredField('Título')]"
              @keyup.enter="save"
            />
          </VCol>
          <VCol md="4" cols="12">
            <VTextField
              v-model="item.artist"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              label="Autor / Artista"
              :error-messages="errors?.artist"
            />
          </VCol>
          <VCol md="2" cols="6">
            <VTextField
              v-model="item.key"
              density="compact"
              label="Tonalidad"
              variant="outlined"
              :disabled="disabled"
              placeholder="C, D, Em..."
            />
          </VCol>
          <VCol md="2" cols="6">
            <VTextField
              v-model="item.tempo"
              label="Tempo"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              placeholder="90 bpm"
            />
          </VCol>
        </VRow>
      </VForm>

      <div class="d-flex align-center flex-wrap my-3">
        <VBtn
          size="small"
          color="primary"
          class="mr-2 mb-1"
          variant="outlined"
          @click="pasteDialog = true"
        >
          <VIcon start>mdi-content-paste</VIcon>
          Pegar letra
        </VBtn>
        <VBtn
          size="small"
          color="primary"
          class="mr-2 mb-1"
          variant="outlined"
          @click="addSection"
        >
          <VIcon start>mdi-plus</VIcon>
          Agregar sección
        </VBtn>
        <VBtn
          size="small"
          color="primary"
          class="mr-2 mb-1"
          variant="outlined"
          @click="addTab"
        >
          <VIcon start>mdi-plus</VIcon>
          Agregar tab
        </VBtn>
        <VBtn
          id="song-import-json-btn"
          size="small"
          color="primary"
          class="mr-2 mb-1"
          variant="outlined"
          @click="triggerImportJson"
        >
          <VIcon start>mdi-file-upload-outline</VIcon>
          Cargar JSON
        </VBtn>
        <VBtn
          id="song-export-json-btn"
          class="mb-1"
          size="small"
          color="primary"
          variant="outlined"
          @click="exportJson"
        >
          <VIcon start>mdi-file-download-outline</VIcon>
          Exportar JSON
        </VBtn>
        <input
          id="song-json-file-input"
          ref="jsonFileInput"
          type="file"
          style="display: none"
          accept=".json,application/json"
          @change="onJsonFileChange"
        />
      </div>

      <div
        v-if="content.sections.length === 0 && content.tabs.length === 0"
        class="text-center text-grey py-6"
      >
        <VIcon size="48" class="mb-2">mdi-music-note-plus</VIcon>
        <div>Pega la letra o agrega una sección para empezar.</div>
      </div>

      <div
        v-for="(section, si) in content.sections"
        :key="section.id"
        class="section-editor mb-3"
      >
        <div style="gap: 8px" class="d-flex align-center mb-2">
          <VTextField
            v-model="section.name"
            hide-details
            label="Sección"
            density="compact"
            variant="outlined"
            class="flex-grow-1"
            :disabled="disabled"
          />
          <VTextField
            :id="`song-section-times-${si}`"
            v-model.number="section.times"
            :min="1"
            :max="10"
            hide-details
            label="Veces"
            type="number"
            density="compact"
            variant="outlined"
            :disabled="disabled"
            style="max-width: 90px"
            title="Veces que se repite la sección"
            @update:model-value="
              (v: unknown) => {
                const n = Number(v);
                section.times =
                  !Number.isFinite(n) || n < 1 ? 1 : Math.floor(n);
              }
            "
          />
          <VBtn
            size="small"
            variant="text"
            title="Agregar línea"
            @click="addLine(section)"
          >
            <VIcon>mdi-plus</VIcon>
          </VBtn>
          <VBtn
            size="small"
            color="error"
            variant="text"
            title="Eliminar sección"
            @click="removeSection(si)"
          >
            <VIcon>mdi-delete</VIcon>
          </VBtn>
        </div>

        <div
          v-for="(line, li) in section.lines"
          :key="line.id"
          class="line-editor mb-2"
        >
          <div class="d-flex align-center mb-1" style="gap: 8px">
            <span class="text-caption text-grey" style="min-width: 48px">Línea {{ li + 1 }}</span>
            <VTextField
              :id="`song-line-times-${si}-${li}`"
              v-model.number="line.times"
              type="number"
              hide-details
              label="Veces"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              :min="1"
              :max="10"
              style="max-width: 90px"
              title="Veces que se repite la línea"
              @update:model-value="(v: unknown) => { const n = Number(v); line.times = !Number.isFinite(n) || n < 1 ? 1 : Math.floor(n) }"
            />
            <span v-if="line.times > 1" class="text-caption text-primary">×{{ line.times }}</span>
          </div>
          <div class="line-table-wrap">
            <table class="line-table">
              <tbody>
                <tr class="row-chords">
                  <th class="row-label">Acordes</th>
                  <td
                    v-for="syllable in line.syllables"
                    :key="'c-' + syllable.id"
                    :class="[
                      'cell-chord',
                      { 'is-active': activeSyllableId === syllable.id },
                    ]"
                    :style="{
                      width:
                        Math.max(1, chordsText(syllable).length) + 0.66 + 'ch',
                    }"
                    @click.stop="setActiveSyllable(syllable.id)"
                  >
                    <input
                      :value="chordsText(syllable)"
                      class="cell-input chord-input"
                      title="Acordes (separados por coma o espacio)"
                      @focus="activeSyllableId = syllable.id"
                      @change="onChordsChange(syllable, $event)"
                    />
                  </td>
                </tr>
                <tr class="row-lyrics">
                  <th class="row-label">Letra</th>
                  <td
                    v-for="syllable in line.syllables"
                    :key="'t-' + syllable.id"
                    :style="{
                      width:
                        Math.max(1, (syllable.text || ' ').length) +
                        0.66 +
                        'ch',
                    }"
                    :class="[
                      'cell-lyric',
                      {
                        'cell-bottom-border': !isNotesRowVisible(line),
                        'is-active': activeSyllableId === syllable.id,
                      },
                    ]"
                    @click.stop="setActiveSyllable(syllable.id)"
                  >
                    <input
                      v-model="syllable.text"
                      class="cell-input text-input"
                      @focus="activeSyllableId = syllable.id"
                    />
                  </td>
                </tr>
                <tr v-if="isNotesRowVisible(line)" class="row-notes">
                  <th class="row-label">Notas</th>
                  <td
                    v-for="syllable in line.syllables"
                    :key="'n-' + syllable.id"
                    :class="[
                      'cell-note',
                      { 'is-active': activeSyllableId === syllable.id },
                    ]"
                    :style="{
                      width:
                        Math.max(1, notesText(syllable).length) + 0.66 + 'ch',
                    }"
                    @click.stop="setActiveSyllable(syllable.id)"
                  >
                    <input
                      :value="notesText(syllable)"
                      class="cell-input note-input"
                      title="Melodía (notas separadas por coma o espacio)"
                      @focus="activeSyllableId = syllable.id"
                      @change="onNotesChange(syllable, $event)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="line.syllables.length === 0" class="mt-1">
            <VBtn
              size="x-small"
              variant="text"
              color="primary"
              @click="addSyllable(line)"
            >
              <VIcon start size="small">mdi-plus</VIcon>
              Agregar sílaba
            </VBtn>
          </div>
          <div style="gap: 4px" class="d-flex align-center flex-wrap mt-1">
            <!-- Syllable insert/remove for selected cell – at beginning -->
            <template v-if="getActiveSyllableInLine(line)">
              <VBtn
                :id="`song-syllable-insert-left-${si}-${li}`"
                text
                size="x-small"
                variant="text"
                color="primary"
                :disabled="disabled"
                title="Agregar sílaba antes de la celda seleccionada"
                @click="addSyllableBefore(line, getActiveSyllableInLine(line)!)"
              >
                <VIcon size="small">mdi-plus</VIcon>
                <VIcon size="10">mdi-arrow-left</VIcon>
              </VBtn>
              <VBtn
                :id="`song-syllable-insert-right-${si}-${li}`"
                text
                size="x-small"
                variant="text"
                color="primary"
                :disabled="disabled"
                title="Agregar sílaba después de la celda seleccionada"
                @click="addSyllableAfter(line, getActiveSyllableInLine(line)!)"
              >
                <VIcon size="small">mdi-plus</VIcon>
                <VIcon size="10">mdi-arrow-right</VIcon>
              </VBtn>
              <VBtn
                :id="`song-syllable-remove-${si}-${li}`"
                text
                color="error"
                size="x-small"
                variant="text"
                :disabled="disabled"
                title="Quitar sílaba seleccionada"
                @click="
                  removeSyllable(line, getActiveSyllableInLine(line)!);
                  clearActiveSyllable();
                "
              >
                <VIcon size="small">mdi-minus</VIcon>
              </VBtn>
              <VDivider
                vertical
                class="mx-1"
                style="height: 16px; align-self: center"
              />
            </template>
            <template v-else>
              <VBtn
                text
                disabled
                size="x-small"
                variant="text"
                title="Selecciona una sílaba"
              >
                <VIcon size="small">mdi-plus</VIcon>
                <VIcon size="10">mdi-arrow-left</VIcon>
              </VBtn>
              <VBtn
                text
                disabled
                size="x-small"
                variant="text"
                title="Selecciona una sílaba"
              >
                <VIcon size="small">mdi-plus</VIcon>
                <VIcon size="10">mdi-arrow-right</VIcon>
              </VBtn>
              <VBtn
                text
                disabled
                size="x-small"
                variant="text"
                title="Selecciona una sílaba"
              >
                <VIcon size="small">mdi-minus</VIcon>
              </VBtn>
              <VDivider
                vertical
                class="mx-1"
                style="height: 16px; align-self: center"
              />
            </template>
            <VBtn
              text
              size="x-small"
              variant="text"
              color="primary"
              @click="splitLineSyllables(line)"
            >
              Dividir sílabas
            </VBtn>
            <VBtn
              text
              size="x-small"
              variant="text"
              color="primary"
              @click="mergeLine(line)"
            >
              Unir
            </VBtn>
            <VBtn
              text
              size="x-small"
              variant="text"
              :color="isNotesRowVisible(line) ? 'primary' : undefined"
              @click="toggleNotes(line)"
            >
              {{ isNotesRowVisible(line) ? "Ocultar notas" : "Notas" }}
            </VBtn>
            <VBtn
              :id="`song-line-duplicate-btn-${si}-${li}`"
              text
              size="x-small"
              variant="text"
              color="primary"
              title="Duplicar línea"
              @click="duplicateLine(section, li)"
            >
              <VIcon start size="small">mdi-content-duplicate</VIcon>
              Duplicar
            </VBtn>
            <VBtn
              :id="`song-line-up-btn-${si}-${li}`"
              text
              size="x-small"
              variant="text"
              title="Mover arriba"
              :disabled="li === 0 || disabled"
              @click="moveLine(section, li, -1)"
            >
              <VIcon size="small">mdi-arrow-up</VIcon>
            </VBtn>
            <VBtn
              :id="`song-line-down-btn-${si}-${li}`"
              text
              size="x-small"
              variant="text"
              title="Mover abajo"
              :disabled="li === section.lines.length - 1 || disabled"
              @click="moveLine(section, li, 1)"
            >
              <VIcon size="small">mdi-arrow-down</VIcon>
            </VBtn>
            <VBtn
              text
              color="error"
              size="x-small"
              variant="text"
              @click="removeLine(section, li)"
            >
              Eliminar línea
            </VBtn>
          </div>
        </div>
      </div>

      <VCard
        v-for="tab in content.tabs"
        :key="tab.id"
        variant="tonal"
        class="section-editor mb-3"
      >
        <VCardText>
          <div class="d-flex align-center mb-2">
            <VTextField
              v-model="tab.title"
              label="Tab"
              class="mr-2"
              hide-details
              density="compact"
              variant="outlined"
              :disabled="disabled"
            />
            <VBtn
              size="small"
              color="error"
              variant="text"
              title="Eliminar tab"
              @click="removeTab(tab)"
            >
              <VIcon>mdi-delete</VIcon>
            </VBtn>
          </div>
          <VTextarea
            v-model="tab.tablature"
            rows="4"
            auto-grow
            class="tab-input"
            density="compact"
            label="Tablatura"
            variant="outlined"
            :disabled="disabled"
            placeholder="e|--------------------------------"
          />
        </VCardText>
      </VCard>
    </VCardText>

    <div class="d-flex justify-end px-4 pb-4">
      <VBtn
        class="mr-4"
        variant="text"
        color="primary"
        :disabled="disabled"
        @click="close"
      >
        Cancelar
      </VBtn>
      <VBtn
        color="primary"
        variant="elevated"
        :loading="saving || loading"
        :disabled="saving || loading"
        @click="save"
      >
        <VIcon start>mdi-content-save</VIcon>
        Guardar
      </VBtn>
    </div>

    <SongPasteDialog
      v-if="pasteDialog"
      @apply="applyPasted"
      @close="pasteDialog = false"
    />
  </VCard>
</template>

<script setup lang="ts">
import { useValidationErrors } from "~/composables/useValidationErrors";
import { useVrules } from "~/composables/useVrules";
import {
  defaultSong,
  exportSongToJson,
  importSongFromJson,
  normalizeContent,
  newLine,
  newSection,
  newSyllable,
  newTab,
  type Song,
  type SongContent,
  type SongLine,
  type SongSection,
  type SongSyllable,
  type SongTab,
} from "~/types/song";
import { parsePastedLyrics } from "~/utils/songParser";
import { splitLine, uid } from "~/utils/syllables";

const props = defineProps<{
  song?: Record<string, unknown>;
  loading?: boolean;
  permission?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", val: Record<string, unknown>): void;
}>();

const { vrules } = useVrules();
const { errors, clearErrors } = useValidationErrors();
const notifyJson = useNotifyStore();

const formRef = ref();
const saving = ref(false);
const pasteDialog = ref(false);
const jsonFileInput = ref<HTMLInputElement | null>(null);
const activeSyllableId = ref<string | null>(null);

function setActiveSyllable(id: string) {
  activeSyllableId.value = id;
}
function clearActiveSyllable() {
  activeSyllableId.value = null;
}
function getActiveSyllableInLine(line: SongLine): SongSyllable | null {
  if (!activeSyllableId.value) return null;
  return line.syllables.find((s) => s.id === activeSyllableId.value) ?? null;
}

const item = ref<Song>(defaultSong());
const content = computed<SongContent>({
  get: () => normalizeContent(item.value.content),
  set: (v) => {
    item.value.content = v;
  },
});

watch(
  () => props.loading,
  (val) => {
    if (!val) saving.value = false;
  },
  { immediate: true },
);

const isEditMode = computed(() => !!item.value.id);
const formTitle = computed(() =>
  isEditMode.value ? "Editar canción" : "Nueva canción",
);
const disabled = computed(() => props.loading || saving.value);

watch(
  () => props.song,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = {
        ...defaultSong(),
        ...val,
        content: normalizeContent(val.content),
      } as Song;
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  if (props.song && Object.keys(props.song).length > 0) {
    item.value = {
      ...defaultSong(),
      ...props.song,
      content: normalizeContent(props.song.content),
    } as Song;
  }
  // org_id is now optional/global – always keep null for new songs
  if (!isEditMode.value) {
    item.value.org_id = null;
  }
  clearErrors();
  document.addEventListener("click", onDocClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".cell-lyric, .cell-chord, .cell-note")) {
    clearActiveSyllable();
  }
}

function addSection() {
  content.value.sections.push(
    newSection(`Sección ${content.value.sections.length + 1}`),
  );
}

function removeSection(index: number) {
  content.value.sections.splice(index, 1);
}

function addLine(section: SongSection) {
  section.lines.push(newLine());
}

function removeLine(section: SongSection, index: number) {
  section.lines.splice(index, 1);
}

function duplicateLine(section: SongSection, index: number) {
  const line = section.lines[index]
  if (!line) return
  const cloned: SongLine = {
    id: uid("ln"),
    times: (line as SongLine).times ?? 1,
    syllables: line.syllables.map((s) => ({
      id: uid("sy"),
      text: s.text,
      chords: [...(s.chords || [])],
      notes: [...(s.notes || [])],
    })),
  }
  section.lines.splice(index + 1, 0, cloned)
}

function moveLine(section: SongSection, index: number, direction: number) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= section.lines.length) return;
  const [moved] = section.lines.splice(index, 1);
  if (moved) section.lines.splice(newIndex, 0, moved);
}

function addSyllable(line: SongLine) {
  line.syllables.push(newSyllable());
}

function addSyllableAfter(line: SongLine, syllable: SongSyllable) {
  const idx = line.syllables.findIndex((s) => s.id === syllable.id);
  line.syllables.splice(
    idx === -1 ? line.syllables.length : idx + 1,
    0,
    newSyllable(),
  );
}

function addSyllableBefore(line: SongLine, syllable: SongSyllable) {
  const idx = line.syllables.findIndex((s) => s.id === syllable.id);
  line.syllables.splice(idx === -1 ? 0 : idx, 0, newSyllable());
}

function removeSyllable(line: SongLine, syllable: SongSyllable) {
  const idx = line.syllables.findIndex((s) => s.id === syllable.id);
  if (idx !== -1) line.syllables.splice(idx, 1);
}

const expandedNotesLines = reactive(new Set<string>());
const forcedHiddenNotesLines = reactive(new Set<string>());

function lineHasNotes(line: SongLine): boolean {
  return line.syllables.some((s) => s.notes && s.notes.length > 0);
}

function isNotesRowVisible(line: SongLine): boolean {
  if (forcedHiddenNotesLines.has(line.id)) return false;
  return expandedNotesLines.has(line.id) || lineHasNotes(line);
}

function toggleNotes(line: SongLine) {
  if (isNotesRowVisible(line)) {
    expandedNotesLines.delete(line.id);
    forcedHiddenNotesLines.add(line.id);
  } else {
    forcedHiddenNotesLines.delete(line.id);
    expandedNotesLines.add(line.id);
  }
}

function parseChordNoteList(value: string): string[] {
  return value
    .split(/[, ]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function chordsText(syllable: SongSyllable): string {
  return (syllable.chords || []).join(" ");
}

function notesText(syllable: SongSyllable): string {
  return (syllable.notes || []).join(" ");
}

function onChordsChange(syllable: SongSyllable, event: Event) {
  syllable.chords = parseChordNoteList(
    (event.target as HTMLInputElement).value,
  );
}

function onNotesChange(syllable: SongSyllable, event: Event) {
  syllable.notes = parseChordNoteList((event.target as HTMLInputElement).value);
}

function splitLineSyllables(line: SongLine) {
  const text = line.syllables.map((s) => s.text).join("");
  line.syllables = splitLine(text).map((t) => newSyllable(t));
}

function mergeLine(line: SongLine) {
  const text = line.syllables.map((s) => s.text).join("");
  const first = line.syllables[0];
  if (!first) return;
  const chords = [...first.chords];
  const notes = [...first.notes];
  line.syllables = [newSyllable(text)];
  line.syllables[0].chords = chords;
  line.syllables[0].notes = notes;
}

function addTab() {
  content.value.tabs.push(newTab());
}

function removeTab(tab: SongTab) {
  const idx = content.value.tabs.findIndex((t) => t.id === tab.id);
  if (idx !== -1) content.value.tabs.splice(idx, 1);
}

function applyPasted(text: string, mode: "replace" | "append") {
  const parsed = parsePastedLyrics(text);
  if (mode === "replace") {
    content.value = parsed;
  } else {
    for (const s of parsed.sections) content.value.sections.push(s);
    for (const t of parsed.tabs) content.value.tabs.push(t);
  }
  pasteDialog.value = false;
}

function triggerImportJson() {
  jsonFileInput.value?.click();
}

function onJsonFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = reader.result as string;
      const parsed = JSON.parse(text);
      const imported = importSongFromJson(parsed);
      // Merge imported data – org_id is global (always null)
      item.value = {
        ...defaultSong(),
        ...imported,
        content: normalizeContent(imported.content),
        org_id: null,
        id: item.value.id,
      } as Song;
      // Title fallback from JSON if present
      if (imported.title) item.value.title = imported.title as string;
      if (imported.artist) item.value.artist = imported.artist as string;
      if (imported.key) item.value.key = imported.key as string;
      if (imported.tempo) item.value.tempo = imported.tempo as string;
      notifyJson.notify({
        success: `JSON cargado: ${imported.title || file.name}`,
      });
    } catch (err) {
      notifyJson.notify({
        error: `Error al cargar JSON: ${(err as Error).message}`,
      });
    } finally {
      // Reset input so same file can be re-selected
      if (input) input.value = "";
    }
  };
  reader.onerror = () => {
    notifyJson.notify({ error: "No se pudo leer el archivo." });
    if (input) input.value = "";
  };
  reader.readAsText(file);
}

function exportJson() {
  const payload = exportSongToJson(item.value);
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = (item.value.title || "cancion")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  a.href = url;
  a.download = `${slug || "cancion"}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  notifyJson.notify({ success: "JSON exportado." });
}

function close() {
  emit("close");
}

async function save() {
  if (saving.value || props.loading) return;
  const form = formRef.value;
  const { valid } = form ? await form.validate() : { valid: true };
  if (!valid) return;
  if (saving.value || props.loading) return;
  saving.value = true;

  const payload: Record<string, unknown> = { ...item.value };
  payload.content = JSON.parse(JSON.stringify(content.value));
  // org_id is now global/optional – always send null (backend accepts null)
  payload.org_id = null;
  if (isEditMode.value) delete payload.org_id;
  emit("save", payload);
}

defineExpose({
  exportJson,
  triggerImportJson,
  getSong: () => item.value,
});
</script>

<style scoped>
.section-editor {
  padding: 16px;
  border-radius: 4px;
}

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

.tab-input :deep(textarea) {
  font-family: "Consolas", "Monaco", monospace;
  font-size: 12px;
}
</style>
