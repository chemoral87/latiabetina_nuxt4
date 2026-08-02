// Module-level reactive ref — shared across all components
const activeRequests = ref(0)

// Only requests fired during a route navigation (the page's initial fetch)
// drive the global progress bar. In-page operations (refresh, filter, sort,
// save...) run afterwards and must NOT show it.
let navigating = false
let navigationRequests = 0

export function useGlobalProgress() {
  const isLoading = computed(() => activeRequests.value > 0)

  function beginNavigation() {
    navigating = true
  }

  function endNavigation() {
    navigating = false
  }

  function start() {
    if (navigating) {
      navigationRequests++
      activeRequests.value++
    }
  }

  function finish() {
    if (navigationRequests > 0) {
      navigationRequests--
      if (activeRequests.value > 0) {
        activeRequests.value--
      }
      if (navigationRequests === 0) {
        navigating = false
      }
    }
  }

  return { isLoading, beginNavigation, endNavigation, start, finish }
}
