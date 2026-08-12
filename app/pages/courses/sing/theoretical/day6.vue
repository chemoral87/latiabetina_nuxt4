<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 6 · El Glisando" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Definición -->
        <CoursesSection title="¿Qué es el Glisando?" icon="mdi-arrow-split-vertical">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>glisando</strong> (también llamado <em>glissando</em> o "sirena") es el
            deslizamiento continuo de una nota a otra, <strong>pasando por todas las alturas
            intermedias</strong>, sin detenerse en ninguna. Es como la sirena de una ambulancia:
            sube o baja sin "escalones".
          </p>

          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #1976d2;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="primary">mdi-gradient</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-primary mb-1">Escala vs. Glisando</div>
                <p class="text-body-2 mb-2">
                  Una <strong>escala</strong> suena nota a nota (escalones). Un <strong>glisando</strong>
                  se desliza sin escalones (rampa). Canta "Do-Re-Mi" (escalones) y luego desliza de Do a
                  Mi (rampa): la diferencia es exactamente esa.
                </p>
                <div class="d-flex align-center font-mono text-body-2">
                  <span>Escala: C4 → D4 → E4</span>
                  <span class="mx-2">|</span>
                  <span class="text-primary font-weight-bold">Glisando: C4 ▲ E4</span>
                </div>
              </div>
            </div>
          </VCard>
        </CoursesSection>

        <!-- SECCION 2: Tipos -->
        <CoursesSection icon="mdi-swap-vertical" title="Tipos de Glisando">
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="success">mdi-trending-up</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Ascendente</div>
                <p class="text-body-2 mb-0">De una nota grave a una aguda. Entrena el paso al registro agudo.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="info">mdi-trending-down</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Descendente</div>
                <p class="text-body-2 mb-0">De una aguda a una grave. Relaja la tensión al bajar del registro alto.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="amber">mdi-sync</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Completo (ida y vuelta)</div>
                <p class="text-body-2 mb-0">Sube y baja en un solo flujo. El "rey" de los ejercicios de calentamiento.</p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: Para qué sirve -->
        <CoursesSection icon="mdi-target-account" title="¿Para Qué Entrena el Glisando?">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Beneficio</th>
                <th class="text-left">Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="benefit in benefits" :key="benefit.title">
                <td><strong>{{ benefit.title }}</strong></td>
                <td class="text-body-2">{{ benefit.detail }}</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            El glisando es también una <strong>herramienta expresiva</strong>: un pequeño desliz
            hacia la nota le da sensibilidad y emoción a las canciones (muy usado en soul, pop y
            adoración).
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay6",
  data() {
    return {
      showContent: true,
      benefits: [
        { title: "Conexión de registros", detail: "Une la voz de pecho y la de cabeza sin 'cortes' ni roturas." },
        { title: "Relajación de la laringe", detail: "Al deslizar sin saltos, la laringe aprende a moverse con suavidad." },
        { title: "Control del aire", detail: "Exige un flujo constante y apoyado durante todo el trayecto." },
        { title: "Afinación continua", detail: "Entrena el oído a seguir la altura de forma progresiva." },
        { title: "Expresión", detail: "Aporta color y sensibilidad a las frases musicales." },
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