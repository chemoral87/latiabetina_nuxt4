<template>
  <VContainer :fluid="true" class="pa-2 pa-md-4">
    <!-- Header -->
    <VRow class="mb-2">
      <VCol cols="12">
        <div class="d-flex align-center justify-space-between">
          <span v-if="auditorium && auditorium.name" class="text-h6 text-md-h5">{{ auditorium.name }}</span>
          <VBtn color="primary" :size="mobile ? 'small' : undefined" id="btn-audid-save" :loading="saving" :disabled="saving" @click="saveAuditorium">
            <VIcon :start="!mobile">mdi-content-save</VIcon>
            <span v-if="!mobile">Guardar</span>
          </VBtn>
        </div>
      </VCol>
    </VRow>

    <VRow>
      <!-- Canvas de Asientos - Primero en mobile -->
      <VCol cols="12" :md="9" :order="mdAndUp ? 2 : 1">
        <ClientOnly>
          <AuditoriumSeats :sections="sections" :settings="settings" :stage-config="stageConfig" :categories="stageCategories" />
        </ClientOnly>
      </VCol>

      <!-- Panel de Control - Segundo en mobile -->
      <VCol cols="12" :md="3" :order="mdAndUp ? 1 : 2">
        <!-- Botones de Acción -->
        <VRow density="comfortable" class="mb-3">
          <VCol cols="6" md="12">
            <VBtn color="primary" block :size="mobile ? 'small' : undefined" class="mb-md-2" id="btn-audid-add-section" @click="addSection(false)">
              <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-plus</VIcon>
              <span :class="{ 'd-none d-sm-inline': mobile }">Agregar sección</span>
            </VBtn>
          </VCol>
          <VCol cols="6" md="12">
            <VBtn color="secondary" block :size="mobile ? 'small' : undefined" class="mb-md-2" id="btn-audid-add-label" @click="addSection(true)">
              <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-label</VIcon>
              <span :class="{ 'd-none d-sm-inline': mobile }">Agregar etiqueta sección</span>
            </VBtn>
          </VCol>
          <VCol cols="6" md="12">
            <VBtn color="warning" block :size="mobile ? 'small' : undefined" class="mb-md-2" id="btn-audid-clear-cats" @click="clearAllSeatStates">
              <VIcon :start="mdAndUp" :size="mobile ? 'small' : undefined">mdi-broom</VIcon>
              <span :class="{ 'd-none d-sm-inline': mobile }">Limpiar categorías</span>
            </VBtn>
          </VCol>
        </VRow>

        <!-- Configuración -->
        <VCard id="card-audit-edito-1" variant="outlined" class="mb-3 pa-2">
          <div class="text-subtitle-2 mb-2">Configuración</div>

          <!-- Save Format Toggle -->
          <div class="d-flex align-center mb-2">
            <span class="text-caption mr-2">Formato:</span>
            <VBtnToggle v-model="saveFormat" mandatory density="compact">
              <VBtn id="btn-audid-fmt-csv" size="x-small" value="csv" color="primary">
                <VIcon start size="x-small">mdi-file-delimited</VIcon>CSV
              </VBtn>
              <VBtn id="btn-audid-fmt-json" size="x-small" value="json" color="primary">
                <VIcon start size="x-small">mdi-code-json</VIcon>JSON
              </VBtn>
            </VBtnToggle>
            <VChip size="x-small" :color="saveFormat === 'csv' ? 'success' : 'info'" class="ml-2">
              {{ saveFormat === 'csv' ? 'Plano CSV' : 'JSON anidado' }}
            </VChip>
          </div>

          <JsonConfig :config-data="configData" :config-data-csv="configDataCsv" :save-format="saveFormat" @imported="handleImportedConfig" @import-error="onImportError" />

          <VSlider v-model="settings.SEAT_SIZE" :min="5" :max="20" :step="1" label="Tamaño de asiento" thumb-label density="compact" class="mb-1" />
          <VSlider v-model="settings.SEATS_DISTANCE" :min="2" :max="8" :step="1" label="Distancia entre asientos" thumb-label density="compact" class="mb-1" />
          <VSlider v-model="settings.SECTION_TOP_PADDING" :min="0" :max="160" :step="5" label="Padding superior sección" thumb-label density="compact" class="mb-0" />
        </VCard>

        <!-- Lista de Secciones -->
        <div class="text-subtitle-2 mb-2">Secciones</div>
        <div v-for="(section, sIdx) in sections" :key="`section-${sIdx}`">
          <VCard variant="outlined" class="mb-2">
            <div class="d-flex align-center pa-2">
              <VBtn icon size="x-small" class="mr-1" id="btn-audid-section-toggle" @click="toggleSection(sIdx)">
                <VIcon size="x-small">{{ openSections[sIdx] ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</VIcon>
              </VBtn>
              <VTextField id="tf-audid-section-name" v-model="section.name" density="compact" variant="solo" hide-details :style="mobile ? 'max-width: 120px' : 'max-width: 140px'" />
              <VChip v-if="section.isLabel" size="x-small" color="secondary" class="ml-1 ml-md-2">Etiqueta</VChip>
              <VSpacer />
              <VBtn icon size="x-small" color="error" id="btn-audid-section-remove" @click="removeSection(sIdx)">
                <VIcon size="x-small">mdi-delete</VIcon>
              </VBtn>
            </div>

            <VCardText v-if="openSections[sIdx] && !section.isLabel" class="pa-2 pt-0">
              <VRow density="comfortable" class="mb-2">
                <VCol cols="6">
                  <VBtn :size="xs ? 'x-small' : mobile ? 'small' : undefined" block color="secondary" id="btn-audid-subsection-add" @click="addSubsection(sIdx, false)">
                    <VIcon :start="smAndUp" size="small">mdi-plus</VIcon>
                    <span :class="{ 'd-none d-sm-inline': xs }">Agregar subsección</span>
                  </VBtn>
                </VCol>
                <VCol cols="6">
                  <VBtn :size="xs ? 'x-small' : mobile ? 'small' : undefined" block color="accent" id="btn-audid-subsection-add-label" @click="addSubsection(sIdx, true)">
                    <VIcon :start="smAndUp" size="small">mdi-label-outline</VIcon>
                    <span :class="{ 'd-none d-sm-inline': xs }">Agregar área</span>
                  </VBtn>
                </VCol>
              </VRow>

              <!-- Subsecciones -->
              <VCard v-for="(sub, subIdx) in section.subsections" :key="`sub-${subIdx}`" variant="outlined" class="mb-2" :class="mobile ? 'pa-1' : 'pa-2'">
                <div class="d-flex align-center mb-2">
                  <VTextField id="tf-audid-sub-name" v-model="sub.name" :label="sub.isLabel ? 'Nombre área' : 'Nombre subsección'" density="compact" hide-details :style="mobile ? 'font-size: 14px' : ''" />
                  <VChip v-if="sub.isLabel" size="x-small" color="accent" class="ml-1 ml-md-2">Área</VChip>
                </div>

                <!-- Ancho de área (solo para etiquetas) -->
                <VSlider v-if="sub.isLabel" v-model="sub.width" :min="50" :max="300" :step="10" label="Ancho del área" thumb-label density="compact" hide-details class="mb-2" />

                <template v-if="!sub.isLabel">
                  <!-- Definir filas y columnas -->
                  <VRow density="comfortable" class="mb-2">
                    <VCol cols="4" sm="3">
                      <VTextField id="tf-audid-sub-rows" v-model.number="sub.tempRows" label="Filas" type="text" density="compact" hide-details />
                    </VCol>
                    <VCol cols="4" sm="3">
                      <VTextField id="tf-audid-sub-cols" v-model.number="sub.tempCols" label="Columnas" type="text" density="compact" hide-details />
                    </VCol>
                    <VCol cols="4" sm="2">
                      <VBtn :size="xs ? 'x-small' : 'small'" color="primary" id="btn-audid-sub-grid" @click="setSubsectionGrid(sIdx, subIdx)">Set</VBtn>
                    </VCol>
                  </VRow>

                  <!-- Agregar asiento individual por fila -->
                  <VDivider class="my-2" />
                  <div class="text-caption mb-1">Agregar asiento individual:</div>
                  <VRow density="comfortable">
                    <VCol cols="12" sm="6">
                      <VSelect id="sel-audid-sub-row" v-model="selectedRow[`${sIdx}-${subIdx}`]" :items="getRowOptions(sub)" label="Seleccionar fila" density="compact" hide-details />
                    </VCol>
                    <VCol cols="12" sm="6" class="d-flex" style="gap: 4px">
                      <VBtn size="x-small" color="primary" block :disabled="!isRowSelected(sIdx, subIdx)" id="btn-audid-seat-left" @click="addSeatToRow(sIdx, subIdx, 'left')">
                        <VIcon size="x-small">mdi-arrow-left-circle</VIcon>
                        <span class="ml-1">Izq</span>
                      </VBtn>
                      <VBtn size="x-small" color="primary" block :disabled="!isRowSelected(sIdx, subIdx)" id="btn-audid-seat-right" @click="addSeatToRow(sIdx, subIdx, 'right')">
                        <VIcon size="x-small">mdi-arrow-right-circle</VIcon>
                        <span class="ml-1">Der</span>
                      </VBtn>
                    </VCol>
                  </VRow>

                  <VDivider class="my-2" />
                </template>

                <div class="d-flex gap-2">
                  <VSpacer />
                  <VBtn icon size="x-small" color="error" id="btn-audid-sub-remove" @click="removeSubsection(sIdx, subIdx)">
                    <VIcon size="x-small">mdi-delete</VIcon>
                  </VBtn>
                </div>
              </VCard>
            </VCardText>
          </VCard>
        </div>
      </VCol>
    </VRow>

    <!-- Debug info (hidden by default) -->
    <div v-if="false">{{ configData }}</div>
  </VContainer>
</template>

<script setup lang="ts">
import { STAGE_CATEGORIES } from "~/constants/auditorium"
import { useNotifyStore } from "~/composables/useNotify"
import { withNotify } from "~/repositories/factory/withNotify"

definePageMeta({
  title: "Editor Auditorio",
  icon: "mdi-seat-outline",
  middleware: "authenticated",
})

const DEFAULT_SETTINGS = {
  SEAT_SIZE: 12,
  SEATS_DISTANCE: 8,
  SUBSECTION_SPACING: 30,
  SECTIONS_MARGIN: 10,
  SECTION_TOP_PADDING: 80,
  SECTION_SIDE_PADDING: 20,
  SECTION_BOTTOM_PADDING: 20,
}

interface Seat {
  id: string
  row: number
  col: number
  category?: string | null
}

interface Subsection {
  id: string
  name: string
  isLabel: boolean
  width?: number
  tempRows?: number
  tempCols?: number
  seats?: (Seat | null)[][]
}

interface Section {
  id: string
  name: string
  isLabel: boolean
  subsections: Subsection[]
}

const route = useRoute()
const { Auditorium } = useRepository()
const notify = useNotifyStore()
const { xs, smAndUp, mdAndUp, mobile } = useDisplay()

const auditorium = ref<Record<string, unknown>>({})
const stageConfig = ref({ width: 900, height: 700 })
const stageCategories = STAGE_CATEGORIES
const sections = ref<Section[]>([])
const selectedRow = ref<Record<string, number>>({})
const settings = ref({ ...DEFAULT_SETTINGS })
// 'csv' | 'json' — toggle to switch between flat CSV and nested JSON persistence
const saveFormat = ref<'csv' | 'json'>('csv')
const saving = ref(false)
const openSections = ref<Record<number, boolean>>({})

// Top-level await — loads auditorium before render (asyncData equivalent)
const id = route.params.id as string
const loaded = (await Auditorium.show(id).catch(() => ({}))) as Record<string, unknown>
auditorium.value = loaded
loadConfiguration()

if (auditorium.value.name) {
  route.meta.title = `Editor Auditorio: ${auditorium.value.name}`
  route.meta.icon = "mdi-seat-outline"
  route.meta.back = "/auditorium"
  route.meta.showDrawer = false
}

onMounted(() => {
  updateStageSize()
  window.addEventListener("resize", updateStageSize)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateStageSize)
})

function updateStageSize() {
  // Ajustar el tamaño del canvas según el viewport
  const width = window.innerWidth
  if (width < 600) {
    // Mobile - restar padding del container (pa-2 = 8px * 2) + padding del sheet (pa-2 = 8px * 2)
    stageConfig.value.width = Math.max(width - 48, 280)
    stageConfig.value.height = 450
  } else if (width < 960) {
    // Tablet
    stageConfig.value.width = Math.min(width - 64, 700)
    stageConfig.value.height = 600
  } else {
    // Desktop
    stageConfig.value.width = 900
    stageConfig.value.height = 700
  }
}

function toggleSection(sIdx: number) {
  const next = !openSections.value[sIdx]
  openSections.value = { [sIdx]: next }
}

const configData = computed<Record<string, unknown>>(() => {
  // Return a cleaned copy so transient values like category="Ninguno" are not persisted
  const cleaned = JSON.parse(
    JSON.stringify({
      sections: sections.value,
    })
  ) as { sections: Section[] }

  if (Array.isArray(cleaned.sections)) {
    const mappedSections = cleaned.sections.map((section) => {
      const s: Record<string, unknown> = {
        i: section.id,
        n: section.name,
        l: section.isLabel ? 1 : 0,
        ss: [],
      }

      if (Array.isArray(section.subsections)) {
        s.ss = section.subsections.map((sub) => {
          const ss: Record<string, unknown> = {
            i: sub.id,
            n: sub.name,
            l: sub.isLabel ? 1 : 0,
            tr: sub.tempRows,
            tc: sub.tempCols,
          }
          if (sub.isLabel) {
            ss.w = sub.width
          } else if (Array.isArray(sub.seats)) {
            ss.s = sub.seats.map((row) => {
              return row.map((seat) => {
                if (!seat) return null
                const rs: Record<string, unknown> = {
                  i: seat.id,
                  r: seat.row,
                  c: seat.col,
                }
                if (seat.category && seat.category !== "Ninguno") {
                  rs.k = seat.category
                }
                return rs
              })
            })
          }
          return ss
        })
      }
      return s
    })
    return { s: mappedSections }
  }

  return cleaned
})

/**
 * Hierarchical CSV representation of the auditorium configuration.
 *
 * Format (rows separated by '|'):
 *   csv_format              – single header token
 *   s,{name}                – section (no id/level columns needed)
 *   ss,{name},{tr},{tc}     – subsection with grid dimensions
 *   z,{id},{r},{c},{k}      – seat (z = seat row; belongs to last ss)
 *
 * Sections with isLabel flag use:  s,{name},1
 * Subsections with isLabel use:    ss,{name},,,1
 */
const configDataCsv = computed(() => {
  const csvEscape = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    if (s.includes(',') || s.includes('"') || s.includes('|')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }

  const rows: string[] = ['csv_format']

  sections.value.forEach((section) => {
    // s,name  or  s,name,1  when isLabel
    const sRow = ['s', csvEscape(section.name)]
    if (section.isLabel) sRow.push('1')
    rows.push(sRow.join(','))

    if (Array.isArray(section.subsections)) {
      section.subsections.forEach((sub) => {
        if (sub.isLabel) {
          // ss,name,,,1
          rows.push(['ss', csvEscape(sub.name), '', '', '1'].join(','))
        } else {
          // ss,name,tr,tc
          const tr = sub.tempRows !== undefined ? sub.tempRows : ''
          const tc = sub.tempCols !== undefined ? sub.tempCols : ''
          rows.push(['ss', csvEscape(sub.name), csvEscape(tr), csvEscape(tc)].join(','))

          if (Array.isArray(sub.seats)) {
            sub.seats.forEach((row) => {
              row.forEach((seat) => {
                if (!seat) return
                const cat = seat.category && seat.category !== 'Ninguno' ? seat.category : ''
                // z,id,r,c[,k]  — k omitted when empty to save space
                const zRow = ['z', csvEscape(seat.id), csvEscape(seat.row), csvEscape(seat.col)]
                if (cat) zRow.push(csvEscape(cat))
                rows.push(zRow.join(','))
              })
            })
          }
        }
      })
    }
  })

  return rows.join('|')
})

/**
 * Returns true when the raw config value is a CSV string (starts with our header).
 * Supports both the legacy 'type,id,name,...' header and the new 'csv_format' header.
 */
function _isCsvConfig(raw: unknown): boolean {
  if (typeof raw !== 'string') return false
  const trimmed = raw.trimStart()
  return trimmed.startsWith('csv_format') || trimmed.startsWith('type,id,name,')
}

/**
 * Parse a hierarchical CSV config string back into the internal `sections` array.
 *
 * New format (rows separated by '|'):
 *   csv_format                    – header
 *   s,{name}[,1]                  – section  (,1 = isLabel)
 *   ss,{name},{tr},{tc}[,1]       – subsection (,1 = isLabel)
 *   z,{id},{r},{c}[,{k}]          – seat
 *
 * Legacy format (still supported):
 *   type,id,name,level,parent,tr,tc,r,c,k  – header
 *   s / ss / seat rows
 */
function _parseCsvConfig(csvString: string): Section[] {
  const lines = csvString.split('|').map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const parseCsvLine = (line: string) => {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else { inQuotes = !inQuotes }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current); current = ''
      } else {
        current += ch
      }
    }
    fields.push(current)
    return fields
  }

  const isNewFormat = lines[0].trim() === 'csv_format'

  // ── Legacy format path ──────────────────────────────────────────────
  if (!isNewFormat) {
    const header = lines[0].split(',')
    const idx: Record<string, number> = {}
    header.forEach((h, i) => { idx[h.trim()] = i })

    const sections: Section[] = []
    let currentSection: Section | null = null
    let currentSub: Subsection | null = null

    for (let li = 1; li < lines.length; li++) {
      const f = parseCsvLine(lines[li])
      const type = f[idx.type] || ''
      const id = f[idx.id] || ''
      const name = f[idx.name] || ''
      const level = parseInt(f[idx.level] || '0', 10)
      const tr = f[idx.tr] !== '' && f[idx.tr] !== undefined ? parseInt(f[idx.tr], 10) : undefined
      const tc = f[idx.tc] !== '' && f[idx.tc] !== undefined ? parseInt(f[idx.tc], 10) : undefined
      const r = f[idx.r] !== '' && f[idx.r] !== undefined ? parseInt(f[idx.r], 10) : undefined
      const c = f[idx.c] !== '' && f[idx.c] !== undefined ? parseInt(f[idx.c], 10) : undefined
      const k = (f[idx.k] || '').trim()

      if (type === 's') {
        currentSection = { id, name, isLabel: level === 1, subsections: [] }
        currentSub = null
        sections.push(currentSection)
      } else if (type === 'ss' && currentSection) {
        currentSub = { id, name, isLabel: level === 1 }
        if (currentSub.isLabel) { currentSub.width = 100 }
        else { currentSub.tempRows = tr; currentSub.tempCols = tc; currentSub.seats = [] }
        currentSection.subsections.push(currentSub)
      } else if (type === 'seat' && currentSub && !currentSub.isLabel) {
        const seatRow = r ?? 0
        while (currentSub.seats!.length <= seatRow) { currentSub.seats!.push([]) }
        const seat: Seat = { id, row: seatRow, col: c ?? 0 }
        if (k) seat.category = k
        currentSub.seats![seatRow].push(seat)
      }
    }
    return sections
  }

  // ── New hierarchical format path ─────────────────────────────────────
  const sections: Section[] = []
  let currentSection: Section | null = null
  let currentSub: Subsection | null = null
  let sectionCounter = 0
  let subCounter = 0

  for (let li = 1; li < lines.length; li++) {
    const f = parseCsvLine(lines[li])
    const type = f[0] || ''

    if (type === 's') {
      // s,name[,1]
      sectionCounter++
      subCounter = 0
      const name = f[1] || ''
      const isLabel = f[2] === '1'
      currentSection = { id: String(sectionCounter), name, isLabel, subsections: [] }
      currentSub = null
      sections.push(currentSection)
    } else if (type === 'ss' && currentSection) {
      // ss,name,tr,tc[,1]
      subCounter++
      const name = f[1] || ''
      const tr = f[2] !== '' && f[2] !== undefined ? parseInt(f[2], 10) : undefined
      const tc = f[3] !== '' && f[3] !== undefined ? parseInt(f[3], 10) : undefined
      const isLabel = f[4] === '1'
      const subId = `${currentSection.id}-${subCounter}`
      currentSub = { id: subId, name, isLabel }
      if (isLabel) {
        currentSub.width = 100
      } else {
        currentSub.tempRows = tr
        currentSub.tempCols = tc
        currentSub.seats = []
      }
      currentSection.subsections.push(currentSub)
    } else if (type === 'z' && currentSub && !currentSub.isLabel) {
      // z,id,r,c[,k]
      const id = f[1] || ''
      const r = f[2] !== '' && f[2] !== undefined ? parseInt(f[2], 10) : 0
      const c = f[3] !== '' && f[3] !== undefined ? parseInt(f[3], 10) : 0
      const k = (f[4] || '').trim()
      while (currentSub.seats!.length <= r) { currentSub.seats!.push([]) }
      const seat: Seat = { id, row: r, col: c }
      if (k) seat.category = k
      currentSub.seats![r].push(seat)
    }
  }

  return sections
}

