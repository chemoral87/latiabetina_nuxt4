<template>
  <VSheet rounded color="white" class="pa-2 pa-sm-3">
    <div class="text-subtitle-1 font-weight-medium d-flex align-center">
      <VIcon start size="small" color="primary">mdi-history</VIcon>
      Interacciones
    </div>
    <VDivider class="my-2" />
    <div>
      <VRow
        id="cmm-logs-controls-row"
        density="compact"
        class="w-100 align-center"
      >
        <VCol cols="12" sm="auto">
          <VBtn
            id="cmm-refresh-logs-btn"
            color="primary"
            variant="outlined"
            :loading="loadingLogs"
            @click="emit('refresh')"
          >
            <VIcon start>mdi-reload</VIcon>
            Refrescar
          </VBtn>
        </VCol>
        <VCol v-if="phoneDigits" sm="4" cols="12">
          <VTextField
            id="cmm-message-input"
            v-model="message"
            clearable
            hide-details
            density="compact"
            variant="outlined"
            placeholder="Mensaje para WhatsApp / SMS"
            append-inner-icon="mdi-message-text-outline"
          />
        </VCol>

        <VCol
          cols="12"
          sm="auto"
          class="d-flex justify-center justify-sm-end ga-2"
        >
          <VTooltip location="top">
            <template #activator="{ props }">
              <VBtn
                v-if="phoneDigits"
                id="cmm-whatsapp-btn"
                icon
                color="green"
                variant="outlined"
                v-bind="props"
                @click="openContact('whatsapp')"
              >
                <VIcon>mdi-whatsapp</VIcon>
              </VBtn>
            </template>
            <span>WhatsApp</span>
          </VTooltip>
          <VTooltip location="top">
            <template #activator="{ props }">
              <VBtn
                v-if="phoneDigits"
                id="cmm-sms-btn"
                icon
                color="teal"
                variant="outlined"
                v-bind="props"
                @click="openContact('sms')"
              >
                <VIcon>mdi-message-text</VIcon>
              </VBtn>
            </template>
            <span>Mensaje</span>
          </VTooltip>
          <VTooltip location="top">
            <template #activator="{ props }">
              <VBtn
                v-if="phoneDigits"
                id="cmm-call-btn"
                icon
                color="primary"
                variant="outlined"
                v-bind="props"
                @click="openContact('llamada')"
              >
                <VIcon>mdi-phone</VIcon>
              </VBtn>
            </template>
            <span>Llamar</span>
          </VTooltip>
          <VTooltip location="top">
            <template #activator="{ props }">
              <VBtn
                id="cmm-face-to-face-btn"
                icon
                variant="outlined"
                color="deep-orange"
                v-bind="props"
                @click="openContact('presencial')"
              >
                <VIcon>mdi-account-group</VIcon>
              </VBtn>
            </template>
            <span>Presencial</span>
          </VTooltip>
        </VCol>
      </VRow>
    </div>
    <div>
      <ChurchMemberTrackingLogTable
        id="cmm-tracking-log-table"
        :loading="loadingLogs"
        :response="logsResponse"
        @edit="(log: Record<string, unknown>) => emit('editLog', log)"
        @delete="(log: Record<string, unknown>) => emit('deleteLog', log)"
        @sorting="(opts: Record<string, unknown>) => emit('sorting', opts)"
      />
    </div>
  </VSheet>
</template>

<script setup lang="ts">
const props = defineProps<{
  member: Record<string, unknown>;
  logsResponse: { data: unknown[]; total: number };
  loadingLogs: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
  editLog: [log: Record<string, unknown>];
  deleteLog: [log: Record<string, unknown>];
  sorting: [opts: Record<string, unknown>];
  contact: [payload: { medium: string; url?: string | null; message: string }];
}>();

const message = ref("");

const phoneDigits = computed(() =>
  String(props.member.cellphone || "").replace(/\D/g, ""),
);

const whatsappHref = computed(() => {
  if (!phoneDigits.value) return null;
  const msg = encodeURIComponent(message.value.trim());
  return msg
    ? `https://wa.me/${phoneDigits.value}?text=${msg}`
    : `https://wa.me/${phoneDigits.value}`;
});

const { isIOS } = useUAParser();

const smsHref = computed(() => {
  if (!phoneDigits.value) return null;
  const msg = encodeURIComponent(message.value.trim());
  if (!msg) return `sms:${phoneDigits.value}`;
  const separator = isIOS() ? "&" : "?";
  return `sms:${phoneDigits.value}${separator}body=${msg}`;
});

const telHref = computed(() =>
  phoneDigits.value ? `tel:${phoneDigits.value}` : null,
);

function openContact(medium: "whatsapp" | "sms" | "llamada" | "presencial") {
  const url =
    medium === "whatsapp"
      ? whatsappHref.value
      : medium === "sms"
        ? smsHref.value
        : medium === "llamada"
          ? telHref.value
          : null;

  if (medium === "whatsapp" && url) {
    triggerWhatsApp();
  } else if ((medium === "sms" || medium === "llamada") && url) {
    window.location.href = url;
  }

  emit("contact", { medium, url, message: message.value.trim() });
}

function triggerWhatsApp() {
  const digits = phoneDigits.value;
  if (!digits) return;
  const encoded = encodeURIComponent(message.value.trim());
  const appUrl = encoded
    ? `whatsapp://send?phone=${digits}&text=${encoded}`
    : `whatsapp://send?phone=${digits}`;
  const webUrl = encoded
    ? `https://wa.me/${digits}?text=${encoded}`
    : `https://wa.me/${digits}`;

  let fallback: ReturnType<typeof window.setTimeout> | null = null;
  function cancelFallback() {
    if (fallback !== null) {
      window.clearTimeout(fallback);
      fallback = null;
    }
    window.removeEventListener("pagehide", onHide);
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("blur", onHide);
  }
  function onHide() {
    cancelFallback();
  }
  function onVis() {
    if (document.hidden) cancelFallback();
  }
  window.addEventListener("pagehide", onHide);
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("blur", onHide);

  window.location.href = appUrl;

  fallback = window.setTimeout(() => {
    fallback = null;
    cancelFallback();
    if (!document.hidden) window.open(webUrl, "_blank", "noopener");
  }, 1200);
}
</script>
