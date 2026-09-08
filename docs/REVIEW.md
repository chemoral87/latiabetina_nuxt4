# Code Review - Recomendaciones de Mejora

**Proyecto:** latiabetina_nuxt4 (Nuxt 4 + Vuetify + Pinia)  
**Fecha:** 2026-09-08  
**Scope:** Arquitectura, patrones, calidad de código, mantenibilidad

---

## Resumen Ejecutivo

El proyecto tiene una base arquitectónica sólida: uso consistente de `<script setup>`, composables bien nombrados, patrón de repositorio con fábricas, y buena separación por dominios. Las principales áreas de mejora son: **duplicación masiva en componentes CRUD**, **composables que acumulan demasiada responsabilidad**, y **37 páginas legacy con Options API**.

---

## 1. Componentes CRUD - Duplicación Masiva

**Severidad: Alta**  
**Impacto: ~2000+ líneas de código duplicado**

Casi todos los dominios (`User`, `Role`, `Permission`, `Organization`, `ChurchMember`, `Consolidation`, `AuditoriumEvent`, `Testimony`, `Product`, `Song`, `Sale`, `Tracking`, `WhatsApp`) siguen un patrón idéntico:

```
<Module>/Table.vue   → VDataTableServer + paginación + filtro + sort
<Module>/Dialog.vue  → formulario create/edit en diálogo
```

Cada par Table/Dialog repite: `defineProps`, `defineEmits`, `useRowHighlight()`, `useDebouncedFilter()`, `buildApiParams()`, y la lógica de carga/paginación.

**Recomendación:** Crear componentes genéricos `<CrudTable<T>` y `<CrudDialog<T>>` parametrizados por el recurso API, las columnas de la tabla, y los campos del formulario. Esto eliminaría ~2000 líneas de boilerplate.

---

## 2. Composables Sobrecargados

**Severidad: Alta**

| Composable | Líneas | Problema |
|------------|--------|----------|
| `usePitcherStore.ts` | 338 | 30+ propiedades reactivas, lógica de audio + UI + persistencia |
| `useAuth.ts` | 311 | JWT refresh + login/logout + permisos + cookie management |
| `useQuiz.ts` | 329 | Estado del quiz + lógica de negocio + scoring |
| `useRelaxAudio.ts` | 382 | WebAudio API + iOS workarounds + buffer management |
| `useRepository.ts` | 194 | **God-composable** — define TODOS los repositorios de API en un solo return |

**Recomendación:**
- `useAuth.ts`: Separar en `useAuthSession.ts` (login/logout/JWT) y `useAuthPermissions.ts` (permisos/roles)
- `useRepository.ts`: Dividir en repositorios por dominio (`useChurchMemberRepo.ts`, `useAuditoriumRepo.ts`, etc.)
- `usePitcherStore.ts`: Extraer lógica de audio a `usePitcherAudio.ts` y UI a `usePitcherUI.ts`

---

## 3. Páginas Legacy con Options API

**Severidad: Media**  
**Archivos afectados: 37 páginas en `pages/courses/`**

Todas las páginas de cursos (`sing/practical/day*.vue`, `sing/theoretical/day*.vue`, `ukelele/practical/day*.vue`, `ukelele/theoretical/day*.vue`) usan `<script>` con Options API (`data()`, `methods`, `computed`).

**Recomendación:** Migrar a `<script setup lang="ts">` para mantener consistencia con el resto del proyecto.

---

## 4. Type Duplicado `ApiFn`

**Severidad: Baja-Media**

`ApiFn` está definido idénticamente en:
- `app/repositories/factory/createCommonRepository.ts:3`
- `app/repositories/factory/createParentRepository.ts:3`

**Recomendación:** Extraer a `app/repositories/factory/types.ts` y re-exportar desde ambos archivos.

---

## 5. Middleware `prevent-refresh.ts` - Memory Leak

**Severidad: Media**

```ts
// app/middleware/prevent-refresh.ts
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.client) {
    window.addEventListener("beforeunload", (event) => {
      event.preventDefault()
      event.returnValue = "Realmente desea salir?"
    })
  }
})
```

Se agrega el event listener pero **nunca se remueve**. En SPA navigation, si el middleware se re-evalúa, se acumulan listeners.

**Recomendación:** Usar `onUnmounted()` o `beforeRouteLeave` para limpiar el listener, o mover la lógica a un composable `usePreventRefresh()` que gestione el lifecycle.

---

