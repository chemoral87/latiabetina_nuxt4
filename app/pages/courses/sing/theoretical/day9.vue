<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teórico - Día 9 · Primera y Segunda Voz (Registros)" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Registros -->
        <CoursesSection icon="mdi-rhombus-split" title="Los Registros de la Voz">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            La voz humana se organiza en <strong>registros</strong>: zonas de producción con mecánica
            distinta. El habla cotidiana usa uno, pero cantar exige dominar (y conectar) varios. Los
            dos que vas a entrenar hoy son la <strong>primera voz</strong> (pecho) y la
            <strong>segunda voz</strong> (cabeza / mixta).
          </p>
          <VRow density="comfortable">
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 fill-height">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="deep-purple">mdi-arrow-down-bold</VIcon>
                  <span class="font-weight-medium">Primera Voz (Registro de Pecho)</span>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-2">
                  Sientes la vibración en el pecho. Son los graves y medios de tu voz: fuerte,
                  cálida y "terrenal".
                </p>
                <span class="font-mono text-caption text-grey-darken-2">Ejemplo: zona de conversación grave y media</span>
              </VCard>
            </VCol>
            <VCol md="6" cols="12">
              <VCard variant="outlined" class="pa-3 mb-3 fill-height">
                <div class="d-flex align-center mb-2">
                  <VIcon class="mr-2" color="light-blue">mdi-arrow-up-bold</VIcon>
                  <span class="font-weight-medium">Segunda Voz (Registro de Cabeza / Mixto)</span>
                </div>
                <p class="text-body-2 text-grey-darken-1 mb-2">
                  Sientes la vibración en la cabeza/nariz (máscara). Son los agudos: brillante,
                  ligera y "plateada".
                </p>
                <span class="font-mono text-caption text-grey-darken-2">Ejemplo: notas altas sin esfuerzo</span>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Cantantes reales -->
        <CoursesSection icon="mdi-account-music" title="Los Registros en la Música">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            En los arreglos musicales (y en coros), la <strong>primera voz</strong> es la línea
            principal/melodía, y la <strong>segunda voz</strong> es una armonía que acompaña por
            encima o por debajo. Aquí hablamos de <em>registro vocal</em>: el mecanismo de cada
            zona de la voz.
          </p>
          <VTable class="mb-4" density="compact">
            <thead>
              <tr>
                <th class="text-left">Término</th>
                <th class="text-left">Significado</th>
                <th class="text-left">Registro usual</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in voiceTerms" :key="row.term">
                <td><strong>{{ row.term }}</strong></td>
                <td class="text-body-2">{{ row.mean }}</td>
                <td class="text-body-2">{{ row.register }}</td>
              </tr>
            </tbody>
          </VTable>
          <VAlert type="info" density="compact" variant="outlined">
            La "primera voz" y la "segunda voz" en un coro también se refieren a quién canta la
            melodía y quién armoniza. Este curso enfatiza el <strong>registro</strong>: el mecanismo
            de pecho (1ª) y de cabeza/mixta (2ª).
          </VAlert>
        </CoursesSection>

        <!-- SECCION 3: Pasaje -->
        <CoursesSection icon="mdi-bridge" title="El Pasaje de Registro (Passaggio)">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            El <strong>pasaje</strong> es el punto donde tu voz "cambia" de un registro a otro. Si lo
            fuerzas, la voz "quiebra" (se corta). Si lo entrenas, el paso se vuelve
            <strong>invisible</strong>: nadie nota dónde cambias de registro.
          </p>
          <VCard class="knife-analogy-card pa-4 mb-3" style="border-left: 5px solid #6a1b9a;">
            <div class="d-flex align-start">
              <VIcon size="36" class="mr-3" color="deep-purple">mdi-auto-upload</VIcon>
              <div>
                <div class="text-subtitle-1 font-weight-bold text-deep-purple mb-1">Cómo suavizarlo</div>
                <VList density="compact">
                  <VListItem v-for="(tip, i) in passageTips" :key="i">
                    <template #prepend>
                      <VChip class="mr-2" size="x-small" color="deep-purple">{{ i + 1 }}</VChip>
                    </template>
                    <span class="text-body-2">{{ tip }}</span>
                  </VListItem>
                </VList>
              </div>
            </div>
          </VCard>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "SingTheoreticalDay9",
  data() {
    return {
      showContent: true,
      voiceTerms: [
        { term: "Voz de pecho", mean: "Registro grave/medio con vibración en el pecho", register: "Primera zona" },
        { term: "Voz mixta", mean: "Mezcla balanceada de pecho y cabeza", register: "Zona media" },
        { term: "Voz de cabeza", mean: "Registro agudo con vibración en la máscara", register: "Segunda zona" },
        { term: "Pasaje (passaggio)", mean: "El punto de transición entre registros", register: "Cambio" },
      ],
      passageTips: [
        "Sube la escala con la vocal 'OE' o 'I' suaves, que ayudan a dar el salto sin romper.",
        "Aumenta el aire y el apoyo justo antes del pasaje.",
        "No subas la laringe de golpe: deja que la voz «caiga en la cabeza» de forma progresiva.",
        "Usa el glisando (Día 6) para unir los registros sin escalones.",
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