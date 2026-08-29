<template>
  <div id="cmp-consolidator-combobox">
    <VCombobox
      v-model="model"
      v-model:menu="menu"
      v-model:search="search"
      v-bind="$attrs"
      hide-selected
      :items="items"
      multiple
      :label="label"
      return-object
      item-value="id"
      item-title="name"
      variant="outlined"
      :filter="customFilter"
      :hide-no-data="!search"
    >
      <template #no-data>
        <VListItem>
          <template #title>
            <span v-if="!searching">Intente con otra búsqueda...</span>
            <span v-else>Buscando...</span>
          </template>
        </VListItem>
      </template>

      <template #selection="{ item }">
        <VChip
          closable
          size="small"
          color="primary"
          variant="elevated"
          @click:close="removeUser(item as UserItem)"
        >
          {{ (item as UserItem).name }}
        </VChip>
      </template>

      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip label size="large" color="success" variant="elevated">
              {{ (item as UserItem).name }}
            </VChip>
          </template>
        </VListItem>
      </template>
    </VCombobox>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

interface UserItem {
  id: number;
  name: string;
}

const props = withDefaults(
  defineProps<{
    consolidatorsx?: UserItem[];
    orgId?: number | string | null;
    label?: string;
  }>(),
  {
    label: "Consolidadores",
  },
);

const emit = defineEmits<{
  (e: "modelChange", val: UserItem[]): void;
}>();

const items = ref<UserItem[]>([]);
const model = ref<UserItem[]>([]);
const search = ref<string | null>(null);
const searching = ref(false);
const menu = ref(false);

const { ConsoSheet } = useRepository();

const consolidatorsId = computed(() => model.value.map((el) => el.id));

let initializing = true;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let requestId = 0;

async function loadConsolidators(queryText: string) {
  if (!props.orgId) {
    items.value = [];
    searching.value = false;
    return;
  }
  const currentRequestId = ++requestId;
  searching.value = true;
  try {
    const result = await ConsoSheet.consolidators<UserItem[]>({
      queryText,
      ids: consolidatorsId.value,
      org_id: props.orgId,
    });
    if (currentRequestId === requestId) {
      items.value = (Array.isArray(result) ? result : []) as UserItem[];
      const selected = model.value;
      if (selected.length > 0) {
        const existingIds = new Set(items.value.map((r) => r.id));
        for (const user of selected) {
          if (!existingIds.has(user.id)) {
            items.value.push(user);
          }
        }
      }
    }
  } catch (error) {
    console.error("Unable to load filtered consolidators", error);
  } finally {
    if (currentRequestId === requestId) {
      searching.value = false;
    }
  }
}

function runSearch(queryText: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadConsolidators(queryText), 500);
}

watch(search, (val) => {
  const q = val?.trim() ?? "";
  if (!q) {
    searching.value = false;
    return;
  }
  runSearch(q);
});

watch(model, (val, prev) => {
  if (val.length === prev.length) return;
  let i = val.length;
  const copy = [...val];
  while (i--) {
    if (typeof copy[i] === "string" || typeof copy[i] === "number")
      copy.splice(i, 1);
  }

  const hasChanged = copy.length !== val.length;
  if (hasChanged) {
    model.value = copy as UserItem[];
  }

  if (val.length > prev.length) {
    nextTick(() => {
      menu.value = true;
    });
  }

  if (!initializing) {
    emit("modelChange", copy as UserItem[]);
  }
});

if (props.consolidatorsx && props.consolidatorsx.length > 0) {
  model.value = [...props.consolidatorsx];
  items.value = [...props.consolidatorsx];
}
nextTick(() => { initializing = false; });

watch(
  () => props.consolidatorsx,
  (val) => {
    if (!val || val.length === 0) return;
    const known = new Set(model.value.map((u) => u.id));
    const fresh = val.filter((u) => !known.has(u.id));
    if (fresh.length === 0) return;
    model.value = [...model.value, ...fresh];
    items.value = [...items.value, ...fresh];
  },
);

watch(
  () => props.orgId,
  (val) => {
    if (val && search.value) {
      runSearch(search.value);
    }
  },
);

function customFilter(
  value: unknown,
  query: string,
  item: { title: string; raw: Record<string, unknown> },
) {
  const text = (item.title ?? "").toString().toLowerCase();
  const q = (query ?? "").toString().toLowerCase();
  return text.includes(q);
}

function removeUser(user: UserItem) {
  model.value = model.value.filter((u) => u.id !== user.id);
  emit("modelChange", model.value);
}
</script>

<style scoped></style>