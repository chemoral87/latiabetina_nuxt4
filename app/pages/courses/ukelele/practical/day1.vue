<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 1" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">

        <!-- SECCION 1: Afinador de Referencia -->
        <CoursesSection title="Afinador de Referencia Interactivo" icon="mdi-tune">
          <p class="text-body-2 text-grey-darken-3 mb-4">
            Usa estos tonos de referencia generados en tiempo real para afinar tu ukelele de oído.
            Toca cada cuerda y ajusta el clavijero de tu instrumento hasta que suene idéntico al tono del afinador.
          </p>

          <VRow density="comfortable" class="mb-4 align-center">
            <VCol cols="12" md="8">
              <VRow density="comfortable">
                <VCol v-for="(string, index) in tuningStrings" :key="string.number" cols="6" sm="3">
                  <VCard variant="outlined" :color="activeStringIndex === index ? 'grey-lighten-4' : 'transparent'"
                    class="pa-3 text-center fill-height d-flex flex-column justify-space-between align-center border-transition"
                    :style="activeStringIndex === index ? 'border-color: var(--v-primary-base, #1976d2) !important;' : ''"
                    style="cursor: pointer" @click="playString(index)">
                    <div>
                      <VChip size="x-small" :color="string.color"  class="mb-2 font-weight-black" variant="elevated">
                        Cuerda {{ string.number }}
                      </VChip>
                      <div class="text-h4 font-weight-bold text-primary mb-1">
                        {{ string.note_en }}
                      </div>
                      <div class="text-subtitle-2 text-grey-darken-2">
                        {{ string.note_es }}
                      </div>
                      <div class="text-caption text-grey-darken-1">
                        {{ string.frequency }}
                      </div>
                    </div>

                    <div class="mt-3">
                      <VBtn id="btn-uked1-play-string" icon :color="activeStringIndex === index ? 'primary' : 'grey'" class="elevation-1">
                        <VIcon>{{ activeStringIndex === index ? 'mdi-volume-high' : 'mdi-play-circle-outline'
                        }}</VIcon>
                      </VBtn>
                    </div>

                    <!-- Wave visualizer for active string -->
                    <div class="d-flex justify-center align-end mt-2" style="height: 16px; width: 40px;">
                      <template v-if="activeStringIndex === index">
                        <div v-for="n in 5" :key="n" class="wave-active mx-0.5 primary rounded-sm"
                          :style="`height: 100%; width: 3px; animation-delay: ${n * 0.1}s; background-color: var(--v-primary-base, #1976d2);`">
                        </div>
                      </template>
                      <template v-else>
                        <div v-for="n in 5" :key="n" class="mx-0.5 bg-bg-grey-lighten-2 rounded-sm"
                          style="height: 3px; width: 3px;"></div>
                      </template>
                    </div>
                  </VCard>
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12" md="4" class="text-center py-4">
              <VBtn id="btn-uked1-tune-all" :color="isPlayingAll ? 'red-darken-2' : 'primary'" class="mb-3 w-100"  size="large"
                @click="playAllStrings">
                <VIcon start>{{ isPlayingAll ? 'mdi-stop' : 'mdi-play' }}</VIcon>
                {{ isPlayingAll ? 'Detener Afinador' : 'Afinar en Secuencia' }}
              </VBtn>

              <!-- Wave type and settings controls -->
              <VSelect v-model="waveType" :items="waveOptions" label="Tipo de Sonido" density="compact" variant="outlined" hide-details
                class="mt-2"></VSelect>

              <div class="mt-4 px-2">
                <div class="d-flex justify-space-between text-caption text-grey-darken-2 mb-1">
                  <span>Volumen</span>
                  <span>{{ Math.round(volume * 100) }}%</span>
                </div>
                <VSlider v-model="volume" min="0" max="1" step="0.05" density="compact" hide-details color="primary"
                  track-color="grey-lighten-2"></VSlider>
              </div>
            </VCol>
          </VRow>
        </CoursesSection>

        <!-- SECCION 2: Cuestionario de Partes del Ukelele -->
        <CoursesSection title="Ponte a Prueba: Identificación de Partes" icon="mdi-help-circle-outline">
          <div v-if="!quizCompleted">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-subtitle-2 text-grey-darken-2">Pregunta {{ currentQuestionIndex + 1 }} de {{
                quizQuestions.length }}</span>
              <span class="text-subtitle-2 font-weight-bold text-primary">Puntuación: {{ score }}</span>
            </div>

            <VProgressLinear :model-value="((currentQuestionIndex) / quizQuestions.length) * 100" color="primary"
              bg-color="grey-lighten-3" height="6" rounded class="mb-4"></VProgressLinear>

            <p class="text-subtitle-1 font-weight-bold text-grey-darken-4 mb-4">
              {{ currentQuestion.question }}
            </p>

            <VRow density="comfortable" class="mb-4">
              <VCol v-for="(option, idx) in currentQuestion.options" :key="idx" cols="12" sm="6">
                <VBtn id="btn-uked1-quiz-option" block variant="outlined" :disabled="isAnswered" :color="getOptionColor(idx)"
                  class="quiz-option-btn py-6 text-left justify-start" @click="checkAnswer(idx)">
                  <VIcon start class="mr-2" :color="getOptionIconColor(idx)">
                    {{ getOptionIcon(idx) }}
                  </VIcon>
                  <span class="text-truncate text-body-2 font-weight-medium" style="color: inherit;">{{ option
                  }}</span>
                </VBtn>
              </VCol>
            </VRow>

            <VExpandTransition>
              <div v-if="isAnswered" class="mt-4">
                <VAlert :type="selectedAnswer === currentQuestion.answerIndex ? 'success' : 'error'" density="compact" variant="outlined"
                  class="mb-4">
                  <div class="font-weight-bold mb-1">
                    {{ selectedAnswer === currentQuestion.answerIndex ? '¡Correcto!' : 'Incorrecto' }}
                  </div>
                  <div class="text-body-2">{{ currentQuestion.explanation }}</div>
                </VAlert>

                <div class="d-flex justify-end">
                  <VBtn id="btn-uked1-quiz-next" color="primary" @click="nextQuestion">
                    {{ currentQuestionIndex + 1 === quizQuestions.length ? 'Finalizar' : 'Siguiente' }}
                    <VIcon end>mdi-arrow-right</VIcon>
                  </VBtn>
                </div>
              </div>
            </VExpandTransition>
          </div>

          <!-- Quiz Results screen -->
          <div v-else class="text-center py-6">
            <VIcon size="64" :color="score >= 4 ? 'success' : 'amber'">
              {{ score >= 4 ? 'mdi-trophy-outline' : 'mdi-school-outline' }}
            </VIcon>

            <h3 class="text-h5 font-weight-bold text-grey-darken-4 mt-3">¡Cuestionario Completado!</h3>
            <p class="text-subtitle-1 text-primary font-weight-bold mt-1">
              Tu puntuación: {{ score }} / {{ quizQuestions.length }}
            </p>

            <VCard variant="outlined" class="pa-4 my-4 mx-auto bg-grey-lighten-5 border-grey" max-width="500">
              <p class="text-body-1 mb-0 text-grey-darken-3">
                {{ quizFeedbackMessage }}
              </p>
            </VCard>

            <VBtn id="btn-uked1-quiz-retry" color="primary" size="large" class="mt-2" @click="resetQuiz">
              <VIcon start>mdi-refresh</VIcon>
              Intentar de nuevo
            </VBtn>
          </div>
        </CoursesSection>

        <!-- SECCION 3: Juego de Correspondencia Latina / Inglesa -->
        <CoursesSection title="Ponte a Prueba: Relaciona las Notas" icon="mdi-swap-horizontal">
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
              Dominas perfectamente la equivalencia entre notación latina e inglesa. ¡Excelente!
            </p>
            <VBtn id="btn-uked1-match-retry" color="primary" class="mt-4" @click="resetMatchGame">
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
                  🇪🇸 Latina
                </div>
                <transition-group name="match-list" tag="div">
                  <div v-for="note in unmatchedLatin" :key="note.latin" class="mb-2">
                    <VBtn id="btn-uked1-latin-note" block variant="flat" :color="getLatinBtnColor(note.latin)"
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
                  🇬🇧 Inglesa
                </div>
                <transition-group name="match-list" tag="div">
                  <div v-for="note in unmatchedEnglish" :key="note.english" class="mb-2">
                    <VBtn id="btn-uked1-english-note" block variant="flat" :color="getEnglishBtnColor(note.english)"
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
              Haz clic en una nota latina y luego en su equivalente inglesa para emparejarlas.
            </div>
          </div>
        </CoursesSection>

        <!-- SECCION 4: Escala de Do Mayor -->
        <CoursesSection title="Escala de Do Mayor (C Major Scale)" icon="mdi-music-clef-treble">
          <p class="text-body-2 text-grey-darken-3 mb-3">
            La escala mayor natural se construye a partir de una nota raíz siguiendo la fórmula de intervalos:
          </p>

          <div class="d-flex justify-center align-center py-2 px-4 bg-grey-lighten-3 rounded-lg mb-4 text-center">
            <span class="font-weight-black text-subtitle-2 font-mono text-primary">
              Tono — Tono — Semitono — Tono — Tono — Tono — Semitono
            </span>
          </div>

          <p class="text-body-2 text-grey-darken-3 mb-4">
            En el ukelele, <strong>1 Tono</strong> equivale a avanzar <strong>2 trastes</strong>, y <strong>1
              Semitono</strong> equivale a avanzar <strong>1 traste</strong>.
            Explora la escala a continuación. Haz clic en las notas para escuchar su sonido y ver en qué traste y
            cuerda se
            colocan tus dedos. <strong>Fórmula: 1 Tono = 2 Semitonos</strong>.
          </p>

          <VRow density="comfortable" class="align-center">
            <!-- Column 1: Scale selector and explanations -->
            <VCol cols="12" md="7" class="pr-md-4">
              <!-- Scale Step Visualizer (Horizontal Buttons) -->
              <div class="d-flex align-center justify-space-between flex-wrap mb-6 py-2 px-1 rounded bg-grey-lighten-4">
                <template v-for="(note, index) in scaleNotes" :key="`note-${index}`">
                  <div class="d-flex align-center justify-center flex-grow-1 my-1">
                    <VBtn id="btn-uked1-scale-note" icon rounded="circle" size="small" :color="selectedNoteIndex === index ? 'primary' : 'grey-lighten-2'"
                      class="elevation-2 font-weight-black text-subtitle-1"
                      :class="selectedNoteIndex === index ? 'text-white scale-up-pulse' : 'text-grey-darken-3'"
                      style="width: 38px; height: 38px;" @click="selectNote(index)">
                      {{ note.name }}
                    </VBtn>

                    <!-- Connector indicating Tone / Semitone interval -->
                    <div v-if="index < scaleNotes.length - 1" class="note-step-connector"
                      :class="{ active: selectedNoteIndex === index || selectedNoteIndex === index + 1 }"
                      style="position: relative;">
                      <span class="text-caption font-weight-black font-mono"
                        :style="selectedNoteIndex === index ? 'color: var(--v-primary-base, #1976d2)' : 'color: #888'"
                        style="position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 0.65rem !important;">
                        {{ scaleNotes[index].intervalLabel }}
                      </span>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Active Note details card -->
              <VCard variant="outlined" class="pa-4 bg-grey-lighten-5 mb-4"
                style="border-color: rgba(25, 118, 210, 0.25) !important;">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-h5 font-weight-black text-capitalize text-primary">
                    {{ selectedNote.name }} <span class="text-subtitle-2 text-grey">({{ selectedNote.english
                    }})</span>
                  </span>
                  <VChip size="small" color="primary" variant="outlined">
                    {{ selectedNote.role }}
                  </VChip>
                </div>

                <VDivider class="mb-3" />

                <VRow density="comfortable">
                  <VCol cols="4">
                    <div class="text-caption text-grey">Frecuencia</div>
                    <div class="text-body-1 font-weight-bold text-grey-darken-4">{{ selectedNote.frequency }}
                      Hz</div>
                  </VCol>
                  <VCol cols="8">
                    <div class="text-caption text-grey">Intervalo previo</div>
                    <div class="text-body-1 font-weight-bold font-mono text-amber-darken-3">
                      {{ selectedNote.intervalDesc }}
                    </div>
                  </VCol>
                  <VCol cols="12" class="mt-2">
                    <div class="text-caption text-grey">Instrucciones de digitación</div>
                    <div class="text-caption  mt-1 text-grey-darken-4">
                      <VIcon size="small" color="primary" class="mr-1">mdi-hand-pointing-right</VIcon>
                      {{ selectedNote.instructions }}
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
                          :fill="selectedNote.leftFinger === 0 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="503" cy="135" r="38"
                          :fill="selectedNote.leftFinger === 1 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="424" cy="70" r="38"
                          :fill="selectedNote.leftFinger === 2 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="350" cy="109" r="38"
                          :fill="selectedNote.leftFinger === 3 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="276" cy="170" r="38"
                          :fill="selectedNote.leftFinger === 4 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                      </g>
                      <!-- finger numbers -->
                      <text x="343.1" y="161" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.leftFinger === 1 ? '#ffffff' : 'red'">1</text>
                      <text x="422.1" y="96" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.leftFinger === 2 ? '#ffffff' : 'red'">2</text>
                      <text x="496.1" y="135" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.leftFinger === 3 ? '#ffffff' : 'red'">3</text>
                      <text x="570.1" y="196" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.leftFinger === 4 ? '#ffffff' : 'red'">4</text>
                    </svg>
                    <div class="text-caption font-weight-bold text-grey-darken-3 mt-1">
                      Mano Izquierda (diapasón)
                    </div>
                    <div class="text-caption text-primary font-weight-bold">
                      {{ leftHandLabel }}
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
                          :fill="selectedNote.rightFinger === 0 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="503" cy="135" r="38"
                          :fill="selectedNote.rightFinger === 1 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="424" cy="70" r="38"
                          :fill="selectedNote.rightFinger === 2 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="350" cy="109" r="38"
                          :fill="selectedNote.rightFinger === 3 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                        <circle cx="276" cy="170" r="38"
                          :fill="selectedNote.rightFinger === 4 ? 'var(--v-primary-base, #1976d2)' : 'transparent'" />
                      </g>
                      <!-- finger letters: P (pulgar), I (índice), M (medio), A (anular) -->
                      <text x="239.1" y="403" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.rightFinger === 0 ? '#ffffff' : 'red'">P</text>
                      <text x="343.1" y="161" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.rightFinger === 1 ? '#ffffff' : 'red'">I</text>
                      <text x="422.1" y="96" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.rightFinger === 2 ? '#ffffff' : 'red'">M</text>
                      <text x="496.1" y="135" text-anchor="middle" font-size="75" font-weight="bold"
                        font-family="sans-serif" :fill="selectedNote.rightFinger === 3 ? '#ffffff' : 'red'">A</text>
                    </svg>
                    <div class="text-caption font-weight-bold text-grey-darken-3 mt-1">
                      Mano Derecha (cuerdas)
                    </div>
                    <div class="text-caption text-orange-darken-3 font-weight-bold">
                      {{ rightHandLabel }}
                    </div>
                  </VCol>
                </VRow>
              </VCard>

              <div class="d-flex flex-wrap gap-2">
                <VBtn id="btn-uked1-scale-play" :color="isPlayingScale ? 'red-darken-2' : 'primary'" class="mr-2 mb-2 text-white"
                  @click="playScaleSequence">
                  <VIcon start>{{ isPlayingScale ? 'mdi-stop' : 'mdi-play-circle' }}</VIcon>
                  {{ isPlayingScale ? 'Detener escala' : 'Reproducir Escala' }}
                </VBtn>

                <VBtn id="btn-uked1-scale-sound" variant="outlined" color="grey-darken-2" class="mb-2" @click="playTone(selectedNote.frequency, 1.2)">
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
                        <VAvatar v-if="selectedNote.string === s && selectedNote.fret === 0" color="primary" size="26"
                          class="elevation-4 scale-up-pulse font-weight-black text-white"
                          style="font-size: 0.7rem; border: 2px solid white;">
                          {{ selectedNote.name }}
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
                          <VAvatar v-if="selectedNote.string === s && selectedNote.fret === f" color="amber-accent-4"
                            size="28" class="elevation-6 scale-up-pulse font-weight-black text-black"
                            style="z-index: 5; font-size: 0.68rem; border: 2px solid #fff;">
                            {{ selectedNote.name }}
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

      </div>
    </VExpandTransition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContent: true,
      activeStringIndex: null,
      isPlayingAll: false,
      stringTimeout: null,

      // Synthesizer Settings
      waveType: "triangle",
      volume: 0.35,
      audioCtx: null,

      waveOptions: [
        { title: "Acústico (Triangular)", value: "triangle" },
        { title: "Suave (Sinusoidal)", value: "sine" },
        { title: "Metálico (Sierra)", value: "sawtooth" },
        { title: "Digital (Cuadrado)", value: "square" },
      ],

      tuningStrings: [
        {
          number: 4,
          note_en: "G",
          note_es: "Sol",
          frequency: "392 Hz",
          frequencyHz: 392.00,
          color: "green-darken-1",
        },
        {
          number: 3,
          note_en: "C",
          note_es: "Do",
          frequency: "262 Hz",
          frequencyHz: 261.63,
          color: "blue-darken-1",
        },
        {
          number: 2,
          note_en: "E",
          note_es: "Mi",
          frequency: "330 Hz",
          frequencyHz: 329.63,
          color: "orange-darken-1",
        },
        {
          number: 1,
          note_en: "A",
          note_es: "La",
          frequency: "440 Hz",
          frequencyHz: 440.00,
          color: "red-darken-1",
        },
      ],

      // Quiz State
      quizCompleted: false,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      isAnswered: false,
      score: 0,

      quizQuestions: [
        {
          question: "¿Qué parte del ukelele se gira para ajustar la tensión de las cuerdas al afinar?",
          options: ["Puente inferior", "Mástil", "Clavijeros", "Cejilla superior"],
          answerIndex: 2,
          explanation: "Los clavijeros son las llaves o engranajes mecánicos en la pala que tensan o aflojan las cuerdas para modificar y afinar su tono."
        },
        {
          question: "¿Cómo se llaman las barritas metálicas incrustadas a lo largo del diapasón?",
          options: ["Cejillas", "Trastes", "Cuerdas", "Clavijas"],
          answerIndex: 1,
          explanation: "Los trastes son las barras metálicas que dividen el mástil. Al presionar una cuerda contra un traste, acortas la distancia de vibración, aumentando el tono."
        },
        {
          question: "¿Qué pieza guía las cuerdas en la parte superior del mástil y marca el inicio de la escala?",
          options: ["Cejilla superior", "Boca (Sound hole)", "Puente inferior", "Diapasón"],
          answerIndex: 0,
          explanation: "La cejilla superior (nut) mantiene separadas y elevadas las cuerdas en el extremo del diapasón, sirviendo de frontera entre el mástil y la pala."
        },
        {
          question: "¿Cuál es el cuerpo hueco del ukelele que sirve para amplificar acústicamente el sonido?",
          options: ["Mástil", "Caja de resonancia", "Boca (Sound hole)", "Pala (Headstock)"],
          answerIndex: 1,
          explanation: "La caja de resonancia vibra junto con las cuerdas, acumulando el aire interno para amplificar y proyectar el sonido a través de la boca."
        },
        {
          question: "¿Qué nota produce la cuerda número 3 del ukelele al aire en afinación estándar?",
          options: ["La (A)", "Sol (G)", "Do (C)", "Mi (E)"],
          answerIndex: 2,
          explanation: "En afinación estándar (G-C-E-A), la tercera cuerda se afina en Do (C4). Es la cuerda de mayor grosor y produce la nota más grave del instrumento al aire."
        },
        {
          question: "¿Para qué sirve la Boca (Sound hole) del ukelele?",
          options: ["Para sostener las cuerdas en la base", "Para ajustar la afinación", "Para que el sonido salga con mayor proyección", "Para marcar el inicio del diapasón"],
          answerIndex: 2,
          explanation: "La Boca o Sound hole es el agujero circular en la tapa del instrumento. Permite que las ondas sonoras amplificadas dentro de la caja de resonancia salgan hacia afuera, aumentando la proyección y el volumen del sonido."
        },
        {
          question: "¿En qué parte del ukelele se ubican los trastes y donde se presionan los acordes?",
          options: ["Caja de resonancia", "Pala (Headstock)", "Cejilla inferior", "Mástil (Diapasón)"],
          answerIndex: 3,
          explanation: "El mástil incluye el diapasón, que es la superficie donde se colocan los dedos para presionar las cuerdas contra los trastes y producir distintas notas y acordes."
        },
        {
          question: "¿Cuántas cuerdas tiene un ukelele estándar y de qué material suelen ser?",
          options: ["6 cuerdas de acero", "5 cuerdas de tripa", "4 cuerdas de nylon o fluorocarbono", "4 cuerdas de acero"],
          answerIndex: 2,
          explanation: "El ukelele estándar tiene 4 cuerdas, generalmente fabricadas en nylon o fluorocarbono. Este material les da su sonido característico brillante y suave, diferente al acero de la guitarra."
        }
      ],

      // Match Game State
      notePairs: [
        { latin: 'Do', english: 'C' },
        { latin: 'Re', english: 'D' },
        { latin: 'Mi', english: 'E' },
        { latin: 'Fa', english: 'F' },
        { latin: 'Sol', english: 'G' },
        { latin: 'La', english: 'A' },
        { latin: 'Si', english: 'B' },
      ],
      shuffledEnglish: [],
      matchedPairs: [],
      selectedLatinName: null,
      selectedEnglishName: null,
      wrongLatinName: null,
      wrongEnglishName: null,
      wrongTimeout: null,
      matchGameComplete: false,

      // Scale State
      selectedNoteIndex: 0,
      isPlayingScale: false,
      fingerNames: ['Pulgar', 'Índice', 'Medio', 'Anular', 'Meñique'],

      scaleNotes: [
        {
          name: "Do",
          english: "C4",
          frequency: 261.63,
          string: 3,
          fret: 0,
          role: "Nota Raíz (Tónica)",
          intervalLabel: "T",
          intervalDesc: "Inicio de la escala",
          instructions: "Toca la cuerda 3 al aire (sin presionar ningún traste).",
          leftFinger: null,
          rightFinger: 1
        },
        {
          name: "Re",
          english: "D4",
          frequency: 293.66,
          string: 3,
          fret: 2,
          role: "Segunda Mayor",
          intervalLabel: "T",
          intervalDesc: "+1 Tono (avanza 2 trastes)",
          instructions: "Coloca tu dedo índice o medio en el traste 2 de la cuerda 3.",
          leftFinger: 2,
          rightFinger: 1
        },
        {
          name: "Mi",
          english: "E4",
          frequency: 329.63,
          string: 2,
          fret: 0,
          role: "Tercera Mayor",
          intervalLabel: "S",
          intervalDesc: "+1 Tono (cambio de cuerda)",
          instructions: "Toca la cuerda 2 al aire (sin presionar ningún traste).",
          leftFinger: null,
          rightFinger: 2
        },
        {
          name: "Fa",
          english: "F4",
          frequency: 349.23,
          string: 2,
          fret: 1,
          role: "Cuarta Justa",
          intervalLabel: "T",
          intervalDesc: "+1/2 Tono (avanza 1 traste)",
          instructions: "Presiona el traste 1 de la cuerda 2 (se suele usar el dedo índice).",
          leftFinger: 1,
          rightFinger: 2
        },
        {
          name: "Sol",
          english: "G4",
          frequency: 392.00,
          string: 2,
          fret: 3,
          role: "Quinta Justa",
          intervalLabel: "T",
          intervalDesc: "+1 Tono (avanza 2 trastes)",
          instructions: "Presiona el traste 3 de la cuerda 2 (se suele usar el dedo anular).",
          leftFinger: 3,
          rightFinger: 2
        },
        {
          name: "La",
          english: "A4",
          frequency: 440.00,
          string: 1,
          fret: 0,
          role: "Sexta Mayor",
          intervalLabel: "T",
          intervalDesc: "+1 Tono (cambio de cuerda)",
          instructions: "Toca la cuerda 1 al aire (sin presionar ningún traste).",
          leftFinger: null,
          rightFinger: 3
        },
        {
          name: "Si",
          english: "B4",
          frequency: 493.88,
          string: 1,
          fret: 2,
          role: "Séptima Mayor",
          intervalLabel: "S",
          intervalDesc: "+1 Tono (avanza 2 trastes)",
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
          role: "Octava (Tónica)",
          intervalLabel: "",
          intervalDesc: "+1/2 Tono (avanza 1 traste)",
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

    currentQuestion() {
      return this.quizQuestions[this.currentQuestionIndex];
    },

    selectedNote() {
      return this.scaleNotes[this.selectedNoteIndex];
    },

    leftHandLabel() {
      const f = this.selectedNote.leftFinger;
      if (f === null) return 'Cuerda al aire (sin presionar)';
      return `${this.fingerNames[f]} · Traste ${this.selectedNote.fret}`;
    },

    rightHandLabel() {
      const f = this.selectedNote.rightFinger;
      return `${this.fingerNames[f]} · Cuerda ${this.selectedNote.string}`;
    },

    quizFeedbackMessage() {
      if (this.score === 8) {
        return "¡Perfecto! 8/8 — Tienes una comprensión impecable de la estructura de tu ukelele. ¡Eres un estudiante excepcional!";
      } else if (this.score >= 6) {
        return "¡Excelente trabajo! Dominás la mayoría de los conceptos. Repasa las preguntas que fallaste para completar tu comprensión.";
      } else if (this.score >= 4) {
        return "¡Buen esfuerzo! Tenés los conceptos básicos pero hay algunos detalles que vale la pena repasar en la lección teórica del Día 1.";
      } else {
        return "¡No te desanimes! El ukelele es nuevo para vos. Te recomendamos releer el material teórico del Día 1 e intentarlo de nuevo con más confianza.";
      }
    }
  },

  mounted() {
    this.initMatchGame();
  },

  beforeUnmount() {
    if (this.stringTimeout) clearTimeout(this.stringTimeout);
    if (this.wrongTimeout) clearTimeout(this.wrongTimeout);
    this.isPlayingAll = false;
    this.isPlayingScale = false;
  },

  methods: {
    toggleContent() {
      this.showContent = !this.showContent;
    },

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

    playString(index) {
      const string = this.tuningStrings[index];
      if (!string) return;

      this.activeStringIndex = index;
      this.playTone(string.frequencyHz, 1.4);

      if (this.stringTimeout) clearTimeout(this.stringTimeout);
      this.stringTimeout = setTimeout(() => {
        if (this.activeStringIndex === index) {
          this.activeStringIndex = null;
        }
      }, 1400);
    },

    async playAllStrings() {
      if (this.isPlayingAll) {
        this.isPlayingAll = false;
        this.activeStringIndex = null;
        return;
      }

      this.isPlayingAll = true;
      for (let i = 0; i < this.tuningStrings.length; i++) {
        if (!this.isPlayingAll) break;
        this.playString(i);
        await new Promise((resolve) => setTimeout(resolve, 1600));
      }
      this.isPlayingAll = false;
    },

    checkAnswer(optionIdx) {
      this.selectedAnswer = optionIdx;
      this.isAnswered = true;
      if (optionIdx === this.currentQuestion.answerIndex) {
        this.score++;
      }
    },

    getOptionColor(idx) {
      if (!this.isAnswered) {
        return "grey darken-2";
      }
      if (idx === this.currentQuestion.answerIndex) {
        return "success";
      }
      if (idx === this.selectedAnswer) {
        return "error";
      }
      return "bg-grey-lighten-2";
    },

    getOptionIcon(idx) {
      if (!this.isAnswered) {
        return "mdi-radiobox-blank";
      }
      if (idx === this.currentQuestion.answerIndex) {
        return "mdi-check-circle";
      }
      if (idx === this.selectedAnswer) {
        return "mdi-close-circle";
      }
      return "mdi-minus-circle-outline";
    },

    getOptionIconColor(idx) {
      if (!this.isAnswered) {
        return "grey darken-1";
      }
      if (idx === this.currentQuestion.answerIndex) {
        return "success";
      }
      if (idx === this.selectedAnswer) {
        return "error";
      }
      return "bg-grey-lighten-1";
    },

    nextQuestion() {
      this.isAnswered = false;
      this.selectedAnswer = null;
      if (this.currentQuestionIndex + 1 < this.quizQuestions.length) {
        this.currentQuestionIndex++;
      } else {
        this.quizCompleted = true;
      }
    },

    resetQuiz() {
      this.currentQuestionIndex = 0;
      this.score = 0;
      this.selectedAnswer = null;
      this.isAnswered = false;
      this.quizCompleted = false;
    },

    selectNote(index) {
      this.selectedNoteIndex = index;
      const note = this.scaleNotes[index];
      this.playTone(note.frequency, 1.2);
    },

    async playScaleSequence() {
      if (this.isPlayingScale) {
        this.isPlayingScale = false;
        return;
      }

      this.isPlayingScale = true;

      for (let i = 0; i < this.scaleNotes.length; i++) {
        if (!this.isPlayingScale) break;
        this.selectNote(i);
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      if (this.isPlayingScale) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      for (let i = this.scaleNotes.length - 2; i >= 0; i--) {
        if (!this.isPlayingScale) break;
        this.selectNote(i);
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      this.isPlayingScale = false;
    },

    getStringThickness(s) {
      if (s === 4) return 2.0;
      if (s === 3) return 3.2;
      if (s === 2) return 2.4;
      if (s === 1) return 1.5;
      return 2.0;
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
    }
  }
}
</script>

<style scoped>
.wave-active {
  animation: wavePulse 1.2s infinite ease-in-out;
}

@keyframes wavePulse {

  0%,
  100% {
    transform: scaleY(0.2);
    opacity: 0.5;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}

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

.note-step-connector {
  flex-grow: 1;
  height: 3px;
  background-color: #d0d0d5;
  margin: 0 2px;
  min-width: 6px;
  transition: all 0.3s;
}

.fretboard-strings>div {
  align-self: stretch;
}

.note-step-connector.active {
  background-color: var(--v-primary-base, #1976d2);
  box-shadow: 0 0 5px rgba(25, 118, 210, 0.4);
}

.border-transition {
  transition: border-color 0.25s ease-in-out, background-color 0.25s ease-in-out;
  border-width: 1px;
}

.border-grey {
  border: 1px solid #d0d0d5 !important;
}

.quiz-option-btn {
  text-transform: none !important;
  height: auto !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(0, 0, 0, 0.02) !important;
}

.quiz-option-btn:hover:not(.v-btn--disabled) {
  transform: translateY(-1px);
  background-color: rgba(0, 0, 0, 0.04) !important;
  border-color: var(--v-primary-base, #1976d2) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.gap-2 {
  gap: 8px;
}

.w-100 {
  width: 100%;
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