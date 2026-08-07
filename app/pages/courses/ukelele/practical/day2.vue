<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 2" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION: Juego de Correspondencia Notas Sostenidas / Bemoles -->
        <CoursesSection title="Ponte a Prueba: Relaciona las Notas Sostenidas y Bemoles" icon="mdi-swap-horizontal">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Selecciona una nota en la columna <strong>latina</strong> y su equivalente en la columna
            <strong>inglesa</strong>.
            Si el par es correcto se marca en verde y sube a la zona de resueltos. ¡Completa los 7 pares!
          </p>

          <!-- Resolved pairs stacking area -->
          <VExpandTransition>
            <div v-if="matchedPairs.length > 0" class="mb-4">
              <div class="text-caption font-weight-bold text-grey-darken-2 mb-2">
                <VIcon size="small" color="success">mdi-check-circle</VIcon>
                Pares resueltos ({{ matchedPairs.length }} / {{ notePairs.length }}):
              </div>
              <div class="d-flex flex-wrap" style="gap: 8px;">
                <VChip v-for="pair in matchedPairs" :key="pair.latin" color="light-green-lighten-4"
                  class="font-weight-bold match-resolved-chip" style="border: 2px solid #43a047;" variant="elevated">
                  <VIcon start size="small" color="light-green-darken-3">mdi-check-circle</VIcon>
                  <span class="text-light-green-darken-4">{{ pair.latin }}</span>
                  <span class="mx-1 text-grey">=</span>
                  <span class="text-light-green-darken-4">{{ pair.english }}</span>
                </VChip>
              </div>
              <VDivider class="mt-3 mb-1" />
            </div>
          </VExpandTransition>

          <!-- Game Complete screen -->
          <div v-if="matchGameComplete" class="text-center py-8">
            <VIcon size="64" color="light-green-darken-2">mdi-trophy-outline</VIcon>
            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mt-3">¡Todas las notas relacionadas!</h3>
            <p class="text-body-1 text-grey-darken-2 mt-2">
              Dominas perfectamente la equivalencia entre notación con sostenidos y bemoles. ¡Excelente!
            </p>
            <VBtn id="btn-uked2-match-retry" color="primary" class="mt-4" @click="resetMatchGame">
              <VIcon start>mdi-refresh</VIcon>
              Jugar de nuevo
            </VBtn>
          </div>

          <!-- Active game -->
          <div v-else>
            <VRow no-gutters class="align-stretch">

              <!-- LEFT: Latin column -->
              <VCol cols="5">
                <div class="text-subtitle-2 font-weight-bold text-center text-primary mb-3"
                  style="letter-spacing: 0.5px;">
                  🇪🇸 Sostenidos (#)
                </div>
                <transition-group name="match-list" tag="div">
                  <div v-for="note in unmatchedLatin" :key="note.latin" class="mb-2">
                    <VBtn id="btn-uked2-latin-note" block variant="flat" :color="getLatinBtnColor(note.latin)"
                      class="match-note-btn"
                      :class="{
                        'match-selected-left': selectedLatinName === note.latin && wrongLatinName === null,
                        'match-wrong-shake': wrongLatinName === note.latin
                      }" @click="selectLatin(note.latin)">
                      <span class="text-h6 font-weight-black">{{ note.latin }}</span>
                    </VBtn>
                  </div>
                </transition-group>
              </VCol>

              <!-- CENTER: connector icon -->
              <VCol cols="2" class="d-flex flex-column align-center justify-center">
                <div v-for="i in unmatchedLatin.length" :key="i" class="mb-2 d-flex align-center justify-center"
                  style="height: 44px;">
                  <VIcon size="small" color="grey-lighten-1">mdi-arrow-left-right</VIcon>
                </div>
              </VCol>

              <!-- RIGHT: English column -->
              <VCol cols="5">
                <div class="text-subtitle-2 font-weight-bold text-center text-orange-darken-2 mb-3"
                  style="letter-spacing: 0.5px;">
                  🇬🇧 Bemoles (b)
                </div>
                <transition-group name="match-list" tag="div">
                  <div v-for="note in unmatchedEnglish" :key="note.english" class="mb-2">
                    <VBtn id="btn-uked2-english-note" block variant="flat" :color="getEnglishBtnColor(note.english)"
                      class="match-note-btn" :class="{
                        'match-selected-right': selectedEnglishName === note.english && wrongEnglishName === null,
                        'match-wrong-shake': wrongEnglishName === note.english
                      }" @click="selectEnglish(note.english)">
                      <span class="text-h6 font-weight-black">{{ note.english }}</span>
                    </VBtn>
                  </div>
                </transition-group>
              </VCol>
            </VRow>

            <!-- Hint bar -->
            <div class="text-center text-caption text-grey-darken-1 mt-4">
              <VIcon size="x-small" color="grey">mdi-information-outline</VIcon>
              Haz clic en una nota sostenida (#) y luego en su equivalente bemol (b) para emparejarlas.
            </div>
          </div>
        </CoursesSection>

        <!-- SECCION: Escala Cromática -->
        <CoursesSection title="Escala Cromática (Chromatic Scale)" icon="mdi-music-clef-treble">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La escala cromática contiene <strong>12 semitonos</strong> consecutivos. Cada paso avanza exactamente <strong>1 semitono (1 traste)</strong>.
            Cada semitono representa la distancia más pequeña posible entre dos notas en la música occidental.
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono text-primary">
              Semitono — Semitono — Semitono — Semitono — Semitono — ... (12 pasos totales)
            </span>
          </div>

          <p class="text-body-2 text-grey-darken-3 mb-4">
            En el ukelele, <strong>1 Semitono</strong> equivale a avanzar <strong>1 traste</strong>.
            Explora la escala a continuación. Haz clic en las notas para escuchar su sonido y ver en qué traste y
            cuerda se colocan tus dedos. <strong>Fórmula: 1 Semitono = 1 Traste</strong>.
          </p>

          <VRow density="comfortable" class="align-center">
            <!-- Column 1: Scale selector and explanations -->
            <VCol cols="12" md="7" class="pr-md-4">
              <!-- Scale Step Visualizer (Horizontal Buttons) -->
              <div class="d-flex align-center justify-center flex-wrap mb-6 py-2 px-1 rounded bg-grey-lighten-4" style="gap: 8px;">
                <template v-for="(note, index) in chromaticScaleNotes" :key="`note-${index}`">
                  <VBtn id="btn-uked2-chromatic-note" icon rounded="circle" size="small" :color="selectedChromaticNoteIndex === index ? 'primary' : 'grey-lighten-2'"
                    class="elevation-2 font-weight-black text-subtitle-1"
                    :class="selectedChromaticNoteIndex === index ? 'text-white scale-up-pulse' : 'text-grey-darken-3'"
                    style="width: 44px; height: 44px; position: relative; flex-shrink: 0;" @click="selectChromaticNote(index)">
                    {{ note.name }}
                    <span v-if="index < chromaticScaleNotes.length - 1" class="text-caption font-weight-black"
                      style="position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); white-space: nowrap; color: #888; font-size: 0.65rem !important;">s</span>
                  </VBtn>
                </template>
              </div>

              <!-- Active Note details card -->
              <VCard variant="outlined" class="pa-4 bg-grey-lighten-5 mb-4"
                style="border-color: rgba(25, 118, 210, 0.25) !important;">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-h5 font-weight-black text-capitalize text-primary">
                    {{ selectedChromaticNote.name }} <span class="text-subtitle-2 text-grey">({{ selectedChromaticNote.english
                    }})</span>
                  </span>
                  <VChip size="small" color="primary" variant="outlined">
                    Nota {{ selectedChromaticNoteIndex + 1 }}/12
                  </VChip>
                </div>

                <VDivider class="mb-3" />

                <VRow density="comfortable">
                  <VCol cols="4">
                    <div class="text-caption text-grey">Frecuencia</div>
                    <div class="text-body-1 font-weight-bold text-grey-darken-4">{{ selectedChromaticNote.frequency }}
                      Hz</div>
                  </VCol>
                  <VCol cols="8">
                    <div class="text-caption text-grey">Posición de semitono</div>
                    <div class="text-body-1 font-weight-bold font-mono text-amber-darken-3">
                      {{ selectedChromaticNoteIndex }} semitono(s) desde Do
                    </div>
                  </VCol>
                  <VCol cols="12" class="mt-2">
                    <div class="text-caption text-grey">Instrucciones de digitación</div>
                    <div class="text-caption  mt-1 text-grey-darken-4">
                      <VIcon size="small" color="primary" class="mr-1">mdi-hand-pointing-right</VIcon>
                      {{ selectedChromaticNote.instructions }}
                    </div>
                  </VCol>
                </VRow>

                <VDivider class="my-3" />

                <div class="text-caption font-weight-bold text-grey-darken-2 mb-2 text-center">
                  Posición de las manos
                </div>
                <VRow density="comfortable" class="align-center text-center">
                  <!-- Left hand: fretting hand -->
                  <VCol cols="6">
                    <svg viewBox="0 0 846.1 869.7" width="150" height="120" preserveAspectRatio="none"
                      class="mx-auto d-block">
                      <g transform="scale(-1,1) translate(-846.1,0)">
                        <path
                          d="M 600.8 394.7 C 584.0999999999999 398.5 568.5 429.2 542.6999999999999 456.7 L 542.6999999999999 398.59999999999997 L 542.6999999999999 369.79999999999995 L 542.6999999999999 211.5 C 542.6999999999999 198.1 531.8 187.2 518.4 187.2 L 515.6999999999999 187.2 C 502.29999999999995 187.2 491.3999999999999 198.1 491.3999999999999 211.5 L 491.0952819824218 370.71412353515626 L 480.99999999999994 369.8 L 480.99999999999994 160.5 C 480.99999999999994 147.1 470.09999999999997 136.2 456.69999999999993 136.2 L 453.99999999999994 136.2 C 440.59999999999997 136.2 429.69999999999993 147.1 429.69999999999993 160.5 L 429.69999999999993 375.5893981933594 L 421.90471801757803 376.5392272949219 L 421.5999999999999 192.1 C 421.5999999999999 178.7 410.69999999999993 167.79999999999998 397.19999999999993 167.79999999999998 L 394.49999999999994 167.79999999999998 C 381.09999999999997 167.79999999999998 370.19999999999993 178.7 370.19999999999993 192.1 L 370.50468749999993 389.9105041503906 L 364.20940551757803 390.82462768554683 L 363.5999999999999 239.79999999999995 C 363.5999999999999 226.39999999999995 352.69999999999993 215.49999999999994 339.2999999999999 215.49999999999994 L 336.5999999999999 215.49999999999994 C 323.19999999999993 215.49999999999994 312.2999999999999 226.39999999999995 312.2999999999999 239.79999999999995 L 312.2999999999999 369.79999999999995 L 312 369.79999999999995 L 312 542.5 C 312 542.5 312 645.4 427.4 645.4 C 499.4 645.4 529.8 611.8 539.3 588.9 C 539.4 588.8 610.9 463.9 625.8 435.2 C 640.7 406.3 622.4 389.7 600.8 394.7 Z"
                          fill="#f0d9b8" stroke="#5a4632" stroke-width="8" stroke-linejoin="round"
                          transform="matrix(1.2674051523208618, 0, 0, 1.2674051523208618, -153.31993103027344, -57.254132499850925)" />
                        <!-- finger highlight markers: pulgar, índice, medio, anular, meñique -->
                        <circle cx="607" cy="377" r="38"
                          :fill="selectedChromaticNote.leftFinger === 0 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="503" cy="135" r="38"
                          :fill="selectedChromaticNote.leftFinger === 1 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="424" cy="70" r="38"
                          :fill="selectedChromaticNote.leftFinger === 2 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="350" cy="109" r="38"
                          :fill="selectedChromaticNote.leftFinger === 3 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="276" cy="170" r="38"
                          :fill="selectedChromaticNote.leftFinger === 4 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                      </g>
                      <!-- finger numbers -->
                      <text x="343.1" y="161" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.leftFinger === 1 ? '#ffffff' : 'red'">1</text>
                      <text x="422.1" y="96" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.leftFinger === 2 ? '#ffffff' : 'red'">2</text>
                      <text x="496.1" y="135" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.leftFinger === 3 ? '#ffffff' : 'red'">3</text>
                      <text x="570.1" y="196" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.leftFinger === 4 ? '#ffffff' : 'red'">4</text>
                    </svg>
                    <div class="text-caption font-weight-bold text-grey-darken-3 mt-1">
                      Mano Izquierda (diapasón)
                    </div>
                    <div class="text-caption text-primary font-weight-bold">
                      {{ leftChromaticHandLabel }}
                    </div>
                  </VCol>

                  <!-- Right hand: plucking hand -->
                  <VCol cols="6">
                    <svg viewBox="0 0 846.1 869.7" width="150" height="120" preserveAspectRatio="none"
                      class="mx-auto d-block">
                      <g transform="scale(-1,1) translate(-846.1,0)">
                        <path
                          d="M 600.8 394.7 C 584.0999999999999 398.5 568.5 429.2 542.6999999999999 456.7 L 542.6999999999999 398.59999999999997 L 542.6999999999999 369.79999999999995 L 542.6999999999999 211.5 C 542.6999999999999 198.1 531.8 187.2 518.4 187.2 L 515.6999999999999 187.2 C 502.29999999999995 187.2 491.3999999999999 198.1 491.3999999999999 211.5 L 491.0952819824218 370.71412353515626 L 480.99999999999994 369.8 L 480.99999999999994 160.5 C 480.99999999999994 147.1 470.09999999999997 136.2 456.69999999999993 136.2 L 453.99999999999994 136.2 C 440.59999999999997 136.2 429.69999999999993 147.1 429.69999999999993 160.5 L 429.69999999999993 375.5893981933594 L 421.90471801757803 376.5392272949219 L 421.5999999999999 192.1 C 421.5999999999999 178.7 410.69999999999993 167.79999999999998 397.19999999999993 167.79999999999998 L 394.49999999999994 167.79999999999998 C 381.09999999999997 167.79999999999998 370.19999999999993 178.7 370.19999999999993 192.1 L 370.50468749999993 389.9105041503906 L 364.20940551757803 390.82462768554683 L 363.5999999999999 239.79999999999995 C 363.5999999999999 226.39999999999995 352.69999999999993 215.49999999999994 339.2999999999999 215.49999999999994 L 336.5999999999999 215.49999999999994 C 323.19999999999993 215.49999999999994 312.2999999999999 226.39999999999995 312.2999999999999 239.79999999999995 L 312.2999999999999 369.79999999999995 L 312 369.79999999999995 L 312 542.5 C 312 542.5 312 645.4 427.4 645.4 C 499.4 645.4 529.8 611.8 539.3 588.9 C 539.4 588.8 610.9 463.9 625.8 435.2 C 640.7 406.3 622.4 389.7 600.8 394.7 Z"
                          fill="#f0d9b8" stroke="#5a4632" stroke-width="8" stroke-linejoin="round"
                          transform="matrix(1.2674051523208618, 0, 0, 1.2674051523208618, -153.31993103027344, -57.254132499850925)" />
                        <!-- finger highlight markers: pulgar, índice, medio, anular, meñique -->
                        <circle cx="607" cy="377" r="38"
                          :fill="selectedChromaticNote.rightFinger === 0 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="503" cy="135" r="38"
                          :fill="selectedChromaticNote.rightFinger === 1 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="424" cy="70" r="38"
                          :fill="selectedChromaticNote.rightFinger === 2 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="350" cy="109" r="38"
                          :fill="selectedChromaticNote.rightFinger === 3 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="276" cy="170" r="38"
                          :fill="selectedChromaticNote.rightFinger === 4 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                      </g>
                      <!-- finger letters: P (pulgar), I (índice), M (medio), A (anular) -->
                      <text x="239.1" y="403" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.rightFinger === 0 ? '#ffffff' : 'red'">P</text>
                      <text x="343.1" y="161" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.rightFinger === 1 ? '#ffffff' : 'red'">I</text>
                      <text x="422.1" y="96" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.rightFinger === 2 ? '#ffffff' : 'red'">M</text>
                      <text x="496.1" y="135" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedChromaticNote.rightFinger === 3 ? '#ffffff' : 'red'">A</text>
                    </svg>
                    <div class="text-caption font-weight-bold text-grey-darken-3 mt-1">
                      Mano Derecha (cuerdas)
                    </div>
                    <div class="text-caption text-orange-darken-3 font-weight-bold">
                      {{ rightChromaticHandLabel }}
                    </div>
                  </VCol>
                </VRow>
              </VCard>

              <div class="d-flex flex-wrap gap-2">
                <VBtn id="btn-uked2-chromatic-play" :color="isPlayingChromaticScale ? 'red-darken-2' : 'primary'" class="mr-2 mb-2 text-white"
                  @click="playChromaticScaleSequence">
                  <VIcon start>{{ isPlayingChromaticScale ? 'mdi-stop' : 'mdi-play-circle' }}</VIcon>
                  {{ isPlayingChromaticScale ? 'Detener escala' : 'Reproducir Escala' }}
                </VBtn>

                <VBtn id="btn-uked2-chromatic-sound" variant="outlined" color="grey-darken-2" class="mb-2" @click="playTone(selectedChromaticNote.frequency, 1.2)">
                  <VIcon start>mdi-music-note</VIcon>
                  Sonar Nota Actual
                </VBtn>
              </div>
            </VCol>

            <!-- Column 2: Fretboard diagram -->
            <VCol cols="12" md="5" class="d-flex justify-center">
              <VCard variant="outlined" class="pa-4 w-100" max-width="340">
                <div class="text-subtitle-2 font-weight-bold text-center text-grey-darken-2 mb-3">
                  Diagrama del Diapasón
                </div>

                <div class="fretboard-container mx-auto" style="max-width: 280px; padding: 0 32px;">
                  <!-- Labels of strings at top -->
                  <div
                    class="d-flex justify-space-between mb-2 text-caption font-weight-black text-grey-darken-3"
                    style="width: 100%;">
                    <div v-for="(str, idx) in ['4ª G', '3ª C', '2ª E', '1ª A']" :key="idx" class="text-center"
                      style="flex: 1;">
                      {{ str }}
                    </div>
                  </div>

                  <!-- Fretboard block -->
                  <div class="fretboard rounded-lg overflow-visible" style="
                      background: linear-gradient(180deg, #c8a97a 0%, #a07040 40%, #8b5e2a 100%);
                      border: 3px solid #5c3a10;
                      border-radius: 6px;
                      position: relative;
                      box-shadow: inset 0 0 18px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.2);
                    ">

                    <!-- ── Vertical string lines running full height ── -->
                    <div class="fretboard-strings"
                      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; pointer-events: none; z-index: 1;">
                      <div v-for="s in [4, 3, 2, 1]" :key="s" :style="{
                        width: getStringThickness(s) + 'px',
                        background: s === 3
                          ? 'linear-gradient(180deg, #d4d4d4 0%, #ffffff 30%, #c0c0c0 60%, #ffffff 100%)'
                          : s === 4
                            ? 'linear-gradient(180deg, #cccc88 0%, #ffffaa 30%, #b8b870 60%, #ffffcc 100%)'
                            : 'linear-gradient(180deg, #e0e0e0 0%, #ffffff 30%, #cccccc 60%, #ffffff 100%)',
                        boxShadow: '0 0 3px rgba(255,255,255,0.6), 0 0 6px rgba(0,0,0,0.4)',
                        borderRadius: '2px',
                      }"></div>
                    </div>

                    <!-- Open string row (above nut) -->
                    <div class="d-flex justify-space-around pb-2 pt-2" style="position: relative; z-index: 4;">
                      <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                        style="flex: 1; height: 28px;">
                        <VAvatar v-if="selectedChromaticNote.string === s && selectedChromaticNote.fret === 0" color="primary" size="26"
                          class="elevation-4 scale-up-pulse font-weight-black text-white"
                          style="font-size: 0.7rem; border: 2px solid white;">
                          {{ selectedChromaticNote.name }}
                        </VAvatar>
                        <div v-else class="rounded-circle"
                          style="width: 6px; height: 6px; background: rgba(255,255,255,0.3);">
                        </div>
                      </div>
                    </div>

                    <!-- ── Nut (cejilla) ── -->
                    <div style="
                      height: 8px;
                      background: linear-gradient(180deg, #f5f0e8 0%, #ffffff 50%, #d8d0c0 100%);
                      border-top: 2px solid #aaa;
                      border-bottom: 2px solid #888;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                      position: relative; z-index: 3;
                    "></div>

                    <!-- ── Frets 1 to 4 ── -->
                    <div v-for="f in [1, 2, 3, 4]" :key="f" style="position: relative;"
                      :style="{ borderBottom: f < 4 ? '3px solid #9a8060' : 'none', height: '56px' }">
                      <!-- Fret label on the left -->
                      <span class="text-caption font-weight-bold"
                        style="position: absolute; left: -28px; top: 50%; transform: translateY(-50%); color: #666; font-size: 0.62rem;">Tr.{{
                          f }}</span>

                      <!-- Position dot on fret 3 -->
                      <div v-if="f === 3" class="rounded-circle"
                        style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.2); z-index: 2;">
                      </div>

                      <!-- Note avatars per string, centered in each cell -->
                      <div class="d-flex justify-space-around fill-height align-center"
                        style="position: relative; z-index: 4;">
                        <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                          style="flex: 1; height: 100%;">
                          <VAvatar v-if="selectedChromaticNote.string === s && selectedChromaticNote.fret === f" color="amber-accent-4"
                            size="28" class="elevation-6 scale-up-pulse font-weight-black text-black"
                            style="z-index: 5; font-size: 0.68rem; border: 2px solid #fff;">
                            {{ selectedChromaticNote.name }}
                          </VAvatar>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom border cosmetic -->
                    <div
                      style="height: 6px; background: linear-gradient(180deg, #5c3a10 0%, #3a2008 100%); border-radius: 0 0 4px 4px;">
                    </div>
                  </div>

                  <div class="text-center text-caption text-grey-darken-2 mt-3">
                    <span class="text-primary font-weight-bold">●</span> cuerda al aire &nbsp;|&nbsp;
                    <span class="text-amber-darken-3 font-weight-bold">●</span> presionar traste
                  </div>
                </div>
              </VCard>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION: Reproductor de Escalas del Mundo -->
        <CoursesSection title="Reproductor de Escalas del Mundo: Egipcia, Árabe y China" icon="mdi-earth">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            No todas las escalas del mundo siguen la fórmula occidental Tono-Tono-Semitono... Muchas
            culturas usan otras combinaciones de intervalos que le dan a la música un color distinto e
            inconfundible. Explora a continuación tres escalas tradicionales: la <strong>egipcia</strong>,
            la <strong>árabe</strong> y la <strong>china</strong>. Cada nota está coloreada según la
            escala seleccionada.
          </p>

          <!-- Scale selector buttons -->
          <div class="d-flex flex-wrap justify-center mb-6" style="gap: 10px;">
            <VBtn id="btn-uked2-world-scale" v-for="(scale, index) in worldScales" :key="scale.key"
              :color="selectedWorldScaleIndex === index ? scale.color : 'grey-lighten-3'"
              :variant="selectedWorldScaleIndex === index ? 'flat' : 'outlined'"
              class="font-weight-bold" rounded size="large" @click="selectWorldScale(index)">
              <VIcon start>{{ scale.icon }}</VIcon>
              {{ scale.name }}
            </VBtn>
          </div>

          <!-- Description card for the selected scale -->
          <VCard variant="outlined" class="pa-4 mb-5" :style="`border-color: ${currentWorldScale.colorHex}55 !important; background-color: ${currentWorldScale.colorHex}0d;`">
            <div class="d-flex align-center mb-2">
              <VIcon :color="currentWorldScale.color" class="mr-2">{{ currentWorldScale.icon }}</VIcon>
              <span class="text-subtitle-1 font-weight-bold" :class="`text-${currentWorldScale.color}-darken-2`">
                Escala {{ currentWorldScale.name }}
              </span>
            </div>
            <p class="text-body-2 text-grey-darken-3 mb-0">
              {{ currentWorldScale.description }}
            </p>
          </VCard>

          <VRow density="comfortable" class="align-center">
            <!-- Column 1: Colored note selector and details -->
            <VCol cols="12" md="7" class="pr-md-4">
              <!-- Scale Step Visualizer (Colored Buttons) -->
              <div class="d-flex align-center justify-center flex-wrap mb-6 py-3 px-2 rounded bg-grey-lighten-4" style="gap: 10px;">
                <template v-for="(note, index) in currentWorldScale.notes" :key="`world-note-${index}`">
                  <VBtn id="btn-uked2-world-note" icon rounded="circle" size="small" :color="selectedWorldNoteIndex === index ? currentWorldScale.color : `${currentWorldScale.color}-lighten-4`"
                    class="elevation-2 font-weight-black text-subtitle-1"
                    :class="selectedWorldNoteIndex === index ? 'scale-up-pulse' : ''"
                    :style="selectedWorldNoteIndex !== index ? `color: ${currentWorldScale.colorHex} !important;` : ''"
                    style="width: 44px; height: 44px; flex-shrink: 0;" @click="selectWorldNote(index)">
                    {{ note.name }}
                  </VBtn>
                </template>
              </div>

              <!-- Active Note details card -->
              <VCard variant="outlined" class="pa-4 bg-grey-lighten-5 mb-4"
                :style="`border-color: ${currentWorldScale.colorHex}55 !important;`">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-h5 font-weight-black text-capitalize" :class="`text-${currentWorldScale.color}-darken-2`">
                    {{ currentWorldNote.name }} <span class="text-subtitle-2 text-grey">({{ currentWorldNote.english }})</span>
                  </span>
                  <VChip size="small" :color="currentWorldScale.color" variant="outlined">
                    {{ currentWorldNote.degree }}
                  </VChip>
                </div>

                <VDivider class="mb-3" />

                <VRow density="comfortable">
                  <VCol cols="5">
                    <div class="text-caption text-grey">Frecuencia</div>
                    <div class="text-body-1 font-weight-bold text-grey-darken-4">{{ currentWorldNote.frequency }} Hz</div>
                  </VCol>
                  <VCol cols="7">
                    <div class="text-caption text-grey">Cuerda / Traste</div>
                    <div class="text-body-1 font-weight-bold font-mono" :class="`text-${currentWorldScale.color}-darken-3`">
                      {{ currentWorldNote.fret === 0 ? `Cuerda ${currentWorldNote.string} al aire` : `Cuerda ${currentWorldNote.string}, Traste ${currentWorldNote.fret}` }}
                    </div>
                  </VCol>
                  <VCol cols="12" class="mt-2">
                    <div class="text-caption text-grey">Instrucciones de digitación</div>
                    <div class="text-caption mt-1 text-grey-darken-4">
                      <VIcon size="small" :color="currentWorldScale.color" class="mr-1">mdi-hand-pointing-right</VIcon>
                      {{ currentWorldNote.instructions }}
                    </div>
                  </VCol>
                </VRow>
              </VCard>

              <div class="d-flex flex-wrap gap-2">
                <VBtn id="btn-uked2-world-play" :color="isPlayingWorldScale ? 'red-darken-2' : currentWorldScale.color" class="mr-2 mb-2 text-white"
                  @click="playWorldScaleSequence">
                  <VIcon start>{{ isPlayingWorldScale ? 'mdi-stop' : 'mdi-play-circle' }}</VIcon>
                  {{ isPlayingWorldScale ? 'Detener escala' : `Reproducir Escala ${currentWorldScale.name}` }}
                </VBtn>

                <VBtn id="btn-uked2-world-sound" variant="outlined" color="grey-darken-2" class="mb-2" @click="playTone(currentWorldNote.frequency, 1.2)">
                  <VIcon start>mdi-music-note</VIcon>
                  Sonar Nota Actual
                </VBtn>
              </div>
            </VCol>

            <!-- Column 2: Fretboard diagram colored by scale -->
            <VCol cols="12" md="5" class="d-flex justify-center">
              <VCard variant="outlined" class="pa-4 w-100" max-width="340">
                <div class="text-subtitle-2 font-weight-bold text-center text-grey-darken-2 mb-3">
                  Diagrama del Diapasón — Escala {{ currentWorldScale.name }}
                </div>

                <div class="fretboard-container mx-auto" style="max-width: 280px; padding: 0 32px;">
                  <!-- Labels of strings at top -->
                  <div
                    class="d-flex justify-space-between mb-2 text-caption font-weight-black text-grey-darken-3"
                    style="width: 100%;">
                    <div v-for="(str, idx) in ['4ª G', '3ª C', '2ª E', '1ª A']" :key="idx" class="text-center"
                      style="flex: 1;">
                      {{ str }}
                    </div>
                  </div>

                  <!-- Fretboard block -->
                  <div class="fretboard rounded-lg overflow-visible" style="
                      background: linear-gradient(180deg, #c8a97a 0%, #a07040 40%, #8b5e2a 100%);
                      border: 3px solid #5c3a10;
                      border-radius: 6px;
                      position: relative;
                      box-shadow: inset 0 0 18px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.2);
                    ">

                    <!-- Vertical string lines running full height -->
                    <div class="fretboard-strings"
                      style="position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-around; pointer-events: none; z-index: 1;">
                      <div v-for="s in [4, 3, 2, 1]" :key="s" :style="{
                        width: getStringThickness(s) + 'px',
                        background: s === 3
                          ? 'linear-gradient(180deg, #d4d4d4 0%, #ffffff 30%, #c0c0c0 60%, #ffffff 100%)'
                          : s === 4
                            ? 'linear-gradient(180deg, #cccc88 0%, #ffffaa 30%, #b8b870 60%, #ffffcc 100%)'
                            : 'linear-gradient(180deg, #e0e0e0 0%, #ffffff 30%, #cccccc 60%, #ffffff 100%)',
                        boxShadow: '0 0 3px rgba(255,255,255,0.6), 0 0 6px rgba(0,0,0,0.4)',
                        borderRadius: '2px',
                      }"></div>
                    </div>

                    <!-- Open string row (above nut) -->
                    <div class="d-flex justify-space-around pb-2 pt-2" style="position: relative; z-index: 4;">
                      <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                        style="flex: 1; height: 28px;">
                        <VAvatar v-if="currentWorldNote.string === s && currentWorldNote.fret === 0" :color="currentWorldScale.color" size="26"
                          class="elevation-4 scale-up-pulse font-weight-black text-white"
                          style="font-size: 0.7rem; border: 2px solid white;">
                          {{ currentWorldNote.name }}
                        </VAvatar>
                        <div v-else-if="isNoteInWorldScale(s, 0)" class="rounded-circle"
                          :style="`width: 10px; height: 10px; background: ${currentWorldScale.colorHex}99; border: 1px solid white;`">
                        </div>
                        <div v-else class="rounded-circle"
                          style="width: 6px; height: 6px; background: rgba(255,255,255,0.3);">
                        </div>
                      </div>
                    </div>

                    <!-- Nut (cejilla) -->
                    <div style="
                      height: 8px;
                      background: linear-gradient(180deg, #f5f0e8 0%, #ffffff 50%, #d8d0c0 100%);
                      border-top: 2px solid #aaa;
                      border-bottom: 2px solid #888;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.5);
                      position: relative; z-index: 3;
                    "></div>

                    <!-- Frets 1 to 4 -->
                    <div v-for="f in [1, 2, 3, 4]" :key="f" style="position: relative;"
                      :style="{ borderBottom: f < 4 ? '3px solid #9a8060' : 'none', height: '56px' }">
                      <!-- Fret label on the left -->
                      <span class="text-caption font-weight-bold"
                        style="position: absolute; left: -28px; top: 50%; transform: translateY(-50%); color: #666; font-size: 0.62rem;">Tr.{{ f }}</span>

                      <!-- Note avatars per string, centered in each cell -->
                      <div class="d-flex justify-space-around fill-height align-center"
                        style="position: relative; z-index: 4;">
                        <div v-for="s in [4, 3, 2, 1]" :key="s" class="d-flex justify-center align-center"
                          style="flex: 1; height: 100%;">
                          <VAvatar v-if="currentWorldNote.string === s && currentWorldNote.fret === f" :color="currentWorldScale.color"
                            size="28" class="elevation-6 scale-up-pulse font-weight-black text-white"
                            style="z-index: 5; font-size: 0.68rem; border: 2px solid #fff;">
                            {{ currentWorldNote.name }}
                          </VAvatar>
                          <div v-else-if="isNoteInWorldScale(s, f)" class="rounded-circle"
                            :style="`width: 12px; height: 12px; background: ${currentWorldScale.colorHex}77; border: 1px solid white; z-index: 4;`">
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Bottom border cosmetic -->
                    <div
                      style="height: 6px; background: linear-gradient(180deg, #5c3a10 0%, #3a2008 100%); border-radius: 0 0 4px 4px;">
                    </div>
                  </div>

                  <div class="text-center text-caption text-grey-darken-2 mt-3">
                    <span :style="`color: ${currentWorldScale.colorHex};`" class="font-weight-bold">●</span>
                    nota activa &nbsp;|&nbsp;
                    <span :style="`color: ${currentWorldScale.colorHex}77;`" class="font-weight-bold">●</span>
                    otras notas de la escala
                  </div>
                </div>
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
  data() {
    return {
      showContent: true,
      audioCtx: null,
      waveType: "triangle",
      volume: 0.35,

      // Match Game State
      notePairs: [
        { latin: 'Do#', english: 'Reb' },
        { latin: 'Re#', english: 'Mib' },
        { latin: 'Fa#', english: 'Solb' },
        { latin: 'Sol#', english: 'Lab' },
        { latin: 'La#', english: 'Sib' },
      ],
      shuffledEnglish: [],
      matchedPairs: [],
      selectedLatinName: null,
      selectedEnglishName: null,
      wrongLatinName: null,
      wrongEnglishName: null,
      wrongTimeout: null,
      matchGameComplete: false,

      // Chromatic Scale State
      selectedChromaticNoteIndex: 0,
      isPlayingChromaticScale: false,
      fingerNames: ['Pulgar', 'Índice', 'Medio', 'Anular', 'Meñique'],

      // World Scales State
      selectedWorldScaleIndex: 0,
      selectedWorldNoteIndex: 0,
      isPlayingWorldScale: false,

      worldScales: [
        {
          key: 'egyptian',
          name: 'Egipcia',
          icon: 'mdi-pyramid',
          color: 'green',
          colorHex: '#2e7d32',
          description: 'La escala egipcia (suspendida) omite la 3ª y la 7ª, dejando un sonido abierto, flotante y "suspendido" muy usado en música ceremonial del antiguo Egipto. Fórmula: 1ª - 2ª - 4ª - 5ª - b7ª.',
          notes: [
            { name: 'Do', english: 'C4', degree: '1ª', frequency: 261.63, string: 3, fret: 0, instructions: 'Toca la cuerda 3 al aire (sin presionar ningún traste).' },
            { name: 'Re', english: 'D4', degree: '2ª', frequency: 293.66, string: 3, fret: 2, instructions: 'Presiona el traste 2 de la cuerda 3 (dedo índice o medio).' },
            { name: 'Fa', english: 'F4', degree: '4ª', frequency: 349.23, string: 2, fret: 1, instructions: 'Presiona el traste 1 de la cuerda 2 (dedo índice).' },
            { name: 'Sol', english: 'G4', degree: '5ª', frequency: 392.00, string: 2, fret: 3, instructions: 'Presiona el traste 3 de la cuerda 2 (dedo anular).' },
            { name: 'Lab', english: 'Bb4', degree: 'b7ª', frequency: 466.16, string: 1, fret: 1, instructions: 'Presiona el traste 1 de la cuerda 1 (dedo índice).' },
          ]
        },
        {
          key: 'arabic',
          name: 'Árabe',
          icon: 'mdi-mosque',
          color: 'deep-orange',
          colorHex: '#d84315',
          description: 'Conocida como escala doble armónica o "maqam", combina dos segundas aumentadas que le dan ese carácter exótico y dramático típico de la música del Medio Oriente. Fórmula: 1ª - b2ª - 3ª - 4ª - 5ª - b6ª - 7ª.',
          notes: [
            { name: 'Do', english: 'C4', degree: '1ª', frequency: 261.63, string: 3, fret: 0, instructions: 'Toca la cuerda 3 al aire (sin presionar ningún traste).' },
            { name: 'Reb', english: 'Db4', degree: 'b2ª', frequency: 277.18, string: 3, fret: 1, instructions: 'Presiona el traste 1 de la cuerda 3 (dedo índice).' },
            { name: 'Mi', english: 'E4', degree: '3ª', frequency: 329.63, string: 2, fret: 0, instructions: 'Toca la cuerda 2 al aire (cambio de cuerda).' },
            { name: 'Fa', english: 'F4', degree: '4ª', frequency: 349.23, string: 2, fret: 1, instructions: 'Presiona el traste 1 de la cuerda 2 (dedo índice).' },
            { name: 'Sol', english: 'G4', degree: '5ª', frequency: 392.00, string: 2, fret: 3, instructions: 'Presiona el traste 3 de la cuerda 2 (dedo anular).' },
            { name: 'Lab', english: 'Ab4', degree: 'b6ª', frequency: 415.30, string: 2, fret: 4, instructions: 'Presiona el traste 4 de la cuerda 2 (dedo meñique).' },
            { name: 'Si', english: 'B4', degree: '7ª', frequency: 493.88, string: 1, fret: 2, instructions: 'Presiona el traste 2 de la cuerda 1 (dedo medio).' },
          ]
        },
        {
          key: 'chinese',
          name: 'China',
          icon: 'mdi-lantern',
          color: 'red',
          colorHex: '#c62828',
          description: 'La escala pentatónica china (modo Gong) usa solo 5 notas sin semitonos, lo que evita disonancias y produce ese sonido sereno y armonioso típico de la música tradicional china. Fórmula: 1ª - 2ª - 3ª - 5ª - 6ª.',
          notes: [
            { name: 'Do', english: 'C4', degree: '1ª', frequency: 261.63, string: 3, fret: 0, instructions: 'Toca la cuerda 3 al aire (sin presionar ningún traste).' },
            { name: 'Re', english: 'D4', degree: '2ª', frequency: 293.66, string: 3, fret: 2, instructions: 'Presiona el traste 2 de la cuerda 3 (dedo índice o medio).' },
            { name: 'Mi', english: 'E4', degree: '3ª', frequency: 329.63, string: 2, fret: 0, instructions: 'Toca la cuerda 2 al aire (cambio de cuerda).' },
            { name: 'Sol', english: 'G4', degree: '5ª', frequency: 392.00, string: 2, fret: 3, instructions: 'Presiona el traste 3 de la cuerda 2 (dedo anular).' },
            { name: 'La', english: 'A4', degree: '6ª', frequency: 440.00, string: 1, fret: 0, instructions: 'Toca la cuerda 1 al aire (cambio de cuerda).' },
          ]
        },
      ],

      chromaticScaleNotes: [
        {
          name: "Do",
          english: "C4",
          frequency: 261.63,
          string: 3,
          fret: 0,
          intervalLabel: "S",
          instructions: "Toca la cuerda 3 al aire (sin presionar ningún traste).",
          leftFinger: null,
          rightFinger: 1
        },
        {
          name: "Do#",
          english: "C#4",
          frequency: 277.18,
          string: 3,
          fret: 1,
          intervalLabel: "S",
          instructions: "Presiona el traste 1 de la cuerda 3 (se suele usar el dedo índice).",
          leftFinger: 1,
          rightFinger: 1
        },
        {
          name: "Re",
          english: "D4",
          frequency: 293.66,
          string: 3,
          fret: 2,
          intervalLabel: "S",
          instructions: "Presiona el traste 2 de la cuerda 3 (se suele usar el dedo índice o medio).",
          leftFinger: 2,
          rightFinger: 1
        },
        {
          name: "Re#",
          english: "D#4",
          frequency: 311.13,
          string: 3,
          fret: 3,
          intervalLabel: "S",
          instructions: "Presiona el traste 3 de la cuerda 3 (se suele usar el dedo anular).",
          leftFinger: 3,
          rightFinger: 1
        },
        {
          name: "Mi",
          english: "E4",
          frequency: 329.63,
          string: 2,
          fret: 0,
          intervalLabel: "S",
          instructions: "Toca la cuerda 2 al aire (cambio de cuerda).",
          leftFinger: null,
          rightFinger: 2
        },
        {
          name: "Fa",
          english: "F4",
          frequency: 349.23,
          string: 2,
          fret: 1,
          intervalLabel: "S",
          instructions: "Presiona el traste 1 de la cuerda 2 (se suele usar el dedo índice).",
          leftFinger: 1,
          rightFinger: 2
        },
        {
          name: "Fa#",
          english: "F#4",
          frequency: 369.99,
          string: 2,
          fret: 2,
          intervalLabel: "S",
          instructions: "Presiona el traste 2 de la cuerda 2 (se suele usar el dedo medio).",
          leftFinger: 2,
          rightFinger: 2
        },
        {
          name: "Sol",
          english: "G4",
          frequency: 392.00,
          string: 2,
          fret: 3,
          intervalLabel: "S",
          instructions: "Presiona el traste 3 de la cuerda 2 (se suele usar el dedo anular).",
          leftFinger: 3,
          rightFinger: 2
        },
        {
          name: "Sol#",
          english: "G#4",
          frequency: 415.30,
          string: 2,
          fret: 4,
          intervalLabel: "S",
          instructions: "Presiona el traste 4 de la cuerda 2 (se suele usar el dedo meñique).",
          leftFinger: 4,
          rightFinger: 2
        },
        {
          name: "La",
          english: "A4",
          frequency: 440.00,
          string: 1,
          fret: 0,
          intervalLabel: "S",
          instructions: "Toca la cuerda 1 al aire (cambio de cuerda).",
          leftFinger: null,
          rightFinger: 3
        },
        {
          name: "La#",
          english: "A#4",
          frequency: 466.16,
          string: 1,
          fret: 1,
          intervalLabel: "S",
          instructions: "Presiona el traste 1 de la cuerda 1 (se suele usar el dedo índice).",
          leftFinger: 1,
          rightFinger: 3
        },
        {
          name: "Si",
          english: "B4",
          frequency: 493.88,
          string: 1,
          fret: 2,
          intervalLabel: "S",
          instructions: "Presiona el traste 2 de la cuerda 1 (se suele usar el dedo medio).",
          leftFinger: 2,
          rightFinger: 3
        },
        {
          name: "Do",
          english: "C5",
          frequency: 523.25,
          string: 1,
          fret: 3,
          intervalLabel: "",
          instructions: "Presiona el traste 3 de la cuerda 1 (se suele usar el dedo anular).",
          leftFinger: 3,
          rightFinger: 3
        }
      ]
    }
  },

  computed: {
    unmatchedLatin() {
      const matched = this.matchedPairs.map(p => p.latin);
      return this.notePairs.filter(p => !matched.includes(p.latin));
    },

    unmatchedEnglish() {
      const matched = this.matchedPairs.map(p => p.english);
      return this.shuffledEnglish.filter(p => !matched.includes(p.english));
    },

    selectedChromaticNote() {
      return this.chromaticScaleNotes[this.selectedChromaticNoteIndex];
    },

    leftChromaticHandLabel() {
      const f = this.selectedChromaticNote.leftFinger;
      if (f === null) return 'Cuerda al aire (sin presionar)';
      return `${this.fingerNames[f]} · Traste ${this.selectedChromaticNote.fret}`;
    },

    rightChromaticHandLabel() {
      const f = this.selectedChromaticNote.rightFinger;
      return `${this.fingerNames[f]} · Cuerda ${this.selectedChromaticNote.string}`;
    },

    currentWorldScale() {
      return this.worldScales[this.selectedWorldScaleIndex];
    },

    currentWorldNote() {
      return this.currentWorldScale.notes[this.selectedWorldNoteIndex];
    },
  },

  mounted() {
    this.initMatchGame();
  },

  beforeUnmount() {
    if (this.wrongTimeout) clearTimeout(this.wrongTimeout);
    this.isPlayingChromaticScale = false;
    this.isPlayingWorldScale = false;
  },

  methods: {
    // ───── Audio ─────
    playTone(frequency, duration = 1.2) {
      if (typeof window === 'undefined') return;
      try {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) return;

        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioCtxClass();
        }

        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = this.waveType;
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(this.volume, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("No se pudo generar sonido:", e);
      }
    },

    // ───── Match Game ─────
    initMatchGame() {
      const arr = this.notePairs.map(p => ({ english: p.english }));
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      }
      this.shuffledEnglish = arr;
    },

    selectLatin(name) {
      if (this.wrongLatinName) return;
      this.selectedLatinName = this.selectedLatinName === name ? null : name;
      this.tryMatch();
    },

    selectEnglish(english) {
      if (this.wrongLatinName) return;
      this.selectedEnglishName = this.selectedEnglishName === english ? null : english;
      this.tryMatch();
    },

    tryMatch() {
      if (!this.selectedLatinName || !this.selectedEnglishName) return;
      const pair = this.notePairs.find(p => p.latin === this.selectedLatinName);
      if (pair && pair.english === this.selectedEnglishName) {
        // Correct match
        this.matchedPairs.push({ latin: this.selectedLatinName, english: this.selectedEnglishName });
        this.selectedLatinName = null;
        this.selectedEnglishName = null;
        if (this.matchedPairs.length === this.notePairs.length) {
          this.matchGameComplete = true;
        }
      } else {
        // Wrong match — flash red then clear
        this.wrongLatinName = this.selectedLatinName;
        this.wrongEnglishName = this.selectedEnglishName;
        if (this.wrongTimeout) clearTimeout(this.wrongTimeout);
        this.wrongTimeout = setTimeout(() => {
          this.wrongLatinName = null;
          this.wrongEnglishName = null;
          this.selectedLatinName = null;
          this.selectedEnglishName = null;
        }, 900);
      }
    },

    getLatinBtnColor(name) {
      if (this.wrongLatinName === name) return 'red-lighten-4';
      if (this.selectedLatinName === name) return 'primary';
      return 'grey-lighten-3';
    },

    getEnglishBtnColor(english) {
      if (this.wrongEnglishName === english) return 'red-lighten-4';
      if (this.selectedEnglishName === english) return 'orange-darken-1';
      return 'grey-lighten-3';
    },

    resetMatchGame() {
      this.matchedPairs = [];
      this.selectedLatinName = null;
      this.selectedEnglishName = null;
      this.wrongLatinName = null;
      this.wrongEnglishName = null;
      this.matchGameComplete = false;
      this.initMatchGame();
    },

    // ───── Chromatic Scale ─────
    selectChromaticNote(index) {
      this.selectedChromaticNoteIndex = index;
      const note = this.chromaticScaleNotes[index];
      this.playTone(note.frequency, 1.2);
    },

    async playChromaticScaleSequence() {
      if (this.isPlayingChromaticScale) {
        this.isPlayingChromaticScale = false;
        return;
      }

      this.isPlayingChromaticScale = true;

      // Play ascending
      for (let i = 0; i < this.chromaticScaleNotes.length; i++) {
        if (!this.isPlayingChromaticScale) break;
        this.selectChromaticNote(i);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      // Play descending back to start
      for (let i = this.chromaticScaleNotes.length - 2; i >= 0; i--) {
        if (!this.isPlayingChromaticScale) break;
        this.selectChromaticNote(i);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      this.isPlayingChromaticScale = false;
    },

    getStringThickness(s) {
      if (s === 4) return 2.0;
      if (s === 3) return 3.2;
      if (s === 2) return 2.4;
      if (s === 1) return 1.5;
      return 2.0;
    },

    // ───── World Scales ─────
    selectWorldScale(index) {
      this.isPlayingWorldScale = false;
      this.selectedWorldScaleIndex = index;
      this.selectedWorldNoteIndex = 0;
    },

    selectWorldNote(index) {
      this.selectedWorldNoteIndex = index;
      const note = this.currentWorldScale.notes[index];
      this.playTone(note.frequency, 1.2);
    },

    isNoteInWorldScale(stringNumber, fretNumber) {
      return this.currentWorldScale.notes.some(n => n.string === stringNumber && n.fret === fretNumber);
    },

    async playWorldScaleSequence() {
      if (this.isPlayingWorldScale) {
        this.isPlayingWorldScale = false;
        return;
      }

      this.isPlayingWorldScale = true;
      const notes = this.currentWorldScale.notes;

      // Play ascending
      for (let i = 0; i < notes.length; i++) {
        if (!this.isPlayingWorldScale) break;
        this.selectWorldNote(i);
        await new Promise((resolve) => setTimeout(resolve, 650));
      }

      // Play descending back to start
      for (let i = notes.length - 2; i >= 0; i--) {
        if (!this.isPlayingWorldScale) break;
        this.selectWorldNote(i);
        await new Promise((resolve) => setTimeout(resolve, 650));
      }

      this.isPlayingWorldScale = false;
    }
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
}

/* ── Scale Animations ── */
.scale-up-pulse {
  animation: accentPulse 1.8s infinite alternate;
}

@keyframes accentPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.3);
  }

  100% {
    transform: scale(1.1);
    box-shadow: 0 0 8px 3px rgba(25, 118, 210, 0.5);
  }
}



.fretboard-strings>div {
  align-self: stretch;
}

/* ── Match Game ── */
.match-note-btn {
  text-transform: none !important;
  height: 44px !important;
  font-size: 1.1rem !important;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border-radius: 8px !important;
}

.match-note-btn:hover:not(.v-btn--disabled) {
  transform: scale(1.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.match-selected-left {
  border: 2px solid var(--v-primary-base, #1976d2) !important;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.2) !important;
}

.match-selected-right {
  border: 2px solid #e65100 !important;
  box-shadow: 0 0 0 3px rgba(230, 81, 0, 0.2) !important;
}

.match-wrong-shake {
  animation: matchShake 0.45s ease;
  border: 2px solid #e53935 !important;
}

@keyframes matchShake {
  0% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-7px);
  }

  40% {
    transform: translateX(7px);
  }

  60% {
    transform: translateX(-4px);
  }

  80% {
    transform: translateX(4px);
  }

  100% {
    transform: translateX(0);
  }
}

.match-resolved-chip {
  animation: resolvePopUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes resolvePopUp {
  0% {
    opacity: 0;
    transform: scale(0.6) translateY(12px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.match-list-enter-active {
  transition: all 0.3s ease;
}

.match-list-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.match-list-enter,
.match-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>