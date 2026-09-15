<template>
  <VDialog :id="id" v-model="dialogVisible" max-width="600px">
    <VCard id="cmp-assistance-form">
      <VCardTitle class="d-flex align-center">
        <VIcon class="mr-2">{{ iconTitle }}</VIcon>
        <span class="text-h5">{{ formTitle }}</span>
      </VCardTitle>

      <VCardText class="py-1">
        <VAlert
          v-if="upsertWarning"
          class="mb-4"
          type="warning"
          density="compact">
          Ya existe una asistencia para esta organización, fecha y horario de servicio. Al guardar se reemplazarán los datos existentes.
        </VAlert>

        <VForm ref="formRef" @submit.prevent="save">
          <VRow density="compact">
            <VCol v-if="showOrgSelect" md="3" cols="12">
              <OrganizationSelect
                v-model="item.org_id"
                required
                density="compact"
                variant="outlined"
                :permission="permission"
                :disabled="disabled || isEditMode"
                :rules="[vrules.requiredField('Organización')]"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="ass-form-date"
                v-model="item.assistance_date"
                required
                autofocus
                type="date"
                density="compact"
                variant="outlined"
                :disabled="disabled"
                label="Fecha Asistencia"
                :error-messages="errors?.assistance_date"
                :rules="[vrules.requiredField('Fecha Asistencia')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VSelect
                id="ass-form-service-time"
                v-model="item.service_time"
                required
                density="compact"
                variant="outlined"
                :disabled="disabled"
                label="Hora Servicio"
                :items="serviceTimeOptions"
                :error-messages="errors?.service_time"
                :rules="[vrules.requiredField('Hora Servicio')]"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="ass-form-adults"
                v-model.number="item.adults"
                min="0"
                required
                type="number"
                label="Adultos"
                density="compact"
                variant="outlined"
                :disabled="disabled"
                :error-messages="errors?.adults"
                :rules="[vrules.requiredField('Adultos'), vrules.minValue(0, 'Adultos')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="ass-form-teens"
                v-model.number="item.teens"
                min="0"
                required
                type="number"
                density="compact"
                variant="outlined"
                :disabled="disabled"
                label="Adolescentes"
                :error-messages="errors?.teens"
                :rules="[vrules.requiredField('Adolescentes'), vrules.minValue(0, 'Adolescentes')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="ass-form-kids"
                v-model.number="item.kids"
                min="0"
                required
                label="Niños"
                type="number"
                density="compact"
                variant="outlined"
                :disabled="disabled"
                :error-messages="errors?.kids"
                :rules="[vrules.requiredField('Niños'), vrules.minValue(0, 'Niños')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="3" cols="12">
              <VTextField
                id="ass-form-babies"
                v-model.number="item.babies"
                min="0"
                required
                label="Bebés"
                type="number"
                density="compact"
                variant="outlined"
                :disabled="disabled"
                :error-messages="errors?.babies"
                :rules="[vrules.requiredField('Bebés'), vrules.minValue(0, 'Bebés')]"
                @keyup.enter="save"
              />
            </VCol>
            <VCol md="6" cols="12">
              <VTextarea
                v-model="item.notes"
                rows="1"
                auto-grow
                label="Notas"
                density="compact"
                variant="outlined"
                :disabled="disabled"
                :error-messages="errors?.notes"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <div class="d-flex justify-end px-4 pb-4">
        <VBtn
          id="ass-form-cancel-btn"
          variant="text"
          color="primary"
          :disabled="disabled"
          @click="close">
          Cancelar
        </VBtn>
        <VBtn
          id="ass-form-save-btn"
          color="primary"
          :loading="saving"
          :disabled="saving"
          variant="elevated"
          @click="save">
          Guardar
        </VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { useValidationErrors } from "~/composables/useValidationErrors";
import { useVrules } from "~/composables/useVrules";
import { useAuthStore } from "~/composables/useAuth";

interface AssistanceItem {
  id?: number | null;
  org_id?: number | string | null;
  assistance_date: string;
  service_time: "09:45" | "12:00" | "20:00";
  adults: number;
  teens: number;
  kids: number;
  babies: number;
  notes?: string | null;
}

const props = defineProps<{
  assistance?: Record<string, unknown> | null;
  loading?: boolean;
  permission?: string;
  dialog?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", val: Record<string, unknown>): void;
}>();

const { vrules } = useVrules();
const { errors: validationErrors, clearErrors } = useValidationErrors();
const auth = useAuthStore();

const formRef = ref();
const saving = ref(false);
const dialogVisible = ref(false);

const item = ref<AssistanceItem>({
  id: null,
  org_id: null,
  assistance_date: "",
  service_time: "09:45",
  adults: 0,
  teens: 0,
  kids: 0,
  babies: 0,
  notes: undefined,
});

watch(
  () => props.loading,
  (val) => {
    if (!val) saving.value = false;
  },
  { immediate: true },
);

const isEditMode = computed(() => !!item.value.id);
const iconTitle = computed(() =>
  isEditMode.value ? "mdi-pencil" : "mdi-plus",
);
const formTitle = computed(() => (isEditMode.value ? "Editar" : "Nuevo"));

const serviceTimeOptions = ["09:45", "12:00", "20:00"];

const errors = computed(() => {
  const base = validationErrors.value ? { ...validationErrors.value } : {};
  return base;
});

const showOrgSelect = computed(() => {
  const orgIds = auth.permissionsOrg[props.permission ?? "assistance-index"] ?? [];
  return Array.isArray(orgIds) && orgIds.length > 1;
});

const upsertWarning = ref(false);

watch(
  () => props.assistance,
  (val) => {
    if (val && Object.keys(val).length > 0) {
      item.value = { ...item.value, ...val } as AssistanceItem;
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  initializeForm();
  dialogVisible.value = props.dialog ?? false;
});

function initializeForm() {
  if (props.assistance && Object.keys(props.assistance).length > 0) {
    item.value = { ...item.value, ...props.assistance } as AssistanceItem;
  }
  if (!item.value.org_id && !showOrgSelect.value) {
    const orgIds = auth.permissionsOrg[props.permission ?? "assistance-index"] ?? [];
    if (Array.isArray(orgIds) && orgIds.length === 1) {
      item.value.org_id = orgIds[0];
    }
  }
  clearErrors();
}

function close() {
  emit("close");
}

async function save() {
  if (saving.value) return;
  const form = formRef.value;
  const { valid } = form ? await form.validate() : { valid: true };
  if (!valid) return;
  if (saving.value) return;
  saving.value = true;

  const payload: Record<string, unknown> = { ...item.value };
  if (isEditMode.value) {
    delete payload.org_id;
  }

  emit("save", payload);
}
</script>