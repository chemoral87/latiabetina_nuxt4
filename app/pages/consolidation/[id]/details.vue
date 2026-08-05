<template>
  <VContainer fluid>
    <VRow dense>
      <VCol v-if="sheet.id" cols="12">
        <VCard id="con-detai-card-1" variant="outlined" class="mb-3">
          <VCardTitle class="text-subtitle-1 font-weight-bold d-flex align-center">
            <VIcon start>mdi-clipboard-list</VIcon>
            Consolidado #{{ sheet.folio_number }}
            <VSpacer />
            <VBtn id="cnsld-save-sheet-btn" color="primary" size="small" :loading="savingSheet" :disabled="!isDirty || savingSheet" @click="saveSheet">
              <VIcon start size="small">mdi-content-save</VIcon>
              Guardar
            </VBtn>
          </VCardTitle>
          <VCardText>
            <VRow dense align="center">
              <VCol cols="12" md="2">
                <div class="d-flex align-center">
                  <VIcon size="small" class="mr-1">mdi-calendar</VIcon>
                  <span class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                    Fecha: {{ (formatShortDateDash(sheet.date as string | null)).toUpperCase() }}
                  </span>
                </div>
              </VCol>
              <VCol cols="12" md="2">
                <div class="d-flex align-center">
                  <VIcon size="small" class="mr-1">mdi-office-building</VIcon>
                  <span class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                    Org: {{ (sheet.organization as Record<string, unknown> | undefined)?.name || 'N/A' }}
                  </span>
                </div>
              </VCol>
              <VCol cols="12" md="2">
                <div class="d-flex align-center">
                  <VIcon size="small" class="mr-1">mdi-account-plus</VIcon>
                  <span class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                    Creador: {{ (sheet.creator as Record<string, unknown> | undefined)?.name || 'N/A' }}
                  </span>
                </div>
              </VCol>
              <VCol cols="12" md="2">
                <VTextField
                  id="tf-conso-detai-sheet-how_did_you_hear-1"
                  v-model="sheet.how_did_you_hear"
                  label="¿Cómo se enteró?"
                  density="compact"
                  hide-details
                  variant="outlined"
                  prepend-inner-icon="mdi-bullhorn"
                  :disabled="savingSheet"
                />
              </VCol>
              <VCol cols="12" md="2">
                <VAutocomplete
                  id="det-consolidator-ac"
                  v-model="sheet.consolidator_id"
                  :items="users"
                  item-title="name"
                  item-value="id"
                  variant="outlined"
                  label="Consolidador"
                  clearable
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-account-tie"
                  :disabled="savingSheet"
                />
              </VCol>
              <VCol cols="12" md="2">
                <VSelect
                  id="det-first-church-sel"
                  v-model="sheet.first_time_christian_church"
                  :items="[{ title: 'SI', value: true }, { title: 'NO', value: false }]"
                  label="¿Primera vez en iglesia cristiana?"
                  variant="outlined"
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-help-circle-outline"
                  :disabled="savingSheet"
                />
              </VCol>

              <VCol cols="12" class="mt-2">
                <VDivider />
              </VCol>

              <VCol cols="12" md="6" class="mt-1">
                <VTextarea
                  id="det-comments-ta"
                  v-model="sheet.comments"
                  label="Comentarios"
                  variant="outlined"
                  rows="2"
                  auto-grow
                  density="compact"
                  hide-details
                  prepend-inner-icon="mdi-comment-text-outline"
                  :disabled="savingSheet"
                />
              </VCol>
              <VCol cols="12" md="6" class="mt-1">
                <VTextarea
                  id="det-special-request-ta"
                  v-model="sheet.special_request"
                  label="Petición especial"
                  rows="2"
                  auto-grow
                  variant="outlined"
                  hide-details
                  prepend-inner-icon="mdi-heart-outline"
                  :disabled="savingSheet"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4">
        <VTextField
          id="con-detai-filterterm-tf-2"
          v-model="filterTerm"
          append-inner-icon="mdi-magnify"
          clearable
          hide-details
          placeholder="Filtro"
          density="compact"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VBtn id="cnsld-new-member-btn" color="primary" class="mr-1" @click="newMember">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Miembro
        </VBtn>
        <VBtn id="cnsld-refresh-btn" color="primary" :loading="loading" @click="fetchMembers">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>

      <VCol cols="12">
        <ConsolidationMemberTable :members="filteredMembers" :loading="loading" @edit="editMember" @delete="deleteMemberPrompt" />
      </VCol>
    </VRow>

    <ConsolidationMemberDialog v-if="dialog" :member="member" :loading="saving" @close="closeDialog" @save="saveMember" />

    <DialogDelete v-if="dialogDelete" :dialog="deleteData" :loading="deleting" @ok="confirmDelete" @close="dialogDelete = false" />

    <DialogConfirm
      v-if="showConfirmDialog"
      title="Cambios sin guardar"
      message="Hay cambios sin guardar. ¿Desea guardarlos antes de salir?"
      @yes="confirmSave"
      @no="confirmDiscard"
      @cancel="confirmAbort"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { onBeforeRouteLeave } from "vue-router"
import { formatShortDateDash } from "~/utils/date"

definePageMeta({
  title: "Detalles de Consolidado",
  icon: "mdi-clipboard-list",
  middleware: "authenticated",
})

