<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 17 · Control del Aire Avanzado" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Más allá del día 2 -->
        <CoursesSection icon="mdi-windsock" title="Refinando el Control del Aire">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            En el Día 2 aprendiste el apoyo básico con Tsss y Chsss. Hoy lo llevamos al siguiente
            nivel: <strong>frases largas, dinámica constante y reproyección</strong>. El aire es tu
            combustible: cuanto mejor lo administres, más largas y estables tus frases.
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="primary">mdi-timer-outline</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Duración</div>
                <p class="text-body-2 mb-0">Idear con Tsss frases de 25 a 40 segundos sin presión.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="green">mdi-speedometer</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Estabilidad</div>
                <p class="text-body-2 mb-0">Flujo parejo de principio a fin, sin "golpes" ni caídas.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="amber">mdi-repeat-once</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Respiración rápida</div>
                <p class="text-body-2 mb-0">Inspirar en el silencio en menos de 1 segundo, sin ruido.</p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Técnicas avanzadas -->
        <CoursesSection title="Técnicas Avanzadas de Aire" icon="mdi-chart-bell-curve-cumulative">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Técnica</th>
                <th class="text-left">Qué hace</th>
                <th class="text-left">Cómo practicarla</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in airTechs" :key="t.name">
                <td><strong>{{ t.name }}</strong></td>
                <td class="text-body-2">{{ t.what }}</td>
                <td class="text-body-2">{{ t.how }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 3: Reprovectorías -->
        <CoursesSection icon="mdi-sort-variant-lock" title="Aguantar y Reinspirar">
          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #01579b;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="light-blue">mdi-battery-charging</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-light-blue mb-1">Analogía de la batería</div>
                <p class="text-body-2 mb-0">
                  Tu aire es una batería que recargas en cada silencio. Cantar no es "gastar todo de
                  una": es <strong>distribuir la carga</strong> para que la batería nunca se apague en
                  medio de la frase. Las respiraciones rápidas y silenciosas son tu cargador.
                </p>
              </div>
            </div>
          </VCard>
          <VAlert type="info" density="compact" variant="outlined">
            Objetivo del día: cantar una frase de 8 compases sin quedarte sin aire y entrar en la
            siguiente sin que se note la respiración.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay17",
  data() {
    return {
      showContent: true,
      airTechs: [
        { name: "Tsss con dinámica", what: "Exhalar con Tsss creciente y decreciente", how: "pp → f → pp durante 10-15 s" },
        { name: "Chsss con picos", what: "Controlar 'explosiones' de aire", how: "Chsss normal, con picos de apoyo 5 veces" },
        { name: "Inspiración rápida", what: "Entrenar la carga express", how: "Inhalar 1s (boca pequeña) y exhalar 5s" },
        { name: "Frase artificial", what: "Cantar la duración de una frase sin letra", how: "Sobre una vocal 'Ah' manteniendo el ritmo" },
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