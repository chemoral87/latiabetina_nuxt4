<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 13 · Frecuencia y el Origen del 440 Hz" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Qué es la frecuencia -->
        <CoursesSection icon="mdi-sine-wave" title="La Frecuencia de la Música">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Cada nota es una <strong>onda sonora</strong> que vibra un número de veces por segundo.
            Ese número es la <strong>frecuencia</strong>, medida en <strong>hercios (Hz)</strong>.
            Cuanto más alta la frecuencia, más <strong>aguda</strong> la nota; cuanto más baja, más
            <strong>grave</strong>.
          </p>
          <VRow density="comfortable">
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="green">mdi-music-note</VIcon>
                <div class="text-subtitle-1 font-weight-bold">Grave</div>
                <p class="font-mono text-body-1 font-weight-bold">≈ 82 Hz</p>
                <p class="text-body-2 mb-0">Ej: E2. Vibración lenta.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" class="mb-1" color="primary">mdi-music-note-eighth</VIcon>
                <div class="text-subtitle-1 font-weight-bold">Medio</div>
                <p class="font-mono text-body-1 font-weight-bold">261.63 Hz</p>
                <p class="text-body-2 mb-0">Do central (C4): tu referencia vocal.</p>
              </VCard>
            </VCol>
            <VCol md="4" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 text-center fill-height">
                <VIcon size="36" color="red" class="mb-1">mdi-music-note-whole</VIcon>
                <div class="text-subtitle-1 font-weight-bold">Agudo</div>
                <p class="font-mono text-body-1 font-weight-bold">≥ 1046 Hz</p>
                <p class="text-body-2 mb-0">C6. Vibración rapidísima.</p>
              </VCard>
            </VCol>
          </VRow>
          <VAlert type="info" density="compact" variant="outlined">
            Doblar la frecuencia = subir una <strong>octava</strong>. A4=440 Hz, A5=880 Hz, A3=220 Hz,
            A2=110 Hz. La octava es la relación 2:1.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 2: Historia del 440 -->
        <CoursesSection icon="mdi-clock-history" title="El Origen del 440 Hz">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            El <strong>La4 = 440 Hz</strong> no siempre fue el estándar. Durante siglos cada región y
            orquesta afilaba el "La" de manera distinta (de 415 a 470 Hz según la época).
          </p>
          <VTimeline side="end" class="mb-4" density="compact">
            <VTimelineItem v-for="event in history" :key="event.year" size="x-small">
              <div class="d-flex align-center mb-1">
                <VChip size="small" color="primary" variant="tonal" class="font-weight-bold mr-2">{{ event.year }}</VChip>
                <strong>{{ event.title }}</strong>
              </div>
              <p class="text-body-2 text-grey-darken-2 mb-0">{{ event.detail }}</p>
            </VTimelineItem>
          </VTimeline>
          <VAlert type="warning" density="compact" variant="outlined">
            El 440 Hz es un <strong>acuerdo internacional</strong>, no una ley de la naturaleza. Es el
            La que usan afinadores y orquestas hoy; es también la nota de referencia de tus
            ejercicios de canto.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Afinación propia -->
        <CoursesSection icon="mdi-tune-variant" title="La Afinación de Tu Voz">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Para el oído humano, la "afinación correcta" no es un punto único sino una
            <strong>ventana de tolerancia</strong>: un coro o una voz suenan afinados si las notas
            caen cerca del centro del tono. Tu trabajo es entrenar el oído para quedarte en el centro.
          </p>
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">Nota</th>
                <th class="text-left">Hz exactos</th>
                <th class="text-left">Papel del cantante</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tuningTable" :key="row.note">
                <td><strong>{{ row.note }}</strong></td>
                <td class="font-mono text-body-2">{{ row.hz }}</td>
                <td class="text-body-2">{{ row.role }}</td>
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
  name: "SingTheoreticalDay13",
  data() {
    return {
      showContent: true,
      history: [
        {
          year: "siglo XVII",
          title: "Cada región, su tono",
          detail: "Los La de las orquestas variaban entre ~415 y ~470 Hz: cada ciudad tenía su 'tono'.",
        },
        {
          year: "1834",
          title: "El científico Scheibler",
          detail: "Propone 440 Hz para el La central como estándar 'científico'.",
        },
        {
          year: "1939",
          title: "Conferencia internacional",
          detail: "La Conferencia de Londres adopta oficialmente A4 = 440 Hz como referencia.",
        },
        {
          year: "1955",
          title: "ISO 16",
          detail: "La ISO publica la norma ISO 16 que consolida el 440 Hz mundialmente.",
        },
        {
          year: "hoy",
          title: "Estándar mundial",
          detail: "Afinadores, orquestas y apps usan 440 Hz. Existe un movimiento por 432 Hz, pero el estándar es 440.",
        },
      ],
      tuningTable: [
        { note: "C4 (Do central)", hz: "261.63", role: "Zona cómoda para empezar" },
        { note: "A4 (La4)", hz: "440.00", role: "Referencia universal" },
        { note: "G4 (Sol4)", hz: "392.00", role: "Registro medio de muchas voces" },
        { note: "C5 (Do alto)", hz: "523.25", role: "Agudo cómodo inicial" },
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