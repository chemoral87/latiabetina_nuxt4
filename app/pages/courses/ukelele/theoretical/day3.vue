<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 3" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Grados de la Escala Mayor -->
        <CoursesSection title="Grados de la Escala Mayor" icon="mdi-stairs">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Antes de formar acordes, es necesario conocer los <strong>7 grados</strong> que componen una
            escala mayor. Cada nota de la escala recibe un nombre según la función que cumple respecto
            a la tónica:
          </p>

          <VTable density="compact" class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Grado</th>
                <th class="text-left">Nombre</th>
                <th class="text-left">Ejemplo (Escala de Do)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="degree in scale_degrees" :key="degree.number">
                <td>
                  <VChip size="x-small" color="primary" variant="outlined" class="font-weight-bold">{{ degree.number }}</VChip>
                </td>
                <td class="font-weight-bold">{{ degree.name }}</td>
                <td class="text-body-2">{{ degree.example }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="text" class="mt-4 mb-0">
            De estos 7 grados, el acorde mayor solo utiliza tres: la <strong>1ª (Tónica)</strong>, la
            <strong>3ª (Mediante)</strong> y la <strong>5ª (Dominante)</strong>.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: ¿Qué es un Acorde Mayor? -->
        <CoursesSection title="¿Qué es un Acorde Mayor?" icon="mdi-music-box-outline">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Un acorde mayor es una <strong>tríada</strong>: la combinación de tres notas tocadas al mismo tiempo,
            construidas a partir de una nota raíz (fundamental) siguiendo esta fórmula de intervalos:
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono text-primary">
              1ª (Tónica) — 3ª (Mediante) — 5ª (Dominante)
            </span>
          </div>

          <p class="text-body-2 text-grey-darken-3 mb-0">
            Por ejemplo, el acorde de <strong>Do Mayor (C)</strong> se compone de las notas
            <strong>Do – Mi – Sol</strong>. Estas tres notas, sonando juntas, producen ese carácter
            brillante y "alegre" típico de los acordes mayores. A continuación se listan los acordes
            mayores más usados en el ukelele junto con las notas que los componen.
          </p>
        </CoursesSection>

        <!-- SECCION 3: Tabla de Acordes Mayores y sus Notas -->
        <CoursesSection title="Acordes Mayores y sus Notas" icon="mdi-table-music">
          <p class="text-body-2 text-grey-darken-2 mb-4">
            Cada acorde mayor se forma con su tónica (1ª), su tercera mayor (3ª) y su quinta justa (5ª).
          </p>

          <VTable density="compact" class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Acorde</th>
                <th class="text-left">Nombre</th>
                <th class="text-left">1ª (Tónica)</th>
                <th class="text-left">3ª Mayor</th>
                <th class="text-left">5ª Justa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="chord in major_chords_table" :key="chord.name">
                <td>
                  <VChip size="x-small" color="primary"  class="font-weight-bold" variant="elevated">{{ chord.name }}</VChip>
                </td>
                <td class="text-body-2">{{ chord.fullName }}</td>
                <td class="font-weight-bold">{{ chord.root }}</td>
                <td class="font-weight-bold">{{ chord.third }}</td>
                <td class="font-weight-bold">{{ chord.fifth }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="text" class="mt-4 mb-0">
            La tercera mayor se ubica <strong>2 tonos completos</strong> por encima de la tónica, y la
            quinta justa se ubica <strong>3 tonos y medio</strong> por encima de la tónica.
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

      scale_degrees: [
        { number: "1ª", name: "Tónica", example: "Do (C)" },
        { number: "2ª", name: "Supertónica", example: "Re (D)" },
        { number: "3ª", name: "Mediante", example: "Mi (E)" },
        { number: "4ª", name: "Subdominante", example: "Fa (F)" },
        { number: "5ª", name: "Dominante", example: "Sol (G)" },
        { number: "6ª", name: "Submediante", example: "La (A)" },
        { number: "7ª", name: "Sensible", example: "Si (B)" },
      ],

      major_chords_table: [
        { name: "C", fullName: "Do Mayor", root: "Do (C)", third: "Mi (E)", fifth: "Sol (G)" },
        { name: "D", fullName: "Re Mayor", root: "Re (D)", third: "Fa# (F#)", fifth: "La (A)" },
        { name: "E", fullName: "Mi Mayor", root: "Mi (E)", third: "Sol# (G#)", fifth: "Si (B)" },
        { name: "F", fullName: "Fa Mayor", root: "Fa (F)", third: "La (A)", fifth: "Do (C)" },
        { name: "G", fullName: "Sol Mayor", root: "Sol (G)", third: "Si (B)", fifth: "Re (D)" },
        { name: "A", fullName: "La Mayor", root: "La (A)", third: "Do# (C#)", fifth: "Mi (E)" },
      ],
    }
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent
    },
  },
}
</script>
