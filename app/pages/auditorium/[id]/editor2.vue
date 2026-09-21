<template>
  <VContainer :fluid="true" class="pa-2 pa-md-4">
    <VRow class="mb-2" density="compact">
      <VCol cols="12">
        <div class="d-flex align-center justify-space-between">
          <span v-if="auditorium && auditorium.name" class="text-h6 text-md-h5">
            {{ auditorium.name }}
          </span>
          <VBtn
            id="ae2-save-btn"
            color="primary"
            :loading="saving"
            :disabled="saving"
            variant="elevated"
            :size="mobile ? 'small' : undefined"
            @click="saveAuditorium"
          >
            <VIcon :start="!mobile">mdi-content-save</VIcon>
            <span v-if="!mobile">Guardar</span>
          </VBtn>
        </div>
      </VCol>
    </VRow>

    <VRow density="compact">
      <VCol :md="9" cols="12" :order="mdAndUp ? 2 : 1">
        <ClientOnly>
          <AuditoriumEditor2Canvas
            :config="config"
            :stage-config="stageConfig"
            @tag-delete="onTagDelete"
            @tag-rename="onTagRename"
            @section-edit="onSectionEdit"
          />
        </ClientOnly>
      </VCol>

      <VCol :md="3" cols="12" :order="mdAndUp ? 1 : 2">
        <AuditoriumEditor2Panel
          @add-tag="addTag"
          @add-section="addSection"
        />
      </VCol>
    </VRow>

    <AuditoriumEditor2SectionDialog
      v-model="sectionDialogOpen"
      :section="editingSection"
      @delete="requestSectionDelete"
      @duplicate="onSectionDuplicate"
    />

    <DialogDelete
      v-if="sectionDeleteDialog"
      id="ae2-section-delete-dlg"
      :dialog="sectionDeleteDialogProp"
      @ok="confirmSectionDelete"
      @close="sectionDeleteDialog = false"
    />
  </VContainer>
</template>

<script setup lang="ts">
/**
 * Auditorium Editor v2 — floating layout overview.
 * Sections and tags are freely positioned on a Konva canvas (JSON-only config).
 * Section pencil opens Editor2SectionDialog (rows/cols, categories, dup/delete).
 */
import { withNotify } from "~/repositories/factory/withNotify"
import type { FloatingLayoutConfig, FloatingSection, FloatingTag } from "~/types/auditorium"
import {
  createFloatingSection,
  createFloatingTag,
  duplicateFloatingSection,
  getFloatingSectionHeight,
  getFloatingSectionWidth,
  parseFloatingConfig,
  serializeFloatingConfig,
} from "~/utils/auditoriumFloating"

definePageMeta({
  title: "Editor Auditorio",
  icon: "mdi-seat-outline",
  middleware: "authenticated",
})

const route = useRoute()
const { Auditorium } = useRepository()
const { mdAndUp, mobile } = useDisplay()

const auditorium = ref<Record<string, unknown>>({})
const config = ref<FloatingLayoutConfig>({ v: 2, sections: [], tags: [] })
const stageConfig = ref({ width: 900, height: 700 })
const saving = ref(false)

const sectionDialogOpen = ref(false)
const editingSection = ref<FloatingSection | null>(null)
const sectionDeleteDialog = ref(false)
const sectionPendingDelete = ref<FloatingSection | null>(null)

const sectionDeleteDialogProp = computed(() => ({
  title: "Eliminar sección",
  text: "¿Eliminar la sección",
  strong: sectionPendingDelete.value?.name ?? "",
  payload: sectionPendingDelete.value,
}))

const id = route.params.id as string
const loaded = (await Auditorium.show(id).catch(() => ({}))) as Record<string, unknown>
auditorium.value = loaded

// Defense in depth: non-v2 layouts must use the classic editor
if (Number(auditorium.value.layout_version ?? 1) !== 2) {
  await navigateTo(`/auditorium/${id}/editor`, { replace: true })
} else {
  config.value = parseFloatingConfig(auditorium.value.config)

  if (auditorium.value.name) {
    route.meta.title = `Editor Auditorio: ${auditorium.value.name}`
    route.meta.icon = "mdi-seat-outline"
    route.meta.back = "/auditorium"
    route.meta.showDrawer = false
  }
}

