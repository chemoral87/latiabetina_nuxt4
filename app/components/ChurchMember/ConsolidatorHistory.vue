<template>
  <VSheet rounded color="white" class="pa-2 pa-sm-3">
    <div class="text-subtitle-1 font-weight-medium d-flex align-center">
      <VIcon start size="small" color="primary">mdi-history</VIcon>
      Historial de Consolidadores
    </div>
    <VDivider class="my-2" />
    <div>
      <VTimeline side="end" align="start" density="compact">
        <VTimelineItem
          v-for="log in logs"
          :key="log.id"
          size="small"
          :dot-color="log.action === 'assigned' ? 'success' : 'error'"
          :icon="
            log.action === 'assigned'
              ? 'mdi-account-plus'
              : 'mdi-account-minus'
          "
        >
          <div class="text-body-2">
            <strong
              >{{ log.consolidator?.name }}
              {{ log.consolidator?.last_name }}</strong
            >
            <VChip
              class="ms-1"
              size="x-small"
              variant="flat"
              :color="log.action === 'assigned' ? 'success' : 'error'"
            >
              {{ log.action === "assigned" ? "Asignado" : "Desasignado" }}
            </VChip>
            <span class="text-medium-emphasis ms-1">
              por {{ log.changer?.name }} {{ log.changer?.last_name }}
            </span>
          </div>
          <div
            v-if="log.created_at"
            class="text-caption text-medium-emphasis"
          >
            {{ new Date(log.created_at).toLocaleString() }}
          </div>
        </VTimelineItem>
      </VTimeline>
    </div>
  </VSheet>
</template>

<script setup lang="ts">
interface ConsolidatorLog {
  id: number;
  consolidator_id: number;
  action: string;
  consolidator?: { id: number; name: string; last_name?: string };
  changer?: { id: number; name: string; last_name?: string };
  created_at?: string;
}

defineProps<{ logs: ConsolidatorLog[] }>();
</script>
