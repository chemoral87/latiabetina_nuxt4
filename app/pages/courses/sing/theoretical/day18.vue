<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 18 · Repaso Integral del Curso" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Mapa del cantante -->
        <CoursesSection icon="mdi-map-marker-path" title="Mapa Completo del Cantante">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Has recorrido 17 días. Este es el resumen de todo lo aprendido y cómo encaja cada pieza:
          </p>

          <VTimeline side="end" class="mb-2" density="compact">
            <VTimelineItem v-for="item in timeline" :key="item.title" size="small"
              color="primary" :icon="item.icon">
              <div class="d-flex align-center mb-1">
                <strong>{{ item.title }}</strong>
              </div>
              <p class="text-body-2 text-grey-darken-2 mb-0">{{ item.detail }}</p>
            </VTimelineItem>
          </VTimeline>
        </CoursesSection>

        <!-- SECCION 2: Rutina semanal -->
        <CoursesSection icon="mdi-calendar-week" title="Tu Rutina de Práctica Semanal">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La constancia gana a la intensidad. Recomendación práctica de 20 minutos al día:
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Bloque</th>
                <th class="text-left">Duración</th>
                <th class="text-left">Contenido</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="block in routine" :key="block.time">
                <td><strong>{{ block.time }}</strong></td>
                <td class="text-body-2">{{ block.duration }}</td>
                <td class="text-body-2">{{ block.content }}</td>
              </tr>
            </tbody>
          </VTable>
        </CoursesSection>

        <!-- SECCION 3: Glosario -->
        <CoursesSection title="Glosario Clave" icon="mdi-book-open-page-variant">
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">Término</th>
                <th class="text-left">Definición rápida</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in glossary" :key="g.term">
                <td><strong>{{ g.term }}</strong></td>
                <td class="text-body-2">{{ g.def }}</td>
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
  name: "SingTheoreticalDay18",
  data() {
    return {
      showContent: true,
      timeline: [
        { icon: "mdi-microphone", title: "T1 · La voz (días 1-6)", detail: "Partes de la voz, respiración costodiafragmática, notas Do/C, escalas, ataque y glisando." },
        { icon: "mdi-head-cog", title: "T2 · Técnica y control (días 7-12)", detail: "Lips trills, vocal fry, control de laringe, registros 1ª/2ª, colocación, rangos, lengua y paladar." },
        { icon: "mdi-music-clef-treble", title: "T3 · Teoría y expresión (días 13-17)", detail: "Frecuencia y 440 Hz, acordes, cromática, color/dinámica y control avanzado del aire." },
        { icon: "mdi-flag-checkered", title: "Hoy · Día 18", detail: "Integras todo con un quiz final y una rutina semanal." },
      ],
      routine: [
        { time: "0-5 min", duration: "5", content: "Respiración: ejercicios Tsss/Chsss (Días 2 y 17)" },
        { time: "5-12 min", duration: "7", content: "Calentamiento: lip trills + sirenas/glisando (Días 6 y 7)" },
        { time: "12-18 min", duration: "6", content: "Técnica del día: escala, arpegio o ejercicio específico" },
        { time: "18-20 min", duration: "2", content: "Vocal fry de relajación y estiramiento de lengua" },
      ],
      glossary: [
        { term: "Colocación", def: "Dónde vibra tu voz (máscara, pecho...)" },
        { term: "Proyección", def: "Volumen eficiente sin grito" },
        { term: "Apoyo", def: "Músculos abdominales que sostienen el aire" },
        { term: "Glisando", def: "Deslizamiento continuo entre notas" },
        { term: "Pasaje", def: "Zona de transición entre registros" },
        { term: "Tesitura", def: "Zona donde tu voz suena cómoda" },
        { term: "Cromática", def: "Escala que usa los 12 semitonos" },
        { term: "Dinámica", def: "Control intencional del volumen (p-f)" },
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