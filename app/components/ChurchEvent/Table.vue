<template>
  <div id="cmp-church-event-table">
    <VDataTableServer
      id="eve-table-items-dt-1"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:items-per-page="itemsPerPage"
      mustSort
      striped="odd"
      :items="items"
      density="compact"
      :headers="headers"
      :loading="loading"
      :items-length="total"
      :search="props.search"
      class="elevation-1 xwidth1100"
      :items-per-page-options="[10, 15, 30]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.org_code`]="{ item }">
        {{ orgCodeById((item as Record<string, unknown>).org_id as number) }}
      </template>

      <template #[`item.publish_date`]="{ item }">
        {{ formatShortDate((item as Record<string, unknown>).publish_date as string | null) }}
      </template>

      <template #[`item.event_date`]="{ item }">
        {{ formatShortDate((item as Record<string, unknown>).event_date as string | null) }}
        <span v-if="(item as Record<string, unknown>).time_start" class="ml-1 text-grey-darken-1">
          {{ formatTime((item as Record<string, unknown>).time_start as string | null) }}
        </span>
      </template>

      <template #[`item.classification`]="{ item }">
        <VChip
          v-if="(item as Record<string, unknown>).classification"
          size="small"
          variant="elevated"
          :color="classificationColor((item as Record<string, unknown>).classification as string)"
        >
          {{ (item as Record<string, unknown>).classification }}
        </VChip>
      </template>

      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <VBtn
            id="eve-table-edit-btn"
            icon
            class="ma-1"
            size="small"
            title="Editar"
            color="primary"
            rounded="circle"
            variant="outlined"
            @click="emit('edit', item)"
          >
            <VIcon size="x-large">mdi-pencil</VIcon>
          </VBtn>
          <VBtn
            id="eve-table-copy-btn"
            icon
            class="ma-1"
            size="small"
            title="Copiar"
            color="success"
            rounded="circle"
              variant="outlined"
            @click="emit('copy', item)"
          >
            <VIcon size="x-large">mdi-content-copy</VIcon>
          </VBtn>
          <VBtn
            id="eve-table-delete-btn"
            icon
            class="ma-1"
            size="small"
            color="error"
            rounded="circle"
            title="Eliminar"
               variant="outlined"
            @click="emit('delete', item)"
          >
            <VIcon size="x-large">mdi-delete</VIcon>
          </VBtn>
        </div>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-church</VIcon>
          <span class="text-body-1 text-grey">No se encontraron eventos de iglesia</span>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/composables/useAuth"
import { classificationColor } from "./classifications"
import { formatShortDate } from "~/utils/date"

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
  permission?: string
  initialSortBy?: { key: string; order: string }[]
}>(), {
  response: null,
  loading: false,
  search: "",
  permission: "church-event-index",
  initialSortBy: () => [{ key: "event_date", order: "desc" }],
})

const emit = defineEmits<{
  (e: 'sorting', val: Record<string, unknown>): void
  (e: 'edit', val: unknown): void
  (e: 'copy', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const auth = useAuthStore()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([...props.initialSortBy])

const total = computed(() => props.response?.total ?? 0)
const items = computed(() => props.response?.data ?? [])
const loading = computed(() => props.loading ?? false)

const showOrgColumn = computed(() => {
  const orgIds = auth.permissionsOrg[props.permission] ?? []
  return Array.isArray(orgIds) && orgIds.length > 1
})

const headers = computed<Header[]>(() => {
  const cols: Header[] = [{ title: "Nombre", value: "name", align: "start", sortable: true }]
  if (showOrgColumn.value) {
    cols.push({ title: "Org", value: "org_code", sortable: false })
  }
  cols.push(
    { title: "Ubicación", value: "location", sortable: false },
    { title: "Clasificación", value: "classification", sortable: false },
    { title: "Fecha Publicación", value: "publish_date", sortable: true },
    { title: "Fecha Evento", value: "event_date", sortable: true },
    { title: "Acciones", value: "actions", sortable: false, align: "center", width: "150px" },
  )
  return cols
})

function orgCodeById(orgId?: number | string): string {
  if (orgId == null) return ""
  const orgs = (auth.user?.orgs as { id: number; short_code?: string }[] | undefined) ?? []
  return orgs.find((o) => o.id === orgId)?.short_code ?? ""
}

function formatTime(value?: string | null): string {
  if (!value) return ""
  const [hour, minute] = value.split(":").map(Number)
  if (isNaN(hour) || isNaN(minute)) return ""
  const period = hour >= 12 ? "pm" : "am"
  const h = hour % 12 || 12
  return `${h}:${String(minute).padStart(2, "0")} ${period}`
}

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}
</script>

<style scoped></style>
