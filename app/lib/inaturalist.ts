// app/lib/inaturalist.ts
// Client-side helpers for the iNaturalist API v1 (https://api.inaturalist.org/v1).
// No API key, CORS-open, so these run in the browser exactly like the Open-Meteo
// weather fetch. We query by CALENDAR MONTH (month=8), which aggregates every
// August on record, so results are correct for the late-August trip dates no
// matter when the page loads. (A "recent observations" feed would instead show
// whatever season it currently is, i.e. the wrong birds for an August trip.)

const API = 'https://api.inaturalist.org/v1'

// The iconic taxon groups iNaturalist buckets everything into. The API's
// `iconic_taxa` param also accepts a comma-separated list (e.g. herps =
// 'Reptilia,Amphibia'), so callers pass a plain string.
export type IconicTaxon =
  | 'Aves'
  | 'Mammalia'
  | 'Reptilia'
  | 'Amphibia'
  | 'Actinopterygii'
  | 'Insecta'
  | 'Plantae'
  | 'Fungi'

export interface Species {
  taxonId: number
  commonName: string
  scientificName: string
  count: number
  photoUrl: string | null
  photoAttribution: string | null
  iconicTaxon: string | null
}

interface RawSpeciesCounts {
  results?: Array<{
    count: number
    taxon: {
      id: number
      name: string
      preferred_common_name?: string
      iconic_taxon_name?: string
      default_photo?: {
        square_url?: string | null
        medium_url?: string | null
        attribution?: string | null
      } | null
    }
  }>
}

export interface SpeciesQuery {
  placeId: number
  month: number
  iconicTaxa?: string
  perPage?: number
}

// Seasonality data is session-static, so multiple mounts / tab switches share
// one network trip per (place, month, group, size). Mirrors the historicalYears
// cache. Failed requests are evicted so a later mount can retry.
const speciesCache = new Map<string, Promise<Species[]>>()

export const fetchSpeciesCounts = (query: SpeciesQuery): Promise<Species[]> => {
  const { placeId, month, iconicTaxa, perPage = 30 } = query
  const key = `${placeId}:${month}:${iconicTaxa ?? 'all'}:${perPage}`
  const cached = speciesCache.get(key)
  if (cached) return cached

  const params = new URLSearchParams({
    place_id: String(placeId),
    month: String(month),
    verifiable: 'true',
    per_page: String(perPage),
  })
  // NB: no `order_by`. species_counts defaults to LOCAL count descending.
  // Adding order_by=observations_count silently sorts by each taxon's GLOBAL
  // count instead, which would surface common-everywhere species over the ones
  // actually seen here.
  if (iconicTaxa) params.set('iconic_taxa', iconicTaxa)

  const request = fetch(`${API}/observations/species_counts?${params}`)
    .then((res) => {
      if (!res.ok) throw new Error(`iNaturalist request failed (${res.status})`)
      return res.json() as Promise<RawSpeciesCounts>
    })
    .then((data) =>
      (data.results ?? []).map((r): Species => {
        const photo = r.taxon.default_photo
        return {
          taxonId: r.taxon.id,
          // iNat common names are already correctly cased ("Cooper's Hawk"),
          // so use them verbatim; fall back to the scientific name.
          commonName: r.taxon.preferred_common_name || r.taxon.name,
          scientificName: r.taxon.name,
          count: r.count,
          photoUrl: photo?.medium_url ?? photo?.square_url ?? null,
          photoAttribution: photo?.attribution ?? null,
          iconicTaxon: r.taxon.iconic_taxon_name ?? null,
        }
      })
    )

  request.catch(() => speciesCache.delete(key))
  speciesCache.set(key, request)
  return request
}

interface RawHistogram {
  results?: { month_of_year?: Record<string, number> }
}

const histogramCache = new Map<string, Promise<number[]>>()

// Returns a 12-element array (index 0 = January) of how many observations fall
// in each calendar month, aggregated across all years. Used to draw the little
// "August is when this group peaks" seasonality bars.
export const fetchMonthlyActivity = (
  placeId: number,
  iconicTaxa?: string
): Promise<number[]> => {
  const key = `${placeId}:${iconicTaxa ?? 'all'}`
  const cached = histogramCache.get(key)
  if (cached) return cached

  const params = new URLSearchParams({
    place_id: String(placeId),
    date_field: 'observed',
    interval: 'month_of_year',
    verifiable: 'true',
  })
  if (iconicTaxa) params.set('iconic_taxa', iconicTaxa)

  const request = fetch(`${API}/observations/histogram?${params}`)
    .then((res) => {
      if (!res.ok) throw new Error(`iNaturalist histogram failed (${res.status})`)
      return res.json() as Promise<RawHistogram>
    })
    .then((data) => {
      const buckets = data.results?.month_of_year ?? {}
      return Array.from({ length: 12 }, (_, i) => Number(buckets[String(i + 1)] ?? 0))
    })

  request.catch(() => histogramCache.delete(key))
  histogramCache.set(key, request)
  return request
}

// Deep links for "see the full list" style buttons.
export const inatPlaceUrl = (placeId: number): string =>
  `https://www.inaturalist.org/observations?place_id=${placeId}&month=8&verifiable=true`

export const inatTaxonUrl = (taxonId: number): string =>
  `https://www.inaturalist.org/taxa/${taxonId}`
