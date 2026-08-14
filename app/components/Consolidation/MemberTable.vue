<template>
  <VDataTable
    id="con-membe-members-dt-1"
    :headers="headers"
    :items="members"
    :loading="loading"
    density="compact"
    mobile-breakpoint="0"
    class="elevation-1"
    :items-per-page="-1"
    hide-default-footer
  >
    <template #[`item.actions`]="{ item }">
      <div class="d-flex flex-nowrap justify-center">
        <VBtn
          id="con-membertable-edit-btn"
          title="Editar"
          color="primary"
          variant="outlined"
          icon
          rounded="circle"
          size="small"
          class="ma-1"
          @click="emit('edit', item)"
        >
          <VIcon>mdi-pencil</VIcon>
        </VBtn>

        <VBtn
          id="con-membertable-delete-btn"
          title="Eliminar"
          color="error"
          variant="outlined"
          icon
          rounded="circle"
          size="small"
          class="ma-1"
          @click="emit('delete', item)"
        >
          <VIcon>mdi-delete</VIcon>
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
  members?: unknown[]
  loading?: boolean
}>(), {
  members: () => [],
  loading: false,
})

const emit = defineEmits<{
  (e: 'edit', val: unknown): void
  (e: 'delete', val: unknown): void
}>()

const headers: Header[] = [
  { title: "Nombre", value: "name" },
  { title: "Apellido Paterno", value: "last_name" },
  { title: "Apellido Materno", value: "second_last_name" },
  { title: "Edad", value: "years_old" },
  { title: "Hijos", value: "number_of_children" },
  { title: "Celular", value: "cellphone" },
  { title: "Dirección", value: "address" },
  { title: "Estado Civil", value: "marriage_status" },
  { title: "Acciones", value: "actions", sortable: false, align: "center", width: "110px" },
]
</script>

<style scoped></style>
