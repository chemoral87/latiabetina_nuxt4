<template>
  <div v-if="quantity === 0" id="cmp-pos-product-controls" class="pos-ctrl-empty">
    <VBtn
      id="pos-controls-add-btn"
      icon
      rounded="circle"
      variant="flat"
      color="primary"
      class="pos-ctrl-fab"
      @click="emit('add')"
    >
      <VIcon color="white">mdi-plus</VIcon>
    </VBtn>
  </div>
  <div v-else id="cmp-pos-product-controls" class="pos-ctrl-filled">
    <VBtn
      icon
      rounded="circle"
      variant="outlined"
      color="error"
      class="pos-ctrl-delete mr-2"
      @click="emit('remove')"
    >
      <VIcon size="small">mdi-delete</VIcon>
    </VBtn>
    <VBtn
      icon
      rounded="circle"
      variant="flat"
      color="error"
      class="pos-ctrl-btn"
      @click="emit('decrease')"
    >
      <VIcon color="white">mdi-minus</VIcon>
    </VBtn>
    <span class="pos-ctrl-qty">{{ quantity }}</span>
    <VBtn
      icon
      rounded="circle"
      variant="flat"
      color="success"
      class="pos-ctrl-btn"
      @click="emit('add')"
    >
      <VIcon color="white">mdi-plus</VIcon>
    </VBtn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quantity: number
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'decrease'): void
  (e: 'remove'): void
}>()
</script>

<style scoped>
.pos-ctrl-empty {
  display: flex;
  justify-content: flex-end;
}

.pos-ctrl-filled {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.pos-ctrl-fab {
  width: 38px !important;
  height: 38px !important;
}

.pos-ctrl-btn {
  width: 38px !important;
  height: 38px !important;
}

.pos-ctrl-qty {
  font-size: 1.4rem;
  font-weight: 900;
  min-width: 28px;
  text-align: center;
  color: #212121;
}

.pos-ctrl-delete {
  width: 26px !important;
  height: 26px !important;
}
</style>
