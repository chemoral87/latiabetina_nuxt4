<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 16 · Color y Dinámica" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Color -->
        <CoursesSection icon="mdi-palette" title="El Color Emocional de tu Voz">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>color</strong> es la huella emocional del sonido: cómo la misma nota suena
            triste, alegre, dulce o potente según la resonancia, la vocal y la intención. Es el
            territorio donde el cantante se convierte en artista.
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="light-blue">mdi-brightness-5</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Brillante</div>
                <p class="text-body-2 mb-0">Máscara alta, vocales "e/i", alegría y energía.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="deep-purple">mdi-brightness-4</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Cálido / Oscuro</div>
                <p class="text-body-2 mb-0">Máscara baja, vocales "o/u", ternura y nostalgia.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="amber">mdi-vibrate</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Diminuto / Susurro</div>
                <p class="text-body-2 mb-0">Poco aire, intimidad, confesión.</p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Dinámica -->
        <CoursesSection icon="mdi-volume-variant" title="La Dinámica: el Volumen Intencional">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La <strong>dinámica</strong> es el control planeado del volumen. En italiano se usan unas
            marcas que debes conocer para leer partituras de coro y para interpretar:
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Marca</th>
                <th class="text-left">Significado</th>
                <th class="text-left">En tu voz</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in dynamics" :key="d.mark">
                <td><strong>{{ d.mark }}</strong></td>
                <td class="text-body-2">{{ d.mean }}</td>
                <td class="text-body-2">{{ d.voice }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 3: Integración -->
        <CoursesSection icon="mdi-set-merge" title="Integrando Color y Dinámica">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            En el canto expresivo, color y dinámica van juntos. Una frase que dice "te extraño" no
            suena igual con color brillante y forte que con color cálido y piano: <strong>tú
            decides</strong> con tu interpretación.
          </p>
          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #e91e63;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="pink">mdi-palette-swatch-outline</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-pink mb-1">Analogía del pintor</div>
                <p class="text-body-2 mb-0">
                  El color es el <strong>pincel</strong> (qué matiz) y la dinámica es la
                  <strong>presión de la mano</strong> (cuánta fuerza). Un pintor experto decide ambos
                  por cada trazo; tú, por cada frase.
                </p>
              </div>
            </div>
          </VCard>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay16",
  data() {
    return {
      showContent: true,
      dynamics: [
        { mark: "pp / p", mean: "Pianísimo / piano (muy suave / suave)", voice: "Casi susurro, intimidad" },
        { mark: "mp / mf", mean: "Mezzopiano / Mezzoforte (medio-suave / medio-fuerte)", voice: "La voz natural de conversación cantada" },
        { mark: "f / ff", mean: "Forte / fortísimo (fuerte / muy fuerte)", voice: "Lleno y proyectado, sin gritar" },
        { mark: "cresc. / dim.", mean: "Crescendo (subir) / diminuendo (bajar)", voice: "Construir o soltar una frase" },
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