onMounted(() => {
  updateStageSize()
  window.addEventListener("resize", updateStageSize)
})

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateStageSize)
})

function updateStageSize() {
  const width = window.innerWidth
  if (width < 600) {
    stageConfig.value.width = Math.max(width - 48, 280)
    stageConfig.value.height = 450
  } else if (width < 960) {
    stageConfig.value.width = Math.min(width - 64, 700)
    stageConfig.value.height = 600
  } else {
    stageConfig.value.width = 900
    stageConfig.value.height = 700
  }
}

/**
 * Place new items below/right of the current content bounding box so they
 * don't stack exactly on top of existing sections/tags.
 */
function nextPlacement(): { x: number; y: number } {
  const sections = config.value.sections
  const tags = config.value.tags
  if (sections.length === 0 && tags.length === 0) {
    return { x: 40, y: 40 }
  }

  let maxRight = 0
  let maxBottom = 0

  for (const s of sections) {
    maxRight = Math.max(maxRight, s.x + getFloatingSectionWidth(s))
    maxBottom = Math.max(maxBottom, s.y + getFloatingSectionHeight(s))
  }
  for (const t of tags) {
    maxRight = Math.max(maxRight, t.x + 100)
    maxBottom = Math.max(maxBottom, t.y + 40)
  }

  if (maxBottom < stageConfig.value.height * 2) {
    return { x: 40, y: maxBottom + 40 }
  }
  return { x: maxRight + 40, y: 40 }
}

function addSection() {
  const { x, y } = nextPlacement()
  const n = config.value.sections.length + 1
  config.value.sections.push(createFloatingSection(`Sección ${n}`, x, y))
}

function addTag() {
  const { x, y } = nextPlacement()
  config.value.tags.push(createFloatingTag("Etiqueta", x, y))
}

function onSectionEdit(section: FloatingSection) {
  editingSection.value = section
  sectionDialogOpen.value = true
}

function onSectionDuplicate(section: FloatingSection) {
  const { x, y } = nextPlacement()
  config.value.sections.push(duplicateFloatingSection(section, x, y))
  sectionDialogOpen.value = false
  editingSection.value = null
}

function requestSectionDelete(section: FloatingSection) {
  sectionPendingDelete.value = section
  sectionDeleteDialog.value = true
}

function confirmSectionDelete(payload?: unknown) {
  const section = (payload as FloatingSection | undefined) ?? sectionPendingDelete.value
  sectionDeleteDialog.value = false
  if (!section) return
  const idx = config.value.sections.findIndex((s) => s.id === section.id)
  if (idx >= 0) config.value.sections.splice(idx, 1)
  if (editingSection.value?.id === section.id) {
    sectionDialogOpen.value = false
    editingSection.value = null
  }
  sectionPendingDelete.value = null
}

function onTagDelete(tag: FloatingTag) {
  const idx = config.value.tags.findIndex((t) => t.id === tag.id)
  if (idx >= 0) config.value.tags.splice(idx, 1)
}

function onTagRename(_tag: FloatingTag, _text: string) {
  // Canvas mutates tag.text in place; emit kept for future listeners.
}

async function saveAuditorium() {
  if (saving.value) return
  try {
    const configString = serializeFloatingConfig(config.value)
    auditorium.value.config = configString
    const payload: Record<string, unknown> = {
      ...auditorium.value,
      name: auditorium.value.name,
      org_id:
        (auditorium.value.org_id as Record<string, unknown>)?.id ??
        auditorium.value.org_id,
      config: configString,
    }
    saving.value = true
    await withNotify(Auditorium.update(auditorium.value.id as number, payload))
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
@media (max-width: 960px) {
  :deep(.v-btn) {
    min-height: 36px;
  }
}
</style>
