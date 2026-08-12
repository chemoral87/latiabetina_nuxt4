<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 11 · Rangos Vocales" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Qué es el rango -->
        <CoursesSection icon="mdi-ruler" title="Tu Rango Vocal">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>rango vocal</strong> es el conjunto de notas que puedes cantar (de la más grave
            a la más aguda). Y la <strong>tesitura</strong> es la zona donde tu voz suena más cómoda y
            expresiva. Ambos te ayudan a elegir canciones adecuadas y a cuidar tu voz.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="primary">mdi-format-vertical-align-bottom</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Rango completo</div>
                <p class="text-body-2 mb-0">Todas las notas que puedes producir, incluso con esfuerzo. Define tus límites físicos.</p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="amber">mdi-format-horizontal-align-center</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Tesitura</div>
                <p class="text-body-2 mb-0">La zona donde cantas bien y sin cansancio. Es lo que usas en el día a día y en las canciones.</p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Clasificaciones -->
        <CoursesSection icon="mdi-account-group" title="Clasificaciones de la Voz">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Tradicionalmente las voces se clasifican por <strong>proximidad</strong> en familias. Las
            más conocidas: soprano (mujeres agudas), tenor (hombres agudos), barítono (hombres
            medios). Cada voz es única: estas son brújulas, no etiquetas rígidas.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Familia</th>
                <th class="text-left">Rango típico (aprox.)</th>
                <th class="text-left">Carácter</th>
                <th class="text-left">Tesitura</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in voiceTypes" :key="v.name">
                <td>
                  <VChip variant="tonal" :color="v.color" class="font-weight-bold">{{ v.name }}</VChip>
                </td>
                <td class="font-mono text-body-2">{{ v.range }}</td>
                <td class="text-body-2">{{ v.character }}</td>
                <td class="text-body-2">{{ v.tessitura }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 3: Cómo hallar tu rango -->
        <CoursesSection icon="mdi-compass-outline" title="Cómo Encontrar tu Propio Rango">
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="text-subtitle-1 font-weight-bold mb-2">Paso a paso</div>
                <VList density="compact">
                  <VListItem v-for="(step, i) in rangeSteps" :key="i">
                    <template #prepend>
                      <VChip class="mr-2" size="x-small" color="primary">{{ i + 1 }}</VChip>
                    </template>
                    <span class="text-body-2">{{ step }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="text-subtitle-1 font-weight-bold mb-2">Avisos importantes</div>
                <VList density="compact">
                  <VListItem v-for="notice in rangeNotices" :key="notice">
                    <template #prepend>
                      <VIcon class="mr-2" size="small" color="amber">mdi-alert</VIcon>
                    </template>
                    <span class="text-body-2">{{ notice }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay11",
  data() {
    return {
      showContent: true,
      voiceTypes: [
        {
          name: "Soprano",
          color: "pink",
          range: "C4 (Do central) – C6",
          character: "Brillante y aguda, la 'voz de la melodía' femenina.",
          tessitura: "Desde el Do central hasta la doble octava alta.",
        },
        {
          name: "Mezzosoprano",
          color: "purple",
          range: "A3 (La grave) – A5",
          character: "Cálida y llena, entre soprano y contralto.",
          tessitura: "Zona media grave-ligera más aguda que le da calidez.",
        },
        {
          name: "Contralto / Bajo",
          color: "deep-purple",
          range: "F3 – F5 / E2 – E4",
          character: "Las voces más graves de mujeres y hombres.",
          tessitura: "Zona grave y muy grave, de gran volumen y profundidad.",
        },
        {
          name: "Tenor",
          color: "light-blue",
          range: "C3 – C5",
          character: "Agudo masculino, brillante y potente en la zona alta.",
          tessitura: "Desde el Do2/C3 grave hasta el Do4/C5 de pecho.",
        },
        {
          name: "Barítono",
          color: "teal",
          range: "A2 – A4",
          character: "Media masculina: la voz masculina 'estándar' más común.",
          tessitura: "Zona A2 hasta A4, balanceada entre grave y agudo.",
        },
        {
          name: "Bajo profundo",
          color: "indigo",
          range: "E2 – E4",
          character: "La voz masculina más grave y resonante.",
          tessitura: "Zona muy grave, zumbido profundo.",
        },
      ],
      rangeSteps: [
        "Encuentra tu nota más cómoda (suele ser la de tu voz hablada).",
        "Baja por semitonos hasta que la nota se vuelva grave y frágil.",
        "Sube por semitonos hasta que el agudo se vuelva forzado.",
        "Anota los extremos: ese es tu rango actual.",
        "Halla tu tesitura: la franja donde cantas sin esfuerzo.",
      ],
      rangeNotices: [
        "El rango NO es fijo: con técnica (y tiempo) se expande.",
        "No compares tu rango con el de otros: cada voz es única.",
        "No cantes hasta el dolor al medir tus límites.",
        "El género no determina el rango: hay hombres sopranos y mujeres tenores.",
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