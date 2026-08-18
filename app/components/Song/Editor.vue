<template>
  <VCard id="cmp-song-editor">
    <VCardTitle class="d-flex align-center">
      <VIcon class="mr-2" color="primary">{{ isEditMode ? "mdi-pencil" : "mdi-music-note-plus" }}</VIcon>
      <span class="text-h5">{{ formTitle }}</span>
    </VCardTitle>

    <VCardText class="py-1">
      <VForm ref="formRef" @submit.prevent="save">
        <VRow>
          <VCol v-if="showOrgSelect" md="3" cols="12">
            <OrganizationSelect
              v-model="item.org_id"
              required
              density="compact"
              variant="outlined"
              permission="song-create"
              :disabled="disabled || isEditMode"
              :rules="[vrules.requiredField('Organización')]"
            />
          </VCol>
          <VCol :md="showOrgSelect ? 3 : 4" :cols="showOrgSelect ? 12 : 6">
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
          <VCol :md="showOrgSelect ? 3 : 4" :cols="showOrgSelect ? 12 : 6">
            <VTextField
              v-model="item.artist"
              density="compact"
              variant="outlined"
              :disabled="disabled"
              label="Autor / Artista"
              :error-messages="errors?.artist"
            />
          </VCol>
          <VCol cols="6" :md="showOrgSelect ? 2 : 2">
            <VTextField
              v-model="item.key"
              density="compact"
              label="Tonalidad"
              variant="outlined"
              :disabled="disabled"
              placeholder="C, D, Em..."
            />
          </VCol>
          <VCol cols="6" :md="showOrgSelect ? 2 : 2">
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
        <VBtn size="small" color="primary" class="mr-2 mb-1" variant="outlined" @click="pasteDialog = true">
          <VIcon start>mdi-content-paste</VIcon>
          Pegar letra
        </VBtn>
        <VBtn size="small" color="primary" class="mr-2 mb-1" variant="outlined" @click="addSection">
          <VIcon start>mdi-plus</VIcon>
          Agregar sección
        </VBtn>
        <VBtn class="mb-1" size="small" color="primary" variant="outlined" @click="addTab">
          <VIcon start>mdi-plus</VIcon>
          Agregar tab
        </VBtn>
      </div>

      <div
        v-if="content.sections.length === 0 && content.tabs.length === 0"
        class="text-center text-grey py-6"
      >
        <VIcon size="48" class="mb-2">mdi-music-note-plus</VIcon>
        <div>Pega la letra o agrega una sección para empezar.</div>
      </div>

      <VCard
        v-for="(section, si) in content.sections"
        :key="section.id"
        variant="tonal"
        class="section-editor mb-3"
      >
        <VCardText>
          <div class="d-flex align-center mb-2">
            <VTextField
              v-model="section.name"
              class="mr-2"
              hide-details
              label="Sección"
              density="compact"
              variant="outlined"
              :disabled="disabled"
            />
            <VBtn size="small" variant="text" title="Agregar línea" @click="addLine(section)">
              <VIcon>mdi-plus</VIcon>
            </VBtn>
            <VBtn size="small" color="error" variant="text" title="Eliminar sección" @click="removeSection(si)">
              <VIcon>mdi-delete</VIcon>
            </VBtn>
          </div>

          <div
            v-for="(line, li) in section.lines"
            :key="line.id"
            class="line-editor mb-2"
          >
            <div class="syllable-row">
              <SongSyllableCell
                v-for="syllable in line.syllables"
                :key="syllable.id"
                :syllable="syllable"
                @remove="removeSyllable(line, syllable)"
              />
              <VBtn icon size="small" variant="text" title="Agregar sílaba" @click="addSyllable(line)">
                <VIcon>mdi-plus</VIcon>
              </VBtn>
            </div>
            <div class="d-flex align-center mt-1">
              <VBtn text size="x-small" variant="text" color="primary" @click="splitLineSyllables(line)">
                Dividir sílabas
              </VBtn>
              <VBtn text size="x-small" variant="text" color="primary" @click="mergeLine(line)">
                Unir
              </VBtn>
              <VBtn text color="error" size="x-small" variant="text" @click="removeLine(section, li)">
                Eliminar línea
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>

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
            <VBtn size="small" color="error" variant="text" title="Eliminar tab" @click="removeTab(tab)">
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
      <VBtn class="mr-4" variant="text" color="primary" :disabled="disabled" @click="close">
        Cancelar
      </VBtn>
      <VBtn color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
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
import { useAuthStore } from "~/composables/useAuth"
import { useValidationErrors } from "~/composables/useValidationErrors"
import { useVrules } from "~/composables/useVrules"
import {
  defaultSong,
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
} from "~/types/song"
import { parsePastedLyrics } from "~/utils/songParser"
import { splitLine } from "~/utils/syllables"

