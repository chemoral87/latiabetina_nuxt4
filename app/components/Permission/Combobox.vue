<template>
  <div id="cmp-permission-combobox">
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
          @click:close="removePermission(item as PermissionItem)"
        >
          {{ (item as PermissionItem).name }}
        </VChip>
      </template>

      <template #item="{ item, props: itemProps }">
        <VListItem v-bind="itemProps">
          <template #title>
            <VChip label size="large" color="success" variant="elevated">{{
              (item as PermissionItem).name
            }}</VChip>
          </template>
        </VListItem>
      </template>
    </VCombobox>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

interface PermissionItem {
  id: number;
  name: string;
}

const props = withDefaults(
  defineProps<{
    permissionsx?: PermissionItem[];
    label?: string;
  }>(),
  {
    label: "Permisos Directos",
  },
);

const emit = defineEmits<{
  (e: "modelChange", val: PermissionItem[]): void;
}>();

const items = ref<PermissionItem[]>([]);
const model = ref<PermissionItem[]>([]);
const search = ref<string | null>(null);
const searching = ref(false);
const menu = ref(false);

const { Permission } = useRepository();

const permissionsId = computed(() => model.value.map((el) => el.id));

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let requestId = 0;

async function loadPermissions(queryText: string) {
  const currentRequestId = ++requestId;
  searching.value = true;
  try {
    const result = await Permission.filter({
      queryText,
      ids: permissionsId.value,
    });
    if (currentRequestId === requestId) {
      items.value = (Array.isArray(result) ? result : []) as PermissionItem[];
      const selected = model.value;
      if (selected.length > 0) {
        const existingIds = new Set(items.value.map((r) => r.id));
        for (const perm of selected) {
          if (!existingIds.has(perm.id)) {
            items.value.push(perm);
          }
        }
      }
    }
  } catch (error) {
    console.error("Unable to load filtered permissions", error);
  } finally {
    if (currentRequestId === requestId) {
      searching.value = false;
    }
  }
}

function runSearch(queryText: string) {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => loadPermissions(queryText), 500);
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

  if (val.length > prev.length) {
    // Keep the menu open and the current search text so the user can
    // keep clicking additional matching items without retyping the query.
    nextTick(() => {
      menu.value = true;
    });
  }

  if (copy.length !== val.length) {
    model.value = copy as PermissionItem[];
    return;
  }
  emit("modelChange", copy as PermissionItem[]);
});

// Sync the initial selection from the parent's `permissionsx` prop only once,
// matching the old Vuetify 2 component's `mounted()` behavior. We deliberately
// do NOT keep this reactive: the parent re-assigns its permissions ref on every
// `modelChange` emit (see role/[id]/children/index.vue setPermissions), which
// would otherwise loop back here and overwrite `items` with only the currently
// selected permissions, wiping out the rest of the active search results.
if (props.permissionsx && props.permissionsx.length > 0) {
  model.value = [...props.permissionsx];
  items.value = [...props.permissionsx];
}

// Additively merge in permissions added by the parent after mount (e.g. the
// "Crear y agregar" flow on role/[id]/children). Only items missing from the
// current model are appended, so a chip the user removed is never re-added,
// and there is no emit loop: a merged append emits one `modelChange`, the
// parent re-assigns the same array, and the next pass finds nothing new.
watch(
  () => props.permissionsx,
  (val) => {
    if (!val || val.length === 0) return;
    const known = new Set(model.value.map((p) => p.id));
    const fresh = val.filter((p) => !known.has(p.id));
    if (fresh.length === 0) return;
    model.value = [...model.value, ...fresh];
    items.value = [...items.value, ...fresh];
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

function removePermission(perm: PermissionItem) {
  model.value = model.value.filter((p) => p.id !== perm.id);
  emit("modelChange", model.value);
}
</script>

<style scoped></style>
