<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 12 · Lengua, Paladar y Frenillo" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Lengua -->
        <CoursesSection icon="mdi-tongue" title="Relajar la Lengua">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La <strong>lengua</strong> es el músculo que más estorba a la voz si está tensa. Apretada
            contra el paladar o subida al fondo de la boca, bloquea los agudos y opaca el sonido. Un
            objetivo constante es mantenerla <strong>acostada y suelta</strong>, con la punta tocando
            levemente los dientes inferiores.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="error">mdi-tongue-outline</VIcon>
                  <span class="font-weight-medium">Lengua tensa (evitar)</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="t in tongueBad" :key="t">
                    <span class="text-body-2">{{ t }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="success">mdi-tongue</VIcon>
                  <span class="font-weight-medium">Lengua suelta (ideal)</span>
                </div>
                <VList density="compact">
                  <VListItem v-for="t in tongueGood" :key="t">
                    <span class="text-body-2">{{ t }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Paladar blando -->
        <CoursesSection icon="mdi-check-decagram" title="Levantar el Paladar Blando">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>paladar blando</strong> es la parte blanda del techo de la boca, detrás del
            paladar duro. Elevarlo (como al bostezar) <strong>amplia la cavidad oral</strong>, da más
            espacio a la voz y mejora los agudos y la resonancia.
          </p>
          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #0277bd;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="light-blue">mdi-tent</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-light-blue mb-1">La carpa del bostezo</div>
                <p class="text-body-2 mb-0">
                  Imagina que el paladar se eleva como el techo de una carpa: hay más "aire arriba" y
                  la voz resuena con más brillo. Practica el gesto de <em>medio bostezo</em> y agrega
                  una vocal: "Aahh" con paladar arriba.
                </p>
              </div>
            </div>
          </VCard>
        </CoursesSection>

        <!-- SECCION 3: Frenillo -->
        <CoursesSection icon="mdi-ruler-square" title="Estirar el Frenillo Lingual">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>frenillo sublingual</strong> es el puente de tejido debajo de la lengua que la
            une al suelo de la boca. Un frenillo corto o tenso limita la movilidad y puede afectar
            articulación y sonidos agudos. Estirarlo de forma progresiva gana flexibilidad.
          </p>
          <VAlert class="mb-3" type="warning" density="compact" variant="outlined">
            Si tienes el frenillo extremadamente corto (imposible sacar la lengua), consulta a un
            fonoaudiólogo: no fuerces.
          </VAlert>
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">Ejercicio</th>
                <th class="text-left">Objetivo</th>
                <th class="text-left">Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ex in frenulumEx" :key="ex.name">
                <td><strong>{{ ex.name }}</strong></td>
                <td class="text-body-2">{{ ex.goal }}</td>
                <td class="text-body-2">{{ ex.freq }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay12",
  data() {
    return {
      showContent: true,
      tongueBad: [
        "Apretada contra los dientes o paladar.",
        "Doblada hacia atrás (bola en la garganta).",
        "Levantada al fondo subiendo la laringe.",
      ],
      tongueGood: [
        "Acostada en el suelo de la boca.",
        "Punta suave tocando los dientes inferiores.",
        "Grosor relajado como una hoja plana.",
      ],
      frenulumEx: [
        { name: "Rodeo dental", goal: "Dar movilidad a la punta", freq: "5 vueltas por lado de la lengua" },
        { name: "Estiramiento suave con punta", goal: "Ganar longitud hacia arriba", freq: "10 repeticiones lentas" },
        { name: "'La-la-la' y 'tra-tra'", goal: "Balística de la punta", freq: "Series cortas 3 veces" },
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