# Auditorium — Seat Marking Components

Documentation of the **current behavior** of the seat editor / seat marking components.

| Component | Used by | Purpose |
|---|---|---|
| `SeatsStageOp.vue` | `pages/auditorium-event/[id]/mark/index.vue` | Interactive Konva stage for **marking seats on a live auditorium event** (the "mark" page). |
| `SeatsStageSubsection.vue` | `SeatsStageOp.vue` | Renders a single subsection (background, row/column labels, stats, seats). Emits `seat-click`. |
| `SeatsStageSubsectionLabel.vue` | `SeatsStageOp.vue` | Renders a label-only subsection (e.g. "Altar"). |
| `SeatsHistory.vue` | `SeatsStageOp.vue` | History dialog listing seat status changes for a subsection. |
| `Seats.vue` | `pages/auditorium/[id]/editor.vue` | Konva canvas for **designing** an auditorium config (assign categories to seats). |
| `Dialog.vue` / `Table.vue` / `Select.vue` | auditorium list & CRUD pages | Auditorium management UI (not seat interaction). |

---

## 1. Two views on the mark page (`SeatsStageOp.vue`)

### Full view (no subsection selected)
- All sections / subsections are drawn at fit zoom (pink stage background).
- **Tapping a subsection zooms into it** (single-subsection view).
- **Seats are NOT selectable here.** `handleSeatClick` returns early when no subsection is selected:
  - a tap on a seat does **not** select it;
  - the tap bubbles up to the subsection group, which zooms into that subsection (same as tapping the subsection background);
  - there is **no auto-zoom-to-seat** behavior.
- Seats that are already selected **keep blinking** in this view so the user can see what is marked (`selectedSeatsArray` + `blinkState` are passed to every subsection render).

### Subsection view (one subsection selected)
- Only the selected subsection is shown, zoomed to fit (lightgray background).
- **Seats are selectable here**: tap toggles a seat in/out of `selectedSeatsArray`.
- Control row (top-left):
  - **Main** → back to full view (keeps the current fit mode),
  - **‹ / ›** → previous / next subsection (circular),
  - **Fit** (both buttons) → fit width / fit height,
  - **Hist** → open the seat history dialog for the current subsection.

---

## 2. Seat selection & touch handling

### Konva 10 pointer events (the important part)
- The project runs **Konva 10.x** (`pointerEventsEnabled: true` by default). On modern
  browsers a tap/click is delivered to Konva as a **`pointerclick`** event, not `click`/`tap`
  (older Konva 8, used by the legacy AUI app, fired `tap`/`click` on touch — hence the
  AUI/nuxt4 behavioral difference).
- To work on every input type, each **seat circle** registers **all three** events:
  `onClick`, `onTap`, **`onPointerClick`**.
- A single physical tap can deliver more than one of these (e.g. `pointerclick` + a
  compatibility `click`), so `handleSeatClick` in `SeatsStageSubsection.vue` **dedupes**
  near-simultaneous events per seat (300 ms window) — a seat toggles exactly once per tap.
- Only the **circle** is the hit target (the seat `<v-group>` has no click handlers), which
  avoids double toggling from Konva's event bubbling.

### Drag vs tap
- The stage is draggable (pan) and pinch-zoomable. Konva only fires the click-equivalent
  when the pointer stays within `dragDistance` of where it went down:
  - **mobile / touch:** `dragDistance: 12px` (a normal finger tap with 3–6 px drift still counts as a click),
  - **desktop:** `5px`.
- `handleSeatClick` in `SeatsStageOp.vue` additionally ignores clicks that follow a real
  drag (`DRAG_THRESHOLD`), so panning the stage never selects seats.

### Selection state
- `selectedSeatsArray` holds the ids of the currently selected seats.
- Selected seats blink every ~330 ms (`blinkState` interval) and the floating mark panel
  shows `Asientos: N`.
- Tapping a selected seat again **deselects** it.

---

## 3. The floating mark panel (the "dialog")

- Appears automatically when at least one seat is selected (`markPanelVisible = arr.length > 0`),
  rendered by `MyDragPanel` in `mode="fixed"`.
- **Positioning** is based on where the user last tapped:
  - tap in the **top half** of the viewport → panel anchored **bottom** (`20px`),
  - tap in the **bottom half** → panel anchored **top** (`60px`),
  - no tap info yet → bottom (`90px`).
- **Status grid** (buttons + label under each), fixed order:
  `e` (Vacío) · `h` (Hombre) · `i` (Nuevo) · `t` (Teen) · `_` (spacer) · `m` (Mujer) · `n` (Niña) · `c` (Niño)
  (`activeStatusConfig` filters out statuses with `active === false`; `_` is only a spacer).
- Tapping a status calls `setEventSeat(status)`:
  - `e` sends `null` (clears the seat status); every other key sends its status code;
  - seats already at the target status are skipped;
  - emits `setEventSeat` `{ seatIds, status }` to the page, which persists via
    `AuditoriumEventSeat.create` (payload `{ i: eventId, z: seatIds, s: status }`);
  - the selection is cleared afterwards.
- Closing the panel (✕) clears the selection.

---

## 4. Zoom, pan & fit

- **Fit Width / Fit Height** recompute `zoomLevel` from the container size vs content size
  (single subsection or whole stage) and center the stage.
- On mount the stage auto-fits to height; entering/leaving a subsection re-fits using the
  last fit mode (`fitstate`).
- **Desktop:** mouse wheel zooms toward the pointer.
- **Touch:** two-finger pinch zooms (and disables stage dragging while pinching); one-finger
  drag pans; `touch-action: none` on the canvas prevents the browser from scrolling/zooming
  the page instead.
- Heights are computed as `calc(100dvh - controlRow - appbar - pageHeader - safe-area)`
  so the stage fills the viewport without page scroll, including on iOS PWA / Safari.

---

## 5. Seat rendering (`SeatsStageSubsection.vue`)

- Subsection box (black with red stroke), row numbers, column letters, title, and a stats
  line (`marked/total` + colored percentage) in the corner.
- Each seat is a `Circle` whose fill/stroke depends on:
  - **status** (`STATUS_COLORS` + `STATUS_ICONS`),
  - **category** stroke color from the `categories` prop,
  - **reserved / selected** states,
  - **selection + blink**: selected seats alternate between their status color and grey
    every 330 ms.
- Seats being saved show a comet-tail arc spinner (`loadingSeats`).

---

## 6. History dialog

- Only available inside a subsection (**Hist** button).
- Fetches `AuditoriumEventSeatLog.index({ auditorium_event_id, section_prefix: <subId>- })`
  and shows the log + involved users in `SeatsHistory.vue`.

---

## 7. Editor page (`Seats.vue`)

- Canvas for building the auditorium configuration: sections, label subsections, seats with
  categories.
- Clicking a seat opens a small **category tooltip** (`Clasificación:` + category options);
  clicking a category assigns it (the seat border takes the category color).
- Uses the same Konva 10 event handling: seat circles listen to `onClick` / `onTap` /
  `onPointerClick`.
- Clicking empty stage space closes the tooltip.

---

## 8. Notes / known items

- The **mark panel title/status buttons** and the seat click flow were fixed for touch by
  adding `pointerclick` listeners + a 300 ms dedupe; keep those if touching this code.
- `SeatsStageOp.vue` still shows ~30 pre-existing `vue/attributes-order` template lint
  warnings (cosmetic, not introduced by the seat-click logic).
- The Vuetify console warning `Multiple nodes with the same ID` comes from the app sidebar
  (`v-list-group :value="false"` in `app/layouts/default.vue`), unrelated to these components.
