<template>
  <VCard id="cmp-product-card" variant="outlined" class="d-flex flex-column fill-height" style="position: relative">
    <div class="product-card__order-btns">
      <VBtn id="prd-card-moveleft-btn" icon size="x-small" class="order-btn" :disabled="isFirst" @click="emit('move-left', product)">
        <VIcon size="x-small">mdi-chevron-left</VIcon>
      </VBtn>
      <VBtn id="prd-card-moveright-btn" icon size="x-small" class="order-btn" :disabled="isLast" @click="emit('move-right', product)">
        <VIcon size="x-small">mdi-chevron-right</VIcon>
      </VBtn>
    </div>

    <div
      class="d-flex flex-column flex-grow-1"
      :style="product.hidden ? 'opacity: 0.7; background-color: #b0b0b0;' : ''"
    >
      <VImg
        :src="product.image_s3 || ''"
        height="180px"
        contain
        :style="product.hidden ? 'filter: brightness(0.7);' : ''"
        class="bg-grey-lighten-4"
      >
        <template #placeholder>
          <VRow class="fill-height ma-0" align="center" justify="center">
            <VIcon color="grey-lighten-1">mdi-package-variant</VIcon>
          </VRow>
        </template>
      </VImg>

      <VCardTitle class="text-subtitle-1 font-weight-bold pb-1 d-flex align-center">
        <span class="text-truncate d-block">{{ product.name }}</span>
        <VIcon v-if="product.requires_preparation" color="orange-darken-1" small class="ml-1 flex-shrink-0">
          mdi-chef-hat
        </VIcon>
      </VCardTitle>

      <VCardSubtitle class="pb-1">
        <span class="text-grey text-caption">SKU: {{ product.sku }}</span>
      </VCardSubtitle>

      <VCardText class="flex-grow-1 pt-0">
        <div class="text-h6 text-primary font-weight-black">${{ formatNumber(product.price) }}</div>
        <div v-if="product.description" class="text-caption text-grey text-truncate mb-2">
          {{ product.description }}
        </div>
        <div class="text-body-2 mb-2">
          Stock:
          <strong :class="product.stock > 0 ? 'text-success' : 'text-error'">{{ product.stock }}</strong>
        </div>
        <VSwitch
          v-model="product.requires_preparation"
          label="Requiere preparar"
          density="compact"
          hide-details
          class="mt-0 pt-0"
          @change="emit('toggle-preparation', product)"
        />
      </VCardText>
    </div>

    <VDivider></VDivider>

    <VCardActions class="justify-end">
      <VBtn id="prd-card-toggle-btn" icon size="small" class="mr-1" @click="emit('toggle-hidden', product)">
        <VIcon size="small" :color="product.hidden ? 'warning' : 'grey'">
          {{ product.hidden ? 'mdi-eye-off' : 'mdi-eye' }}
        </VIcon>
      </VBtn>
      <VBtn id="prd-card-edit-btn" icon size="small" color="primary" @click="emit('edit', product)">
        <VIcon size="small">mdi-pencil</VIcon>
      </VBtn>
      <VBtn id="prd-card-delete-btn" icon size="small" color="error" @click="emit('delete', product)">
        <VIcon size="small">mdi-delete</VIcon>
      </VBtn>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: Record<string, unknown>
  isFirst?: boolean
  isLast?: boolean
}>()

defineEmits<{
  (e: 'toggle-preparation', val: Record<string, unknown>): void
  (e: 'toggle-hidden', val: Record<string, unknown>): void
  (e: 'edit', val: Record<string, unknown>): void
  (e: 'delete', val: Record<string, unknown>): void
  (e: 'move-left', val: Record<string, unknown>): void
  (e: 'move-right', val: Record<string, unknown>): void
}>()

const isFirst = computed(() => props.isFirst ?? false)
const isLast = computed(() => props.isLast ?? false)

function formatNumber(val: unknown): string {
  const num = Number(val)
  if (isNaN(num)) return String(val ?? "")
  return num.toLocaleString()
}
</script>

<style scoped>
.product-card__order-btns {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  display: flex;
  gap: 4px;
}

.order-btn {
  background-color: #ff6f00 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
}

.order-btn :deep(.v-icon) {
  color: #ffffff !important;
}

.order-btn.v-btn--disabled {
  background-color: rgba(0, 0, 0, 0.18) !important;
  box-shadow: none !important;
}

.order-btn.v-btn--disabled :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.35) !important;
}
</style>
