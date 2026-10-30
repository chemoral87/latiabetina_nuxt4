<template>
  <div v-if="rows.length" id="my-viewport-probe" class="vp-probe">
    <div v-for="r in rows" :key="r.k">
      <b>{{ r.k }}</b> {{ r.v }}
    </div>
    <!-- 300 CSS px reference bar: identical on both browsers unless one is zoomed. -->
    <div class="vp-ruler" />
  </div>
</template>

<script setup lang="ts">
/**
 * Temporary diagnostic overlay. Renders nothing unless the URL carries
 * `?vpdebug=1`, e.g. /consolidation?vpdebug=1.
 *
 * Purpose: compare Chrome-on-iOS vs Safari-on-iOS with the *same* app build.
 * Both are WebKit, so any visible font/scale difference must come from the
 * viewport state below, not from the stylesheet. Delete this file and its
 * one-line usage in app.vue once the numbers are captured.
 */
const rows = ref<{ k: string; v: string }[]>([]);

onMounted(() => {
  if (!new URLSearchParams(location.search).has("vpdebug")) return;

  const cs = getComputedStyle(document.documentElement);
  const cell = document.querySelector(".v-table th, td");
  const vv = window.visualViewport;
  const ua =
    navigator.userAgent.match(/CriOS|FxiOS|EdgiOS|Version\/[\d.]+.*Safari/) ||
    "";

  rows.value = [
    { k: "browser", v: String(ua) || navigator.userAgent.slice(0, 32) },
    { k: "w x h", v: `${innerWidth} x ${innerHeight}` },
    {
      k: "visualViewport",
      v: `${Math.round(vv?.width ?? 0)} scale ${vv?.scale?.toFixed(3) ?? "n/a"}`,
    },
    { k: "dpr", v: String(devicePixelRatio) },
    { k: "html font", v: cs.fontSize },
    {
      k: "text-adjust",
      v:
        cs.getPropertyValue("-webkit-text-size-adjust") ||
        cs.getPropertyValue("text-size-adjust") ||
        "(unset)",
    },
    {
      k: "cell font",
      v: cell ? getComputedStyle(cell).fontSize : "n/a",
    },
    { k: "screen", v: `${screen.width} x ${screen.height}` },
    { k: "standalone", v: matchMedia("(display-mode: standalone)").matches ? "yes" : "no" },
  ];
});
</script>

<style scoped>
.vp-probe {
  position: fixed;
  left: 4px;
  bottom: 96px;
  z-index: 100000;
  max-width: 92vw;
  padding: 4px 6px;
  border-radius: 4px;
  background: #000;
  color: #0f0;
  font: 11px/1.3 monospace;
  word-break: break-all;
  pointer-events: none;
}
.vp-ruler {
  width: 300px;
  height: 6px;
  margin-top: 3px;
  background: #0f0;
}
</style>
