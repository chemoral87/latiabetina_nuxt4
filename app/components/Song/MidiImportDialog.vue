<template>
  <VDialog id="song-midi-import-dlg" persistent max-width="640px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">mdi-midi</VIcon>
        Cargar MIDI
        <VSpacer />
        <DialogCloseButton id="song-midi-import-close-btn" @close="close" />
      </VCardTitle>

      <VCardText class="pt-0">
        <VSelect
          id="song-midi-import-track"
          v-model="trackId"
          class="mb-2"
          label="Pista"
          density="compact"
          variant="outlined"
          :items="trackItems"
        />
        <div v-if="selected" class="text-caption text-medium-emphasis mb-3">
          {{ selected.noteCount }} notas · canal {{ (selected.channel ?? 0) + 1 }}
          <div v-if="selected.preview.length">Vista previa: {{ selected.preview.join(" ") }}</div>
        </div>

        <VRadioGroup id="song-midi-import-mode" v-model="mode" class="mb-2" hide-details density="compact">
          <VRadio value="replace" label="Reemplazar contenido" />
          <VRadio value="append" label="Agregar sección" />
          <VRadio value="apply" :disabled="!hasLyrics" label="Aplicar notas a letra" />
        </VRadioGroup>

        <VAlert
          v-if="mode === 'apply' && mismatch"
          class="mb-2"
          type="warning"
          variant="tonal"
          density="compact"
        >
          La letra tiene {{ syllableCount }} sílabas y el MIDI tiene {{ selected?.noteCount ?? 0 }} notas.
          <span v-if="(selected?.noteCount ?? 0) < syllableCount">Se llenarán las primeras sílabas; el resto quedará sin notas.</span>
          <span v-else>No se crearán sílabas extra. Puedes agregar el resto como sección.</span>
        </VAlert>

        <VCheckbox
          v-if="mode === 'apply' && leftoverCount > 0"
          id="song-midi-import-leftover"
          v-model="appendLeftover"
          hide-details
          density="compact"
          label="Agregar sección con las notas sobrantes"
        />
        <VCheckbox
          v-if="canOverwriteTempo"
          id="song-midi-import-tempo"
          v-model="overwriteTempo"
          class="mt-2"
          hide-details
          density="compact"
          label="Sobrescribir tempo"
        />
        <VCheckbox
          v-if="canOverwriteKey"
          id="song-midi-import-key"
          v-model="overwriteKey"
          hide-details
          density="compact"
          label="Sobrescribir tonalidad"
        />
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="song-midi-import-cancel-btn" class="mr-4" color="primary" variant="outlined" @click="close">
          Cancelar
        </VBtn>
        <VBtn
          id="song-midi-import-apply-btn"
          color="primary"
          variant="elevated"
          :disabled="!selected"
          @click="apply"
        >
          <VIcon start>mdi-check</VIcon>
          Aplicar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import type { MidiImportMode, MidiTrackChoice } from "~/utils/midiSongImport"

const props = defineProps<{
  tracks: MidiTrackChoice[]
  hasLyrics: boolean
  syllableCount: number
  canOverwriteTempo: boolean
  canOverwriteKey: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "apply", payload: {
    track: MidiTrackChoice
    mode: MidiImportMode
    overwriteTempo: boolean
    overwriteKey: boolean
    appendLeftover: boolean
  }): void
}>()

const trackId = ref(props.tracks[0]?.id ?? "")
const mode = ref<MidiImportMode>(props.hasLyrics ? "apply" : "replace")
const overwriteTempo = ref(props.canOverwriteTempo)
const overwriteKey = ref(props.canOverwriteKey)
const appendLeftover = ref(false)

const trackItems = computed(() =>
  props.tracks.map((t) => ({
    title: `${t.name} (${t.noteCount} notas)`,
    value: t.id,
  })),
)

const selected = computed(() => props.tracks.find((t) => t.id === trackId.value) ?? props.tracks[0] ?? null)

const leftoverCount = computed(() => {
  if (mode.value !== "apply" || !selected.value) return 0
  return Math.max(0, selected.value.noteCount - props.syllableCount)
})

const mismatch = computed(() => {
  if (!selected.value) return false
  return selected.value.noteCount !== props.syllableCount
})

function close() {
  emit("close")
}

function apply() {
  const track = selected.value
  if (!track) return
  emit("apply", {
    track,
    mode: mode.value,
    overwriteTempo: overwriteTempo.value,
    overwriteKey: overwriteKey.value,
    appendLeftover: appendLeftover.value,
  })
}
</script>
