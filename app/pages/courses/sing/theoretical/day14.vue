<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 14 · Formación de Acordes" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Qué es un acorde -->
        <CoursesSection title="¿Qué es un Acorde?" icon="mdi-music-accidental-natural">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Un <strong>acorde</strong> es un grupo de notas que suenan al mismo tiempo. El más
            importante y básico es la <strong>triada</strong>, formada por tres notas que se obtienen
            superponiendo <em>terceras</em> sobre la nota raíz.
          </p>

          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #ef6c00;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="orange">mdi-hand-clap</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-orange-darken-3 mb-1">Analogía del trío</div>
                <p class="text-body-2 mb-0">
                  Un acorde es como un trío que llega a la fiesta <strong>juntos</strong>: tres amigos
                  (notas) que se acuerdan de llegar al mismo tiempo. Si faltan o llegan tarde, el
                  "acorde" no suena completo.
                </p>
              </div>
            </div>
          </VCard>
        </CoursesSection>

        <!-- SECCION 2: Triadas -->
        <CoursesSection title="Triadas Mayor y Menor" icon="mdi-format-list-bulleted-triangle">
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Tipo</th>
                <th class="text-left">Fórmula (intervalos)</th>
                <th class="text-left">Do = ejemplo</th>
                <th class="text-left">Carácter</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Mayor</strong></td>
                <td class="font-mono text-body-2">Tónica – 3ª mayor – 5ª justa</td>
                <td class="font-mono text-body-2">Do–Mi–Sol (C–E–G)</td>
                <td class="text-body-2">Alegre, brillante, estable</td>
              </tr>
              <tr>
                <td><strong>Menor</strong></td>
                <td class="font-mono text-body-2">Tónica – 3ª menor – 5ª justa</td>
                <td class="font-mono text-body-2">Do–Mib–Sol (C–Eb–G)</td>
                <td class="text-body-2">Melancólico, oscuro, suave</td>
              </tr>
              <tr>
                <td><strong>Disminuido</strong></td>
                <td class="font-mono text-body-2">Tónica – 3ª menor – 5ª disminuida</td>
                <td class="font-mono text-body-2">Do–Mib–Solb (C–Eb–Gb)</td>
                <td class="text-body-2">Tenso, inestable</td>
              </tr>
              <tr>
                <td><strong>Aumentado</strong></td>
                <td class="font-mono text-body-2">Tónica – 3ª mayor – 5ª aumentada</td>
                <td class="font-mono text-body-2">Do–Mi–Sol# (C–E–G#)</td>
                <td class="text-body-2">Enigmático, soñador</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            Cambiar una sola nota (la 3ª) convierte un acorde mayor en menor: aprendes a
            "colorear" el sonido con una nota. Lo mismo aplica a tu voz con los vocablos.
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Para el canto -->
        <CoursesSection icon="mdi-human-queue" title="Acordes para el Cantante">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            Como cantante, cantas <strong>sobre</strong> los acordes del instrumento. Conocerlos te
            ayuda a:
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard class="pa-3 mb-2" variant="outlined">
                <VList density="compact">
                  <VListItem v-for="use in chordUses" :key="use">
                    <template #prepend>
                      <VIcon class="mr-2" size="small" color="green">mdi-check</VIcon>
                    </template>
                    <span class="text-body-2">{{ use }}</span>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay14",
  data() {
    return {
      showContent: true,
      chordUses: [
        "Saber en qué nota estás apoyándote (la 3ª de un acorde define el color).",
        "Improvisar y crear armonías de segunda voz.",
        "Afinar mejor cantando la nota 'de acorde', no cualquier nota.",
        "Componer acompañamientos con el ukelele u otro instrumento.",
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