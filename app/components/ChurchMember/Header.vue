<template>
  <VSheet rounded color="white" class="pa-2 pa-sm-3">
    <div class="text-subtitle-1 font-weight-medium d-flex align-center">
      <VIcon start size="small" color="primary">mdi-account</VIcon>
      <span class="text-subtitle-2 text-truncate">{{ member.name }}</span>
      <VSpacer />
      <VChip
        size="small"
        variant="elevated"
        :color="statusColor(member.status)"
      >
        {{ statusLabel(member.status) }}
      </VChip>
      <VBtn
        id="cmm-status-edit-btn"
        variant="text"
        color="primary"
        rounded="circle"
        icon="mdi-pencil"
        title="Cambiar estado"
        aria-label="Cambiar estado del miembro"
        @click="emit('statusEdit')"
      />
    </div>
    <VDivider class="my-2" />

    <div>
      <VRow v-if="medals.length > 0" id="cmm-medals-row" density="compact">
        <VCol cols="12" class="d-flex flex-wrap align-center">
          <VIcon size="small" color="primary">mdi-medal-outline</VIcon>
          <template v-for="medal in medals" :key="medal.id">
            <VTooltip location="top">
              <template #activator="{ props: tp }">
                <VChip
                  v-bind="tp"
                  size="small"
                  variant="tonal"
                  class="cursor-pointer"
                  :color="medalColor(medal.medal)"
                >
                  <VIcon start size="small">{{ medalIcon(medal.medal) }}</VIcon>
                  {{ medalLabel(medal.medal) }}
                  <template #append>
                    <VIcon
                      :id="'medal-info-' + medal.id"
                      color="grey"
                      size="small"
                      class="cursor-pointer ml-2"
                      :aria-label="'Información de ' + medalLabel(medal.medal)"
                      >mdi-help-circle-outline</VIcon
                    >
                    <VIcon
                      size="small"
                      color="error"
                      class="cursor-pointer ml-2"
                      :aria-label="'Eliminar medalla ' + medalLabel(medal.medal)"
                      @click.stop="emit('medalDelete', medal)"
                      >mdi-close</VIcon
                    >
                  </template>
                </VChip>
              </template>
              <span>{{ medalLabel(medal.medal) }} {{ medalDetail(medal) }}</span>
            </VTooltip>
            <VMenu location="top" :activator="'#medal-info-' + medal.id">
              <VCard class="pa-2" max-width="220">
                <div class="text-caption">
                  {{ medalLabel(medal.medal) }} {{ medalDetail(medal) }}
                </div>
              </VCard>
            </VMenu>
          </template>
          <VBtn
            id="cmm-medal-add-btn"
            icon
            size="x-small"
            variant="text"
            color="primary"
            title="Agregar medalla"
            aria-label="Agregar medalla"
            @click="emit('medalAdd')"
          >
            <VIcon size="x-small">mdi-plus</VIcon>
          </VBtn>
        </VCol>
      </VRow>
      <VRow v-else id="cmm-medals-empty-row" density="compact">
        <VCol cols="12" class="d-flex align-center">
          <VBtn
            id="cmm-medal-add-btn"
            size="x-small"
            variant="text"
            color="primary"
            prepend-icon="mdi-medal-outline"
            @click="emit('medalAdd')"
          >
            Agregar medalla
          </VBtn>
        </VCol>
      </VRow>
      <VRow id="cmm-info-row" density="compact">
        <VCol
          md="5"
          cols="12"
          class="d-flex justify-center align-center order-md-2"
        >
          <VAvatar
            v-if="member.url_image_s3"
            size="80"
            rounded="circle"
            class="cursor-pointer"
            @click="emit('edit')"
          >
            <VImg cover alt="Foto del miembro" :src="member.url_image_s3" />
          </VAvatar>
          <VIcon
            v-else
            size="64"
            class="cursor-pointer"
            color="grey-lighten-1"
            @click="emit('edit')"
            >mdi-account-circle</VIcon
          >
        </VCol>
        <VCol md="7" cols="12" class="order-md-1">
          <div class="d-flex align-center mb-1">
            <VBtn
              id="cmm-info-toggle-btn"
              size="x-small"
              variant="text"
              color="primary"
              :prepend-icon="showInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              @click="showInfo = !showInfo"
            >
              {{ showInfo ? "Ocultar datos" : "Ver datos" }}
            </VBtn>
          </div>
          <VExpandTransition>
            <VRow v-show="showInfo" density="compact">
              <VCol sm="6" cols="12" class="text-body-2">
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-account</VIcon
                >
                <span class="font-weight-medium">Nombre:</span>
                {{ fullName }}
              </VCol>
              <VCol
                v-if="member.cellphone"
                sm="6"
                cols="12"
                class="text-body-2"
              >
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-phone</VIcon
                >
                <span class="font-weight-medium">Celular:</span>
                {{ member.cellphone }}
              </VCol>
              <VCol
                v-if="member.years_old != null"
                sm="6"
                cols="12"
                class="text-body-2"
              >
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-calendar-account</VIcon
                >
                <span class="font-weight-medium">Edad:</span>
                {{ member.years_old }}
              </VCol>
              <VCol
                v-if="member.number_of_children != null"
                sm="6"
                cols="12"
                class="text-body-2"
              >
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-account-multiple</VIcon
                >
                <span class="font-weight-medium">Hijos:</span>
                {{ member.number_of_children }}
              </VCol>
              <VCol
                v-if="member.marriage_status"
                sm="6"
                cols="12"
                class="text-body-2"
              >
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-ring</VIcon
                >
                <span class="font-weight-medium">Estado civil:</span>
                {{ member.marriage_status }}
              </VCol>
              <VCol
                v-if="creatorName"
                sm="6"
                cols="12"
                class="text-body-2"
              >
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-account-check</VIcon
                >
                <span class="font-weight-medium">Creado por:</span>
                {{ creatorName }}
              </VCol>
              <VCol
                v-if="member.address"
                cols="12"
                class="text-body-2 d-none d-sm-flex"
              >
                <VIcon start size="x-small" color="grey-darken-1"
                  >mdi-map-marker</VIcon
                >
                <span class="font-weight-medium">Dirección:</span>
                {{ member.address }}
              </VCol>
            </VRow>
          </VExpandTransition>
        </VCol>
      </VRow>

      <VRow
        v-if="member.address"
        id="cmm-address-mobile-row"
        density="compact"
        class="d-flex d-sm-none"
      >
        <VCol cols="12" class="text-body-2 py-1">
          <VIcon start size="x-small" color="grey-darken-1"
            >mdi-map-marker</VIcon
          >
          <span class="font-weight-medium">Dirección:</span>
          {{ member.address }}
        </VCol>
      </VRow>
      <VRow id="cmm-edit-row" class="mt-1" density="compact">
        <VCol cols="12" class="d-flex justify-end">
          <VBtn
            id="cmm-edit-btn"
            color="primary"
            variant="elevated"
            prepend-icon="mdi-pencil"
            @click="emit('edit')"
          >
            Editar
          </VBtn>
        </VCol>
      </VRow>
    </div>

    <VDivider class="my-2" />
  </VSheet>
