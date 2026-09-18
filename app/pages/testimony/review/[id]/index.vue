<template>
  <VContainer :fluid="true">
    <VRow density="compact">
      <VCol md="8" cols="12" class="mx-auto">
        <VCard id="rev-main-card">
          <VCardTitle class="d-flex flex-column align-start">
            <div style="width: 100%" class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h6">{{ mTestimony.name || "Sin nombre" }}</div>
                <div class="text-caption text-grey">ID: {{ mTestimony.id }}</div>
              </div>
              <div class="text-right">
                <VChip v-if="mTestimony.status === 'approved'" id="rev-status-approved-chip" size="small" color="success">APROBADO</VChip>
                <VChip v-else-if="mTestimony.status === 'rejected'" id="rev-status-rejected-chip" size="small" color="error">RECHAZADO</VChip>
                <VChip v-else id="rev-status-pending-chip" size="small">Pendiente</VChip>
                <div v-if="mTestimony.status_username" class="text-caption text-grey mt-1">Por: {{ mTestimony.status_username }}</div>
              </div>
            </div>
            <div class="mt-2">
              <VChip v-for="(c, i) in (mTestimony.categories as string[] || [])" id="rev-category-chip" :key="i" class="ma-1" size="small" color="primary">
                {{ c }}
              </VChip>
            </div>
          </VCardTitle>

          <VCardText>
            <VRow density="compact">
              <VCol md="4" cols="12">
                <VList density="compact">
                  <VListItem>
                    <template #prepend>
                      <VIcon>mdi-phone</VIcon>
                    </template>
                    <VListItemTitle>{{ mTestimony.phone_number || "—" }}</VListItemTitle>
                  </VListItem>

                  <VListItem v-if="mTestimony.link">
                    <template #prepend>
                      <VIcon>mdi-link-variant</VIcon>
                    </template>
                    <VListItemTitle>
                      <a rel="noopener" target="_blank" :href="mTestimony.link as string">Ver enlace</a>
                    </VListItemTitle>
                  </VListItem>
                </VList>

                <div v-if="mTestimony.link" class="mt-3">
                  <VResponsive v-if="embedSrc" aspect-ratio="16/9">
                    <iframe
                      allowfullscreen
                      frameborder="0"
                      :src="embedSrc"
                      style="width: 100%; height: 100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    />
                  </VResponsive>
                  <div v-else class="text-caption text-grey">
                    Vista previa no disponible para este enlace.
                    <a rel="noopener" target="_blank" :href="mTestimony.link as string">Abrir enlace</a>
                  </div>
                </div>
              </VCol>

              <VCol md="8" cols="12">
                <div class="mb-4">
                  <div class="text-subtitle-1 font-weight-medium mb-1">Descripción</div>
                  <div class="text-body-1">{{ mTestimony.description || "—" }}</div>
                </div>
              </VCol>
            </VRow>

            <VDivider class="my-2" />

            <VRow density="compact">
              <VCol md="6" cols="12">
                <div class="text-caption text-grey">Creado</div>
                <div>{{ formatShortDateTime(mTestimony.created_at as string | null) }}</div>
              </VCol>
              <VCol md="6" cols="12">
                <div class="text-caption text-grey">Última actualización</div>
                <div>{{ formatShortDateTime(mTestimony.updated_at as string | null) }}</div>
              </VCol>
            </VRow>
          </VCardText>

          <div class="d-flex justify-end px-4 pb-4">
            <VBtn id="tesrev-back-btn" class="mr-5" variant="text" color="primary" @click="navigateTo('/testimony')">Volver</VBtn>

            <VBtn id="tesrev-reject-btn" class="mr-5" color="error" :loading="saving" variant="outlined" @click="updateStatus('rejected')">
              Rechazar
            </VBtn>
            <VBtn id="tesrev-approve-btn" class="mr-2" color="success" :loading="saving" @click="updateStatus('approved')">
              Aprobar
            </VBtn>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { formatShortDateTime } from "~/utils/date"

definePageMeta({
  title: "Testimonio",
  icon: "mdi-comment-text",
  middleware: "authenticated",
})

const route = useRoute()
const { Testimony } = useRepository()
const notify = useNotifyStore()

const mTestimony = ref<Record<string, unknown>>({})
const saving = ref(false)

// Initial load (asyncData equivalent)
{
  const res = await Testimony.show<Record<string, unknown>>(route.params.id as string).catch(() => null)
  mTestimony.value = (res as Record<string, unknown>) || {}
}

onMounted(() => {
  const roleName = (mTestimony.value.name as string) || ""
  route.meta.title = "Testimonio " + roleName
  route.meta.icon = "mdi-comment-text"
  route.meta.back = "/testimony"
  route.meta.showDrawer = false
})

const embedSrc = computed(() => {
  const link = mTestimony.value?.link as string | undefined
  if (!link) return null

  // YouTube watch or short URL -> embed
  const ytMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  // Vimeo -> embed
  const vimeoMatch = link.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // If it's already an embed url, allow it
  if (link.includes("youtube.com/embed") || link.includes("player.vimeo.com")) return link

  return null
})

async function updateStatus(status: string) {
  if (!mTestimony.value || !mTestimony.value.id) return
  try {
    saving.value = true
    const res = await Testimony.updateStatus<{ testimony?: Record<string, unknown> }>(mTestimony.value.id as number, status)
    const testimony = res?.testimony || {}
    mTestimony.value = (testimony as Record<string, unknown>) || mTestimony.value
  } catch (error) {
    notify.notify({ error: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Error al actualizar estado" })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped></style>
