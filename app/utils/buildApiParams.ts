/**
 * Convert Vuetify 4 table options to backend API params.
 * Single source of truth per `ai_rule/index_page_table_pattern.md`:
 * `lastOptions` (Vuetify `{key,order}`) → `buildApiParams()` → backend `{sortBy:[],sortDesc:[]}`.
 * Also passes through any extra filters (`filter`, `status`, `org_id`, `date_from`, `date_to`, …)
 * present in `opts` so callers don't maintain per-page filter branches.
 * Filters out known problematic Vuetify/internal parameters that should not be sent to the API.
 */
export function buildApiParams(
  opts: Record<string, unknown>,
): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: (opts.page as number) ?? 1,
    itemsPerPage: (opts.itemsPerPage as number) ?? 10,
  };

  const sortBy = (opts.sortBy as { key: string; order: string }[]) ?? [];
  if (sortBy.length > 0) {
    params.sortBy = [sortBy[0].key];
    params.sortDesc = [sortBy[0].order === "desc"];
  }

  // Passthrough any additional query keys (filter, org_id, status, date_from, …)
  // Skip pagination/sort which are already mapped; ignore empty values.
  // Also filter out known problematic parameters that should not be sent to API
  const blockedParams = new Set([
    'page', 'itemsPerPage', 'sortBy', // Already mapped above
    'isTrusted', '_vts', 'stopImmediatePropagation', // Vuetify/internal problematic params
  ]);

  for (const [key, value] of Object.entries(opts)) {
    if (blockedParams.has(key)) continue;
    if (value === undefined || value === null || value === "") continue;
    params[key] = value;
  }

  return params;
}
