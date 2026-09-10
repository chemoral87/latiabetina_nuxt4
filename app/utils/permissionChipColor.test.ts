import { describe, it, expect } from "vitest"
import {
  permissionGroupKey,
  buildPermissionColorMap,
  comparePermissionNames,
  sortPermissionNamesForDisplay,
  sortPermissionsForDisplay,
} from "./permissionChipColor"

describe("permissionGroupKey", () => {
  it("drops last segment for 2-segment names", () => {
    expect(permissionGroupKey("user-index")).toBe("user")
    expect(permissionGroupKey("auditorium-index")).toBe("auditorium")
  })

  it("drops last segment for 3-segment names", () => {
    expect(permissionGroupKey("church-member-update")).toBe("church-member")
    expect(permissionGroupKey("auditorium-event-create")).toBe("auditorium-event")
  })

  it("drops only the last segment for 5-segment names", () => {
    expect(permissionGroupKey("church-member-tracking-logs-index")).toBe("church-member-tracking-logs")
  })

  it("three church-member variants produce three distinct keys", () => {
    expect(permissionGroupKey("church-member-update")).toBe("church-member")
    expect(permissionGroupKey("church-member-medal-update")).toBe("church-member-medal")
    expect(permissionGroupKey("church-member-tracking-logs-index")).toBe("church-member-tracking-logs")
  })

  it("single-segment name returns itself", () => {
    expect(permissionGroupKey("consolidador")).toBe("consolidador")
  })
})

describe("buildPermissionColorMap", () => {
  it("singletons fall back to primary", () => {
    const map = buildPermissionColorMap(["user-index", "role-index", "permission-index"])
    expect(map["user-index"]).toBe("primary")
    expect(map["role-index"]).toBe("primary")
    expect(map["permission-index"]).toBe("primary")
  })

  it("same key appearing twice gets a deterministic palette color", () => {
    const map = buildPermissionColorMap(["church-member-update", "church-member-index"])
    const color = map["church-member-update"]
    expect(color).not.toBe("primary")
    expect(map["church-member-index"]).toBe(color)
  })

  it("church-member / church-member-medal / church-member-tracking-logs produce three distinct colors", () => {
    const map = buildPermissionColorMap([
      "church-member-update",
      "church-member-index",
      "church-member-medal-update",
      "church-member-medal-create",
      "church-member-tracking-logs-index",
      "church-member-tracking-logs-all",
    ])
    const c1 = map["church-member-update"]
    const c2 = map["church-member-medal-update"]
    const c3 = map["church-member-tracking-logs-index"]
    expect(c1).not.toBe("primary")
    expect(c2).not.toBe("primary")
    expect(c3).not.toBe("primary")
    expect(c1).not.toBe(c2)
    expect(c1).not.toBe(c3)
    expect(c2).not.toBe(c3)
  })

  it("deterministic: same key always maps to same color", () => {
    const map1 = buildPermissionColorMap(["church-member-update", "church-member-index"])
    const map2 = buildPermissionColorMap(["church-member-index", "church-member-update"])
    expect(map1["church-member-update"]).toBe(map2["church-member-update"])
    expect(map1["church-member-index"]).toBe(map2["church-member-index"])
  })

  it("handles real DB examples", () => {
    const names = [
      "user-index",
      "role-index",
      "permission-index",
      "consolidador",
      "church-member-update",
      "church-member-index",
      "conso-sheet-index",
      "conso-sheet-create",
      "auditorium-index",
      "auditorium-event-create",
      "auditorium-event-update",
    ]
    const map = buildPermissionColorMap(names)
    expect(map["user-index"]).toBe("primary")
    expect(map["role-index"]).toBe("primary")
    expect(map["permission-index"]).toBe("primary")
    expect(map["church-member-update"]).not.toBe("primary")
    expect(map["church-member-update"]).toBe(map["church-member-index"])
    expect(map["conso-sheet-index"]).not.toBe("primary")
    expect(map["conso-sheet-index"]).toBe(map["conso-sheet-create"])
  })
})

