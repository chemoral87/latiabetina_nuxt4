<template>
  <VDataTable
    :id="id"
    :items="members"
    density="compact"
    :headers="headers"
    :loading="loading"
    class="elevation-1"
    hide-default-footer
    :items-per-page="-1"
    mobile-breakpoint="0"
  >
    <template #[`item.status`]="{ item }">
      <VChip size="small" :color="statusColor(item.status)">{{ statusLabel(item.status) }}</VChip>
    </template>

    <template #[`item.actions`]="{ item }">
      <div class="d-flex flex-nowrap justify-center">
        <VBtn
          id="con-membertable-track-btn"
          icon
          class="ma-1"
          color="teal"
          size="small"
          rounded="circle"
          variant="outlined"
          title="Bitácora de seguimiento"
          @click="emit('track', item)"
        >
          <VIcon size="x-large">mdi-notebook-outline</VIcon>
        </VBtn>

        <VBtn
          id="con-membertable-status-btn"
          icon
          class="ma-1"
          size="small"
          color="orange"
          rounded="circle"
          variant="outlined"
          title="Clasificación / Historial de estado"
          @click="emit('status', item)"
        >
          <VIcon size="x-large">mdi-account-cog-outline</VIcon>
        </VBtn>

<VBtn
          id="con-membertable-medal-btn"
          icon
          class="ma-1"
          size="small"
          color="amber"
          rounded="circle"
          title="Medallas"
          variant="outlined"
          @click="emit('medal', item)"
        >
          <VIcon size="x-large">mdi-medal-outline</VIcon>
        </VBtn>

        <VBtn
          id="con-membertable-track-btn"
          icon
          class="ma-1"
          color="teal"
          size="small"
          rounded="circle"
          variant="outlined"
          title="Bitácora de seguimiento"
          @click="emit('track', item)"
        >
          <VIcon size="x-large">mdi-notebook-outline</VIcon>
        </VBtn>

        <VBtn
          id="con-membertable-delete-btn"
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

    <template #[`item.years_old`]="{ item }">
      {{ item.years_old ?? "—" }}
    </template>

    <template #[`item.number_of_children`]="{ item }">
      {{ item.number_of_children ?? "—" }}
    </template>

    <template #no-data>
      <div class="text-center pa-4">
        <VIcon color="grey-lighten-1">mdi-account-group</VIcon>
        <span class="text-body-1 text-grey ml-1">No hay miembros registrados</span>
      </div>
    </template>
  </VDataTable>
</template>

<script setup lang="ts">
interface Header {
  title: string
  value: string
  sortable: boolean
  align?: string
  width?: string
}

withDefaults(defineProps<{
  id?: string
  members?: unknown[]
  loading?: boolean
}>(), {
  id: "con-membe-members-dt-1",
  members: () => [],
  loading: false,
})

const emit = defineEmits<{
  (e: 'medal', val: unknown): void
  (e: 'track', val: unknown): void
  (e: 'status', val: unknown): void
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const statuses = [
  { title: "Activo", value: "ACTIVO" },
  { title: "No contesta", value: "NO CONTESTA" },
  { title: "No molestar", value: "NO MOLESTAR" },
  { title: "Visita", value: "VISITA" },
]

const statusColors: Record<string, string> = {
  ACTIVO: "green",
  "NO CONTESTA": "amber",
  "NO MOLESTAR": "red",
  VISITA: "blue",
}

function statusLabel(status: unknown): string {
  const found = statuses.find((s) => s.value === status)
  return found ? found.title : String(status ?? "Sin estado")
}

function statusColor(status: unknown): string {
  return statusColors[String(status)] ?? "grey"
}

const headers: Header[] = [
  { title: "Nombre", value: "name" },
  { title: "Apellido Paterno", value: "last_name" },
  { title: "Apellido Materno", value: "second_last_name" },
  { title: "Edad", value: "years_old" },
  { title: "Hijos", value: "number_of_children" },
  { title: "Celular", value: "cellphone" },
  { title: "Dirección", value: "address" },
  { title: "Estado Civil", value: "marriage_status" },
  { title: "Estado", value: "status", sortable: false, align: "center" },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "275px" },
]
</script>

<style scoped></style>