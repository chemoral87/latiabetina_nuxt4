<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 2 · Respiración Costilla-Diafragma" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Anatomía de la respiración -->
        <CoursesSection icon="mdi-human" title="Cómo Respiras al Cantar">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Para cantar bien necesitas <strong>aire controlado</strong>, no solo "más aire".
            La respiración correcta se llama <strong>costodiafragmática</strong>: el diafragma (músculo
            en forma de cúpula bajo los pulmones) baja al inspirar, y las costillas se abren
            lateralmente. Es una respiración <strong>baja y ancha</strong>, no de hombros.
          </p>

          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="error">mdi-close-circle</VIcon>
                  <span class="font-weight-medium">Respiración clavicular (MAL)</span>
                </div>
                <p class="text-body-2 mb-1">
                  Los hombros suben y el pecho se expande hacia arriba. Es corta, tensa y queda aire
                  viejo en la parte baja de los pulmones.
                </p>
                <div class="text-caption text-grey-darken-1">Se siente: tensión en cuello y hombros.</div>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="success">mdi-check-circle</VIcon>
                  <span class="font-weight-medium">Respiración costodiafragmática (BIEN)</span>
                </div>
                <p class="text-body-2 mb-1">
                  El abdomen y las costillas se expanden hacia afuera y los hombros quedan quietos.
                  Es larga, estable y relajada.
                </p>
                <div class="text-caption text-grey-darken-1">Se siente: hinchazón en el vientre y costillas.</div>
              </VCard>
            </VCol>
          </VRow>

          <VAlert type="info" density="compact" variant="outlined">
            Prueba rápida: coloca una mano en el vientre y otra en el pecho. Al inspirar bien,
            la mano del vientre sale primero y la del pecho se queda casi quieta.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Aguantar la respiración -->
        <CoursesSection icon="mdi-timer-sand" title="Aguantar la Respiración (Fraseo)">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            "Aguantar la respiración" no significa quedarse sin aire: significa
            <strong>mantener el apoyo abierto</strong> mientras cantas una frase larga. El aire se
            dosifica con los músculos abdominales (apoyo), no se contiene cerrando la garganta.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Concepto</th>
                <th class="text-left">Qué es</th>
                <th class="text-left">Error común</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in breathTable" :key="row.concept">
                <td><strong>{{ row.concept }}</strong></td>
                <td class="text-body-2">{{ row.what }}</td>
                <td class="text-body-2">{{ row.error }}</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="warning" density="compact" variant="outlined">
            Si al "sostener" sientes presión en el cuello o ganas de tragar, estás cerrando la
            glotis. El apoyo correcto se siente en el abdomen, nunca en la garganta.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Ejercicios de descarga de aire -->
        <CoursesSection icon="mdi-wind" title="Descarga Controlada (Tsss / Chsss)">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Los ejercicios de <strong>Tsss</strong> y <strong>Chsss</strong> entrenan la salida
            constante y controlada del aire, el fundamento del apoyo. El aire sale por los dientes y
            la lengua (como una "S"), de forma pareja y continua, mientras el diafragma se mantiene
            firme.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VChip size="x-small" color="light-blue-lighten-4" class="mr-2 font-weight-bold">Tsss</VChip>
                  <span class="font-weight-medium">Aire fino y silbante</span>
                </div>
                <p class="text-body-2 mb-0">
                  Lengua tocando el paladar tras los dientes superiores. Excelente para
                  <strong>control fino</strong> y duración larga.
                </p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VChip size="x-small" class="mr-2 font-weight-bold" color="deep-orange-lighten-4">Chsss</VChip>
                  <span class="font-weight-medium">Aire ancho y ruidoso</span>
                </div>
                <p class="text-body-2 mb-0">
                  Boca en posición de "ch", lengua baja. Trabaja el
                  <strong>esfuerzo abdominal</strong> y el flujo grande de aire.
                </p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 4: Resumen -->
        <CoursesSection title="Resumen del Día" icon="mdi-check-decagram-outline">
          <VList density="compact">
            <VListItem v-for="tip in dayTips" :key="tip">
              <template #prepend>
                <VIcon class="mr-1" size="small" color="primary">mdi-check</VIcon>
              </template>
              <span class="text-body-2">{{ tip }}</span>
            </VListItem>
          </VList>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay2",
  data() {
    return {
      showContent: true,
      breathTable: [
        {
          concept: "Apoyo",
          what: "Músculos abdominales que sostienen la columna de aire de forma firme.",
          error: "Cerrando la garganta o inflando las mejillas.",
        },
        {
          concept: "Fraseo",
          what: "Distribuir el aire para llegar al final de la frase sin tensión.",
          error: "Gastar todo el aire en las primeras palabras.",
        },
        {
          concept: "Emisión / Descarga",
          what: "Liberar el aire de forma controlada y constante, ruido suave antes del sonido.",
          error: "Dejar escapar el aire todo de golpe (explosión).",
        },
        {
          concept: "Inspiración",
          what: "Inhalación baja y ancha en el silencio, entre frases.",
          error: "Inspirar por la boca con ruido y hombros alzados.",
        },
      ],
      dayTips: [
        "Respira con el vientre y las costillas, no con los hombros.",
        "El apoyo está en el abdomen, nunca en la garganta.",
        "Tsss y Chsss dosifican el aire: es la base del apoyo.",
        "Aguantar = mantener el aire fluyendo, no contenerlo.",
        "Inspira en silencio entre frases, siempre relajado.",
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