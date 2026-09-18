<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 2" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Escala Cromática -->
        <CoursesSection icon="mdi-music-note-half" title="La Escala Cromática: Padre de Todas las Escalas">
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
          <VRow class="mb-4" density="compact">
            <VCol cols="12">
              <p class="text-caption text-grey-darken-2 mb-2"><strong>Con Sostenidos (#)</strong></p>
              <VChipGroup column>
                <VChip v-for="note in chromaticScale" :key="note" label  size="small" variant="elevated"
                  class="font-weight-medium" :color="getColorForNote(note)">
                  {{ note }}
                </VChip>
              </VChipGroup>
            </VCol>
          </VRow>

          <VRow class="mb-4" density="compact">
            <VCol cols="12">
              <p class="text-caption text-grey-darken-2 mb-2"><strong>Con Bemoles (b)</strong></p>
              <VChipGroup column>
                <VChip v-for="note in chromaticScaleFlats" :key="note" label  size="small" variant="elevated"
                  class="font-weight-medium" :color="getColorForNote(note)">
                  {{ note }}
                </VChip>
              </VChipGroup>
            </VCol>
          </VRow>

          <VCard class="pa-4 mt-4" variant="outlined">
            <p class="text-subtitle-2 font-weight-medium mb-3">Tabla Comparativa de Escalas</p>
            <VTable density="compact">
              <thead>
                <tr>
                  <th style="width: 220px;" class="text-left font-weight-bold">Escala</th>
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
                    <VChip size="x-small" variant="elevated"  color="grey-darken-1"
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                  </td>
                </tr>
                <!-- Escala Mayor de Do Row -->
                <tr>
                  <td><strong>Escala Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleC.includes(note) || note === 'Do'" size="x-small" variant="elevated" 
                      color="blue-darken-1" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Pentatónica Mayor de Do Row -->
                <tr>
                  <td><strong>Pentatónica Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="pentatonicScaleC.includes(note) || note === 'Do'" size="x-small" variant="elevated" 
                      color="purple-darken-1" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>

          <VAlert type="info" class="mt-4" variant="text" density="compact">
            <strong>Conclusión:</strong> Todas las escalas musicales son subconjuntos de la escala
            cromática. La escala cromática es el "universo" completo de posibilidades, y cada otra escala
            es una "selección específica" de ese universo.
          </VAlert>

        </CoursesSection>

        <!-- SECCION 2: Comparativa de Escalas Mayores -->
        <CoursesSection icon="mdi-piano" title="Escalas Mayores: Desde Do Hasta Fa">
          <p class="text-subtitle-1 font-weight-medium mb-3">¿Qué es una Escala Mayor?</p>
          <p class="text-body-2 text-grey-darken-2 mb-4">
            La <strong>escala mayor</strong> es una de las escalas más importantes en la música. Contiene
            <strong>7 notas</strong> y sigue un patrón específico de tonos y semitonos (Tono-Tono-Semitono-Tono-Tono-Tono-Semitono).
            Cada nota que comienza puede generar una escala mayor distinta.
          </p>

          <VCard class="pa-4 mt-4" variant="outlined">
            <p class="text-subtitle-2 font-weight-medium mb-3">Comparativa de Escalas Mayores</p>
            <VTable density="compact">
              <thead>
                <tr>
                  <th style="width: 200px;" class="text-left font-weight-bold">Escala</th>
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
                    <VChip size="x-small" variant="elevated"  color="grey-darken-1"
                      class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                  </td>
                </tr>
                <!-- Escala Mayor de Do -->
                <tr>
                  <td><strong>Mayor de Do</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleC.includes(note) || note === 'Do'" color="blue" size="x-small" 
                      variant="elevated" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Do# -->
                <tr>
                  <td><strong>Mayor de Do#</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleCSharp.includes(note)" color="cyan" size="x-small" 
                      variant="elevated" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Re -->
                <tr>
                  <td><strong>Mayor de Re</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleD.includes(note)" color="teal" size="x-small" 
                      variant="elevated" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Re# -->
                <tr>
                  <td><strong>Mayor de Re#</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleDSharp.includes(note)" color="green" size="x-small" 
                      variant="elevated" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Mi -->
                <tr>
                  <td><strong>Mayor de Mi</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleE.includes(note)" color="lime" size="x-small" 
                      variant="elevated" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
                <!-- Escala Mayor de Fa -->
                <tr>
                  <td><strong>Mayor de Fa</strong></td>
                  <td v-for="(note, idx) in scaleNotesReference" :key="idx" class="text-center px-1">
                    <VChip v-if="majorScaleF.includes(note)" color="orange" size="x-small" 
                      variant="elevated" class="ma-0 font-weight-medium" style="min-width: 32px; justify-content: center;">
                      {{ note }}
                    </VChip>
                    <span v-else class="text-grey-lighten-2">-</span>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCard>

          <VAlert class="mt-4" type="success" variant="text" density="compact">
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