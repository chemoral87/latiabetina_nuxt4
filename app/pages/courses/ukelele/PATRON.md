# Patrón de Cursos

Documento de referencia para crear y mantener cursos en esta aplicación.
Basado en los cursos existentes: `ukelele`, `sing` (por días) y `nodejs`, `react`,
`vue2`, `vue3`, `sqlserver` (por quiz).

Existen **dos patrones** distintos de curso:

| Patrón | Cursos | Característica |
|---|---|---|
| **Por días** | `ukelele`, `sing` | Lecciones en `.vue` organizadas por día y carpeta temática |
| **Por quiz** | `nodejs`, `react`, `vue2`, `vue3`, `sqlserver` | Banco de preguntas en JSON renderizado con el componente de quiz |

---

## 1. Curso por días (`ukelele`, `sing`)

### 1.1 Estructura de carpetas

```
app/pages/courses/<curso>/
├── index.vue                 ← página del curso (lógica de carga)
├── practical/                ← carpeta PRÁCTICA (código P)
│   └── day1.vue … dayN.vue   ← una lección por día
├── theological/              ← carpeta TEOLÓGICA (código TL)
│   └── day1.vue … dayN.vue
└── theoretical/              ← carpeta TEÓRICA (código TR)
    └── day1.vue … dayN.vue
```

- Las tres carpetas son obligatorias: `practical`, `theological`, `theoretical`.
- Los archivos de lección se nombran `day<numero>.vue` (1, 2, 3…).
- No hace falta crear todos los días en las tres carpetas: la página salta
  los días que no existan en cada carpeta.

### 1.2 Parámetros de URL (`index.vue`)

| Parámetro | Ejemplo | Efecto |
|---|---|---|
| `?day=N` | `?day=1` | Muestra `dayN.vue` de cada carpeta en el orden definido |
| `?order=A,B` | `?order=TR,P` | Prioriza carpetas (códigos `P`, `TL`, `TR`); el resto va al final en el orden por defecto `P, TL, TR` |
| `?folder=x` | `?folder=practical` | Muestra TODO el contenido de una carpeta |
| `?folder=x&day=N` | `?folder=theoretical&day=3` | Un día específico dentro de una carpeta |

Sin parámetros, la página muestra una alerta informativa con las instrucciones.

### 1.3 Carga de módulos: `import.meta.glob` (⚠ gotcha)

`index.vue` importa las lecciones con Vite:

```ts
const folderModules = {
  practical: import.meta.glob("./practical/*.vue", { eager: true }),
  theological: import.meta.glob("./theological/*.vue", { eager: true }),
  theoretical: import.meta.glob("./theoretical/*.vue", { eager: true }),
}
```

**Las claves de `import.meta.glob` incluyen el prefijo de carpeta**:

```
./practical/day1.vue   ./theological/day1.vue   ./theoretical/day1.vue
```

Por eso las búsquedas deben usar la clave con carpeta:

```ts
const key = `./${folder}/${fileName}`   // ← "./practical/day1.vue" ✅
if (!(key in modules)) continue
```

> ⚠️ **Error histórico:** buscar `./day1.vue` (sin carpeta) nunca coincide y
> lanza `No hay lecciones para el día N.` aunque el archivo exista. Fue un
> bug de migración Webpack→Vite (Webpack `require.context` devolvía claves sin
> carpeta; Vite las conserva con prefijo). No repetir.

### 1.4 Estructura de una lección `dayN.vue`

Cada lección sigue la misma plantilla:

```vue
<template>
  <div>
    <CoursesHeader v-model="showContent" title="Práctico - Día 1" />

    <VExpandTransition>
      <div v-if="showContent" class="pa-4">
        <!-- SECCION 1 -->
        <CoursesSection title="Título de la sección" icon="mdi-tune">
          <p class="text-body-2 text-grey-darken-3 mb-4">Intro…</p>
          <!-- contenido: VRow/VCol/VCard, imágenes, tablas, interactivos -->
        </CoursesSection>

        <!-- SECCION 2 … -->
      </div>
    </VExpandTransition>
  </div>
</template>
```

Reglas de la plantilla:

- **`CoursesHeader`** — encabezado colapsable (`v-model="showContent"`, default
  visible). El título incluye la carpeta y el día: `"Práctico - Día 1"`.
- **`CoursesSection`** — tarjeta con título azul (`title`, `icon`). Usar
  `outlined` para secciones devocionales/teológicas y `elevated` (default)
  para el resto.
- **`VExpandTransition`** + `v-if="showContent"` — el contenido se colapsa con
  el encabezado.
- Comentarios `<!-- SECCION N: ... -->` para numerar secciones.

### 1.5 Contenido por carpeta (convención)

| Carpeta | Código | Enfoque | Ejemplo (`ukelele`) |
|---|---|---|---|
| `theoretical` | TR | **Teoría** del instrumento: partes, afinación, notas, escalas | Diagrama del ukelele, tabla de afinación G-C-E-A, notas latinas/inglesas |
| `practical` | P | **Práctica interactiva**: afinadores, quizzes, juegos, ejercicios | Afinador de referencia por cuerda, quiz "Identifica las partes", juego "Relaciona las notas", explorador de escala |
| `theological` | TL | **Devocional / fundamento bíblico** | Versículos (Salmo 150, Efesios 5), analogías, llamado a la excelencia |

El componente se usa automáticamente por convención de Nuxt
(`~/components/Courses/Header.vue` → `CoursesHeader`).

