<template>
  <div>
    <CoursesHeader v-model="showContent" title="Teológico - Día 2" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCIÓN 1: Dios habita y se manifiesta en la alabanza -->
        <CoursesSection outlined title="Dios Habita y Se Manifiesta en la Alabanza" icon="mdi-heart-multiple" text-class="">
          <p class="text-body-1 text-grey-darken-3 mb-4">
            La Escritura enseña que <strong>Dios habita en medio de la alabanza de su pueblo</strong>.
            Esto no significa que esté ausente en otros lugares —Él es omnipresente—, sino que en la
            adoración sincera elige revelar su gloria de un modo particular y transformador.
          </p>

          <VRow density="comfortable" class="mb-4">
            <VCol cols="12" md="6" class="d-flex">
              <VCard id="card-cours-ukele-theol-day2-lighten-5-1" variant="outlined" class="pa-4 bg-grey-lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <VIcon color="primary" class="mr-2">mdi-book-open-variant</VIcon>
                    <span class="font-weight-bold text-grey-darken-4">Salmo 22:3</span>
                  </div>
                  <p class="text-body-2 italic text-grey-darken-3 mb-0">
                    "Pero tú eres santo, tú que habitas entre las alabanzas de Israel."
                  </p>
                </div>
                <div class="text-caption text-primary font-weight-bold mt-2 text-right">RVR1960</div>
              </VCard>
            </VCol>

            <VCol cols="12" md="6" class="d-flex">
              <VCard id="card-cours-ukele-theol-day2-lighten-5-2" variant="outlined" class="pa-4 bg-grey-lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <VIcon color="primary" class="mr-2">mdi-book-open-variant</VIcon>
                    <span class="font-weight-bold text-grey-darken-4">Salmo 100:2-4</span>
                  </div>
                  <p class="text-body-2 italic text-grey-darken-3 mb-0">
                    "Servid a Jehová con alegría; Venid ante su presencia con regocijo… Entrad por sus
                    puertas con acción de gracias, Por sus atrios con alabanza."
                  </p>
                </div>
                <div class="text-caption text-primary font-weight-bold mt-2 text-right">RVR1960</div>
              </VCard>
            </VCol>
          </VRow>

          <VCard id="card-cours-ukele-theol-day2-blue-3" variant="outlined" class="pa-4 mb-0 bg-blue-lighten-5">
            <p class="text-subtitle-2 font-weight-bold text-blue-darken-3 mb-3">
              <VIcon color="blue-darken-3" class="mr-2">mdi-lightbulb-on</VIcon>
              Omnipresencia y manifestación
            </p>
            <VRow density="comfortable">
              <VCol cols="12" md="6">
                <div class="pa-3 rounded mb-3 mb-md-0 fill-height" style="background-color: rgba(63, 81, 181, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold text-blue-darken-3 mb-2">Siempre presente</p>
                  <p class="text-body-2 italic text-grey-darken-3 mb-2">
                    "¿A dónde me iré de tu Espíritu?… Si subiere a los cielos, allí estás tú." — Salmo 139:7-8
                  </p>
                  <p class="text-body-2 text-grey-darken-3 mb-0">
                    Dios está en todo lugar, aunque no siempre lo percibamos.
                  </p>
                </div>
              </VCol>
              <VCol cols="12" md="6">
                <div class="pa-3 rounded fill-height" style="background-color: rgba(244, 67, 54, 0.1);">
                  <p class="text-subtitle-2 font-weight-bold text-red-darken-3 mb-2">Presencia manifiesta</p>
                  <p class="text-body-2 italic text-grey-darken-3 mb-2">
                    "Si tu presencia no ha de ir conmigo, no nos saques de aquí." — Éxodo 33:15
                  </p>
                  <p class="text-body-2 text-grey-darken-3 mb-0">
                    Dios elige revelarse y actuar con poder en momentos concretos —como en la alabanza
                    congregacional— de modo que su pueblo lo experimente con claridad.
                  </p>
                </div>
              </VCol>
            </VRow>
          </VCard>
        </CoursesSection>

        <!-- SECCIÓN 2: Adorar antes que desgastarse -->
        <CoursesSection outlined title="Adorar Antes que Desgastarse" icon="mdi-shield-account" text-class="">
          <p class="text-body-1 text-grey-darken-3 mb-4">
            La victoria espiritual no comienza enfrentando al enemigo con nuestras fuerzas, sino
            sometiéndonos a Dios. La alabanza trae su presencia al campo de batalla —y donde Dios
            actúa, el temor pierde terreno.
          </p>

          <VRow density="comfortable" class="mb-4">
            <VCol cols="12" md="6" class="d-flex">
              <VCard id="card-cours-ukele-theol-day2-lighten-5-4" variant="outlined" class="pa-4 bg-grey-lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <VIcon color="primary" class="mr-2">mdi-book-open-variant</VIcon>
                    <span class="font-weight-bold text-grey-darken-4">Santiago 4:7</span>
                  </div>
                  <p class="text-body-2 italic text-grey-darken-3 mb-0">
                    "Someteos, pues, a Dios; resistid al diablo, y huirá de vosotros."
                  </p>
                </div>
                <div class="text-caption text-primary font-weight-bold mt-2 text-right">RVR1960</div>
              </VCard>
            </VCol>

            <VCol cols="12" md="6" class="d-flex">
              <VCard id="card-cours-ukele-theol-day2-lighten-5-5" variant="outlined" class="pa-4 bg-grey-lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <VIcon color="primary" class="mr-2">mdi-book-open-variant</VIcon>
                    <span class="font-weight-bold text-grey-darken-4">2 Crónicas 20:21-22</span>
                  </div>
                  <p class="text-body-2 italic text-grey-darken-3 mb-0">
                    "Puso a algunos que cantasen y alabasen a Jehová… Y cuando comenzaron a entonar
                    cantos de alabanza, Jehová puso contra los enemigos emboscadas…"
                  </p>
                </div>
                <div class="text-caption text-primary font-weight-bold mt-2 text-right">RVR1960</div>
              </VCard>
            </VCol>
          </VRow>

          <VRow density="comfortable" class="mb-4">
            <VCol cols="12" md="6">
              <VCard id="card-cours-ukele-theol-day2-6" variant="outlined" class="pa-4 h-100" style="border-color: #d32f2f; background-color: rgba(211, 47, 47, 0.05);">
                <div class="d-flex align-center mb-2">
                  <VIcon color="red-darken-2" class="mr-2">mdi-cloud-alert</VIcon>
                  <h3 class="text-subtitle-2 font-weight-bold text-red-darken-2 mb-0">
                    Centrarse solo en el enemigo
                  </h3>
                </div>
                <p class="text-body-2 text-grey-darken-3 mb-0">
                  Agota, genera ansiedad y nos deja peleando solos. El problema ocupa el centro y el
                  Vencedor queda en segundo plano.
                </p>
              </VCard>
            </VCol>

            <VCol cols="12" md="6">
              <VCard id="card-cours-ukele-theol-day2-7" variant="outlined" class="pa-4 h-100" style="border-color: #388e3c; background-color: rgba(56, 142, 60, 0.05);">
                <div class="d-flex align-center mb-2">
                  <VIcon color="green-darken-2" class="mr-2">mdi-music-box-multiple</VIcon>
                  <h3 class="text-subtitle-2 font-weight-bold text-green-darken-2 mb-0">
                    Centrarse en adorar a Dios
                  </h3>
                </div>
                <p class="text-body-2 text-grey-darken-3 mb-0">
                  Reenfoca la mirada, fortalece la fe y trae paz. Josafat no envió guerreros primero:
                  envió cantores. La batalla pertenecía al Señor.
                </p>
              </VCard>
            </VCol>
          </VRow>

          <VRow density="comfortable" class="mb-4">
            <VCol cols="12" md="6" class="d-flex">
              <VCard id="card-cours-ukele-theol-day2-lighten-5-8" variant="outlined" class="pa-4 bg-grey-lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <VIcon color="primary" class="mr-2">mdi-book-open-variant</VIcon>
                    <span class="font-weight-bold text-grey-darken-4">Salmo 27:1</span>
                  </div>
                  <p class="text-body-2 italic text-grey-darken-3 mb-0">
                    "Jehová es mi luz y mi salvación; ¿de quién temeré?"
                  </p>
                </div>
                <div class="text-caption text-primary font-weight-bold mt-2 text-right">RVR1960</div>
              </VCard>
            </VCol>

            <VCol cols="12" md="6" class="d-flex">
              <VCard id="card-cours-ukele-theol-day2-lighten-5-9" variant="outlined" class="pa-4 bg-grey-lighten-5 w-100 d-flex flex-column justify-space-between">
                <div>
                  <div class="d-flex align-center mb-2">
                    <VIcon color="primary" class="mr-2">mdi-book-open-variant</VIcon>
                    <span class="font-weight-bold text-grey-darken-4">Filipenses 4:6-7</span>
                  </div>
                  <p class="text-body-2 italic text-grey-darken-3 mb-0">
                    "Por nada estéis afanosos… con acción de gracias. Y la paz de Dios… guardará vuestros
                    corazones y vuestros pensamientos en Cristo Jesús."
                  </p>
                </div>
                <div class="text-caption text-primary font-weight-bold mt-2 text-right">RVR1960</div>
              </VCard>
            </VCol>
          </VRow>

          <VAlert type="success" border="left" colored-border elevation="1" class="mb-0">
            <div class="text-body-2 font-weight-medium text-grey-darken-4">
              <strong>Aplicación práctica:</strong> Si el temor o la opresión te abruman, no te desgastes
              repitiendo la batalla en tus propias fuerzas. Abre tu corazón a la adoración: canta, alaba,
              contempla al Dios que habita entre las alabanzas de su pueblo. Cuando Él se manifiesta, la
              paz reemplaza la ansiedad y la fe desplaza al miedo.
            </div>
          </VAlert>
        </CoursesSection>

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  name: "UkeleleTheologicalDay2",
  data() {
    return {
      showContent: true,
    };
  },
};
</script>

<style scoped>
.italic {
  font-style: italic;
}
.w-100 {
  width: 100%;
}
</style>
