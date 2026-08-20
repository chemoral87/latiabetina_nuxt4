<template>
  <VContainer fluid>
    <VRow density="comfortable">
      <VCol v-if="sheet.id" cols="12">
        <VCard id="con-detai-card-1" class="mb-3" variant="outlined">
          <VCardTitle class="text-subtitle-1 font-weight-bold d-flex align-center">
            <VIcon start>mdi-clipboard-list</VIcon>
            Consolidado #{{ sheet.folio_number }}
          </VCardTitle>
          <VCardText>
            <VRow align="center" density="comfortable">
              <VCol md="2" cols="12">
                <div class="d-flex align-center">
                  <VIcon class="mr-1" size="small">mdi-calendar</VIcon>
                  <span id="det-fecha" class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                    Fecha: {{ (formatShortDateDash(sheet.date as string | null)).toUpperCase() }}
                  </span>
                </div>
              </VCol>
              <VCol v-if="!singleOrg" md="2" cols="12">
                <div class="d-flex align-center">
                  <VIcon class="mr-1" size="small">mdi-office-building</VIcon>
                  <span id="det-org" class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                    Org: {{ (sheet.organization as Record<string, unknown> | undefined)?.name || 'N/A' }}
                  </span>
                </div>
              </VCol>
              <VCol md="2" cols="12">
                <div class="d-flex align-center">
                  <VIcon class="mr-1" size="small">mdi-account-plus</VIcon>
                  <span id="det-creador" class="text-caption font-weight-bold text-grey-darken-2 text-truncate">
                    Creador: {{ (sheet.creator as Record<string, unknown> | undefined)?.name || 'N/A' }}
                  </span>
                </div>
              </VCol>
              <VCol md="2" cols="12">
                <VTextField
                  id="tf-conso-detai-sheet-how_did_you_hear-1"
                  v-model="sheet.how_did_you_hear"
                  hide-details
                  density="compact"
                  variant="outlined"
                  :disabled="savingSheet"
                  label="¿Cómo se enteró?"
                  prepend-inner-icon="mdi-bullhorn"
                />
              </VCol>
              <VCol v-if="auth.hasPermission('conso-sheet-consolidator-select')" md="2" cols="12">
                <VAutocomplete
                  
                  id="det-consolidator-ac"
                  v-model="sheet.consolidator_id"
                  clearable
                  hide-details
                  :items="users"
                  item-value="id"
                  density="compact"
                  item-title="name"
                  variant="outlined"
                  label="Consolidador"
                  :disabled="savingSheet"
                  prepend-inner-icon="mdi-account-tie"
                />
              </VCol>
              <VCol md="2" cols="12">
                <VSelect
                  id="det-first-church-sel"
                  v-model="sheet.first_time_christian_church"
                  hide-details
                  density="compact"
                  variant="outlined"
                  :disabled="savingSheet"
                  label="¿Primera vez en iglesia cristiana?"
                  prepend-inner-icon="mdi-help-circle-outline"
                  :items="[{ title: 'SI', value: true }, { title: 'NO', value: false }]"
                />
              </VCol>

              <VCol cols="12" class="mt-2">
                <VDivider />
              </VCol>

              <VCol md="6" cols="12" class="mt-1">
                <VTextarea
                  id="det-comments-ta"
                  v-model="sheet.comments"
                  rows="2"
                  auto-grow
                  hide-details
                  density="compact"
                  variant="outlined"
                  label="Comentarios"
                  :disabled="savingSheet"
                  prepend-inner-icon="mdi-comment-text-outline"
                />
              </VCol>
              <VCol md="6" cols="12" class="mt-1">
                <VTextarea
                  id="det-special-request-ta"
                  v-model="sheet.special_request"
                  rows="2"
                  auto-grow
                  hide-details
                  variant="outlined"
                  :disabled="savingSheet"
                  label="Petición especial"
                  prepend-inner-icon="mdi-heart-outline"
                />
              </VCol>

              <VCol cols="12" class="d-flex justify-end mt-2">
                <VBtn
                  id="cnsld-save-sheet-btn"
                  size="small"
                  color="primary"
                  variant="elevated"
                  :loading="savingSheet"
                  :disabled="!isDirty || savingSheet"
                  @click="saveSheet"
                >
                  <VIcon start size="small">mdi-content-save</VIcon>
                  Guardar
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol md="4" cols="12">
        <VTextField
          id="con-detai-filterterm-tf-2"
          v-model="filterTerm"
          clearable
          hide-details
          density="compact"
          variant="outlined"
          placeholder="Filtro"
          append-inner-icon="mdi-magnify"
        />
      </VCol>
      <VCol md="4" cols="12">
        <VBtn id="cnsld-new-member-btn" class="mr-1" color="success" @click="newMember">
          <VIcon start>mdi-plus</VIcon>
          Nuevo Miembro
        </VBtn>
        <VBtn id="cnsld-refresh-btn" color="primary" :loading="loading" @click="fetchMembers">
          <VIcon start>mdi-reload</VIcon>
          Refrescar
        </VBtn>
      </VCol>

      <VCol cols="12">
        <ConsolidationMemberTable id="det-members-dt" :loading="loading" :members="filteredMembers" @edit="editMember" @status="openStatus" @track="openTracking" @delete="deleteMemberPrompt" />
      </VCol>

      <VCol cols="12" class="d-flex justify-end">
        <VBtn id="cnsld-back-btn" color="primary" variant="outlined" @click="navigateTo('/consolidation')">
          <VIcon start>mdi-arrow-left</VIcon>
          Volver
        </VBtn>
      </VCol>
    </VRow>

    <ConsolidationMemberDialog v-if="dialog" id="det-member-dlg" :member="member" :loading="saving" @save="saveMember" @close="closeDialog" />

    <DialogDelete v-if="dialogDelete" id="det-member-delete-dlg" :loading="deleting" :dialog="deleteData" @ok="confirmDelete" @close="dialogDelete = false" />

    <ConsolidationTrackingLogDialog v-if="trackDialog" id="det-track-dlg" :member="trackMember" @close="trackDialog = false" />

    <ConsolidationStatusLogDialog v-if="statusDialog" id="det-status-dlg" :member="statusMember" @close="statusDialog = false" @status-changed="onStatusChanged" />

    <DialogConfirm
      v-if="showConfirmDialog"
      id="det-sheet-dirty-dlg"
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
  middleware: ["authenticated","permission"],
  permissions: ["conso-sheet-index"],
  back: "/consolidation",
  showDrawer: false,
})

