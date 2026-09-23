<template>
  <VMenu v-model="menu" max-height="310" location="bottom start" :disabled="!suggestions.length">
    <template #activator="{ props: activatorProps }">
      <VTextField
        :id="id"
        v-model="text"
        v-bind="activatorProps"
        clearable
        density="compact"
        label="Dirección"
        variant="outlined"
        :disabled="disabled"
        :loading="searching"
        @click:clear="onClear"
        @update:model-value="onInput"
      />
    </template>
    <VList height="180" density="compact" class="overflow-y-auto">
      <VListItem
        v-for="(s, i) in suggestions"
        :key="i"
        :active="false"
        :class="i % 2 === 0 ? 'bg-blue-lighten-5' : ''"
        @click="onPick(s)"
      >
        <span class="text-body-2 font-weight-medium">{{ s.displayName }}</span>
      </VListItem>
    </VList>
  </VMenu>
</template>

<script setup lang="ts">
  import {
    searchAddresses,
    buildAddressWithCity,
    type AddressSuggestion,
  } from '~/services/address-service'

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      id?: string
      disabled?: boolean
    }>(),
    {
      modelValue: '',
      id: 'my-address-completion',
      disabled: false,
    }
  )

  const emit = defineEmits<{
    (e: 'update:modelValue', val: string): void
  }>()

  const text = ref(props.modelValue ?? '')
  const suggestions = ref<AddressSuggestion[]>([])
  const menu = ref(false)
  const searching = ref(false)
  let debounce: ReturnType<typeof setTimeout> | null = null

  watch(
    () => props.modelValue,
    val => {
      if (val !== text.value) text.value = val ?? ''
    }
  )

  function onInput(query: string) {
    if (debounce) clearTimeout(debounce)
    if (!query || query.trim().length < 3) {
      suggestions.value = []
      menu.value = false
      return
    }
    debounce = setTimeout(async () => {
      try {
        searching.value = true
        suggestions.value = await searchAddresses(query)
        menu.value = true
      } catch {
        suggestions.value = []
        menu.value = false
      } finally {
        searching.value = false
      }
    }, 500)
  }

  function onPick(s: AddressSuggestion) {
    const val = buildAddressWithCity(s)
    text.value = val
    emit('update:modelValue', val)
    menu.value = false
  }

  function onClear() {
    text.value = ''
    emit('update:modelValue', '')
    suggestions.value = []
    menu.value = false
  }
</script>
