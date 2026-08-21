<template>
  <div id="cmp-church-member-tracking-log-table">
    <VDataTableServer
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="items"
      :items-length="total"
      :loading="loading"
      density="compact"
      class="elevation-1"
      :items-per-page-options="[10, 15, 25]"
      items-per-page-text="Filas por página"
      @update:options="onUpdateOptions"
    >
      <template #[`item.medium`]="{ item }">
        <VChip size="small" variant="tonal" :color="mediumColor(item.medium)">
          {{ mediumLabel(item.medium) }}
        </VChip>
      </template>

      <template #[`item.contact_date`]="{ item }">
        {{ formatShortDate(item.contact_date) }}
      </template>

      <template #[`item.creator`]="{ item }">
        {{ (item.creator as Record<string, unknown> | undefined)?.name || "N/A" }}
      </template>

      <template #[`item.classification`]="{ item }">
        <VChip v-if="item.classification" size="small" variant="tonal" :color="classificationColor(item.classification)">
          {{ item.classification }}
        </VChip>
      </template>

      <template #[`item.description`]="{ item }">
        <span v-if="item.description">{{ item.description }}</span>
        <span v-else class="text-grey">—</span>
      </template>

      <template #[`item.actions`]="{ item }">
        <VBtn
          id="cmm-tlt-edit-btn"
          icon
          class="ma-1"
          size="small"
          color="primary"
          variant="outlined"
          rounded="circle"
          title="Editar"
          @click="emit('edit', item)"
        >
          <VIcon size="x-large">mdi-pencil</VIcon>
        </VBtn>
        <VBtn
          id="cmm-tlt-delete-btn"
          icon
          class="ma-1"
          size="small"
          color="error"
          variant="outlined"
          rounded="circle"
          title="Eliminar"
          @click="emit('delete', item)"
        >
          <VIcon size="x-large">mdi-delete</VIcon>
        </VBtn>
      </template>

      <template #no-data>
        <div class="text-center pa-4">
          <VIcon color="grey-lighten-1">mdi-history</VIcon>
          <div class="text-body-2 mt-1">Sin interacciones registradas</div>
        </div>
      </template>
    </VDataTableServer>
  </div>
</template>

<script setup lang="ts">
import { formatShortDate } from "~/utils/date"
import { rowPropsFor } from "~/composables/useRowHighlight"

interface Header {
  title: string
  value: string
  sortable: boolean
  align?: string
  width?: string
}

const props = withDefaults(defineProps<{
  id?: string
  response?: { total?: number; data?: unknown[] } | null
  loading?: boolean
}>(), {
  id: "cmp-church-member-tracking-log-table",
  response: () => ({ data: [], total: 0 }),
  loading: false,
})

const emit = defineEmits<{
  (e: "sorting", val: Record<string, unknown>): void
  (e: "edit", val: unknown): void
  (e: "delete", val: unknown): void
}>()

const page = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<{ key: string; order: string }[]>([
  { key: "contact_date", order: "desc" },
])

const total = computed(() => props.response?.total ?? 0)

const items = computed(() => props.response?.data ?? [])

const headers = computed<Header[]>(() => [
  { title: "Medio", value: "medium", sortable: false, align: "center" },
  { title: "Clasificación", value: "classification", sortable: false, align: "center" },
  { title: "Fecha", value: "contact_date", sortable: true },
  { title: "Usuario", value: "creator", sortable: false },
  { title: "Descripción", value: "description", sortable: false },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "100px" },
])

const rowProps = rowPropsFor(() => null, () => null)

onMounted(() => {
  const opts = props.response ?? {}
  if (Array.isArray(opts.sortBy)) {
    const sb = opts.sortBy as ({ key: string; order: string } | string)[]
    sortBy.value = sb.map((s) =>
      typeof s === "string" ? { key: s, order: "asc" } : s,
    )
  }
})

function onUpdateOptions(val: Record<string, unknown>) {
  emit("sorting", val)
}

function mediumLabel(medium: unknown): string {
  const labels: Record<string, string> = {
    whatsapp: "WhatsApp",
    sms: "Mensaje",
    llamada: "Llamada",
    presencial: "Presencial",
  }
  return labels[String(medium)] || String(medium ?? "—")
}

function mediumColor(medium: unknown): string {
  const colors: Record<string, string> = {
    whatsapp: "green",
    sms: "teal",
    llamada: "primary",
    presencial: "amber",
  }
  return colors[String(medium)] ?? "grey"
}

function classificationColor(classification: unknown): string {
  const colors: Record<string, string> = {
    CONTESTA: "green",
    "NO CONTESTA": "amber",
  }
  return colors[String(classification)] ?? "grey"
}

function formatShortDate(value: unknown): string {
  if (!value) return "—"
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
</script>

<style scoped></style>