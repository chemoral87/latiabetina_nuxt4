<template>
  <VCard id="cmp-pitcher-trumpet-notation" class="pa-0">
    <VCardTitle class="text-h6 mb-2 d-flex align-center">
      Trompeta
      <VChip
        v-if="noteInfo"
        id="pit-trumpet-note"
        class="ml-2"
        size="small"
        color="primary"
        variant="elevated"
        >Nota escrita: {{ noteInfo.written }}</VChip
      >
    </VCardTitle>
    <VCardText class="pa-1">
      <VRow no-gutters density="compact">
        <VCol md="4" cols="12">
          <VSelect
            id="pit-trumpet-tuning"
            v-model="tuning"
            hide-details
            label="Tono"
            density="compact"
            variant="outlined"
            :items="tuningOptions"
            style="max-width: 150px"
          />
          <div
            v-if="noteInfo"
            id="pit-trumpet-info"
            class="d-flex align-center flex-wrap ga-4 mb-2"
          >
            <span
              >Escrita: <strong>{{ noteInfo.written }}</strong></span
            >
            <span
              >Sonido: <strong>{{ noteInfo.sounding }}</strong></span
            >
            <VChip
              id="pit-trumpet-fingering"
              size="small"
              variant="tonal"
              :color="fingeringColor"
            >
              {{ fingeringLabel }}
            </VChip>
          </div>

          <!-- Valve diagram -->
          <div v-if="noteInfo" id="pit-trumpet-valves" class="valve-container">
            <svg
              class="trumpet"
              viewBox="0 0 460 260"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Main tube -->
              <line
                x1="60"
                x2="300"
                y1="185"
                y2="185"
                stroke="#C8A24B"
                stroke-width="14"
                stroke-linecap="round"
              />

              <!-- Mouthpiece -->
              <g>
                <rect
                  x="8"
                  rx="5"
                  y="176"
                  width="30"
                  height="18"
                  fill="#C0C0C0"
                  stroke="#7A7A7A"
                  stroke-width="2"
                />
                <line
                  x1="38"
                  x2="60"
                  y1="185"
                  y2="185"
                  stroke="#C0C0C0"
                  stroke-width="12"
                  stroke-linecap="round"
                />
              </g>

              <!-- Bell -->
              <path
                fill="#C8A24B"
                stroke="#8B6914"
                stroke-width="2"
                stroke-linejoin="round"
                d="M300 185 C 345 185, 375 168, 395 140 L 448 118 L 448 252 L 395 230 C 375 202, 345 185, 300 185 Z"
              />

              <!-- Valves (1 = closer to the mouthpiece) -->
              <g v-for="valve in 3" :key="valve">
                <rect
                  rx="8"
                  y="100"
                  width="40"
                  height="85"
                  fill="#B8860B"
                  stroke="#8B6914"
                  stroke-width="2"
                  :x="getValveX(valve) - 20"
                />
                <circle
                  r="22"
                  stroke-width="3"
                  :cx="getValveX(valve)"
                  :cy="isValvePressed(valve) ? 112 : 88"
                  :fill="isValvePressed(valve) ? '#1E88E5' : '#D4AF37'"
                  :stroke="isValvePressed(valve) ? '#0D47A1' : '#8B6914'"
                />
                <text
                  font-size="20"
                  font-weight="bold"
                  text-anchor="middle"
                  :x="getValveX(valve)"
                  :y="isValvePressed(valve) ? 119 : 95"
                  :fill="isValvePressed(valve) ? '#FFFFFF' : '#5D4037'"
                >
                  {{ valve }}
                </text>
              </g>
            </svg>
          </div>

          <p v-else class="text-caption text-medium-emphasis mb-0">
            Toca una nota con la trompeta para ver la digitación.
          </p>
        </VCol>

        <VCol md="8" cols="12">
          <div id="pit-trumpet-glossary" class="glossary-wrap">
            <VTable
              v-for="(list, index) in glossaryColumns"
              :key="index"
              density="compact"
              class="glossary-table"
            >
              <thead>
                <tr>
                  <th class="text-left">Nota</th>
                  <th class="text-left">Pos</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in list"
                  :key="row.sounding"
                  :class="{
                    'glossary-row-active': row.sounding === activeSounding,
                  }"
                >
                  <td>{{ row.sounding }}</td>
                  <td>
                    <VChip
                      size="x-small"
                      variant="tonal"
                      :color="
                        row.fingering.length === 0 ? 'success' : 'primary'
                      "
                    >
                      {{ row.label }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { usePitcherStore } from "~/composables/usePitcherStore";

interface NoteInfo {
  written: string;
  sounding: string;
  fingering: number[] | null;
}

const props = withDefaults(
  defineProps<{
    frequency?: number | null;
  }>(),
  {
    frequency: null,
  },
);

const store = usePitcherStore();
const { latinNotation } = storeToRefs(store);

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const latinNotes = [
  "Do",
  "Do#",
  "Re",
  "Re#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];

type TrumpetTuning = "C" | "Bb";

// La trompeta en Sib suena una segunda mayor (2 semitonos) más grave de lo escrito,
// así que para obtener la nota escrita a partir del sonido detectado sumamos 2.
const tuning = ref<TrumpetTuning>("Bb");
const tuningOptions = [
  { title: "Do (C)", value: "C" },
  { title: "Sib (Bb)", value: "Bb" },
];
const transposition = computed(() => (tuning.value === "Bb" ? 2 : 0));

interface GlossaryRow {
  written: string;
  sounding: string;
  fingering: number[];
  label: string;
}

// Glosario de todas las posiciones de la trompeta según el tono seleccionado.
// En Sib la nota más grave (sonido) es E3 = Fa#3 escrita, y llega hasta Do6 (sonido) = Re6 escrita.
const glossaryRows = computed<GlossaryRow[]>(() => {
  const rows: GlossaryRow[] = [];
  const octaves = Object.keys(FINGERINGS)
    .map(Number)
    .sort((a, b) => a - b);
  for (const octave of octaves) {
    const pcs = Object.keys(FINGERINGS[octave])
      .map(Number)
      .sort((a, b) => a - b);
    for (const pc of pcs) {
      const writtenMidi = (octave + 1) * 12 + pc;
      const soundingMidi = writtenMidi - transposition.value;
      // En Sib el glosario llega hasta Do6 (sonido)
      if (tuning.value === "Bb" && soundingMidi > 84) continue;
      const fingering = FINGERINGS[octave][pc];
      rows.push({
        written: getNoteName(pc, octave),
        sounding: getNoteName(
          ((soundingMidi % 12) + 12) % 12,
          Math.floor(soundingMidi / 12) - 1,
        ),
        fingering,
        label: fingering.length === 0 ? "Abierta" : fingering.join("-"),
      });
    }
  }
  return rows;
});

// El glosario se muestra en tres listas para no ocupar demasiado espacio vertical
const glossaryColumns = computed<GlossaryRow[][]>(() => {
  const rows = glossaryRows.value;
  const perList = Math.ceil(rows.length / 3);
  return [
    rows.slice(0, perList),
    rows.slice(perList, perList * 2),
    rows.slice(perList * 2),
  ];
});

// Sonido detectado actualmente para resaltar la fila correspondiente
const activeSounding = computed(() => noteInfo.value?.sounding ?? null);

// Digitación estándar de la trompeta por nota escrita (clase de tono dentro de cada octava)
const FINGERINGS: Record<number, Record<number, number[]>> = {
  3: { 6: [1, 2, 3], 7: [1, 3], 8: [2, 3], 9: [1, 2], 10: [1], 11: [2] },
  4: {
    0: [],
    1: [1, 2, 3],
    2: [1, 3],
    3: [2, 3],
    4: [1, 2],
    5: [1],
    6: [2],
    7: [],
    8: [2, 3],
    9: [1, 2],
    10: [1],
    11: [2],
  },
  5: {
    0: [],
    1: [1, 2],
    2: [1],
    3: [2],
    4: [],
    5: [1],
    6: [2],
    7: [],
    8: [2, 3],
    9: [1, 2],
    10: [1],
    11: [2],
  },
  6: { 0: [], 1: [1, 2], 2: [1], 3: [2] },
};

const noteInfo = computed<NoteInfo | null>(() => {
  if (!props.frequency) return null;
  const concertMidi = Math.round(freqToMidi(props.frequency));
  const writtenMidi = concertMidi + transposition.value;
  const writtenPc = ((writtenMidi % 12) + 12) % 12;
  const writtenOctave = Math.floor(writtenMidi / 12) - 1;
  return {
    written: getNoteName(writtenPc, writtenOctave),
    sounding: getNoteName(concertMidi % 12, Math.floor(concertMidi / 12) - 1),
    fingering: FINGERINGS[writtenOctave]?.[writtenPc] ?? null,
  };
});

const fingeringLabel = computed(() => {
  const fingering = noteInfo.value?.fingering;
  if (!fingering) return "Fuera de rango";
  return fingering.length === 0 ? "Abierta" : fingering.join("-");
});

const fingeringColor = computed(() => {
  if (!noteInfo.value?.fingering) return "error";
  return noteInfo.value.fingering.length === 0 ? "success" : "primary";
});

function freqToMidi(freq: number): number {
  if (freq <= 0) return 0;
  return 69 + 12 * Math.log2(freq / 440);
}

function getNoteName(pitchClass: number, octave: number): string {
  const noteArray = latinNotation.value ? latinNotes : notes;
  return `${noteArray[pitchClass]}${octave}`;
}

function getValveX(valve: number): number {
  return 130 + (valve - 1) * 50;
}

function isValvePressed(valve: number): boolean {
  return noteInfo.value?.fingering?.includes(valve) ?? false;
}
</script>

<style scoped>
.valve-container {
  width: 100%;
  border-radius: 8px;
  padding: 4px;
  overflow: hidden;
}

.trumpet {
  display: block;
  width: 100%;
  height: auto;
  max-width: 320px;
}

.glossary-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.glossary-table {
  flex: 1 1 0;
  min-width: 120px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.glossary-row-active {
  background-color: rgba(33, 150, 243, 0.25) !important;
}

.glossary-row-active td {
  font-weight: 700;
}
</style>
