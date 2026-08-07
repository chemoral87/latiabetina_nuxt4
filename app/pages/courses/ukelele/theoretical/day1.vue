<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 1" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Partes del Ukelele -->
        <CoursesSection title="Partes del Ukelele" icon="mdi-guitar-acoustic">
          <p class="text-subtitle-1 font-weight-medium mb-3">Partes principales</p>
          <VImg
            src="/courses/ukelele/images/partes-ukelele.jpg"
            class="mb-4 rounded"
            max-height="420"
            contain
          >
            <template #error>
              <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                <VIcon class="mr-1" size="small" color="grey-darken-1">mdi-image-off</VIcon>
                <span class="text-caption text-grey-darken-1">Imagen general no disponible</span>
              </div>
            </template>
          </VImg>

          <VRow density="comfortable" class="mb-4">
            <VCol v-for="part in ukelele_parts" :key="part.name" cols="12" sm="6" md="4">
              <VCard variant="outlined" class="pa-3 fill-height">
                <div class="d-flex align-center mb-1">
                  <VIcon size="small" color="primary" class="mr-2">{{ part.icon }}</VIcon>
                  <span class="font-weight-medium">{{ part.name }}</span>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-0">{{ part.description }}</p>
                <VImg :src="part.image" height="140" class="mt-3 rounded" contain>
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                      <span class="text-caption text-grey-darken-1">Cargando imagen...</span>
                    </div>
                  </template>
                  <template #error>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
                      <VIcon class="mr-1" size="small" color="grey-darken-1">mdi-image-off</VIcon>
                      <span class="text-caption text-grey-darken-1">Imagen no disponible</span>
                    </div>
                  </template>
                </VImg>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Afinación Estándar -->
        <CoursesSection title="Afinación Estándar" icon="mdi-tune">
          <p class="text-subtitle-1 font-weight-medium mb-2">Afinación estándar (G-C-E-A)</p>
          <p class="text-body-2 text-grey-darken-2 mb-4">
            El ukelele soprano, concert y tenor se afinan de forma reentrante: la cuerda 4 (G)
            suena más aguda que las cuerdas 3 y 2. Esta es la afinación <strong>High G</strong>,
            la más común en los ukeleles estándar.
          </p>

          <VTable density="compact" class="mb-4">
            <thead>
              <tr>
                <th class="text-left">Cuerda</th>
                <th class="text-left">Nota (inglés)</th>
                <th class="text-left">Nota (latino)</th>
                <th class="text-left">Frecuencia (Hz)</th>
                <th class="text-left">Posición</th>
                <th class="text-left">Referencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="string in tuning_strings" :key="string.number">
                <td>
                  <VChip size="x-small" :color="string.color"  variant="elevated">{{ string.number }}</VChip>
                </td>
                <td><strong>{{ string.note_en }}</strong></td>
                <td>{{ string.note_es }}</td>
                <td class="text-body-2">{{ string.frequency }}</td>
                <td class="text-body-2">{{ string.position }}</td>
                <td class="text-body-2 text-grey">{{ string.hint }}</td>
              </tr>
            </tbody>
          </VTable>

          <VDivider class="mb-4" />

          <p class="text-subtitle-1 font-weight-medium mb-3">High G vs. Low G</p>

          <VRow density="comfortable">
            <VCol cols="12" md="6">
              <VCard variant="outlined" class="pa-3 mb-3">
                <div class="d-flex align-center mb-2">
                  <VIcon color="amber" class="mr-2">mdi-music-note-high</VIcon>
                  <span class="font-weight-medium">High G (G4 - 392 Hz)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Afinación estándar reentrante. Sonido brillante y clásico del ukelele.
                  La más usada en ukeleles soprano, concert y tenor.
                </p>
              </VCard>
            </VCol>

            <VCol cols="12" md="6">
              <VCard variant="outlined" class="pa-3 mb-3">
                <div class="d-flex align-center mb-2">
                  <VIcon color="blue" class="mr-2">mdi-music-note</VIcon>
                  <span class="font-weight-medium">Low G (G3 - 196 Hz)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Afinación alternativa lineal. Proporciona más registro grave y un sonido más lleno
                  en los acordes. Ideal para arreglos con líneas de bajo.
                </p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: Notas Musicales -->
        <CoursesSection title="Notas Musicales" icon="mdi-music-note">
          <p class="text-subtitle-1 font-weight-medium mb-2">Notación latina vs. inglesa</p>
          <p class="text-body-2 text-grey-darken-2 mb-4">
            En Latinoamérica se usa notación <strong>latina (Do, Re, Mi...)</strong>.
            En el mundo anglosajón y en muchas apps se usa notación <strong>inglesa (C, D, E...)</strong>.
            Ejemplo: Do = C.
          </p>

          <VTable density="compact" class="mb-5">
            <thead>
              <tr>
                <th class="text-left">Latino</th>
                <th class="text-left">Inglés</th>
                <th class="text-left">Sostenido (#)</th>
                <th class="text-left">Bemol (b) siguiente</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="note in notes_table" :key="note.latin">
                <td><strong>{{ note.latin }}</strong></td>
                <td>{{ note.english }}</td>
                <td>
                  <VChip v-if="note.sharp" size="x-small" color="deep-orange-lighten-4" class="font-weight-medium" variant="elevated">
                    {{ note.sharp }}
                  </VChip>
                  <span v-else class="text-grey">—</span>
                </td>
                <td>
                  <VChip v-if="note.flat_next" size="x-small" color="blue-lighten-4" class="font-weight-medium" variant="elevated">
                    {{ note.flat_next }}
                  </VChip>
                  <span v-else class="text-grey">—</span>
                </td>
              </tr>
            </tbody>
          </VTable>

          <VDivider class="mb-4" />

          <p class="text-subtitle-1 font-weight-medium mb-2">¿Qué son los sostenidos y bemoles?</p>

          <VRow density="comfortable">
            <VCol cols="12" md="6">
              <VCard variant="outlined" class="pa-3 mb-3">
                <div class="d-flex align-center mb-2">
                  <VIcon color="deep-orange" class="mr-2">mdi-arrow-up</VIcon>
                  <span class="font-weight-medium">Sostenido (# · Sharp)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Sube la nota <strong>medio tono</strong> (un traste hacia arriba).
                  Ejemplo: Do# / C# está un traste arriba que Do / C.
                </p>
              </VCard>
            </VCol>

            <VCol cols="12" md="6">
              <VCard variant="outlined" class="pa-3 mb-3">
                <div class="d-flex align-center mb-2">
                  <VIcon color="blue" class="mr-2">mdi-arrow-down</VIcon>
                  <span class="font-weight-medium">Bemol (b · Flat)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Baja la nota <strong>medio tono</strong> (un traste hacia abajo).
                  Ejemplo: Reb / Db es la misma altura que Do# / C# (notas enarmónicas).
                </p>
              </VCard>
            </VCol>
          </VRow>

          <VAlert type="warning" density="compact" variant="text" class="mt-4">
            Entre <strong>Mi-Fa (E-F)</strong> y <strong>Si-Do (B-C)</strong>
            <strong>no hay nota intermedia</strong>: son semitonos naturales y no existe
            un sostenido/bemol entre ellos.
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
      ukelele_parts: [
        {
          name: "Clavijeros",
          icon: "mdi-tune",
          description: "Tornillos que tensan o aflojan las cuerdas para ajustar la afinacion.",
          image: "/courses/ukelele/images/clavijeros.jpg",
        },
        {
          name: "Cejilla",
          icon: "mdi-minus",
          description: "Pieza en la parte superior del mastil que guia las cuerdas y define el inicio de la escala.",
          image: "/courses/ukelele/images/cejuela.jpg",
        },
        {
          name: "Mastil",
          icon: "mdi-rectangle-outline",
          description: "Parte donde se ubican los trastes y el diapasón; aqui se presionan los acordes.",
          image: "/courses/ukelele/images/mastil.jpg",
        },
        {
          name: "Trastes",
          icon: "mdi-view-column",
          description: "Barras metalicas que dividen el diapasón. Cada traste representa medio tono.",
          image: "/courses/ukelele/images/trastes.jpg",
        },
        {
          name: "Caja de resonancia",
          icon: "mdi-circle-outline",
          description: "Cuerpo hueco de madera que amplifica el sonido de las cuerdas.",
          image: "/courses/ukelele/images/caja-resonancia.jpg",
        },
        {
          name: "Boca (Sound hole)",
          icon: "mdi-circle",
          description: "Agujero en la tapa que permite que el sonido salga con mayor proyeccion.",
          image: "/courses/ukelele/images/boca.jpg",
        },
        {
          name: "Cuerdas",
          icon: "mdi-guitar-pick",
          description: "El ukelele tiene 4 cuerdas, generalmente de nylon o fluorocarbono.",
          image: "/courses/ukelele/images/cuerdas.jpg",
        },
        {
          name: "Cejilla Inferior",
          icon: "mdi-minus-thick",
          description: "Pieza inferior que sostiene y eleva las cuerdas en la base del instrumento.",
          image: "/courses/ukelele/images/selleta.jpg",
        },
      ],

      tuning_strings: [
        {
          number: "4 (arriba)",
          note_en: "G",
          note_es: "Sol",
          frequency: "392 Hz",
          position: "La mas cercana a ti al tocar",
          hint: "Nota reentrante (suena aguda)",
          color: "green-darken-1",
        },
        {
          number: "3",
          note_en: "C",
          note_es: "Do",
          frequency: "262 Hz",
          position: "Segunda desde arriba",
          hint: "Mas grave de las 4",
          color: "blue-darken-1",
        },
        {
          number: "2",
          note_en: "E",
          note_es: "Mi",
          frequency: "330 Hz",
          position: "Tercera cuerda",
          hint: "",
          color: "orange-darken-1",
        },
        {
          number: "1 (abajo)",
          note_en: "A",
          note_es: "La",
          frequency: "440 Hz",
          position: "La mas alejada de ti al tocar",
          hint: "Cuerda mas aguda en pitch estandar",
          color: "red-darken-1",
        },
      ],

      notes_table: [
        { latin: "Do", english: "C", sharp: "Do# / C#", flat_next: "Reb / Db" },
        { latin: "Re", english: "D", sharp: "Re# / D#", flat_next: "Mib / Eb" },
        { latin: "Mi", english: "E", sharp: null, flat_next: null },
        { latin: "Fa", english: "F", sharp: "Fa# / F#", flat_next: "Solb / Gb" },
        { latin: "Sol", english: "G", sharp: "Sol# / G#", flat_next: "Lab / Ab" },
        { latin: "La", english: "A", sharp: "La# / A#", flat_next: "Sib / Bb" },
        { latin: "Si", english: "B", sharp: null, flat_next: null },
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