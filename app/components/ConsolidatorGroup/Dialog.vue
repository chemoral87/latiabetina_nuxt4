<template>
  <VDialog id="cgr-dialog-dlg-1" persistent max-width="560px" :model-value="true">
    <VCard>
      <VCardTitle class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <VIcon start size="small" color="primary">{{ isEditMode ? 'mdi-pencil' : 'mdi-plus' }}</VIcon>
        {{ formTitle }}
        <VSpacer />
        <DialogCloseButton id="cgr-dialog-close-btn" :disabled="saving || loading" @close="close" />
      </VCardTitle>

      <VCardText class="py-1">
        <VForm ref="formRef" @submit.prevent="save">
          <VTextField
            id="cgr-dialog-name"
            v-model="item.name"
            required
            autofocus
            class="mb-2"
            density="compact"
            variant="outlined"
            label="Nombre del grupo"
            :disabled="saving || loading"
            :error-messages="errors?.name"
            :rules="[vrules.requiredField('Nombre')]"
            @keyup.enter="save"
          />
          <OrganizationSelect
            v-model="item.org_id"
            hide-one
            required
            class="mb-2"
            density="compact"
            variant="outlined"
            label="Organización"
            :error-messages="errors?.org_id"
            permission="consolidator-group-manage"
            :disabled="saving || loading || isEditMode"
            :rules="[vrules.requiredField('Organización')]"
          />
          <ConsolidationConsolidatorCombobox
            id="cgr-dialog-consolidators"
            density="compact"
            :org-id="item.org_id"
            label="Consolidadores"
            :consolidatorsx="item.consolidators"
            :disabled="saving || loading || !item.org_id"
            @model-change="item.consolidators = $event"
          />
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn id="cgr-dialog-cancel-btn" class="mr-4" color="primary" variant="outlined" :disabled="saving || loading" @click="close">
          <VIcon start>mdi-close</VIcon>
          Cancelar
        </VBtn>
        <VBtn id="cgr-dialog-save-btn" color="primary" variant="elevated" :loading="saving || loading" :disabled="saving || loading" @click="save">
          <VIcon start>mdi-content-save</VIcon>
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useValidationErrors } from '~/composables/useValidationErrors'
import { useVrules } from '~/composables/useVrules'

interface ConsolidatorItem {
  id: number | string
  name: string
  last_name?: string
  email?: string
}

interface GroupItem {
  id?: number
  name?: string
  org_id?: number | string | null
  consolidators?: ConsolidatorItem[]
}

const props = withDefaults(defineProps<{
  group?: Record<string, unknown> | null
  loading?: boolean
}>(), {
  group: null,
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', val: Record<string, unknown>): void
}>()

const { errors, clearErrors } = useValidationErrors()
const { vrules } = useVrules()

const formRef = ref()
const saving = ref(false)

const item = ref<GroupItem>({ name: '', org_id: null, consolidators: [] })

const isEditMode = computed(() => !!item.value.id)
const formTitle = computed(() => (isEditMode.value ? 'Editar Grupo' : 'Nuevo Grupo'))

watch(() => props.loading, val => {
  if (!val) saving.value = false
}, { immediate: true })

onMounted(() => {
  clearErrors()
  if (props.group && Object.keys(props.group).length > 0) {
    const g = props.group as GroupItem & { users?: ConsolidatorItem[] }
    item.value = {
      id: g.id,
      name: g.name ?? '',
      org_id: g.org_id ?? null,
      consolidators: g.users ?? [],
    }
  }
})

function close() {
  clearErrors()
  emit('close')
}

async function save() {
  if (saving.value || props.loading) return
  const { valid } = (await formRef.value?.validate()) ?? { valid: false }
  if (!valid) return
  if (saving.value || props.loading) return
  saving.value = true
  emit('save', {
    ...item.value,
    user_ids: (item.value.consolidators ?? []).map(c => c.id),
  })
}
</script>

<style scoped></style>