function loadConfiguration() {
  if (!auditorium.value?.config) {
    notify.notify({ error: 'No se encontró configuración para cargar' })
    return
  }

  const raw = auditorium.value.config

  // ── CSV path ──────────────────────────────────────────────────────────
  if (_isCsvConfig(raw)) {
    saveFormat.value = 'csv'
    sections.value = _parseCsvConfig(raw as string)
    return
  }

  // ── JSON path ─────────────────────────────────────────────────────────
  saveFormat.value = 'json'
  let config = raw as Record<string, unknown>
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config) as Record<string, unknown>
    } catch (e) {
      notify.notify({ error: 'Error parsing config' })
      return
    }
  }

  if (config.s || config.sections) {
    const rawSections = (config.s || config.sections) as unknown
    if (rawSections) {
      sections.value = (rawSections as Record<string, unknown>[]).map((section, sIdx) => {
        const s: Section = {
          id: (section.i as string) || (section.id as string) || `${sIdx + 1}`,
          name: (section.n as string) || (section.name as string),
          isLabel: !!(section.l || section.isLabel),
          subsections: [],
        }

        const rawSubs = section.ss || section.subsections
        if (rawSubs) {
          s.subsections = (rawSubs as Record<string, unknown>[]).map((sub, subIdx) => {
            const ss: Subsection = {
              id: (sub.i as string) || (sub.id as string) || `${s.id}-${subIdx + 1}`,
              name: (sub.n as string) || (sub.name as string),
              isLabel: !!(sub.l || sub.isLabel),
            }
            if (ss.isLabel) {
              ss.width = (sub.w as number) || (sub.width as number)
            } else {
              ss.tempRows = (sub.tr as number) || (sub.tempRows as number)
              ss.tempCols = (sub.tc as number) || (sub.tempCols as number)
              const rawSeats = sub.s || sub.seats
              if (rawSeats) {
                ss.seats = (rawSeats as (Record<string, unknown> | null)[][]).map((row, rowIdx) => {
                  return row.map((seat, colIdx) => {
                    if (!seat) return null
                    return {
                      id: (seat.i as string) || (seat.id as string) || `${ss.id}-${rowIdx + 1}-${colIdx + 1}`,
                      row: seat.r !== undefined ? (seat.r as number) : (seat.row as number),
                      col: seat.c !== undefined ? (seat.c as number) : (seat.col as number),
                      category: (seat.k as string) || (seat.category as string),
                    }
                  })
                })
              }
            }
            return ss
          })
        }
        return s
      })
    }
  }
}

