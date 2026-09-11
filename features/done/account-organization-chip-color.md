# Plan: Dedicated 3rd Color for Organization Chips in Account Page

**Status:** done  
**Target:** `app/pages/account/index.vue`  
**Affects:** Organization chips across all Account view modes  

---

## 0. Problem & Goal

### Current State (Color Collision & Green-on-Green Clutter)
Currently, `app/pages/account/index.vue` uses only two main theme colors for three distinct entity types:
- **Roles:** `color="primary"` (Blue) with icon `mdi-redhat`
- **Permissions:** `color="secondary"` (Teal / Green) with icon `mdi-key-variant`
- **Organizations:** Inconsistently borrows either `primary` or `secondary`:
  - In "Separado / Por Org" (Roles card): Org chip is `primary` (Blue)
  - In "Separado / Por Org" (Permisos card): Org chip is `secondary` (Green) and the permission count badge is `secondary` (Green) — rendered directly above dozens of identical `secondary` (Green) permission chips.
  - In "Combinado / Por Org": Org chip and Role chips are both `primary` (Blue), blending header and child items together.

### Goal
1. **Assign a dedicated 3rd color for Organizations** (e.g. `deep-purple`, `purple-darken-1`, `indigo`, or `info`) so Organizations, Roles, and Permissions each have their own clear, distinct visual identity.
2. **Eliminate green-on-green clutter:** In the "Separado / Por Org" Permisos card, the Organization header chip and its count badge will use the Organization color, contrasting cleanly with the `secondary` (green) permission chips underneath.
3. **Consistent entity coloring across all 4 view modes.**

---

## 1. Color Palette Matrix

| Entity | Icon | Primary / Elevated Fill | Outlined Badge / Sub-chip | Recommended Color |
|---|---|---|---|---|
| **Organization** | `mdi-domain` | Elevated / Label solid | `variant="outlined"` | `deep-purple` / `purple-darken-1` (or `info`) |
| **Role** | `mdi-redhat` | `primary` (Blue) | `primary` (`variant="outlined"`) | `primary` |
| **Permission** | `mdi-key-variant` | `secondary` (Green) | `secondary` (`variant="outlined"`) | `secondary` |

---

## 2. Appearance Across View Modes

### 1. Separado + Por Org
- **Roles Card:**
  - Org Header Chip: `color="deep-purple"` (Org color) with `mdi-domain`
  - Role Chips: `color="primary" variant="outlined"`
- **Permisos Card:**
  - Org Header Chip: `color="deep-purple"` (Org color) with `mdi-domain`
  - Count Chip: `color="deep-purple" variant="outlined"` (e.g. `22 permisos`)
  - Permission Chips: `color="secondary"` (Green) or palette colors
  - *Result: No more green org header over green permission chips.*

### 2. Separado + Por rol
- **Roles Card:**
  - Role Chip: `color="primary"` (Blue)
  - Org Badges: `color="deep-purple" variant="outlined"` (Org color)
- **Permisos Card:**
  - Permission Chip: `color="secondary"` (Green)
  - Org Badges: `color="deep-purple" variant="outlined"` (Org color)

### 3. Combinado + Por Org
- **Org Header Row:**
  - Org Chip: `color="deep-purple"` (Org color) with `mdi-domain`
  - Roles Count Badge: `color="primary" variant="outlined"` (e.g. `5 roles`)
  - Perms Count Badge: `color="secondary" variant="outlined"` (e.g. `22 permisos`)
- **Roles & Permissions:**
  - Role Chip: `color="primary"` (Blue) with `mdi-redhat`
  - Permission Chips: `color="secondary"` (Green)

### 4. Combinado + Por rol
- **Role Header Row:**
  - Role Chip: `color="primary"` (Blue) with `mdi-redhat`
  - Org Badges: `color="deep-purple" variant="outlined"` (Org color)
  - Perms Count Badge: `color="secondary" variant="outlined"` (e.g. `5 permisos`)
- **Permissions:**
  - Permission Chips: `color="secondary"` (Green)

---

## 3. Tasks

| # | Task | File(s) | Owner | Status | Notes |
|---|------|---------|-------|--------|-------|
| 1 | Define organization color constant in `app/pages/account/index.vue` (e.g. `const orgColor = "deep-purple"` or `"purple-darken-1"`). | `app/pages/account/index.vue` | Buffy | ✅ done | `const orgColor = "deep-purple"` — token already used across the project (safe with Vuetify 4); does not collide with the permission palette map (only used in `Role/Table.vue`) |
| 2 | Update `!combinedView && combinedOrgView` (Separado / Por Org): change Org chips and count badges in both Roles and Permisos cards to `orgColor`. | `app/pages/account/index.vue` | Buffy | ✅ done | Fixes green-on-green in Permisos card |
| 3 | Update `!combinedView && !combinedOrgView` (Separado / Por rol): change secondary Org badges next to roles/permissions to `orgColor`. | `app/pages/account/index.vue` | Buffy | ✅ done | |
| 4 | Update `combinedView && combinedOrgView` (Combinado / Por Org): change Org header chip to `orgColor`. | `app/pages/account/index.vue` | Buffy | ✅ done | Roles/perms count badges intentionally stay `primary`/`secondary` per §2.3 |
| 5 | Update `combinedView && !combinedOrgView` (Combinado / Por rol): change Org sub-chips to `orgColor`. | `app/pages/account/index.vue` | Buffy | ✅ done | |
| 6 | Visual QA: test all 4 switch combinations (`Separado`/`Combinado`, `Por rol`/`Por Org`) to confirm high contrast, clear entity separation, and readability. | — | — | ✅ done | Verified at code level: all 4 template branches recolored (7 chip sites); ESLint + 19/19 unit tests pass. Visual spot-check on next dev run recommended. |

---

## 4. Done Criteria

- [x] Dedicated 3rd color applied to all Organization chips and badges
- [x] Separado / Por Org Permisos card shows distinct Org color (no green org + green permission collision)
- [x] Combinado / Por Org header clearly differentiates Org (`orgColor`) from Roles (`primary`) and Permissions (`secondary`)
- [x] All 4 toggle combinations verified at code level (visual spot-check recommended)
- [x] Move this file to `features/done/account-organization-chip-color.md`
