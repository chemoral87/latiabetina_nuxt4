<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 5 · Cómo Atacar la Nota" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: El ataque -->
        <CoursesSection icon="mdi-sword-cross" title="El Ataque (Onset / Attack)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>ataque</strong> es el <em>instante exacto</em> en el que comienza el sonido de
            una nota. Es el momento donde se decide que la nota suene limpia, afinada y sin tensión.
            Existen tres tipos de ataque que debes conocer y dominar.
          </p>

          <VRow density="comfortable">
            <VCol v-for="attack in attacks" :key="attack.name" md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 fill-height">
                <VIcon size="32" class="mb-1" :color="attack.color">{{ attack.icon }}</VIcon>
                <div class="text-subtitle-1 font-weight-bold mb-1">{{ attack.name }}</div>
                <p class="text-body-2 text-grey-darken-1 mb-2">{{ attack.description }}</p>
                <VChip size="x-small" variant="outlined" :color="attack.kind">{{ attack.tag }}</VChip>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Ataque aspirado vs correcto -->
        <CoursesSection icon="mdi-timeline-clock-outline" title="Los Tres Momentos del Ataque">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">#</th>
                <th class="text-left">Momento</th>
                <th class="text-left">Qué pasa</th>
                <th class="text-left">Clave</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td><strong>Prepárate</strong></td>
                <td class="text-body-2">Posición de boca y apoyo listos antes de sonar.</td>
                <td class="text-body-2">Piensa la nota *antes* de emitirla.</td>
              </tr>
              <tr>
                <td>2</td>
                <td><strong>Impulsa</strong></td>
                <td class="text-body-2">El aire sale con un pequeño golpe de apoyo.</td>
                <td class="text-body-2">El apoyo "dispara" la nota, no la garganta.</td>
              </tr>
              <tr>
                <td>3</td>
                <td><strong>Llega</strong></td>
                <td class="text-body-2">Las cuerdas vibran y la nota queda estable.</td>
                <td class="text-body-2">La nota "aterriza" afinada desde el primer instante.</td>
              </tr>
            </tbody>
          </VTable>

          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #ff6f00;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="orange-darken-3">mdi-human-greeting-proximity</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-orange-darken-3 mb-1">Analogía del saludo</div>
                <p class="text-body-2 mb-0">
                  Pensar el ataque como un <strong>saludo con la mano</strong>: llegas con intención
                  clara y firme, no con un choque brusco ni con un "eh…". La nota entra segura desde
                  el primer sonido.
                </p>
              </div>
            </div>
          </VCard>
        </CoursesSection>

        <!-- SECCION 3: Errores comunes -->
        <CoursesSection icon="mdi-alert-outline" title="Errores Comunes al Atacar">
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="error">mdi-close-octagon</VIcon>
                  <span class="font-weight-medium">Ataque duro / glotal</span>
                </div>
                <p class="text-body-2 mb-0">
                  Se golpea la garganta como un "clac". Cansa y puede lesionar. Se corrige pensando
                  la nota con aire suave antes del sonido.
                </p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="warning">mdi-call-received</VIcon>
                  <span class="font-weight-medium">Ataque aspirado (exceso de 'h')</span>
                </div>
                <p class="text-body-2 mb-0">
                  Sale mucho aire antes de la nota ("jaaaa"). Aunque es útil como ejercicio, en el
                  canto real debilita el sonido. Se corrige cerrando el apoyo y bajando la "h".
                </p>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 4: Diferencia entre estilos -->
        <CoursesSection title="Staccato, Legato y Marcato" icon="mdi-music-accidental-natural">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Tipo</th>
                <th class="text-left">Cómo suena</th>
                <th class="text-left">Para qué entrena</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Staccato</strong></td>
                <td class="text-body-2">Notas cortas y separadas (pica-pica)</td>
                <td class="text-body-2">Ataque preciso y agilidad de las cuerdas</td>
              </tr>
              <tr>
                <td><strong>Legato</strong></td>
                <td class="text-body-2">Notas ligadas y continuas, sin cortes</td>
                <td class="text-body-2">Flujo de aire constante y fraseo</td>
              </tr>
              <tr>
                <td><strong>Marcato</strong></td>
                <td class="text-body-2">Notas acentuadas y con peso</td>
                <td class="text-body-2">Control del apoyo y dinámica</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            Rutina del día: 5 staccato (corta), 5 legato (ligada) y 5 marcato (acentuada) sobre la
            misma nota, manteniendo siempre el mismo apoyo.
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay5",
  data() {
    return {
      showContent: true,
      attacks: [
        {
          name: "Ataque Duro (Glottal)",
          icon: "mdi-boomerang",
          color: "error",
          kind: "evitar",
          tag: "Evitar en el canto real",
          description: "Se golpea el sonido con un 'clac' inicial. Útil solo en algunos efectos, perjudicial si es habitual.",
        },
        {
          name: "Ataque Aspirado",
          icon: "mdi-weather-windy",
          color: "amber",
          kind: "progreso",
          tag: "Útil solo como ejercicio",
          description: "Un soplo 'j' antes de la nota. Como ejercicio relaja; en exceso produce voz aérea.",
        },
        {
          name: "Ataque Equilibrado (Correcto)",
          icon: "mdi-target",
          color: "success",
          kind: "ideal",
          tag: "Combina aire + vibración",
          description: "El aire y el cierre de las cuerdas llegan al mismo tiempo: nota limpia, afinada y sin tensión.",
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