async function saveAuditorium() {
  if (saving.value) return
  try {
    // Verify subsection IDs before saving
    verifySubsectionIds()

    let configString: string
    if (saveFormat.value === 'csv') {
      // Store as plain flat CSV string
      configString = configDataCsv.value
    } else {
      // Store as compact nested JSON string
      configString = JSON.stringify(configData.value)
    }

    auditorium.value.config = configString
    const payload: Record<string, unknown> = {
      ...auditorium.value,
      name: auditorium.value.name,
      org_id: (auditorium.value.org_id as Record<string, unknown>)?.id ?? auditorium.value.org_id,
      config: configString,
    }
    saving.value = true
    await withNotify(Auditorium.update(auditorium.value.id as number, payload))
    notify.notify({ success: "Configuración guardada" })
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

function verifySubsectionIds() {
  let configModified = false

  sections.value.forEach((section, sIdx) => {
    const expectedSectionId = `${sIdx + 1}`
    if (section.id !== expectedSectionId) {
      section.id = expectedSectionId
      configModified = true
    }

    if (section.subsections) {
      section.subsections.forEach((sub, subIdx) => {
        const expectedSubId = `${section.id}-${subIdx + 1}`
        if (sub.id !== expectedSubId) {
          sub.id = expectedSubId
          configModified = true
        }

        // Also verify seat IDs if they exist
        if (sub.seats && Array.isArray(sub.seats)) {
          sub.seats.forEach((row, rowIdx) => {
            if (Array.isArray(row)) {
              row.forEach((seat, colIdx) => {
                if (seat) {
                  const expectedSeatId = `${section.id}-${subIdx + 1}-${rowIdx + 1}-${colIdx + 1}`
                  if (seat.id !== expectedSeatId) {
                    seat.id = expectedSeatId
                    seat.row = rowIdx
                    seat.col = colIdx
                    configModified = true
                  }
                }
              })
            }
          })
        }
      })
    }
  })

  if (configModified) {
    // Update the auditorium config to reflect the changes
    auditorium.value.config = configData.value
  }

  return configModified
}

// ============ OPERACIONES DE SECCIÓN ============
function addSection(isLabel: boolean) {
  const sectionIdx = sections.value.length
  const sectionId = `${sectionIdx + 1}`
  const section: Section = {
    id: sectionId,
    name: `${isLabel ? "Etiqueta" : "Sección"} ${sectionIdx + 1}`,
    isLabel,
    subsections: [],
  }
  if (!isLabel) {
    section.subsections.push(createSubsection("Subsección 1", false, 4, 4, sectionIdx, 0, sectionId))
  }
  sections.value.push(section)
  openSections.value[sectionIdx] = true
}

function removeSection(sIdx: number) {
  sections.value.splice(sIdx, 1)
  openSections.value = {}
}

function addSubsection(sIdx: number, isLabel: boolean) {
  const section = sections.value[sIdx]
  const subIdx = section.subsections.length
  const name = `${isLabel ? "Área" : "Subsección"} ${subIdx + 1}`
  section.subsections.push(createSubsection(name, isLabel, 3, 5, sIdx, subIdx, section.id))
}

function removeSubsection(sIdx: number, subIdx: number) {
  sections.value[sIdx].subsections.splice(subIdx, 1)
}

function createSubsection(name: string, isLabel: boolean, rows = 3, cols = 5, sectionIdx: number | string = "", subIdx: number | string = "", sectionId = ""): Subsection {
  const subId = `${sectionId}-${Number(subIdx) + 1}`
  const sub: Subsection = { id: subId, name, isLabel, seats: [] }
  if (isLabel) {
    sub.width = 100
  } else {
    sub.seats = createSeatsGrid(rows, cols, sectionIdx, subIdx, sectionId)
    sub.tempRows = rows
    sub.tempCols = cols
  }
  return sub
}

function setSubsectionGrid(sIdx: number, subIdx: number) {
  const section = sections.value[sIdx]
  const sub = section.subsections[subIdx]
  const rows = Math.max(1, Math.min(20, parseInt(String(sub.tempRows)) || 3))
  const cols = Math.max(1, Math.min(30, parseInt(String(sub.tempCols)) || 5))
  sub.seats = createSeatsGrid(rows, cols, sIdx, subIdx, section.id)
}

function clearAllSeatStates() {
  if (!Array.isArray(sections.value)) return
  sections.value.forEach((section) => {
    if (!Array.isArray(section.subsections)) return
    section.subsections.forEach((sub) => {
      if (!Array.isArray(sub.seats)) return
      sub.seats.forEach((row) => {
        if (!Array.isArray(row)) return
        row.forEach((seat) => {
          if (seat && "category" in seat) {
            delete seat.category
          }
        })
      })
    })
  })
  notify.notify({ success: "Categorías eliminadas" })
}

function getRowOptions(sub: Subsection) {
  return (sub.seats ?? []).map((_, idx) => ({
    title: `Fila ${idx + 1}`,
    value: idx,
  }))
}

function isRowSelected(sIdx: number, subIdx: number): boolean {
  const key = `${sIdx}-${subIdx}`
  return selectedRow.value[key] !== undefined && selectedRow.value[key] !== null
}

function addSeatToRow(sIdx: number, subIdx: number, side: 'left' | 'right') {
  const section = sections.value[sIdx]
  const sub = section.subsections[subIdx]
  const selectedRowIdx = selectedRow.value[`${sIdx}-${subIdx}`]
  if (!isRowSelected(sIdx, subIdx)) return
  const row = sub.seats?.[selectedRowIdx]
  if (!row) return
  if (side === "left") {
    row.unshift(createSeat(0, selectedRowIdx, sIdx, subIdx, section.id))
  } else {
    row.push(createSeat(row.length, selectedRowIdx, sIdx, subIdx, section.id))
  }
}

// ============ CREACIÓN DE ASIENTOS ============
function createSeatsGrid(rows: number, cols: number, sectionIdx: number | string, subIdx: number | string, sectionId = ""): (Seat | null)[][] {
  return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => createSeat(c, r, sectionIdx, subIdx, sectionId)))
}

