// Module-level reactive ref — shared across all components
const activeRequests = ref(0)

export function useGlobalProgress() {
  const isLoading = computed(() => activeRequests.value > 0)

  function start() {
    activeRequests.value++
  }

  function finish() {
    if (activeRequests.value > 0) {
      activeRequests.value--
    }
  }

  return { isLoading, start, finish }
}
