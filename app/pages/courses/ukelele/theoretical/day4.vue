<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 4" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Tonos y Semitonos -->
        <CoursesSection title="Tonos y Semitonos: La Clave de los Acordes" icon="mdi-ruler">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Para entender la diferencia entre un acorde mayor y uno menor, primero hay que medir la
            distancia entre sus notas en <strong>tonos</strong> y <strong>semitonos</strong>. Un semitono
            es la distancia más pequeña entre dos notas (1 traste en el ukelele); un tono equivale a 2
            semitonos (2 trastes).
          </p>

          <VTable density="compact" class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Tipo de Tercera</th>
                <th class="text-left">Distancia desde la Tónica</th>
                <th class="text-left">Ejemplo desde Do</th>
                <th class="text-left">Carácter</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="third in third_types" :key="third.type">
                <td>
                  <VChip size="x-small" :color="third.color"  class="font-weight-bold" variant="elevated">{{ third.type }}</VChip>
                </td>
                <td class="font-weight-bold">{{ third.distance }}</td>
                <td class="text-body-2">{{ third.example }}</td>
                <td class="text-body-2">{{ third.character }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="text" class="mt-4 mb-0">
            Toda la diferencia entre un acorde mayor y uno menor está en <strong>medio tono</strong>: la
            tercera menor es solo 1 semitono más baja que la tercera mayor.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: ¿Qué es un Acorde Menor? -->
        <CoursesSection title="¿Qué es un Acorde Menor?" icon="mdi-music-box-outline">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Un acorde menor es también una <strong>tríada</strong>, pero a diferencia del acorde mayor,
            su tercera se baja medio tono (1 semitono). La fórmula de intervalos es:
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono text-indigo-darken-2">
              1ª (Tónica) — 3ª Menor — 5ª (Dominante)
            </span>
          </div>

          <p class="text-body-2 text-grey-darken-3 mb-0">
            Por ejemplo, el acorde de <strong>La Menor (Am)</strong> se compone de las notas
            <strong>La – Do – Mi</strong>. Ese pequeño cambio de medio tono en la tercera es lo que le da
            al acorde menor su carácter melancólico, nostálgico o "triste", en contraste con el sonido
            brillante del acorde mayor.
          </p>
        </CoursesSection>

        <!-- SECCION 3: Tabla de Acordes Menores y sus Notas -->
        <CoursesSection title="Acordes Menores y sus Notas" icon="mdi-table-music">
          <p class="text-body-2 text-grey-darken-2 mb-4">
            Cada acorde menor se forma con su tónica (1ª), su tercera menor (b3ª) y su quinta justa (5ª).
          </p>

          <VTable density="compact" class="mb-2">
            <thead>
              <tr>
                <th class="text-left">Acorde</th>
                <th class="text-left">Nombre</th>
                <th class="text-left">1ª (Tónica)</th>
                <th class="text-left">b3ª (Tercera Menor)</th>
                <th class="text-left">5ª Justa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="chord in minor_chords_table" :key="chord.name">
                <td>
                  <VChip size="x-small" color="indigo"  class="font-weight-bold" variant="elevated">{{ chord.name }}</VChip>
                </td>
                <td class="text-body-2">{{ chord.fullName }}</td>
                <td class="font-weight-bold">{{ chord.root }}</td>
                <td class="font-weight-bold">{{ chord.third }}</td>
                <td class="font-weight-bold">{{ chord.fifth }}</td>
              </tr>
            </tbody>
          </VTable>

          <VAlert type="info" density="compact" variant="text" class="mt-4 mb-0">
            Cada acorde menor comparte su tónica con su acorde mayor "relativo" (ej. Do Mayor y Do menor
            inician en la misma nota), pero suenan completamente distintos por ese único semitono de
            diferencia en la tercera.
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

      third_types: [
        { type: "3ª Mayor", distance: "2 tonos (4 semitonos)", example: "Do → Mi", character: "Brillante, alegre", color: "primary" },
        { type: "3ª Menor", distance: "1.5 tonos (3 semitonos)", example: "Do → Mib", character: "Melancólico, triste", color: "indigo" },
      ],

      minor_chords_table: [
        { name: "Am", fullName: "La Menor", root: "La (A)", third: "Do (C)", fifth: "Mi (E)" },
        { name: "Dm", fullName: "Re Menor", root: "Re (D)", third: "Fa (F)", fifth: "La (A)" },
        { name: "Em", fullName: "Mi Menor", root: "Mi (E)", third: "Sol (G)", fifth: "Si (B)" },
        { name: "Cm", fullName: "Do Menor", root: "Do (C)", third: "Mib (Eb)", fifth: "Sol (G)" },
        { name: "Gm", fullName: "Sol Menor", root: "Sol (G)", third: "Sib (Bb)", fifth: "Re (D)" },
        { name: "Bm", fullName: "Si Menor", root: "Si (B)", third: "Re (D)", fifth: "Fa# (F#)" },
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
