<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 10 · Colocación y Proyección" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Colocación -->
        <CoursesSection icon="mdi-crosshairs-gps" title="Colocación: Dónde Vibra tu Voz">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La <strong>colocación</strong> es la ubicación de la vibración resonante de tu voz.
            Cantar "adelante" (en la máscara) y "arriba" (en el paladar) da brillo y proyección sin
            esfuerzo. Cantar "atrás" o "abajo" da oscuridad, pero en exceso pierde claridad.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="success">mdi-face-agent</VIcon>
                  <span class="font-weight-medium">Colocación Adelante (Máscara)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Vibración en labios, nariz y mejillas. Da brillo, afinación y agudos fáciles. Es la
                  colocación de referencia para el canto moderno y de coro.
                </p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="deep-purple">mdi-vibrate</VIcon>
                  <span class="font-weight-medium">Colocación Atrás / Abajo</span>
                </div>
                <p class="text-body-2 mb-0">
                  Vibración en la garganta y el pecho. Da calidez y volumen grave, pero si es la única
                  colocación, el agudo se vuelve tenso y la voz pierde brillo.
                </p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Resonadores -->
        <CoursesSection icon="mdi-speaker-multiple" title="El Sistema de Resonadores">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Tu cuerpo tiene varias "cajas de resonancia" naturales. Usar varias a la vez también
            aumenta la <strong>proyección</strong> (volumen) sin grito.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Resonador</th>
                <th class="text-left">Ubicación</th>
                <th class="text-left">Aporta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="res in resounders" :key="res.name">
                <td><strong>{{ res.name }}</strong></td>
                <td class="text-body-2">{{ res.place }}</td>
                <td class="text-body-2">{{ res.adds }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 3: Proyección -->
        <CoursesSection icon="mdi-volume-high" title="Proyección: Llenar el Espacio">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La <strong>proyección</strong> eficiente = <em>resonancias superpuestas</em> + apoyo.
            Un mismo volumen puede sonar enorme si la colocación es frontal y el aire está apoyado.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-2">Consejos de proyección</div>
                <VList density="compact">
                  <VListItem v-for="tip in projectionTips" :key="tip">
                    <template #prepend>
                      <VIcon class="mr-2" size="small" color="green">mdi-check</VIcon>
                    </template>
                    <span class="text-body-2">{{ tip }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3 mb-2">Señales de proyección forzada</div>
                <VList density="compact">
                  <VListItem v-for="sign in forceSigns" :key="sign">
                    <template #prepend>
                      <VIcon color="red" class="mr-2" size="small">mdi-close</VIcon>
                    </template>
                    <span class="text-body-2">{{ sign }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="warning" density="compact" variant="outlined">
            Si proyectar "hacia afuera" te hace doler o toser, vuelve al Día 2: revisa el apoyo
            respiratorio primero.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay10",
  data() {
    return {
      showContent: true,
      resounders: [
        { name: "Nariz / senos", place: "Cara superior y nariz", adds: "Brillo y agudos" },
        { name: "Boca / paladar duro", place: "Techo de la boca", adds: "Claridad y definición" },
        { name: "Garganta (faringe)", place: "Zona baja de la boca y cuello", adds: "Oscuridad y calidez" },
        { name: "Pecho", place: "Torso superior", adds: "Volumen grave y peso" },
      ],
      projectionTips: [
        "Enfoca el sonido hacia la nariz y los dientes (máscara).",
        "Apoya cada frase con el abdomen, no con la garganta.",
        "Abre la boca verticalmente (hueco de la 'u' de huevo).",
        "Imagina que la voz 'sale por los ojos' para las notas altas.",
      ],
      forceSigns: [
        "Dolor o picazón en la garganta al cantar.",
        "Tos o carraspeo frecuente al terminar.",
        "Pérdida de afinación en las notas fuertes.",
        "Voz ronca al día siguiente.",
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