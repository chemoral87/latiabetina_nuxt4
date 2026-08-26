/**
 * Convert Vuetify 4 table options to backend API params.
 * Single source of truth per `ai_rule/index_page_table_pattern.md`:
 * `lastOptions` (Vuetify `{key,order}`) → `buildApiParams()` → backend `{sortBy:[],sortDesc:[]}`.
 * Also passes through any extra filters (`filter`, `status`, `org_id`, `date_from`, `date_to`, …)
 * present in `opts` so callers don't maintain per-page filter branches.
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
  for (const [key, value] of Object.entries(opts)) {
    if (["page", "itemsPerPage", "sortBy"].includes(key)) continue;
    if (value === undefined || value === null || value === "") continue;
    params[key] = value;
  }

  return params;
}
