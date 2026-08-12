<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 8 · Control de la Laringe y Disociación" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: La laringe -->
        <CoursesSection title="La Laringe y Su Posición" icon="mdi-human-male-female-child">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La <strong>laringe</strong> es el "tubo" donde viven las cuerdas vocales; se ve como la
            nuez de Adán en el cuello. Su <strong>posición vertical</strong> influye muchísimo en el
            sonido:
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="success">mdi-arrow-up-bold</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Alta</div>
                <p class="text-body-2 mb-0">Zona de notas agudas y sonido brillante, pero cuidado: si se sube de más junto con la tensión, aparece el "apretón" nasal.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="info">mdi-circle-outline</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Neutral</div>
                <p class="text-body-2 mb-0">La posición de reposo. Es tu punto de partida para casi toda la técnica.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="amber">mdi-arrow-down-bold</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">Baja</div>
                <p class="text-body-2 mb-0">Zona de notas graves y sonido oscuro. Bajarla de más puede volver la voz pesada y forzada.</p>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="info" density="compact" variant="outlined">
            El objetivo <strong>no es mantenerla fija</strong>, sino que se mueva <em>con libertad y
            sin tensión</em> según la nota y el color que quieras.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Disociación -->
        <CoursesSection icon="mdi-head-cog" title="Disociación del Cuerpo al Cantar">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La <strong>disociación corporal</strong> es la habilidad de separar lo que hace tu cuerpo
            de la propia emisión vocal. Cuando cantas notas altas, tu cuerpo tiende a
            <em>hacer cosas innecesarias</em>: subir los hombros, levantar las cejas, alzar el cuello
            o tensar la laringe. Aprender a <strong>desconectarlas</strong> te da voz alta cómoda y
            libre.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Respuesta automática</th>
                <th class="text-left">Por qué pasa</th>
                <th class="text-left">Disociación (lo correcto)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in dissociationTable" :key="row.auto">
                <td><strong>{{ row.auto }}</strong></td>
                <td class="text-body-2">{{ row.why }}</td>
                <td class="text-body-2">{{ row.right }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 3: Estrategias -->
        <CoursesSection icon="mdi-puzzle" title="Estrategias de Disociación">
          <VList class="mb-2" density="compact">
            <VListItem v-for="strategy in strategies" :key="strategy.title">
              <template #prepend>
                <VIcon class="mr-2" :color="strategy.color">{{ strategy.icon }}</VIcon>
              </template>
              <div>
                <div class="text-body-2 font-weight-bold">{{ strategy.title }}</div>
                <div class="text-body-2 text-grey-darken-2">{{ strategy.detail }}</div>
              </div>
            </VListItem>
          </VList>
          <VAlert type="warning" density="compact" variant="outlined">
            La regla de oro: <strong>todo lo que se tensa al cantar afuera de la voz es energía
            perdida</strong>. Tu cara, cuello, hombros y cejas deben quedar casi igual al cantar una
            nota alta o una grave.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay8",
  data() {
    return {
      showContent: true,
      dissociationTable: [
        {
          auto: "Levantar las cejas / fruncir la frente",
          why: "El cerebro asocia 'alto' con 'esfuerzo facial'.",
          right: "Mantener la cara relajada y neutra.",
        },
        {
          auto: "Subir los hombros",
          why: "Al confundir esfuerzo con respiración clavicular.",
          right: "Hombros caídos y quietos; el trabajo está en el abdomen.",
        },
        {
          auto: "Elevar la laringe con tensión",
          why: "Buscando la nota alta con tensión en el cuello.",
          right: "Dejar que la laringe suba suave y sin apretar.",
        },
        {
          auto: "Segurar el cuello / barbilla",
          why: "Frente a una nota difícil, el cuello se pone rígido.",
          right: "Barbilla baja y cuello largo, suelto.",
        },
      ],
      strategies: [
        {
          title: "Practica una cara neutral",
          icon: "mdi-emoticon-neutral-outline",
          color: "primary",
          detail: "Canta con un espejo y verifica que ni cejas ni labios hagan esfuerzo.",
        },
        {
          title: "Ancla con la mano",
          icon: "mdi-hand-pointing-right",
          color: "amber",
          detail: "Apoya suavemente una mano en el abdomen para sentir que el poder está allí, no en el cuello.",
        },
        {
          title: "Separa la melodía del gesto",
          icon: "mdi-call-split",
          color: "green",
          detail: "Canta la escala primero con expresión, luego con cara de «piedra». La nota alta debe sonar igual.",
        },
        {
          title: "Relaja la mandíbula",
          icon: "mdi-human-male-board-poll",
          color: "blue",
          detail: "Mantén la mandíbula blanda; una mandíbula dura bloquea los agudos.",
        },
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