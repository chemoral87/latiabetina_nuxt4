<template>
  <div class="d-inline-flex align-center">
    <VBtn
      id="auevent-stats-btn"
      icon
      class="ml-1"
      size="x-small"
      color="success"
      title="Ver desglose por estatus"
      @click="statsPanel = !statsPanel"
    >
      <VIcon size="small" color="yellow">mdi-chart-bar</VIcon>
    </VBtn>

    <MyDragPanel v-model="statsPanel" title="Desglose de asientos">
      <div class="stats-panel-body">
        <div
          v-for="(cfg, key) in stats.activeStatusCfg"
          :key="key"
          class="stats-row"
        >
          <span class="stats-dot" :style="{ background: cfg.color }"></span>
          <span class="stats-label">{{ cfg.label }}</span>
          <span class="stats-count">
            {{ stats.statusBreakdown[key] || 0 }}
            <span class="grey-text mx-1 font-weight-thin">|</span>
            <span class="stats-percent"
              >{{ stats.getStatusPercentage(key) }}%</span
            >
          </span>
        </div>
        <div class="stats-row stats-total">
          <span class="stats-dot" style="background: transparent"></span>
          <span class="stats-label font-weight-bold">Total</span>
          <span class="stats-count font-weight-bold">
            {{ stats.totalSeats }}
            <span class="grey-text mx-1 font-weight-thin">|</span>
            <span class="stats-percent">100%</span>
          </span>
        </div>
      </div>
    </MyDragPanel>
  </div>
</template>

<script setup lang="ts">
import { useAuditoriumEventStats } from "~/composables/useAuditoriumEventStats"
import type { Section } from "~/types/auditorium"

const props = defineProps<{
  sections: Section[]
}>()

const statsPanel = ref(false)

const stats = useAuditoriumEventStats(computed(() => props.sections))
</script>

<style scoped>
.stats-panel-body {
  padding: 6px 0 4px;
}

.stats-row {
  display: flex;
  align-items: center;
  padding: 3px 12px;
  gap: 8px;
  transition: background 0.15s;
}

.stats-row:hover {
  background: #f5f5f5;
}

.stats-total {
  border-top: 1px solid #e0e0e0;
  margin-top: 4px;
  padding-top: 6px;
}

.stats-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.stats-label {
  flex: 1;
  font-size: 12px;
  color: #333;
}

.stats-count {
  font-size: 12px;
  font-weight: 600;
  color: #111;
  text-align: right;
  white-space: nowrap;
}

.stats-percent {
  display: inline-block;
  min-width: 42px;
  font-weight: 400;
  color: #666;
}
</style>