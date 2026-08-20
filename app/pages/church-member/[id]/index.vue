<template>
  <VContainer fluid>
    <VRow justify="center">
      <VCol cols="12" md="8">
        <VCard v-if="loadingItem" class="text-center pa-5">
          <VProgressCircular indeterminate color="primary" />
        </VCard>

        <VCard v-else>
          <VCardTitle class="text-subtitle-1 font-weight-medium d-flex align-center">
            <VIcon start color="primary">mdi-account</VIcon>
            {{ fullName }}
            <VSpacer />
            <VChip size="small" :color="statusColor(member.status)">
              {{ statusLabel(member.status) }}
            </VChip>
          </VCardTitle>
          <VDivider />

          <VCardText>
            <VRow density="compact">
              <VCol cols="12" md="6" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1">mdi-phone</VIcon>
                <span class="font-weight-medium">Celular:</span>
                {{ member.cellphone || "—" }}
              </VCol>
              <VCol cols="12" md="6" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1">mdi-calendar-account</VIcon>
                <span class="font-weight-medium">Edad:</span>
                {{ member.years_old ?? "—" }}
              </VCol>
              <VCol cols="12" md="6" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1">mdi-account-multiple</VIcon>
                <span class="font-weight-medium">Hijos:</span>
                {{ member.number_of_children ?? "—" }}
              </VCol>
              <VCol cols="12" md="6" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1">mdi-ring</VIcon>
                <span class="font-weight-medium">Estado civil:</span>
                {{ member.marriage_status || "—" }}
              </VCol>
              <VCol cols="12" class="text-body-2">
                <VIcon start size="small" color="grey-darken-1">mdi-map-marker</VIcon>
                <span class="font-weight-medium">Dirección:</span>
                {{ member.address || "—" }}
              </VCol>
            </VRow>
          </VCardText>

          <VDivider />

          <VCardActions>
            <VSpacer />
            <VBtn color="primary" variant="outlined" @click="goBack">
              <VIcon start>mdi-arrow-left</VIcon>
              Volver
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: "Detalle del Miembro",
  icon: "mdi-account",
  permission: "conso-sheet-index",
  middleware: ["authenticated", "permission"],
})

const route = useRoute()
const { ChurchMember } = useRepository()

const loadingItem = ref(true)
const member = ref<Record<string, unknown>>({})

{
  try {
    const dbItem = await ChurchMember.show<Record<string, unknown>>(route.params.id as string)
    member.value = dbItem as Record<string, unknown>
  } catch (e) {
    throw createError({ statusCode: 404, message: "Miembro no encontrado" })
  } finally {
    loadingItem.value = false
  }
}

const statusOptions = [
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

const fullName = computed(() =>
  [member.value.name, member.value.last_name, member.value.second_last_name]
    .filter(Boolean)
    .join(" ") || "Miembro",
)

function statusLabel(status: unknown): string {
  const found = statusOptions.find((s) => s.value === status)
  return found ? found.title : String(status ?? "—")
}

function statusColor(status: unknown): string {
  return statusColors[String(status)] ?? "grey"
}

function goBack() {
  navigateTo("/tracking")
}
</script>

<style scoped></style>