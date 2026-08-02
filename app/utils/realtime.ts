/**
 * Module-level tracker to prevent duplicate channel subscriptions across
 * component instances (e.g. on SPA page refresh when onBeforeUnmount hasn't
 * fully completed before a new component subscribes).
 */
const channelSubscriptions = new Set<string>()

/**
 * Create Echo real-time listeners for one or more channels.
 *
 * @param echo            - The Echo instance ($echo)
 * @param channelConfigs  - Array of { name: string, events: object }
 *        name:   The channel name, e.g. "auditorium-event.42"
 *        events: Map of event names → handler, e.g.
 *                { ".seat.updated": (data) => handleSeatUpdate(data) }
 * @param callbacks       - Optional lifecycle callbacks (onConnected/onDisconnected/onError)
 * @param previousCleanup - Optional cleanup function from a previous call.
 * @returns A cleanup function that leaves all subscribed channels.
 */
export function createRealtimeListeners(
  echo: {
    leave: (name: string) => void
    channel: (name: string) => {
      subscribed: (cb?: () => void) => unknown
      error: (cb?: () => void) => unknown
      stopListening: (event: string) => unknown
      listen: (event: string, handler: (data: unknown) => void) => unknown
    }
    connector?: { pusher?: { connection?: { state?: string } } }
  } | null,
  channelConfigs: { name: string; events: Record<string, (data: unknown) => void> }[],
  callbacks: { onConnected?: () => void; onDisconnected?: () => void; onError?: () => void } = {},
  previousCleanup?: (() => void) | null,
): () => void {
  if (typeof previousCleanup === "function") {
    previousCleanup()
  }
  if (!echo || !channelConfigs || channelConfigs.length === 0) return () => {}

  const channels: Record<string, ReturnType<typeof echo.channel>> = {}

  channelConfigs.forEach(({ name, events }) => {
    if (!name) return
    if (channels[name]) return

    // ── Global duplicate guard ───────────────────────────────────────────
    if (channelSubscriptions.has(name)) {
      echo.leave(name)
      channelSubscriptions.delete(name)
    }

    const channel = echo.channel(name)

    channel
      .subscribed(() => {
        callbacks.onConnected?.()
      })
      .error(() => {
        callbacks.onError?.()
        callbacks.onDisconnected?.()
      })

    channelSubscriptions.add(name)

    if (events) {
      Object.keys(events).forEach((eventName) => {
        const handler = events[eventName]
        if (typeof handler === "function") {
          channel.stopListening(eventName)
          channel.listen(eventName, handler)
        }
      })
    }

    channels[name] = channel
  })

  // Reflect current connection state
  const state = echo?.connector?.pusher?.connection?.state
  if (state === "connected") {
    callbacks.onConnected?.()
  }

  // Return a cleanup function that also clears the global tracker
  return () => {
    Object.keys(channels).forEach((name) => {
      echo.leave(name)
      channelSubscriptions.delete(name)
      delete channels[name]
    })
  }
}

export default createRealtimeListeners