</template>

<script setup lang="ts">
import { MONTHS_SHORT } from "~/utils/date";

interface Medal {
  id: number;
  medal: string;
  description: Record<string, unknown> | string | null;
}

const props = defineProps<{
  member: Record<string, unknown>;
  medals: Medal[];
}>();

defineEmits<{
  edit: [];
  statusEdit: [];
  medalAdd: [];
  medalDelete: [medal: Medal];
}>();

const showInfo = ref(false);

const { statusLabel, statusColor } = useChurchMemberStatus();

const fullName = computed(
  () =>
    [props.member.name, props.member.last_name, props.member.second_last_name]
      .filter(Boolean)
      .join(" ") || "Miembro",
);

const creatorName = computed(() => {
  const creator = props.member.creator as
    | { name?: string; last_name?: string }
    | undefined;
  if (!creator) return null;
  return [creator.name, creator.last_name].filter(Boolean).join(" ") || null;
});

const MEDAL_OPTIONS = [
  { title: "Bautizo", value: "bautizo" },
  { title: "EDIN", value: "edin" },
  { title: "Servicio", value: "servicio" },
];
const MEDAL_COLORS: Record<string, string> = {
  bautizo: "blue",
  edin: "green",
  servicio: "orange",
};
const MEDAL_ICONS: Record<string, string> = {
  bautizo: "mdi-water",
  edin: "mdi-school",
  servicio: "mdi-hand-heart",
};

const monthLabel = (m: unknown) => {
  const idx = Number(m) - 1;
  return idx >= 0 && idx < 12 ? MONTHS_SHORT[idx] : String(m ?? "");
};

function medalLabel(medal: unknown): string {
  return MEDAL_OPTIONS.find((m) => m.value === medal)?.title ?? String(medal ?? "");
}
function medalColor(medal: unknown): string {
  return MEDAL_COLORS[String(medal)] ?? "grey";
}
function medalIcon(medal: unknown): string {
  return MEDAL_ICONS[String(medal)] ?? "mdi-medal";
}
function medalDetail(medal: Medal): string {
  const d = medal.description;
  if (!d) return medalLabel(medal.medal);
  if (typeof d === "string") return d;
  const monthYear = [monthLabel(d.month), d.year ?? ""].filter(Boolean).join(" ");
  if (medal.medal === "bautizo" && (d.month || d.year)) return monthYear;
  if (medal.medal === "edin") {
    const level = d.level != null ? `Nivel ${d.level}` : "";
    return [level, monthYear].filter(Boolean).join(" ") || medalLabel(medal.medal);
  }
  if (medal.medal === "servicio") {
    const area = d.area != null ? String(d.area) : "";
    return [area, monthYear].filter(Boolean).join(" ") || medalLabel(medal.medal);
  }
  return medalLabel(medal.medal);
}
</script>