---

## 2. Curso por quiz (`nodejs`, `react`, `vue2`, `vue3`, `sqlserver`)

### 2.1 Estructura de carpetas

```
app/pages/courses/<curso>/
├── index.vue                     ← página (envuelve CoursesQuizQuizPage)
├── questions_basic.json          ← preguntas nivel básico
├── questions_intermediate.json   ← preguntas nivel intermedio
└── questions_expert.json         ← preguntas nivel experto
```

### 2.2 Página `index.vue`

```vue
<template>
  <CoursesQuizQuizPage
    icon="mdi-nodejs"
    title-en="Node.js Quiz"
    subtitle-en="Test your Node.js knowledge"
    title-es="Node.js Quiz"
    subtitle-es="Pon a prueba tus conocimientos de Node.js"
    :questions-en="questionsEn"
    :questions-es="questionsEs"
  />
</template>

<script setup lang="ts">
import questionsBasic from "./questions_basic.json"
import questionsIntermediate from "./questions_intermediate.json"
import questionsExpert from "./questions_expert.json"

definePageMeta({
  title: "Node.js Quiz",
  icon: "mdi-nodejs",
})

const questionsEn = [
  ...normalizeQuestions(questionsBasic as RawQuestion[], "en"),
  ...normalizeQuestions(questionsIntermediate as RawQuestion[], "en"),
  ...normalizeQuestions(questionsExpert as RawQuestion[], "en"),
]

const questionsEs = [
  ...normalizeQuestions(questionsBasic as RawQuestion[], "es"),
  ...normalizeQuestions(questionsIntermediate as RawQuestion[], "es"),
  ...normalizeQuestions(questionsExpert as RawQuestion[], "es"),
]
</script>
```

### 2.3 Formato de las preguntas (`questions_*.json`)

```json
[
  {
    "id": "nodejs-1",
    "level": "basic",
    "question": {
      "en": "What is Node.js?",
      "es": "¿Qué es Node.js?"
    },
    "answers": [
      {
        "childId": 0,
        "isCorrect": true,
        "text": {
          "en": "A JavaScript runtime built on Chrome's V8 engine",
          "es": "Un entorno de ejecución de JavaScript sobre el motor V8 de Chrome"
        }
      },
      {
        "childId": 1,
        "isCorrect": false,
        "text": {
          "en": "A JavaScript frontend framework",
          "es": "Un framework frontend de JavaScript"
        }
      }
    ]
  }
]
```

- `id`: único por curso (`<curso>-<n>`).
- `level`: `"basic"` | `"intermediate"` | `"expert"` (debe coincidir con el
  archivo JSON).
- `question` y `text`: objetos `{ en, es }` bilingües.
- `isCorrect`: exactamente **una** respuesta correcta por pregunta.
- El tipo TS está en `app/utils/courseQuestions.ts` (`RawQuestion`, `RawAnswer`)
  junto con `normalizeQuestions()`, que aplana `{ en, es }` al idioma pedido.

### 2.4 Componentes de quiz (compartidos)

```
app/components/Courses/Quiz/
├── QuizPage.vue            ← página del quiz (props: icon, titleEn/Es, subtitleEn/Es, questionsEn/Es)
├── QuizConfig.vue          ← pantalla inicial (niveles, nº de preguntas)
├── QuizQuestion.vue        ← render de pregunta/respuestas
├── QuizNavigation.vue      ← anterior / siguiente / finalizar
├── QuizResults.vue         ← resultados por nivel
├── QuizLanguageToggle.vue  ← conmutador en/es
├── QuizProgressChips.vue   ← chips de progreso
├── QuizProgressInfo.vue    ← barra de progreso y puntaje
├── QuizProgressAutoPass.vue← avance automático con countdown
└── QuizHeaderTitle.vue     ← encabezado
```

El estado vive en `~/composables/useQuiz` (store Pinia).

---

## 3. Check: crear un curso nuevo

**Por días** (`<curso>` = nombre en minúsculas):

1. `mkdir app/pages/courses/<curso>/{practical,theological,theoretical}`
2. Copiar `index.vue` de `ukelele` y ajustar: `title`, `icon` (mdi), `permission`
   (en `definePageMeta` y en el menú/servicio de permisos si aplica).
3. Crear `day1.vue`, `day2.vue`… en las carpetas que apliquen, con la plantilla
   de la sección 1.4.
4. Verificar en el navegador: `?day=1`, `?day=1&order=TR,P`, `?folder=practical`,
   `?folder=theoretical&day=3`.
5. Respetar la convención de identificadores (`ai_rule/ui_identifiers_convention.md`):
   prefijos `crs-<curso>-…` y `cmp-courses-…` para componentes compartidos.

**Por quiz**:

1. Crear carpeta con `index.vue` (plantilla sección 2.2) y los 3 JSON
   (`questions_basic/intermediate/expert.json`) con el formato de la sección 2.3.
2. Verificar que `level` de cada pregunta coincide con su archivo.
3. Usar íconos MDI coherentes con la tecnología (`mdi-nodejs`, `mdi-react`, …).

**Errores conocidos a evitar:**

- Claves de `import.meta.glob` **sin prefijo de carpeta** → "No hay lecciones
  para el día N." (ver sección 1.3).
- `dayN.vue` en una carpeta pero con otro nombre (p. ej. `dia1.vue`) → la
  página no lo encuentra.
- Faltar a una de las tres carpetas rompe el orden por defecto `P, TL, TR`.
