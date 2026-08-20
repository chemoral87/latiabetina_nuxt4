// services/address-service.ts
// Address validation via Nominatim (OpenStreetMap). Searches for similar
// addresses and returns the normalized address composed of
// street (road), residential (suburb), and state.

export interface AddressSuggestion {
  address: string
  road: string
  residential: string
  city: string
  county: string
  state: string
  postcode: string
  country: string
  country_code: string
  displayName: string
  lat: string
  lon: string
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

function extractPart(d: Record<string, any>, keys: string[]): string {
  for (const key of keys) {
    const val = d.address?.[key]
    if (val && typeof val === "string" && val.trim()) return val.trim()
  }
  return ""
}

/**
 * Search for addresses matching `query`.
 * @param query free-text address query
 * @param limit max results (default 5, at least 3)
 */
export async function searchAddresses(query: string, limit = 5): Promise<AddressSuggestion[]> {
  const q = query.trim()
  if (q.length < 3) return []

  const url = new URL(NOMINATIM_URL)
  url.searchParams.set("format", "json")
  url.searchParams.set("q", q)
  url.searchParams.set("limit", String(Math.max(limit, 3)))
  url.searchParams.set("countrycodes", "mx")
  url.searchParams.set("addressdetails", "1")

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "LatiabetinaApp/1.0" },
  })
  if (!res.ok) throw new Error("Error al buscar la dirección")

  const data = (await res.json()) as Record<string, any>[]
  return data
    .filter((d) => d.display_name)
    .map((d) => {
      const road = extractPart(d, ["road", "pedestrian", "footway", "path", "neighbourhood", "suburb", "residential"])
      const residential = extractPart(d, ["residential", "suburb", "neighbourhood"])
      const city = extractPart(d, ["city", "town", "village", "municipality"])
      const county = extractPart(d, ["county"])
      const state = extractPart(d, ["state", "region"])
      const postcode = extractPart(d, ["postcode"])
      const country = extractPart(d, ["country"])
      const country_code = extractPart(d, ["country_code"])
      const displayName = String(d.display_name)
      const parts = [road, residential, state].filter((p) => p !== "")
      const address = parts.join(", ")

      return {
        address,
        road,
        residential,
        city,
        county,
        state,
        postcode,
        country,
        country_code,
        displayName,
        lat: String(d.lat),
        lon: String(d.lon),
      }
    })
    .slice(0, Math.max(limit, 3))
}

/**
 * Build the final address string appending the city when it is not already
 * present in the address.
 */
export function buildAddressWithCity(suggestion: AddressSuggestion): string {
  const { address, city } = suggestion
  if (!city) return address
  if (address.toLowerCase().includes(city.toLowerCase())) return address
  return `${address}, ${city}`
}