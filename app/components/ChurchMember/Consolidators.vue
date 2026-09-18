<template>
  <VSheet rounded color="white" class="pa-2 pa-sm-3">
    <div class="text-subtitle-1 font-weight-medium d-flex align-center">
      <VIcon start size="small" color="primary">mdi-account-multiple</VIcon>
      Consolidadores
    </div>
    <VDivider class="my-2" />
    <div>
      <template v-if="canAssign">
        <ConsolidationConsolidatorCombobox
          id="cmm-consolidator-combobox"
          :disabled="saving"
          :org-id="member.org_id"
          label="Asignar consolidadores"
          :consolidatorsx="consolidators"
          @model-change="emit('update:consolidators', $event)"
        />
        <div class="d-flex justify-end mt-2">
          <VBtn
            v-if="hasChanges"
            id="cmm-consolidator-save-btn"
            color="primary"
            :loading="saving"
            variant="elevated"
            @click="emit('save')"
          >
            <VIcon start>mdi-content-save</VIcon>
            Guardar
          </VBtn>
        </div>
      </template>
      <template v-else>
        <div class="text-body-2 d-flex flex-wrap ga-1">
          <VChip
            v-for="c in consolidators"
            :key="c.id"
            size="small"
            color="primary"
            variant="outlined"
          >
            <VIcon start size="x-small">mdi-account</VIcon>
            {{ c.name }} {{ c.last_name }}
            <span
              v-if="c.assigned_by"
              class="text-caption text-medium-emphasis ms-1"
            >
              — por {{ c.assigned_by }}
            </span>
          </VChip>
        </div>
      </template>
    </div>
  </VSheet>
</template>

<script setup lang="ts">
defineProps<{
  member: Record<string, unknown>;
  consolidators: {
    id: number | string;
    name: string;
    last_name?: string;
    assigned_by?: string;
  }[];
  saving: boolean;
  hasChanges: boolean;
  canAssign: boolean;
}>();

defineEmits<{
  "update:consolidators": [
    val: { id: number | string; name: string; last_name?: string }[],
  ];
  save: [];
}>();
</script>
