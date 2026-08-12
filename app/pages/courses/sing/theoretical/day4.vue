<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 4 · Escalas Musicales" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Qué es una escala -->
        <CoursesSection icon="mdi-stairs" title="¿Qué es una Escala?">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Una <strong>escala</strong> es una sucesión ordenada de notas que sube por tonos y
            semitonos. Es la "escalera" sobre la que se construyen las melodías y los acordes.
            Para el canto, las escalas son <strong>el gimnasio del oído</strong>: cantar una escala
            diaria entrena afinación, registro y memoria musical.
          </p>

          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="primary">mdi-stairs-up</VIcon>
                  <span class="font-weight-medium">Tono (T)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Dos semitonos juntos. En el teclado es "salta una tecla". En la voz, la sensación
                  de subir una "muesca" grande.
                </p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="amber">mdi-stairs</VIcon>
                  <span class="font-weight-medium">Semitono (S)</span>
                </div>
                <p class="text-body-2 mb-0">
                  La distancia más pequeña: una tecla a la siguiente (incluye las negras). Es el paso
                  de Mi a Fa o de Si a Do.
                </p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Escala mayor -->
        <CoursesSection title="La Escala Mayor" icon="mdi-music-clef-treble">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La escala mayor natural sigue siempre la fórmula de intervalos:
          </p>
          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded mb-4 text-center">
            <span class="font-weight-bold text-subtitle-2 text-primary font-mono">
              T — T — S — T — T — T — S
            </span>
          </div>

          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Grado</th>
                <th class="text-left">Latino</th>
                <th class="text-left">Inglés</th>
                <th class="text-left">Función</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="note in cMajor" :key="note.degree">
                <td><VChip size="x-small" color="primary" variant="tonal" class="font-weight-bold">{{ note.function }}</VChip></td>
                <td><strong>{{ note.latin }}</strong></td>
                <td>{{ note.english }}</td>
                <td class="text-body-2">{{ note.mean }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="outlined">
            Canta la escala de Do Mayor (Do-Re-Mi-Fa-Sol-La-Si-Do) con el apoyo del día 2. Sube y
            baja lentamente, cuidando que cada nota quede exacta.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Escala menor y grados -->
        <CoursesSection icon="mdi-format-list-numbered" title="Escala Menor y Grados de la Escala">
          <VRow class="mb-2" density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="deep-purple">mdi-music-note-plus</VIcon>
                  <span class="font-weight-medium">Escala Menor Natural</span>
                </div>
                <p class="text-body-2 mb-2">
                  Fórmula: <span class="font-mono font-weight-bold">T — S — T — T — S — T — T</span>.
                  Suena más "triste" o melancólica porque la tercera está bemol.
                </p>
                <div class="text-caption text-grey-darken-1">Ejemplo en La menor: La-Si-Do-Re-Mi-Fa-Sol-La.</div>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="green">mdi-dice-5-outline</VIcon>
                  <span class="font-weight-medium">Grados importantes</span>
                </div>
                <VList density="compact">
                  <VListItem>
                    <span class="text-body-2"><strong>I · Tónica</strong> — centro de reposo (Do)</span>
                  </VListItem>
                  <VListItem>
                    <span class="text-body-2"><strong>III · Mediante</strong> — define mayor/menor</span>
                  </VListItem>
                  <VListItem>
                    <span class="text-body-2"><strong>V · Dominante</strong> — tensión que "pide" volver</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 4: Escalas para voz -->
        <CoursesSection icon="mdi-repeat" title="Escalas Prácticas para Canto">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Ejercicio</th>
                <th class="text-left">Qué entrena</th>
                <th class="text-left">Cómo practicar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in warmups" :key="row.name">
                <td><strong>{{ row.name }}</strong></td>
                <td class="text-body-2">{{ row.target }}</td>
                <td class="text-body-2">{{ row.how }}</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="warning" density="compact" variant="outlined">
            No saltes al extremo de tu registro sin calentar. Empieza en el centro de tu voz y
            expande la escala gradualmente.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay4",
  data() {
    return {
      showContent: true,
      cMajor: [
        { degree: 1, latin: "Do", english: "C4", function: "I", mean: "Tónica · centro de reposo" },
        { degree: 2, latin: "Re", english: "D4", function: "II", mean: "Superdominante" },
        { degree: 3, latin: "Mi", english: "E4", function: "III", mean: "Mediante · define el modo" },
        { degree: 4, latin: "Fa", english: "F4", function: "IV", mean: "Subdominante" },
        { degree: 5, latin: "Sol", english: "G4", function: "V", mean: "Dominante · tensión" },
        { degree: 6, latin: "La", english: "A4", function: "VI", mean: "Superdominante" },
        { degree: 7, latin: "Si", english: "B4", function: "VII", mean: "Sensible · sube a la tónica" },
        { degree: 8, latin: "Do", english: "C5", function: "I", mean: "Octava · la tónica más aguda" },
      ],
      warmups: [
        { name: "Escala completa", target: "Afinación y registro", how: "Do-Re-Mi-Fa-Sol-La-Si-Do, sube y baja" },
        { name: "Tres notas + salto", target: "Saltos de intervalo", how: "Do-Re-Mi (saltar a Sol), vuelve" },
        { name: "Arpegio", target: "Acordes y saltos", how: "Do-Mi-Sol (sube a Mi-Sol-Do), baja" },
        { name: "Escala en 5ta", target: "Memoria tonal", how: "Do-Re-Mi-Fa-Sol y regresa" },
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