const route = useRoute()
const { ConsoSheet, ChurchMember } = useRepository()
const notify = useNotifyStore()
const auth = useAuthStore()

const sheetId = computed(() => route.params.id as string)

const filterTerm = ref("")
const loading = ref(false)
const saving = ref(false)
const savingSheet = ref(false)
const deleting = ref(false)
const dialog = ref(false)
const dialogDelete = ref(false)
const trackDialog = ref(false)
const statusDialog = ref(false)
const sheet = ref<Record<string, unknown>>({})
const originalSheet = ref<Record<string, unknown>>({})
const member = ref<Record<string, unknown>>({})
const trackMember = ref<Record<string, unknown>>({})
const statusMember = ref<Record<string, unknown>>({})
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

onBeforeRouteLeave((_to, _from, next) => {
  if (isDirty.value) {
    showConfirmDialog.value = true
    resolveNext = next as unknown as (val?: unknown) => void
  } else {
    next()
  }
})

const isDirty = computed(() => JSON.stringify(sheet.value) !== JSON.stringify(originalSheet.value))

const singleOrg = computed(() => auth.hasSingleOrgFor("conso-sheet-index"))

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
  const last = members.value.at(-1) as Record<string, unknown> | undefined
  member.value = {
    conso_sheet_id: sheetId.value,
    address: (last?.address as string) || "",
  }
  dialog.value = true
}

function editMember(item: unknown) {
  member.value = { ...(item as Record<string, unknown>) }
  dialog.value = true
}

function openTracking(item: unknown) {
  trackMember.value = item as Record<string, unknown>
  trackDialog.value = true
}

function openStatus(item: unknown) {
  statusMember.value = item as Record<string, unknown>
  statusDialog.value = true
}

function onStatusChanged(updated: Record<string, unknown>) {
  const idx = members.value.findIndex(
    (m) => (m as Record<string, unknown>).id === updated.id,
  )
  if (idx !== -1) {
    members.value[idx] = {
      ...(members.value[idx] as Record<string, unknown>),
      status: updated.status,
    }
  }
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
    const sheetOrgId =
      (sheet.value.org_id as Record<string, unknown>)?.id ?? sheet.value.org_id
    const payload = { ...item, org_id: sheetOrgId }
    const isUpdate = Boolean(item.id)
    if (isUpdate) {
      await ChurchMember.update(item.id as number, payload)
    } else {
      await ChurchMember.create(payload)
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