const route = useRoute()
const { ConsoSheet, ChurchMember } = useRepository()
const notify = useNotifyStore()

const sheetId = computed(() => route.params.id as string)

const filterTerm = ref("")
const loading = ref(false)
const saving = ref(false)
const savingSheet = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const dialogDelete = ref(false)
const sheet = ref<Record<string, unknown>>({})
const originalSheet = ref<Record<string, unknown>>({})
const member = ref<Record<string, unknown>>({})
const deleteData = ref<Record<string, unknown>>({})
const members = ref<unknown[]>([])
const users = ref<{ id: number | string; name: string }[]>([])
const showConfirmDialog = ref(false)
let resolveNext: ((val?: unknown) => void) | null = null

// Initial load (asyncData equivalent)
{
  const [sheetData, dataMembers] = await Promise.all([
    ConsoSheet.show<Record<string, unknown>>(sheetId.value).catch(() => ({} as Record<string, unknown>)),
    ChurchMember.index<unknown>({ conso_sheet_id: sheetId.value }).catch(() => [] as unknown),
  ])
  sheet.value = sheetData as Record<string, unknown>
  originalSheet.value = JSON.parse(JSON.stringify(sheet.value))
  members.value = Array.isArray(dataMembers) ? dataMembers : (dataMembers as { data?: unknown[] })?.data || []
}

onMounted(() => {
  route.meta.back = "/consolidation"
  route.meta.showDrawer = false
})

onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value) {
    showConfirmDialog.value = true
    resolveNext = next as unknown as (val?: unknown) => void
  } else {
    next()
  }
})

const isDirty = computed(() => JSON.stringify(sheet.value) !== JSON.stringify(originalSheet.value))

const filteredMembers = computed(() => {
  if (!filterTerm.value) return members.value
  const term = filterTerm.value.toLowerCase()
  return members.value.filter((m) => {
    const memberData = m as Record<string, unknown>
    return (
      (memberData.name && String(memberData.name).toLowerCase().includes(term)) ||
      (memberData.last_name && String(memberData.last_name).toLowerCase().includes(term)) ||
      (memberData.cellphone && String(memberData.cellphone).toLowerCase().includes(term))
    )
  })
})

// ── Sheet ─────────────────────────────────────────────────────────────

async function fetchSheet() {
  try {
    sheet.value = await ConsoSheet.show<Record<string, unknown>>(sheetId.value)
  } catch (error) {
    notify.notify({ error: "Error al cargar el consolidado" })
  }
}

async function saveSheet() {
  try {
    savingSheet.value = true
    await ConsoSheet.update(sheetId.value, sheet.value)
    originalSheet.value = JSON.parse(JSON.stringify(sheet.value))
    notify.notify({ success: "Consolidado actualizado exitosamente" })
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al guardar consolidado" })
  } finally {
    savingSheet.value = false
  }
}

// ── Members ───────────────────────────────────────────────────────────

async function fetchMembers() {
  try {
    loading.value = true
    const data = await ChurchMember.index<unknown>({ conso_sheet_id: sheetId.value })
    members.value = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data || []
  } catch (error) {
    notify.notify({ error: "Error al cargar los miembros" })
  } finally {
    loading.value = false
  }
}

function newMember() {
  member.value = { conso_sheet_id: sheetId.value }
  dialog.value = true
}

function editMember(item: unknown) {
  member.value = { ...(item as Record<string, unknown>) }
  dialog.value = true
}

function deleteMemberPrompt(item: unknown) {
  const m = item as Record<string, unknown>
  deleteData.value = {
    text: "¿Desea eliminar al miembro ",
    strong: `${m.name} ${m.last_name}`,
    payload: item,
  }
  dialogDelete.value = true
}

async function confirmDelete(item: unknown) {
  const m = item as Record<string, unknown>
  try {
    deleting.value = true
    await ChurchMember.delete(m.id as number)
    await fetchMembers()
    dialogDelete.value = false
    notify.notify({ success: "Miembro eliminado exitosamente" })
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al eliminar miembro" })
  } finally {
    deleting.value = false
  }
}

async function saveMember(item: Record<string, unknown>) {
  try {
    saving.value = true
    const isUpdate = Boolean(item.id)
    if (isUpdate) {
      await ChurchMember.update(item.id as number, item)
    } else {
      await ChurchMember.create(item)
    }
    notify.notify({ success: `Miembro ${isUpdate ? "actualizado" : "creado"} exitosamente` })
    await fetchMembers()
    dialog.value = false
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} miembro` })
  } finally {
    saving.value = false
  }
}

function closeDialog() {
  dialog.value = false
  member.value = {}
}

// ── Dirty-check confirm ───────────────────────────────────────────────

async function confirmSave() {
  await saveSheet()
  showConfirmDialog.value = false
  if (resolveNext) {
    if (!isDirty.value) {
      resolveNext()
    } else {
      resolveNext(false)
    }
    resolveNext = null
  }
}

function confirmDiscard() {
  showConfirmDialog.value = false
  if (resolveNext) {
    resolveNext()
    resolveNext = null
  }
}

function confirmAbort() {
  showConfirmDialog.value = false
  if (resolveNext) {
    resolveNext(false)
    resolveNext = null
  }
}
</script>

<style scoped></style>