function createSeat(col: number, row: number, sectionIdx: number | string = "", subIdx: number | string = "", sectionId = ""): Seat {
  // sectionId: 'section-1', subIdx: 0, row: 0, col: 0 => 'section-1-1-1-1'
  return {
    id: `${sectionId}-${Number(subIdx) + 1}-${row + 1}-${col + 1}`,
    row,
    col,
  }
}

// Handle configuration object/string emitted by JsonConfig component
function handleImportedConfig(config: unknown) {
  try {
    // CSV string import path
    if (typeof config === 'string' && _isCsvConfig(config)) {
      auditorium.value.config = config
      loadConfiguration()
      notify.notify({ success: 'Configuración CSV importada' })
      return
    }

    // JSON object import path
    const parsed = config as Record<string, unknown> | null
    if (!parsed || (!parsed.s && !parsed.sections)) {
      alert('Archivo inválido: falta estructura requerida')
      return
    }

    auditorium.value.config = config
    loadConfiguration()
    notify.notify({ success: 'Configuración JSON importada' })
  } catch (error) {
    alert('Error al importar: ' + (error as Error).message)
  }
}

function onImportError() {
  notify.notify({ error: 'Error al importar configuración' })
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

/* Mejoras para mobile */
@media (max-width: 600px) {
  :deep(.v-slider) {
    margin-top: 8px;
  }

  :deep(.v-card) {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;
  }
}

/* Asegurar que los botones tengan buen tamaño táctil en mobile */
@media (max-width: 960px) {
  :deep(.v-btn) {
    min-height: 36px;
  }

  :deep(.v-icon) {
    font-size: 20px;
  }
}
</style>
