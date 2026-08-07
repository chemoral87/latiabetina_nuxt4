<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 6" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: La Cuarta Nota del Acorde -->
        <CoursesSection title="Más Allá de la Tríada: La Séptima" icon="mdi-numeric-7-circle-outline">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Hasta ahora hemos formado acordes con tres notas (tríadas). Si le agregamos una cuarta nota
            —la <strong>séptima</strong> de la escala— el acorde gana más color, tensión y
            sofisticación. Existen dos tipos principales de séptima, según su distancia con la tónica:
          </p>

          <VTable density="compact" class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Tipo de Séptima</th>
                <th class="text-left">Distancia desde la Tónica</th>
                <th class="text-left">Ejemplo desde Do</th>
                <th class="text-left">Sensación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="seventh in seventh_types" :key="seventh.type">
                <td>
                  <VChip size="x-small" :color="seventh.color"  class="font-weight-bold" variant="elevated">{{ seventh.type }}</VChip>
                </td>
                <td class="font-weight-bold">{{ seventh.distance }}</td>
                <td class="text-body-2">{{ seventh.example }}</td>
                <td class="text-body-2">{{ seventh.feeling }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="text" class="mt-4 mb-0">
            La séptima mayor está a <strong>medio tono</strong> de la octava (muy cerca de "casa"), por
            eso suena suave y soñadora. La séptima menor está a <strong>un tono completo</strong> de la
            octava, lo que crea más tensión y "ganas de resolver" hacia otro acorde.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Acorde con Séptima Mayor (maj7) -->
        <CoursesSection title="Acorde con Séptima Mayor (maj7)" icon="mdi-music-box-outline">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El acorde con séptima mayor se construye tomando un acorde mayor (1ª-3ª-5ª) y añadiendo la
            séptima mayor de la escala. Su fórmula de intervalos es:
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono text-teal-darken-3">
              1ª (Tónica) — 3ª Mayor — 5ª Justa — 7ª Mayor
            </span>
          </div>

          <p class="text-body-2 text-grey-darken-3 mb-0">
            Por ejemplo, el acorde de <strong>Do Mayor con Séptima Mayor (Cmaj7)</strong> se compone de
            las notas <strong>Do – Mi – Sol – Si</strong>. Este tipo de acorde tiene un sonido suave,
            "jazzy" y relajado, muy usado en baladas y música de fondo.
          </p>
        </CoursesSection>

        <!-- SECCION 3: Acorde con Séptima Menor (Dominante) -->
        <CoursesSection title="Acorde con Séptima Menor (Dominante, 7)" icon="mdi-music-box-outline">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El acorde con séptima menor (también llamado "acorde dominante" y escrito simplemente como
            "7", ej. C7, G7) toma un acorde mayor y le añade la séptima menor de la escala. Su fórmula
            de intervalos es:
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono text-deep-orange-darken-3">
              1ª (Tónica) — 3ª Mayor — 5ª Justa — b7ª (Séptima Menor)
            </span>
          </div>

          <p class="text-body-2 text-grey-darken-3 mb-0">
            Por ejemplo, el acorde de <strong>Sol con Séptima Menor (G7)</strong> se compone de las notas
            <strong>Sol – Si – Re – Fa</strong>. Este acorde genera tensión armónica y suele usarse justo
            antes de "resolver" hacia el acorde de tónica, como en la progresión clásica G7 → C.
          </p>
        </CoursesSection>

        <!-- SECCION 4: Tabla Comparativa de Acordes con Séptima -->
        <CoursesSection title="Acordes con Séptima y sus Notas" icon="mdi-table-music">
          <p class="text-body-2 text-grey-darken-2 mb-4">
            A continuación, una comparación de los acordes con séptima mayor y séptima menor (dominante)
            más usados en el ukelele:
          </p>

          <VTable density="compact" class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Acorde</th>
                <th class="text-left">Tipo</th>
                <th class="text-left">1ª</th>
                <th class="text-left">3ª</th>
                <th class="text-left">5ª</th>
                <th class="text-left">7ª</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="chord in seventh_chords_table" :key="chord.name">
                <td>
                  <VChip size="x-small" :color="chord.type === 'Mayor 7 (maj7)' ? 'teal' : 'deep-orange'"  class="font-weight-bold" variant="elevated">{{ chord.name }}</VChip>
                </td>
                <td class="text-body-2">{{ chord.type }}</td>
                <td class="font-weight-bold">{{ chord.root }}</td>
                <td class="font-weight-bold">{{ chord.third }}</td>
                <td class="font-weight-bold">{{ chord.fifth }}</td>
                <td class="font-weight-bold">{{ chord.seventh }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="text" class="mt-4 mb-0">
            Fíjate que <strong>Cmaj7</strong> y <strong>C7</strong> comparten las mismas tres primeras
            notas (Do, Mi, Sol); la única diferencia es esa última nota, Si vs. Sib, que cambia
            completamente el carácter del acorde.
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

      seventh_types: [
        { type: "7ª Mayor", distance: "5.5 tonos (11 semitonos)", example: "Do → Si", feeling: "Suave, soñador, jazzy", color: "teal" },
        { type: "7ª Menor", distance: "5 tonos (10 semitonos)", example: "Do → Sib", feeling: "Tenso, con ganas de resolver", color: "deep-orange" },
      ],

      seventh_chords_table: [
        { name: "Cmaj7", type: "Mayor 7 (maj7)", root: "Do (C)", third: "Mi (E)", fifth: "Sol (G)", seventh: "Si (B)" },
        { name: "Gmaj7", type: "Mayor 7 (maj7)", root: "Sol (G)", third: "Si (B)", fifth: "Re (D)", seventh: "Fa# (F#)" },
        { name: "Fmaj7", type: "Mayor 7 (maj7)", root: "Fa (F)", third: "La (A)", fifth: "Do (C)", seventh: "Mi (E)" },
        { name: "C7", type: "Menor 7 (Dominante)", root: "Do (C)", third: "Mi (E)", fifth: "Sol (G)", seventh: "Sib (Bb)" },
        { name: "G7", type: "Menor 7 (Dominante)", root: "Sol (G)", third: "Si (B)", fifth: "Re (D)", seventh: "Fa (F)" },
        { name: "D7", type: "Menor 7 (Dominante)", root: "Re (D)", third: "Fa# (F#)", fifth: "La (A)", seventh: "Do (C)" },
        { name: "A7", type: "Menor 7 (Dominante)", root: "La (A)", third: "Do# (C#)", fifth: "Mi (E)", seventh: "Sol (G)" },
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
