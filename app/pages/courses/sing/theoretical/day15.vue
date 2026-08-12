<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 15 · Escalas Cromáticas" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Escala cromática -->
        <CoursesSection icon="mdi-rainbow" title="La Escala Cromática">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La <strong>escala cromática</strong> es la que usa <strong>todos los semitonos</strong>:
            las 12 notas (7 naturales + 5 alteradas) de la octava. Sube "de a un semitono", sin
            saltar ninguna tecla. Es la escala más útil para <em>medir tu rango</em> y para entrenar
            la precisión absoluta del oído.
          </p>

          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #7b1fa2;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="deep-purple">mdi-stairs</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-deep-purple mb-1">¿Cuántas notas tiene una octava?</div>
                <p class="text-body-2 mb-0">
                  Toda la octava tiene <strong>12 semitonos</strong> (o "claves"): Do, Do#, Re, Re#,
                  Mi, Fa, Fa#, Sol, Sol#, La, La#, Si. La escala mayor solo "visita" 7 de ellas; la
                  cromática pasa por las 12.
                </p>
              </div>
            </div>
          </VCard>

          <div class="d-flex flex-wrap justify-center gap-1 mb-3">
            <VChip v-for="(n, i) in chromatic" :key="i" size="small" variant="tonal" color="deep-purple"
              class="font-mono font-weight-bold ma-1 px-2">
              {{ n }}
            </VChip>
          </div>
        </CoursesSection>

        <!-- SECCION 2: Tonalidades -->
        <CoursesSection icon="mdi-key-variant" title="Tonalidades y Alteraciones">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Una <strong>tonalidad</strong> (o "key") define el <em>centro tonal</em> de una canción:
            qué escala uso y qué notas son "naturales" en ella. Las alteraciones (sostenidos # /
            bemoles b) indican las notas que salen fuera de la escala.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Tonalidad</th>
                <th class="text-left">Alteraciones</th>
                <th class="text-left">Notas alteradas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in keys" :key="k.name">
                <td><strong>{{ k.name }}</strong></td>
                <td class="text-body-2">{{ k.accs }}</td>
                <td class="text-body-2 font-mono">{{ k.notes }}</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            Para el cantante, la tonalidad decide en qué nota queda cada frase: conocerla te ayuda a
            elegir la tonalidad cómoda y a afinar.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Modos y cenit -->
        <CoursesSection icon="mdi-repeat-variant" title="Escalas para tu Canto">
          <VTable density="compact">
            <thead>
              <tr>
                <th class="text-left">Tipo</th>
                <th class="text-left">Fórmula</th>
                <th class="text-left">Sabor</th>
                <th class="text-left">Estilo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in scaleStyles" :key="s.type">
                <td><strong>{{ s.type }}</strong></td>
                <td class="font-mono text-body-2">{{ s.formula }}</td>
                <td class="text-body-2">{{ s.flavor }}</td>
                <td class="text-body-2">{{ s.style }}</td>
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
  name: "SingTheoreticalDay15",
  data() {
    return {
      showContent: true,
      chromatic: ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"],
      keys: [
        { name: "Do Mayor (C)", accs: "0", notes: "sin alteraciones" },
        { name: "Sol Mayor (G)", accs: "1 sostenido", notes: "Fa#" },
        { name: "Re Mayor (D)", accs: "2 sostenidos", notes: "Fa#, Do#" },
        { name: "La Mayor (A)", accs: "3 sostenidos", notes: "Fa#, Do#, Sol#" },
        { name: "Fa Mayor (F)", accs: "1 bemol", notes: "Sib" },
        { name: "Sib Mayor (Bb)", accs: "2 bemoles", notes: "Sib, Mib" },
      ],
      scaleStyles: [
        { type: "Mayor", formula: "T-T-S-T-T-T-S", flavor: "Alegre, estable", style: "Pop, himnos, alabanza" },
        { type: "Menor natural", formula: "T-S-T-T-S-T-T", flavor: "Melancólico", style: "Baladas, rock" },
        { type: "Cromática", formula: "S-S-S-S (12 pasos)", flavor: "Sombra, tensión", style: "Solos, cromatismos" },
        { type: "Pentatónica", formula: "5 notas (sin semitonos)", flavor: "Espontáneo, cómodo", style: "Gospel, folk" },
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