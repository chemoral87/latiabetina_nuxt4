/**
 * Deterministic color mapping for permission chip prefixes.
 *
 * Permission names follow `{group}-{action}`.
 * The group key drops only the last hyphen-segment (the action word):
 *   - `user-index`                        → `user`
 *   - `church-member-update`              → `church-member`
 *   - `church-member-medal-update`        → `church-member-medal`
 *   - `church-member-tracking-logs-index` → `church-member-tracking-logs`
 *
 * Groups that appear only once on the current page fall back to `primary` (blue).
 * Repeated groups are assigned a color from a fixed palette via a stable string hash.
 */

const PALETTE = [
  'purple',
  'teal',
  'pink-darken-2',
  'indigo',
  'brown',
  'cyan-darken-2',
  'deep-orange-darken-1',
  'blue-grey',
  'lime-darken-4',
  'amber-darken-4',
  'green-darken-1',
  'red-darken-2',
  'light-blue-darken-3',
  'orange-darken-2',
  'blue-darken-1',
  'yellow-darken-4',
  'grey-darken-3',
  'light-green-darken-3',
  'deep-purple',
  'deep-orange-darken-3',
  'teal-darken-1',
  'indigo-darken-1',
  'brown-darken-1',
  'red-darken-1',
]

/**
 * Extract the grouping key from a permission name by dropping the last segment.
 *
 * @example permissionGroupKey("user-index")                        // "user"
 * @example permissionGroupKey("church-member-update")              // "church-member"
 * @example permissionGroupKey("church-member-medal-update")        // "church-member-medal"
 * @example permissionGroupKey("church-member-tracking-logs-index") // "church-member-tracking-logs"
 */
export function permissionGroupKey(name: string): string {
  const lastHyphen = name.lastIndexOf('-')
  if (lastHyphen <= 0) return name
  return name.slice(0, lastHyphen)
}

/**
 * Count the number of hyphen characters in a string without array allocations.
 */
function countHyphens(str: string): number {
  let count = 0
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) === 45) count++
  }
  return count
}

/**
 * Stable 32-bit hash for a string (FNV-1a). Always non-negative.
 */
function hashString(str: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/**
 * Build a lookup mapping every full permission name → Vuetify color token.
 *
 * Groups that appear ≥ 2 times across the provided list get a deterministic
 * palette color; singletons fall back to `"primary"`.
 *
 * @example buildPermissionColorMap(["church-member-update", "church-member-index", "user-index"])
 *   // { "church-member-update": "teal-darken-2", "church-member-index": "teal-darken-2", "user-index": "primary" }
 */
export function buildPermissionColorMap(names: string[]): Record<string, string> {
  const groupCounts = new Map<string, number>()
  for (const name of names) {
    const key = permissionGroupKey(name)
    groupCounts.set(key, (groupCounts.get(key) ?? 0) + 1)
  }

  const colorMap: Record<string, string> = {}
  for (const name of names) {
    const key = permissionGroupKey(name)
    const count = groupCounts.get(key) ?? 0
    if (count >= 2) {
      const idx = hashString(key) % PALETTE.length
      colorMap[name] = PALETTE[idx]
    } else {
      colorMap[name] = 'primary'
    }
  }
  return colorMap
}

/**
 * Map any name (role, permission group, etc.) to a deterministic Vuetify
 * color token from PALETTE, using a hash of the full name string.
 * Unlike `buildPermissionColorMap` there is no group-keying step, so every
 * distinct name gets its own stable color regardless of how many times it
 * appears.
 */
export function hashColorForName(name: string): string {
  const idx = hashString(name) % PALETTE.length
  return PALETTE[idx]
}

/**
 * Compare two permission names by group alphabetically, then by segment count
 * (fewer = more general = first), then alphabetically by full name.
 *
 * @example comparePermissionNames("church-member-index", "church-member-consolidator-assign")
 *   // negative — "church-member-index" (3 segments) comes before "church-member-consolidator-assign" (4)
 */
export function comparePermissionNames(a: string, b: string): number {
  const groupCmp = permissionGroupKey(a).localeCompare(permissionGroupKey(b))
  if (groupCmp !== 0) return groupCmp
  const depthCmp = countHyphens(a) - countHyphens(b)
  if (depthCmp !== 0) return depthCmp
  return a.localeCompare(b)
}

/**
 * Sort a list of permission name strings for display.
 * Returns a NEW array without mutating the input.
 *
 * @example sortPermissionNamesForDisplay([
 *   "church-member-consolidator-assign",
 *   "church-member-index",
 *   "church-member-delete",
 * ])
 * // → ["church-member-delete", "church-member-index", "church-member-consolidator-assign"]
 */
export function sortPermissionNamesForDisplay(names: string[]): string[] {
  return [...names].sort(comparePermissionNames)
}

/**
 * Sort permissions for display: groups alphabetically, then by segment count
 * (fewer segments = more general = shown first) within each group. Ties
 * preserve the original order (stable sort).
 *
 * @example sortPermissionsForDisplay([
 *   { name: "church-member-all" },
 *   { name: "church-member-consolidator-assign" },
 *   { name: "church-member-index" },
 *   { name: "church-member-delete" },
 *   { name: "church-member-update" },
 *   { name: "church-member-create" },
 * ])
 * // → church-member-all, church-member-create, church-member-delete,
 * //   church-member-index, church-member-update, church-member-consolidator-assign
 */
export function sortPermissionsForDisplay<T extends { name: string }>(permissions: T[]): T[] {
  return [...permissions].sort((a, b) => comparePermissionNames(a.name, b.name))
}
