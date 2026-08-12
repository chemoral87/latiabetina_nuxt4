<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 7 · Lips Trills y Vocal Fry" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Lips trills -->
        <CoursesSection icon="mdi-lips" title="Los Lips Trills (Vibrato de Labios)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>lip trill</strong> (o "brrr" con los labios) es un ejercicio de
            <strong>fuerza y coordinación</strong>: haces vibrar los labios mientras emites un sonido
            o una melodía. Es el mejor ejercicio para calentar porque <em>obliga a la voz a trabajar
            sin tensión</em>.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="success">mdi-check-circle</VIcon>
                  <span class="font-weight-medium">Cómo se hace</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="(step, i) in lipTrillSteps" :key="i">
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
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="info">mdi-lightbulb-on</VIcon>
                  <span class="font-weight-medium">Por qué funciona</span>
                </div>
                <p class="text-body-2 text-grey-darken-2 mb-2">
                  Los labios no pueden vibrar si la garganta está tensa: el lip trill
                  <strong>equivale a un "relajante muscular automático"</strong>. Además regula el
                  flujo de aire y conecta el apoyo con la emisión.
                </p>
                <VAlert type="info" class="pa-1" variant="text" density="compact">
                  <span class="text-caption">Si los labios se "apagan", suelta un poquito más de aire del apoyo.</span>
                </VAlert>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Vocal fry -->
        <CoursesSection icon="mdi-crack" title="El Vocal Fry (Registro Crepitativo)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>vocal fry</strong> es el registro más grave de la voz: un sonido "rasposo" o
            "crepitante" como el de las películas de terror o el comienzo de "creaky voice". Es un
            ejercicio de <strong>relajación y liberación de tensión</strong> de las cuerdas vocales.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="amber">mdi-leaf</VIcon>
                  <span class="font-weight-medium">Para qué sirve</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="tip in fryBenefits" :key="tip">
                    <template #prepend>
                      <VIcon class="mr-2" size="small" color="green">mdi-plus</VIcon>
                    </template>
                    <span class="text-body-2">{{ tip }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon color="red" class="mr-2">mdi-alert-circle</VIcon>
                  <span class="font-weight-medium">Precauciones</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="tip in fryCautions" :key="tip">
                    <template #prepend>
                      <VIcon color="red" class="mr-2" size="small">mdi-minus</VIcon>
                    </template>
                    <span class="text-body-2">{{ tip }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: Comparación -->
        <CoursesSection icon="mdi-scale-balance" title="Fuerza y Relajación, las Dos Caras">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Ejercicio</th>
                <th class="text-left">Tipo</th>
                <th class="text-left">Objetivo</th>
                <th class="text-left">Sensación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Lip trill</strong></td>
                <td class="text-body-2">Fuerza + coordinación</td>
                <td class="text-body-2">Conexión apoyo-voz sin tensión</td>
                <td class="text-body-2">Labios vibrando, garganta libre</td>
              </tr>
              <tr>
                <td><strong>Vocal fry</strong></td>
                <td class="text-body-2">Relajación</td>
                <td class="text-body-2">Soltar la tensión de las cuerdas</td>
                <td class="text-body-2">Sonido rasposo y suelto, sin quemar</td>
              </tr>
              <tr>
                <td><strong>Ambos combinados</strong></td>
                <td class="text-body-2">Equilibrio</td>
                <td class="text-body-2">Voz fuerte y relajada</td>
                <td class="text-body-2">Energía del apoyo + flexibilidad</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="success" density="compact" variant="outlined">
            Rutina de oro: empieza con <strong>lip trills</strong> (calienta y une), termina con
            <strong>vocal fry</strong> (relaja y suelta). Nada de medidas al pie de la letra: dos
            minutos de cada uno son suficientes.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay7",
  data() {
    return {
      showContent: true,
      lipTrillSteps: [
        "Junta los labios dejándolos sueltos y húmedos.",
        "Sopla dejando que los labios vibren («brrr»).",
        "Añade un sonido de voz sobre la vibración.",
        "Desliza por una escala o una melodía corta.",
        "Repite en distintas notas sin apretar.",
      ],
      fryBenefits: [
        "Libera la tensión acumulada en las cuerdas.",
        "Enseña a cantar con poco aire y mucha relajación.",
        "Ayuda a encontrar la voz grave de pecho.",
        "Es útil en efectos expresivos modernos.",
      ],
      fryCautions: [
        "No fuerces el sonido rasposo con presión.",
        "Es una herramienta de calentamiento, no tu voz cotidiana.",
        "Si te irrita la garganta, descansa y evalúa tu técnica.",
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