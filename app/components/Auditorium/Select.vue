<template>
  <VSelect id="cmp-auditorium-select" v-model="selected" :disabled="disabled" :items="items" :loading="loading" :label="label" item-title="name" item-value="id" v-bind="$attrs" />
</template>

<script setup lang="ts">
interface AuditoriumItem {
  id: number | string
  name: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<{
  orgId?: string | number | null
  modelValue?: string | number | null
  label?: string
}>(), {
  orgId: null,
  modelValue: null,
  label: "Auditorio",
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number | null): void
}>()

const { Auditorium } = useRepository()

const items = ref<AuditoriumItem[]>([])
const selected = ref<string | number | null>(null)
const disabled = ref(false)
const loading = ref(false)

watch(selected, (val) => {
  emit("update:modelValue", val)
})

watch(() => props.modelValue, (val) => {
  selected.value = val
}, { immediate: true })

watch(() => props.orgId, (newOrgId) => {
  if (newOrgId) {
    loadAuditoriums()
  } else {
    items.value = []
    selected.value = null
  }
}, { immediate: true })

async function loadAuditoriums() {
  if (!props.orgId) {
    items.value = []
    return
  }

  loading.value = true
  try {
    const response = await Auditorium.index<{ data?: AuditoriumItem[] }>({
      org_id: props.orgId,
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 15,
    })
    items.value = response?.data || []

    if (items.value.length === 1 && !selected.value) {
      selected.value = items.value[0].id
    }
  } catch (error) {
    items.value = []
  } finally {
    loading.value = false
  }
}
</script>
