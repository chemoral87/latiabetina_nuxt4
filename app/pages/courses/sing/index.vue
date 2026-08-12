<template>
  <VContainer class="pa-4" style="max-width: 900px">
    <h2 class="text-h5 mb-4">Curso de Canto</h2>

    <VAlert v-if="error" class="mb-4" type="error" density="compact" variant="outlined">
      {{ error }}
    </VAlert>

    <div v-else-if="loading" class="text-center py-8">
      <VProgressCircular indeterminate color="primary" />
      <p class="mt-3 text-body-2 text-grey-darken-3">Cargando lecciones…</p>
    </div>

    <VAlert v-else-if="!blocks.length" type="info" density="compact" variant="outlined">
      Usa parámetros en la URL:
      <code>?day=1</code> para todas las lecciones del día 1,
      <code>?order=TR,P</code> para priorizar carpetas (el resto va al final: P, TL, TR), o
      <code>?folder=practical</code> para todo el contenido de una carpeta.
    </VAlert>

    <section v-for="block in blocks" :key="block.key" class="mb-8">
      <h3 v-if="blocks.length > 1" class="text-subtitle-1 font-weight-medium mb-3">
        {{ block.title }}
      </h3>
      <component :is="block.component" />
    </section>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Curso de Canto",
  icon: "mdi-microphone",
  permission: "sing-course",
  middleware: ["authenticated", "permission"],
})

const FOLDERS = ["practical", "theological", "theoretical"]
const DEFAULT_ORDER_CODES = ["P", "TL", "TR"]
const FOLDER_CODES: Record<string, string> = {
  P: "practical",
  TL: "theological",
  TR: "theoretical",
}
const FOLDER_LABELS: Record<string, string> = {
  practical: "Práctico",
  theological: "Teológico",
  theoretical: "Teórico",
}

function getFolderLabel(folder: string) {
  return FOLDER_LABELS[folder] || folder
}

// Vite equivalent of Webpack's require.context: eagerly import every day*.vue
// in each folder so the components are statically analyzable at build time.
const folderModules = {
  practical: import.meta.glob("./practical/*.vue", { eager: true }),
  theological: import.meta.glob("./theological/*.vue", { eager: true }),
  theoretical: import.meta.glob("./theoretical/*.vue", { eager: true }),
}

interface CourseBlock {
  key: string
  title: string
  component: unknown
}

const route = useRoute()
const loading = ref(false)
const error = ref<string | null>(null)
const blocks = ref<CourseBlock[]>([])

watch(
  () => route.query,
  () => {
    loadContent()
  },
  { immediate: true },
)

function loadContent() {
  error.value = null
  blocks.value = []
  loading.value = true

  try {
    const day = parseDay(route.query.day)
    const folder = parseFolder(route.query.folder)

    const folderOrder = parseOrder(route.query.order)

    if (folder) {
      blocks.value = loadFromFolder(folder, day)
    } else if (day) {
      blocks.value = loadByDay(day, folderOrder)
    }
  } catch (err) {
    error.value = (err as Error).message || "No se pudo cargar el contenido."
  } finally {
    loading.value = false
  }
}

function parseDay(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null
  }
  const day = parseInt(String(value), 10)
  if (!Number.isFinite(day) || day < 1) {
    throw new Error("El parámetro «day» debe ser un número mayor que 0.")
  }
  return day
}

function parseFolder(value: unknown) {
  if (!value) {
    return null
  }
  const folder = String(value).toLowerCase().trim()
  if (!FOLDERS.includes(folder)) {
    const options = FOLDERS.map((name) => getFolderLabel(name)).join(", ")
    throw new Error(`Carpeta no válida. Usa: ${options}.`)
  }
  return folder
}

function parseOrder(value: unknown) {
  const codes = value
    ? String(value)
        .split(",")
        .map((part) => part.trim().toUpperCase())
        .filter(Boolean)
    : [...DEFAULT_ORDER_CODES]

  const folders: string[] = []

  for (const code of codes) {
    const folder = FOLDER_CODES[code]
    if (!folder) {
      throw new Error(`Código de orden no válido: «${code}». Usa P, TL o TR.`)
    }
    if (!folders.includes(folder)) {
      folders.push(folder)
    }
  }

  for (const code of DEFAULT_ORDER_CODES) {
    const folder = FOLDER_CODES[code]
    if (!folders.includes(folder)) {
      folders.push(folder)
    }
  }

  return folders
}

function loadByDay(day: number, folderOrder: string[]) {
  const fileName = `day${day}.vue`
  const loaded: CourseBlock[] = []

  for (const folder of folderOrder) {
    const modules = folderModules[folder as keyof typeof folderModules]
    // Vite's import.meta.glob keys keep the folder prefix (./practical/day1.vue)
    const key = `./${folder}/${fileName}`
    if (!(key in modules)) {
      continue
    }
    loaded.push(makeBlock(folder, key, modules[key]))
  }

  if (!loaded.length) {
    throw new Error(`No hay lecciones para el día ${day}.`)
  }

  return loaded
}

function loadFromFolder(folder: string, day: number | null) {
  const modules = folderModules[folder as keyof typeof folderModules]
  let keys = Object.keys(modules).sort()

  if (day) {
    const target = `./${folder}/day${day}.vue`
    keys = keys.filter((key) => key === target)
    if (!keys.length) {
      throw new Error(`No existe day${day}.vue en «${getFolderLabel(folder)}».`)
    }
  }

  return keys.map((key) => makeBlock(folder, key, modules[key]))
}

function makeBlock(folder: string, key: string, module: unknown) {
  const mod = module as { default?: unknown }
  const component = mod.default || module
  const fileName = key.replace(/^\.\//, "").replace(/\.vue$/, "").split("/").pop() || ""

  return {
    key: `${folder}-${fileName}`,
    title: formatTitle(folder, fileName),
    component,
  }
}

function formatTitle(folder: string, fileName: string) {
  const folderLabel = getFolderLabel(folder)
  const dayMatch = fileName.match(/^day(\d+)$/i)
  const dayLabel = dayMatch ? ` — Día ${dayMatch[1]}` : ` — ${fileName}`
  return `${folderLabel}${dayLabel}`
}
</script>
