/**
 * Blocks browser pinch-zoom on iOS Safari.
 *
 * Why this exists: iOS 10+ Safari ignores `user-scalable=no` and
 * `maximum-scale` in the viewport meta (accessibility decision), so the only
 * working lever is preventing the gestures themselves. Chrome/Android honour
 * the meta, and `html { touch-action: manipulation }` (assets/css/global.css)
 * already covers double-tap zoom — this plugin handles the two-finger pinch.
 *
 * Trade-off: the user loses the ability to zoom the page at all. Anything that
 * needs its own pinch (Konva canvases) is unaffected — those preventDefault on
 * their own touchmove and never depended on browser zoom/pan here.
 *
 * Delete this file to restore normal pinch behaviour.
 */
export default defineNuxtPlugin(() => {
  // Safari-only gestures. `gesturestart` is WebKit's proprietary event; the
  // listener must be non-passive or preventDefault() is ignored.
  const block = (event: Event) => event.preventDefault()

  document.addEventListener('gesturestart', block, { passive: false })
  document.addEventListener('gesturechange', block, { passive: false })
  document.addEventListener('gestureend', block, { passive: false })

  // Two-finger touchmove: window listeners are passive by default since
  // iOS 11.3, hence the explicit `passive: false`. Single-finger scrolling is
  // untouched, so the page still scrolls normally.
  window.addEventListener(
    'touchmove',
    (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault()
    },
    { passive: false }
  )
})
