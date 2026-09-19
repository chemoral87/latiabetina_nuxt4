<template>
  <div id="cmp-assistance-table">
    <VDataTableServer
      id="ass-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      mustSort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      class="elevation-1"
      :items-length="total"
      :search="props.search"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions">
      <template #[`item.assistance_date`]="{ item }">
        {{ formatShortDate((item as Record<string, unknown>).assistance_date as string | null) }}
      </template>

      <template #[`item.service_time`]="{ item }">
        {{ formatHourTime((item as Record<string, unknown>).service_time as string | null) }}
      </template>

      <template #[`item.total`]="{ item }">
        {{ computeTotal(item as Record<string, unknown>) }}
      </template>

      <template #[`item.notes`]="{ item }">
        {{ (item as Record<string, unknown>).notes ?? "—" }}
      </template>

      <template #[`item.org_name`]="{ item }">
        {{ orgNameById((item as Record<string, unknown>).org_id as number) }}
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <VBtn
            v-if="canUpdate"
            id="ass-table-edit-btn"
            icon
            class="ma-1"
            size="small"
            title="Editar"
            color="primary"
            rounded="circle"
            variant="outlined"
            @click="emit('edit', item)">
            <VIcon size="x-large">mdi-pencil</VIcon>
          </VBtn>
          <VBtn
            v-if="canDelete"
            id="ass-table-delete-btn"
            icon
            class="ma-1"
            size="small"
            color="error"
            rounded="circle"
            title="Eliminar"
            variant="outlined"
            :disabled="isLocked(item as Record<string, unknown>)"
            :title="isLocked(item as Record<string, unknown>) ? 'No se puede editar/eliminar: registro tiene más de 7 días' : 'Eliminar'"
            @click="emit('delete', item)">
            <VIcon size="x-large">mdi-delete</VIcon>
          </VBtn>
        </div>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-account-multiple</VIcon>
          <span class="text-body-1 text-grey">No se encontraron asistencias</span>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/composables/useAuth";
import { formatHourTime, formatShortDate } from "~/utils/date";

interface Header {
  title: string
  value: string
  sortable: boolean
  align?: string
  width?: string
}

const props = withDefaults(defineProps<{
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
  search?: string
  initialSortBy?: { key: string; order: string }[]
}>(), {
  response: null,
  loading: false,
  search: "",
  initialSortBy: () => [{ key: "assistance_date", order: "desc" }],
})

const emit = defineEmits<{
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
  (e: 'new'): void
}>()

const auth = useAuthStore()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([...props.initialSortBy])

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const showOrgColumn = computed(() => {
  const orgIds = auth.permissionsOrg["assistance-index"] ?? []
  return Array.isArray(orgIds) && orgIds.length > 1
})

const canCreate = computed(() => auth.hasPermission("assistance-create"))
const canUpdate = computed(() => auth.hasPermission("assistance-update"))
const canDelete = computed(() => auth.hasPermission("assistance-delete"))

const headers = computed<Header[]>(() => {
  const cols: Header[] = [
    { title: "Fecha Asistencia", value: "assistance_date", sortable: true },
    { title: "Hora Servicio", value: "service_time", sortable: true },
    { title: "Adultos", value: "adults", sortable: true },
    { title: "Adolescentes", value: "teens", sortable: true },
    { title: "Niños", value: "kids", sortable: true },
    { title: "Bebés", value: "babies", sortable: true },
    { title: "Nuevos", value: "newcomers", sortable: true },
    { title: "Total", value: "total", sortable: false },
  ]
  if (showOrgColumn.value) {
    cols.push({ title: "Organización", value: "org_name", sortable: false })
  }
  cols.push(
    { title: "Notas", value: "notes", sortable: false },
    { title: "Acciones", value: "actions", sortable: false, align: "center", width: "180px" },
  )
  return cols
})

function orgNameById(orgId?: number | string): string {
  if (orgId == null) return ""
  const orgs = (auth.user?.orgs as { id: number; name?: string }[] | undefined) ?? []
  return orgs.find((o) => o.id === orgId)?.name ?? ""
}

function computeTotal(item: Record<string, unknown>): number {
  const adults = Number(item.adults) || 0
  const teens = Number(item.teens) || 0
  const kids = Number(item.kids) || 0
  const babies = Number(item.babies) || 0
  return adults + teens + kids + babies
}

function isLocked(item: Record<string, unknown>): boolean {
  const dateStr = item.assistance_date as string
  if (!dateStr) return false
  const assistanceDate = new Date(dateStr)
  if (isNaN(assistanceDate.getTime())) return false
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - assistanceDate.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays > 7
}

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}
</script>

<style scoped></style>