const props = defineProps<{
  song?: Record<string, unknown>
  loading?: boolean
  permission?: string
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", val: Record<string, unknown>): void
}>()

const { vrules } = useVrules()
const { errors, clearErrors } = useValidationErrors()
const auth = useAuthStore()

const formRef = ref()
const saving = ref(false)
const pasteDialog = ref(false)

const item = ref<Song>(defaultSong())
const content = computed<SongContent>({
  get: () => normalizeContent(item.value.content),
  set: (v) => {
    item.value.content = v
  },
})

watch(
  () => props.loading,
  (val) => {
    if (!val) saving.value = false
  },
  { immediate: true },
)

const isEditMode = computed(() => !!item.value.id)
const formTitle = computed(() => (isEditMode.value ? "Editar canción" : "Nueva canción"))
const disabled = computed(() => props.loading || saving.value)

const showOrgSelect = computed(() => {
  const orgIds = auth.permissionsOrg[props.permission ?? "song-create"] ?? []
  return Array.isArray(orgIds) && orgIds.length > 1
})

watch(
  () => props.song,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = {
        ...defaultSong(),
        ...val,
        content: normalizeContent(val.content),
      } as Song
    }
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  if (props.song && Object.keys(props.song).length > 0) {
    item.value = {
      ...defaultSong(),
      ...props.song,
      content: normalizeContent(props.song.content),
    } as Song
  }
  if (!item.value.org_id && !showOrgSelect.value) {
    const orgIds = auth.permissionsOrg[props.permission ?? "song-create"] ?? []
    if (Array.isArray(orgIds) && orgIds.length === 1) {
      item.value.org_id = orgIds[0]
    }
  }
  clearErrors()
})

function addSection() {
  content.value.sections.push(newSection(`Sección ${content.value.sections.length + 1}`))
}

function removeSection(index: number) {
  content.value.sections.splice(index, 1)
}

function addLine(section: SongSection) {
  section.lines.push(newLine())
}

function removeLine(section: SongSection, index: number) {
  section.lines.splice(index, 1)
}

function addSyllable(line: SongLine) {
  line.syllables.push(newSyllable())
}

function removeSyllable(line: SongLine, syllable: SongSyllable) {
  const idx = line.syllables.findIndex((s) => s.id === syllable.id)
  if (idx !== -1) line.syllables.splice(idx, 1)
}

function splitLineSyllables(line: SongLine) {
  const text = line.syllables.map((s) => s.text).join("")
  line.syllables = splitLine(text).map((t) => newSyllable(t))
}

function mergeLine(line: SongLine) {
  const text = line.syllables.map((s) => s.text).join("")
  const first = line.syllables[0]
  if (!first) return
  const chords = [...first.chords]
  const notes = [...first.notes]
  line.syllables = [newSyllable(text)]
  line.syllables[0].chords = chords
  line.syllables[0].notes = notes
}

function addTab() {
  content.value.tabs.push(newTab())
}

function removeTab(tab: SongTab) {
  const idx = content.value.tabs.findIndex((t) => t.id === tab.id)
  if (idx !== -1) content.value.tabs.splice(idx, 1)
}

function applyPasted(text: string, mode: "replace" | "append") {
  const parsed = parsePastedLyrics(text)
  if (mode === "replace") {
    content.value = parsed
  } else {
    for (const s of parsed.sections) content.value.sections.push(s)
    for (const t of parsed.tabs) content.value.tabs.push(t)
  }
  pasteDialog.value = false
}

function close() {
  emit("close")
}

async function save() {
  if (saving.value || props.loading) return
  const form = formRef.value
  const { valid } = form ? await form.validate() : { valid: true }
  if (!valid) return
  if (saving.value || props.loading) return
  saving.value = true

  const payload: Record<string, unknown> = { ...item.value }
  payload.content = JSON.parse(JSON.stringify(content.value))
  if (isEditMode.value) delete payload.org_id
  emit("save", payload)
}
</script>

<style scoped>
.syllable-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 6px;
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  background: #f5f5f5;
}

.tab-input :deep(textarea) {
  font-family: "Consolas", "Monaco", monospace;
  font-size: 12px;
}
</style>