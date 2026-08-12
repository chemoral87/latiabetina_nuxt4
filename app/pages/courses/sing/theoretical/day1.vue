<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 1 · Las Partes de la Voz" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Las tres partes de todo instrumento -->
        <CoursesSection icon="mdi-cog-outline" title="Productor · Vibrador · Amplificador">
          <p class="text-subtitle-1 font-weight-medium mb-3">Los tres bloques de todo instrumento</p>
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Todo instrumento musical — el ukelele, el piano, la flauta y también <strong>tu voz</strong> —
            se construye sobre el mismo modelo de tres partes: un <strong>productor</strong> que
            suministra la energía, un <strong>vibrador</strong> que la convierte en sonido y un
            <strong>amplificador</strong> que le da volumen y color. Entender dónde está cada uno en tu
            cuerpo es el primer paso del curso.
          </p>

          <VRow density="comfortable">
            <VCol v-for="part in instrumentParts" :key="part.code" md="4" sm="6" cols="12">
              <VCard variant="outlined" class="pa-4 fill-height">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" size="large" :color="part.color">{{ part.icon }}</VIcon>
                  <div>
                    <span class="font-weight-bold text-grey-darken-4">{{ part.name }}</span>
                    <div class="text-caption text-grey-darken-2">{{ part.instrument }}</div>
                  </div>
                </div>
                <p class="text-body-2 text-grey-darken-3 mb-2">{{ part.inVoice }}</p>
                <VAlert class="pa-1" variant="text" density="compact" :type="part.type">
                  <span class="text-caption">{{ part.tip }}</span>
                </VAlert>
              </VCard>
            </VCol>
          </VRow>

          <VTable class="mt-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Pieza</th>
                <th class="text-left">En el ukelele</th>
                <th class="text-left">En tu voz</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in partTable" :key="row.piece">
                <td><strong>{{ row.piece }}</strong></td>
                <td class="text-body-2">{{ row.ukulele }}</td>
                <td class="text-body-2"><strong>{{ row.voice }}</strong></td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 2: La voz como instrumento -->
        <CoursesSection icon="mdi-microphone" title="Tu Voz es un Instrumento">
          <p class="text-subtitle-1 font-weight-medium mb-3">Cuatro atributos que debes dominar</p>
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Ahora que sabes que tu voz tiene <strong>productor</strong> (el aire), <strong>vibrador</strong>
            (las cuerdas vocales) y <strong>amplificador</strong> (las cavidades de resonancia), puedes
            entender sus cuatro atributos por separado: <strong>color</strong>,
            <strong>proyección</strong>, <strong>colocación</strong> y <strong>afinación</strong>.
            Dominarlos es el objetivo de todo este curso.
          </p>

          <VRow density="comfortable">
            <VCol v-for="attr in voiceAttrs" :key="attr.code" md="6" sm="6" cols="12">
              <VCard variant="outlined" class="pa-3 fill-height">
                <div class="d-flex align-center mb-1">
                  <VIcon class="mr-2" size="small" color="primary">{{ attr.icon }}</VIcon>
                  <span class="font-weight-medium">{{ attr.name }}</span>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-2">{{ attr.description }}</p>
                <VAlert class="pa-1" variant="text" density="compact" :type="attr.type">
                  <span class="text-caption">{{ attr.tip }}</span>
                </VAlert>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 3: El color de la voz -->
        <CoursesSection title="El Color (Timbre)" icon="mdi-palette-outline">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            El <strong>color</strong> o <strong>timbre</strong> es la "firma sonora" de tu voz: lo que
            hace que dos personas suenen distinto aunque canten la misma nota con el mismo volumen.
            Depende de la forma de tu tracto vocal (cavidades de resonancia) y de la mezcla de
            armónicos que producen tus cuerdas vocales.
          </p>
          <VRow class="mb-2" density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="blue">mdi-brightness-5</VIcon>
                  <span class="font-weight-medium">Claro / Brillante</span>
                </div>
                <p class="text-body-2 mb-0">
                  Más armónicos agudos. Se logra acercando la voz a la máscara facial y con más
                  resonancia en la nariz y los senos faciales.
                </p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="deep-purple">mdi-brightness-2</VIcon>
                  <span class="font-weight-medium">Oscuro / Cálido</span>
                </div>
                <p class="text-body-2 mb-0">
                  Más armónicos graves. Se logra abriendo más la garganta y bajando la laringe,
                  dando profundidad y calidez al sonido.
                </p>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="info" density="compact" variant="outlined">
            El color no es bueno ni malo por sí mismo: es una herramienta expresiva. Aprender a
            variarlo conscientemente te da versatilidad interpretativa.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 4: Proyección -->
        <CoursesSection icon="mdi-volume-high" title="Proyección (Volumen)">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La <strong>proyección</strong> es la capacidad de llenar un espacio con tu voz sin gritar.
            No es sinónimo de fuerza: es el resultado de una <strong>resonancia eficiente</strong> que
            amplifica el sonido usando las cavidades de tu cuerpo como caja de resonancia natural.
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="primary">mdi-tune</VIcon>
                <div class="text-subtitle-2 font-weight-bold mb-1">Apoyo</div>
                <p class="text-body-2 mb-0">El aire sale controlado desde el diafragma, no desde la garganta.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="primary">mdi-radio-tower</VIcon>
                <div class="text-subtitle-2 font-weight-bold mb-1">Resonancia</div>
                <p class="text-body-2 mb-0">El sonido rebota en la boca, nariz y pecho para amplificarse.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="primary">mdi-headphones</VIcon>
                <div class="text-subtitle-2 font-weight-bold mb-1">Sin tensión</div>
                <p class="text-body-2 mb-0">El cuello y la mandíbula permanecen relajados.</p>
              </VCard>
            </VCol>
          </VRow>
          <VAlert class="mt-2" type="warning" density="compact" variant="outlined">
            Si te duele o te cansa la garganta al cantar fuerte, estás forzando. La proyección sana
            siempre se siente "hacia arriba y afuera", nunca en la garganta.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 5: Colocación -->
        <CoursesSection icon="mdi-crosshairs-gps" title="Colocación (Resonancia dirigida)">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La <strong>colocación</strong> es <em>dónde</em> sientes que vibra tu voz dentro de tu
            cabeza y cuerpo. Aprender a "colocar" la voz en un punto exacto mejora la afinación y
            la proyección sin esfuerzo.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Zona</th>
                <th class="text-left">Sensación</th>
                <th class="text-left">Para qué sirve</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="zone in placementZones" :key="zone.zone">
                <td><strong>{{ zone.zone }}</strong></td>
                <td class="text-body-2">{{ zone.sensation }}</td>
                <td class="text-body-2">{{ zone.use }}</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            Ejercicio inicial: tararea una "M" cerrada (humming) buscando cosquilleo en los labios y
            la nariz. Esa vibración <strong>frontal</strong> es el punto de partida de una buena colocación.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 6: Afinación -->
        <CoursesSection title="Afinación o Tono (Pitch)" icon="mdi-music-note-eighth-dotted">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La <strong>afinación</strong> es la precisión de tu nota: cantar exactamente la frecuencia
            correcta (por ejemplo, un La4 a 440&nbsp;Hz). Es un músculo del oído: se entrena
            escuchando, imitando y comparando con una referencia.
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="error">mdi-trending-up</VIcon>
                  <span class="font-weight-medium">Desafinado arriba (sostenido)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Cantas más agudo de lo necesario. Suele venir de tensión en el cuello o poca
                  escucha hacia abajo.
                </p>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-3" variant="outlined">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="error">mdi-trending-down</VIcon>
                  <span class="font-weight-medium">Desafinado abajo (bemol)</span>
                </div>
                <p class="text-body-2 mb-0">
                  Cantas más grave de lo necesario. Suele venir de poco apoyo respiratorio.
                </p>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="success" density="compact" variant="outlined">
            Regla práctica: cantar "un poco más arriba" mentalmente (sin tensionar) corrige la
            mayoría de los bajos. Escuchar mientras cantas es el primer paso para afinar.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 7: Resumen de Temporada 1 -->
        <CoursesSection title="Resumen del Día" icon="mdi-check-decagram-outline">
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">Atributo</th>
                <th class="text-left">Pregunta clave</th>
                <th class="text-left">Herramienta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in summary" :key="row.name">
                <td><strong>{{ row.name }}</strong></td>
                <td class="text-body-2">{{ row.question }}</td>
                <td class="text-body-2">{{ row.tool }}</td>
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
  name: "SingTheoreticalDay1",
  data() {
    return {
      showContent: true,
      instrumentParts: [
        {
          code: "P",
          name: "Productor",
          icon: "mdi-flash-outline",
          color: "blue",
          instrument: "El aire / la energía",
          inVoice: "El flujo de aire que sale de tus pulmones y es sostenido por el diafragma.",
          type: "info",
          tip: "Sin aire no hay sonido. Por eso el curso empieza por la respiración.",
        },
        {
          code: "V",
          name: "Vibrador",
          icon: "mdi-waveform",
          color: "deep-purple",
          instrument: "Las cuerdas / la lengüeta",
          inVoice: "Las cuerdas vocales en la laringe, que vibran y transforman el aire en tono.",
          type: "success",
          tip: "El tono (grave o agudo) nace aquí, del grosor y tensión de las cuerdas.",
        },
        {
          code: "A",
          name: "Amplificador",
          icon: "mdi-speaker",
          color: "orange",
          instrument: "La caja de resonancia",
          inVoice: "Las cavidades del cuerpo: pecho, garganta, boca y nariz que amplifican el sonido.",
          type: "warning",
          tip: "El volumen y el color dependen de la forma de estas cavidades.",
        },
      ],
      partTable: [
        { piece: "Productor", ukulele: "La mano que pulsa la cuerda", voice: "El aire y el diafragma" },
        { piece: "Vibrador", ukulele: "La cuerda que vibra", voice: "Las cuerdas vocales" },
        { piece: "Amplificador", ukulele: "La caja del ukelele", voice: "Pecho, boca y nariz" },
      ],
      voiceAttrs: [
        {
          code: "C",
          name: "Color (Timbre)",
          icon: "mdi-palette-outline",
          description: "La firma sonora única de tu voz: claro/brillante u oscuro/cálido.",
          type: "info",
          tip: "Se entrena con vocales y cambios de resonancia.",
        },
        {
          code: "P",
          name: "Proyección (Volumen)",
          icon: "mdi-volume-high",
          description: "La capacidad de sonar fuerte y lleno sin gritar ni forzar.",
          type: "success",
          tip: "Viene del apoyo y la resonancia, no de la fuerza.",
        },
        {
          code: "COL",
          name: "Colocación (Resonancia)",
          icon: "mdi-crosshairs-gps",
          description: "Dónde vibra la voz: frontal (máscara), bucal, nasal o de pecho.",
          type: "warning",
          tip: "El humming 'M' revela tu punto de colocación natural.",
        },
        {
          code: "AF",
          name: "Afinación (Tono)",
          icon: "mdi-music-note-eighth-dotted",
          description: "La precisión de la nota: cantar exactamente la frecuencia correcta.",
          type: "info",
          tip: "Se entrena escuchando e imitando referencias exactas.",
        },
      ],
      placementZones: [
        { zone: "Frontal / Máscara", sensation: "Cosquilleo en labios y nariz", use: "Notas agudas, brillo, proyección alta" },
        { zone: "Bucal / Boca", sensation: "Vibración en el paladar duro", use: "Zona neutra, color medio" },
        { zone: "Nasal", sensation: "Vibración en la nariz", use: "Giros, 'ng', cohesión de registro" },
        { zone: "Pecho", sensation: "Vibración en el torso", use: "Notas graves, peso y calidez" },
      ],
      summary: [
        { name: "Productor", question: "¿De dónde sale la energía?", tool: "Aire + diafragma" },
        { name: "Vibrador", question: "¿Qué convierte el aire en sonido?", tool: "Cuerdas vocales" },
        { name: "Amplificador", question: "¿Qué da volumen y color?", tool: "Cavidades de resonancia" },
        { name: "Color", question: "¿Cómo suen mi voz?", tool: "Vocales, resonancia" },
        { name: "Proyección", question: "¿Lleno el espacio sin gritar?", tool: "Apoyo + resonancia" },
        { name: "Colocación", question: "¿Dónde vibra mi voz?", tool: "Humming 'M', máscara" },
        { name: "Afinación", question: "¿Canto la nota exacta?", tool: "Oído, referencia, práctica" },
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