describe("comparePermissionNames", () => {
  it("sorts by group alphabetically before depth", () => {
    expect(comparePermissionNames("auditorium-index", "church-member-consolidator-assign")).toBeLessThan(0)
    expect(comparePermissionNames("church-member-consolidator-assign", "auditorium-index")).toBeGreaterThan(0)
  })

  it("sorts shallower (more general) permissions before deeper ones within a group", () => {
    expect(comparePermissionNames("church-member-index", "church-member-consolidator-assign")).toBeLessThan(0)
    expect(comparePermissionNames("church-member-consolidator-assign", "church-member-index")).toBeGreaterThan(0)
  })

  it("uses full-name alphabetical order as final tiebreak within same group and depth", () => {
    expect(comparePermissionNames("church-member-all", "church-member-index")).toBeLessThan(0)
    expect(comparePermissionNames("church-member-index", "church-member-all")).toBeGreaterThan(0)
    expect(comparePermissionNames("church-member-index", "church-member-index")).toBe(0)
  })
})

describe("sortPermissionNamesForDisplay", () => {
  it("sorts by group alphabetically, then by segment count within group", () => {
    const input = [
      "church-member-all",
      "church-member-consolidator-assign",
      "church-member-index",
      "church-member-delete",
      "church-member-update",
      "church-member-create",
    ]
    const result = sortPermissionNamesForDisplay(input)
    expect(result).toEqual([
      "church-member-all",
      "church-member-create",
      "church-member-delete",
      "church-member-index",
      "church-member-update",
      "church-member-consolidator-assign",
    ])
  })

  it("clusters different groups alphabetically", () => {
    const input = [
      "church-member-update",
      "auditorium-event-create",
      "auditorium-index",
      "church-member-index",
    ]
    const result = sortPermissionNamesForDisplay(input)
    expect(result).toEqual([
      "auditorium-index",
      "auditorium-event-create",
      "church-member-index",
      "church-member-update",
    ])
  })

  it("does not mutate the input array", () => {
    const input = ["b-index", "a-update"]
    const original = [...input]
    sortPermissionNamesForDisplay(input)
    expect(input).toEqual(original)
  })
})

describe("sortPermissionsForDisplay", () => {
  it("sorts by group alphabetically, then by segment count within group", () => {
    const input = [
      { name: "church-member-all" },
      { name: "church-member-consolidator-assign" },
      { name: "church-member-index" },
      { name: "church-member-delete" },
      { name: "church-member-update" },
      { name: "church-member-create" },
    ]
    const result = sortPermissionsForDisplay(input)
    expect(result.map((p) => p.name)).toEqual([
      "church-member-all",
      "church-member-create",
      "church-member-delete",
      "church-member-index",
      "church-member-update",
      "church-member-consolidator-assign",
    ])
  })

  it("clusters different groups alphabetically", () => {
    const input = [
      { name: "church-member-update" },
      { name: "auditorium-event-create" },
      { name: "auditorium-index" },
      { name: "church-member-index" },
    ]
    const result = sortPermissionsForDisplay(input)
    const names = result.map((p) => p.name)
    const audIdx = names.findIndex((n) => n.startsWith("auditorium"))
    const chIdx = names.findIndex((n) => n.startsWith("church"))
    expect(audIdx).toBeLessThan(chIdx)
    // auditorium sorted alphabetically, then by segment count
    expect(names[0]).toBe("auditorium-index")
    expect(names[1]).toBe("auditorium-event-create")
    // church-member group follows
    expect(names[2]).toMatch(/^church-member/)
    expect(names[3]).toMatch(/^church-member/)
  })

  it("does not mutate the input array", () => {
    const input = [{ name: "b-index" }, { name: "a-update" }]
    const original = [...input]
    sortPermissionsForDisplay(input)
    expect(input).toEqual(original)
  })
})
