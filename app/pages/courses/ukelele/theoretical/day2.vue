<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 2" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Escala Cromática -->
        <CoursesSection title="La Escala Cromática: Padre de Todas las Escalas" icon="mdi-music-note-half">
          <p class="text-subtitle-1 font-weight-medium mb-3">¿Qué es la escala cromática?</p>
          <p class="text-body-2 text-grey-darken-2 mb-4">
            La <strong>escala cromática</strong> es la madre de todas las escalas musicales. Contiene
            <strong>12 semitonos</strong> consecutivos dentro de una octava. Cada semitono representa
            la distancia más pequeña posible entre dos notas en la música occidental moderna.
          </p>

          <p class="text-body-2 text-grey-darken-2 mb-4">
            <strong>Importancia:</strong> Es la base sobre la cual se construyen todas las demás escalas.
            Cualquier escala musical (mayor, menor, pentatónica, etc.) es en realidad una <strong>selección
              específica de notas de la escala cromática</strong>.
          </p>

          <p class="text-subtitle-2 font-weight-medium mb-3">Las 12 notas de la escala cromática</p>
          <VRow density="comfortable" class="mb-4">
            <VCol cols="12">
              <p class="text-caption text-grey-darken-2 mb-2"><strong>Con Sostenidos (#)</strong></p>
              <VChipGroup column>
                <VChip v-for="note in chromaticScale" :key="note" :color="getColorForNote(note)"  size="small" label
                  class="font-weight-medium" variant="elevated">
                  {{ note }}
                </VChip>
              </VChipGroup>
            </VCol>
          </VRow>

          <VRow density="comfortable" class="mb-4">
            <VCol cols="12">
              <p class="text-caption text-grey-darken-2 mb-2"><strong>Con Bemoles (b)</strong></p>
              <VChipGroup column>
                <VChip v-for="note in chromaticScaleFlats" :key="note" :color="getColorForNote(note)"  size="small" label
                  class="font-weight-medium" variant="elevated">
                  {{ note }}
                </VChip>
              </VChipGroup>
            </VCol>
          </VRow>

          <VCard variant="outlined" class="pa-4 mt-4">
            <p class="text-subtitle-2 font-weight-medium mb-3">Tabla Comparativa de Escalas</p>
            <VTable density="compact">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold" style="width: 220px;">Escala</th>
                  <th v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center font-weight-bold px-1">
                    {{ note }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Escala Cromática Row -->
                <tr>
                  <td><strong>Escala Cromática</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip size="x-small" color="grey-darken-1"  class="ma-0 font-weight-medium"
                      style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                  </td>
                </tr>
                <!-- Escala Mayor de Do Row -->
                <tr>
                  <td><strong>Escala Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleC.includes(note) || note === 'Do'" size="x-small" color="blue-darken-1" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Pentatónica Mayor de Do Row -->
                <tr>
                  <td><strong>Pentatónica Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="pentatonicScaleC.includes(note) || note === 'Do'" size="x-small" color="purple-darken-1" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>

          <VAlert type="info" density="compact" variant="text" class="mt-4">
            <strong>Conclusión:</strong> Todas las escalas musicales son subconjuntos de la escala
            cromática. La escala cromática es el "universo" completo de posibilidades, y cada otra escala
            es una "selección específica" de ese universo.
          </VAlert>

        </CoursesSection>

        <!-- SECCION 2: Comparativa de Escalas Mayores -->
        <CoursesSection title="Escalas Mayores: Desde Do Hasta Fa" icon="mdi-piano">
          <p class="text-subtitle-1 font-weight-medium mb-3">¿Qué es una Escala Mayor?</p>
          <p class="text-body-2 text-grey-darken-2 mb-4">
            La <strong>escala mayor</strong> es una de las escalas más importantes en la música. Contiene
            <strong>7 notas</strong> y sigue un patrón específico de tonos y semitonos (Tono-Tono-Semitono-Tono-Tono-Tono-Semitono).
            Cada nota que comienza puede generar una escala mayor distinta.
          </p>

          <VCard variant="outlined" class="pa-4 mt-4">
            <p class="text-subtitle-2 font-weight-medium mb-3">Comparativa de Escalas Mayores</p>
            <VTable density="compact">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold" style="width: 200px;">Escala</th>
                  <th v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center font-weight-bold px-1">
                    {{ note }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- Escala Cromática -->
                <tr>
                  <td><strong>Escala Cromática</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip size="x-small" color="grey-darken-1"  class="ma-0 font-weight-medium"
                      style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                  </td>
                </tr>
                <!-- Escala Mayor de Do -->
                <tr>
                  <td><strong>Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleC.includes(note) || note === 'Do'" size="x-small" color="blue" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Do# -->
                <tr>
                  <td><strong>Mayor de Do#</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleCSharp.includes(note)" size="x-small" color="cyan" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Re -->
                <tr>
                  <td><strong>Mayor de Re</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleD.includes(note)" size="x-small" color="teal" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Re# -->
                <tr>
                  <td><strong>Mayor de Re#</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleDSharp.includes(note)" size="x-small" color="green" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Mi -->
                <tr>
                  <td><strong>Mayor de Mi</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleE.includes(note)" size="x-small" color="lime" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Fa -->
                <tr>
                  <td><strong>Mayor de Fa</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleF.includes(note)" size="x-small" color="orange" 
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;" variant="elevated">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>

          <VAlert type="success" density="compact" variant="text" class="mt-4">
            <strong>Patrón de la Escala Mayor:</strong> Cada escala mayor sigue el patrón de intervalos 
            <strong>T - T - S - T - T - T - S</strong> (Tono-Tono-Semitono-Tono-Tono-Tono-Semitono).
            Este patrón se mantiene igual sin importar la nota raíz, solo cambian las notas específicas.
          </VAlert>

        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: true,
      chromaticScale: [
        "Do", "Do#", "Re", "Re#", "Mi", "Fa",
        "Fa#", "Sol", "Sol#", "La", "La#", "Si"
      ],
      chromaticScaleFlats: [
        "Do", "Reb", "Re", "Mib", "Mi", "Fa",
        "Solb", "Sol", "Lab", "La", "Sib", "Si"
      ],
      majorScaleC: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
      pentatonicScaleC: ["Do", "Re", "Mi", "Sol", "La"],
      scaleNotesReference: ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si", "Do"],      // Escalas Mayores para la sección comparativa
      majorScaleCSharp: ["Do#", "Re#", "Fa", "Fa#", "Sol#", "La#", "Do"],
      majorScaleD: ["Re", "Mi", "Fa#", "Sol", "La", "Si", "Do#"],
      majorScaleDSharp: ["Re#", "Fa", "Sol", "Sol#", "La#", "Do", "Re"],
      majorScaleE: ["Mi", "Fa#", "Sol#", "La", "Si", "Do#", "Re#"],
      majorScaleF: ["Fa", "Sol", "La", "La#", "Do", "Re", "Mi"],    }
  },

  methods: {
    getColorForNote(note) {
      // Agrupa notas por color para visualización
      const colors = {
        "Do": "green",
        "Re": "blue",
        "Mi": "purple",
        "Fa": "red",
        "Sol": "orange",
        "La": "pink",
        "Si": "indigo",
      };
      const baseNote = note.replace("#", "").replace("b", "");
      return colors[baseNote] || "grey";
    },
  },
}
</script>