## 6. `types/song.ts` - Mezcla de Concerns

**Severidad: Media**

El archivo `app/types/song.ts` (247 líneas) exporta tipos pero también contiene funciones de normalización, exportación e importación (`normalizeContent()`, `exportSongToJson()`, `importSongFromJson()`).

**Recomendación:** Mover las funciones a `app/utils/songSerializer.ts` y dejar `types/song.ts` solo con interfaces y tipos.

---

## 7. ESLint Configuración Mínima

**Severidad: Media**

`eslint.config.js` solo tiene una regla: `vue/attributes-order`. No hay:
- Reglas de TypeScript (no disponible por limitación con TS@7)
- Reglas de importación/ordering
- Límites de complejidad ciclomática
- Reglas de consistencia de naming

**Recomendación:** Agregar al menos reglas de importación y `max-lines-per-function` cuando las dependencias lo permitan.

---

## 8. Plugin `vuetify-weekdays.ts` - Fragilidad

**Severidad: Baja-Media**

```ts
// app/plugins/vuetify-weekdays.ts
// Monkey-patches VuetifyDateAdapter prototype
```

Este plugin modifica el prototipo de `VuetifyDateAdapter` para soportar español. Es frágil ante upgrades de Vuetify.

**Recomendación:** Verificar si Vuetify 4 ya soporta locale `es` nativamente. Si no, documentar la dependencia y agregar un test de regresión.

---

## 9. `error.vue` - PropType<unknown>

**Severidad: Baja**

```ts
const props = defineProps({
  error: {
    type: [Object, String] as PropType<unknown>,
    default: null,
  },
})
```

El tipo `unknown` fuerza múltiples casts (`as Record<string, unknown>`) a lo largo del componente.

**Recomendación:** Definir una interfaz `NuxtError`:
```ts
interface NuxtError {
  statusCode: number
  message: string
  data?: { permission?: string; [key: string]: unknown }
  response?: { status: number; data?: Record<string, unknown> }
}
```

---

## 10. `useVrules()` no es Reactivo

**Severidad: Baja**

`app/composables/useVrules.ts` exporta una función que retorna un objeto plano con reglas de validación Vuetify. No usa `ref()`, `computed()`, ni ninguna API reactiva.

**Recomendación:** Mover a `app/utils/vrules.ts` como utilidad pura, o hacer que sea reactiva si se necesita invalidación dinámica.

---

## 11. Typo en Variable

**Severidad: Baja**

En `app/composables/useAuditoriumEventStats.ts`:
- `percentajeTotalSeats` → debería ser `percentageTotalSeats`

---

## 12. Constantes con Doble Export

**Severidad: Baja**

`app/constants/pitcher.ts` y `app/constants/auditorium.ts` exportan tanto named exports como un default export. Esto es un patrón inusual que puede causar confusión con auto-imports.

**Recomendación:** Estandarizar un solo patrón de exportación.

---

## Áreas Positivas

- **100% `<script setup>`** en componentes del dominio principal
- **Naming consistente** `useX` en los 21 composables
- **Buenas prácticas de seguridad:** `safeInternalRedirect()`, cookies CSRF-safe
- **Pinia stores bien estructurados** con separación state/getters/actions
- **Descomposición limpia por dominios** (Auditorium, ChurchMember, Consolidation, etc.)
- **Patrón de repositorio con fábricas** — buena abstracción de capa de datos
- **Composables reutilizables** bien diseñados: `useRowHighlight()`, `useDebouncedFilter()`, `useGlobalProgress()`

---

## Priorización

| Prioridad | Acción | Esfuerzo |
|-----------|--------|----------|
| P0 | Extraer `ApiFn` type compartido | 15 min |
| P0 | Corregir memory leak en `prevent-refresh.ts` | 30 min |
| P1 | Componentes genéricos CRUD | 1-2 días |
| P1 | Separar `useAuth` en session + permissions | 2-3 horas |
| P1 | Separar `useRepository` por dominio | 1-2 horas |
| P2 | Migrar páginas de cursos a `<script setup>` | 4-6 horas |
| P2 | Separar `types/song.ts` types vs utils | 30 min |
| P2 | Definir interfaz `NuxtError` | 15 min |
| P3 | Mover `useVrules` a utils | 15 min |
| P3 | Corregir typo `percentajeTotalSeats` | 5 min |
| P3 | Estudiar reemplazo de vuetify-weekdays plugin | 1 hora |
| P3 | Ampliar ESLint config | 1-2 horas |
