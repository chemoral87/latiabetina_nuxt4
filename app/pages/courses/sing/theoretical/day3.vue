<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 3 · Notas: Do y C" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Nomenclatura -->
        <CoursesSection icon="mdi-alphabetical-variant" title="Nomenclatura Latina vs. Anglosajona">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Así como aprendiste en el ukelele, la música usa <strong>dos sistemas de nombres</strong>:
            la nomenclatura <strong>latina</strong> (Do, Re, Mi...) usada en Latinoamérica y parte de
            España, y la <strong>anglosajona</strong> (C, D, E...) usada en el resto del mundo y en la
            mayoría de los apps y partituras anglófonas. <strong>Do = C</strong>.
          </p>

          <VTable class="mb-5" density="compact">
            <thead>
              <tr>
                <th class="text-left">Latino</th>
                <th class="text-left">Inglés</th>
                <th class="text-left">Sostenido (#)</th>
                <th class="text-left">Bemol (b)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="note in notesTable" :key="note.latin">
                <td><strong>{{ note.latin }}</strong></td>
                <td>{{ note.english }}</td>
                <td>{{ note.sharp }}</td>
                <td>{{ note.flat }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="warning" density="compact" variant="outlined">
            Entre <strong>Mi-Fa (E-F)</strong> y <strong>Si-Do (B-C)</strong> no hay nota intermedia:
            son <strong>semitonos naturales</strong>. Es la misma regla que viste en el ukelele.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: La letra y la octava -->
        <CoursesSection icon="mdi-order-numeric-ascending" title="La Letra Dice la Nota, el Número la Octava">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            En el canto usamos la notación científica: <strong>la letra indica la nota y el número la
            octava</strong>. Por ejemplo, <strong>C4</strong> (Do central) es el "Do del medio" del
            piano, el punto de referencia para muchas voces.
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <div class="text-h4 font-weight-bold text-primary">C4</div>
                <div class="text-subtitle-2 font-weight-medium">Do central · 261.63 Hz</div>
                <p class="text-body-2 text-grey-darken-1 mt-2 mb-0">
                  El "Do del medio" del piano. Punto de equilibrio entre los registros.
                </p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <div class="text-h4 font-weight-bold text-primary">A4</div>
                <div class="text-subtitle-2 font-weight-medium">La central · 440 Hz</div>
                <p class="text-body-2 text-grey-darken-1 mt-2 mb-0">
                  La referencia universal de afinación: la "A" que afina orquestas.
                </p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <div class="text-h4 font-weight-bold text-primary">C3</div>
                <div class="text-subtitle-2 font-weight-medium">Do grave · 130.81 Hz</div>
                <p class="text-body-2 text-grey-darken-1 mt-2 mb-0">
                  Una octava más grave. Zona cómoda para voces masculinas graves.
                </p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: Relación con tu voz -->
        <CoursesSection icon="mdi-voice" title="Tu Voz y las Notas">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Tu voz puede medirse en notas: cada nota que cantas tiene una letra (Do-La-Mi...) y una
            octava (el número). Aprender a identificar <em>en qué nota estás</em> es el primer paso
            para afinar y para saber tu <strong>rango vocal</strong> (lo verás en el Día 11).
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Sistema</th>
                <th class="text-left">Ejemplo</th>
                <th class="text-left">Uso común</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Latino (Do)</strong></td>
                <td>Do central, Sol alto</td>
                <td>Profesores de canto en Latinoamérica, solfeo tradicional</td>
              </tr>
              <tr>
                <td><strong>Anglosajón (C)</strong></td>
                <td>C4, G5</td>
                <td>Apps, afinadores, partituras internacionales, backings</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            Consejo: domina ambos sistemas por igual. Los afinadores y pistas suelen estar en
            nomenclatura inglesa; tus profesores y partituras locales, en latina.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay3",
  data() {
    return {
      showContent: true,
      notesTable: [
        { latin: "Do", english: "C", sharp: "Do# / C#", flat: "Reb / Db" },
        { latin: "Re", english: "D", sharp: "Re# / D#", flat: "Mib / Eb" },
        { latin: "Mi", english: "E", sharp: "—", flat: "—" },
        { latin: "Fa", english: "F", sharp: "Fa# / F#", flat: "Solb / Gb" },
        { latin: "Sol", english: "G", sharp: "Sol# / G#", flat: "Lab / Ab" },
        { latin: "La", english: "A", sharp: "La# / A#", flat: "Sib / Bb" },
        { latin: "Si", english: "B", sharp: "—", flat: "—" },
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