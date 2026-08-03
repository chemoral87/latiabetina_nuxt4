<template>
  <div class="kds-items-list pa-3 pt-0">
    <div
      v-for="(row, rowIndex) in preparationRows"
      :key="`${row.item.id}-${rowIndex}`"
      :id="`pos-kds-item-${order.id}-${row.item.id}-${rowIndex}`"
      class="kds-item-row"
      :class="{ 'kds-item-row-done': isRowDone(row) || isItemCompleted(row.item) }"
      :title="statusTitle(row.item)"
      @click="toggleRow(row.item.id, rowIndex)"
    >
      <div class="kds-item-thumb">
        <VImg
          v-if="row.item.product?.image_s3"
          :src="row.item.product.image_s3"
          height="36"
          width="36"
          class="rounded"
        >
          <template #placeholder>
            <VSheet height="36" width="36" color="grey-lighten-3" class="d-flex align-center justify-center rounded">
              <VIcon size="small" color="grey-lighten-1">mdi-food</VIcon>
            </VSheet>
          </template>
        </VImg>
        <VSheet v-else height="36" width="36" color="grey-lighten-3" class="d-flex align-center justify-center rounded">
          <VIcon size="small" color="grey-lighten-1">mdi-food</VIcon>
        </VSheet>
      </div>

      <div class="kds-item-info">
        <div class="kds-item-name">{{ row.item.product?.name }}</div>
        <div v-if="row.item.product?.description" class="kds-item-desc">{{ row.item.product.description }}</div>
      </div>

      <VBtn
        v-if="isRowDone(row)"
        :id="`pos-kds-item-undo-${order.id}-${row.item.id}-${rowIndex}`"
        icon
        rounded="circle"
        size="small"
        color="orange-darken-2"
        variant="flat"
        class="kds-undo-button"
        @click.stop="undoRow(row.item.id, rowIndex)"
      >
        <VIcon size="small" color="white">mdi-undo-variant</VIcon>
      </VBtn>

      <VBtn
        icon
        rounded="circle"
        size="small"
        :color="isRowDone(row) || isItemCompleted(row.item) ? 'success' : 'orange-darken-2'"
        variant="flat"
        class="kds-toggle-button"
        @click.stop="toggleRow(row.item.id, rowIndex)"
      >
        <VIcon size="small" color="white">
          {{ isRowDone(row) || isItemCompleted(row.item) ? 'mdi-check' : 'mdi-chef-hat' }}
        </VIcon>
      </VBtn>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KdsItem {
  id: number
  quantity: number
  completed_quantity?: number
  product?: {
    name?: string
    description?: string
    image_s3?: string
    requires_preparation?: boolean
  }
}

interface KdsOrder {
  id: number
  items?: KdsItem[]
}

const props = defineProps<{
  order: KdsOrder
  doneMap: Record<string, Record<string, boolean>>
  isItemCompleted: (item: KdsItem) => boolean
  statusTitle: (item: KdsItem) => string
}>()

const emit = defineEmits<{
  (e: 'toggle-row-done', saleId: number, itemId: number, rowIndex: number): void
  (e: 'undo-row-done', saleId: number, itemId: number, rowIndex: number): void
}>()

interface PrepRow {
  item: KdsItem
  rowIndex: number
}

const preparationRows = computed<PrepRow[]>(() => {
  const rows: PrepRow[] = []
  const items = props.order.items?.filter((item) => item.product?.requires_preparation === true) || []
  items.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      rows.push({ item, rowIndex: i })
    }
  })
  return rows
})

function rowKey(itemId: number, rowIndex: number): string {
  return `${itemId}-${rowIndex}`
}

function isRowDone(row: PrepRow): boolean {
  const map = props.doneMap?.[props.order.id] || {}
  const doneEntry = map[rowKey(row.item.id, row.rowIndex)]
  if (doneEntry !== undefined) return !!doneEntry
  return (row.item.completed_quantity ?? 0) > row.rowIndex
}

function toggleRow(itemId: number, rowIndex: number) {
  emit('toggle-row-done', props.order.id, itemId, rowIndex)
}

function undoRow(itemId: number, rowIndex: number) {
  emit('undo-row-done', props.order.id, itemId, rowIndex)
}
</script>

<style scoped>
.kds-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kds-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.kds-item-row:hover {
  background: #fff3e0;
}

.kds-item-row-done {
  opacity: 0.6;
  background: #e8f5e9 !important;
}

.kds-item-row-done:hover {
  background: #c8e6c9 !important;
}

.kds-toggle-button {
  min-width: 28px;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.kds-undo-button {
  min-width: 28px;
  width: 28px;
  height: 28px;
  margin-left: auto;
}

.kds-item-thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
}

.kds-item-info {
  flex: 1;
  min-width: 0;
}

.kds-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.kds-item-desc {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
