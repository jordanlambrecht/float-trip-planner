// app/lib/macrostrat.ts
// Client-side helper for the Macrostrat API v2 (https://macrostrat.org/api/v2).
// No API key, CORS-open: a single point lookup returns the geologic map unit
// under a coordinate: formation name, rock type, and geologic age. Bedrock is
// time-invariant, so there's no date parameter (unlike weather/wildlife).

const API = 'https://macrostrat.org/api/v2'

export interface GeologicUnit {
  name: string
  stratName: string | null
  age: string | null // human interval label, e.g. "Miocene"
  ageTopMa: number | null // youngest age in millions of years
  ageBottomMa: number | null // oldest age in millions of years
  lithology: string | null
  description: string | null
  comments: string | null
  color: string | null // hex swatch from the source map
}

interface RawUnit {
  name?: string
  strat_name?: string
  best_int_name?: string
  t_int_age?: number | string
  b_int_age?: number | string
  t_int_name?: string
  b_int_name?: string
  lith?: string
  descrip?: string
  comments?: string
  color?: string
}

interface RawResponse {
  success?: { data?: RawUnit[] }
}

const num = (v: number | string | undefined): number | null => {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// The source map's `comments` field appends bibliographic boilerplate ("Original
// map source: …", "Primary reference: …") after the geologically interesting
// description. Keep the readable part for the on-card field note.
const cleanComments = (raw: string | undefined): string | null => {
  if (!raw) return null
  const cut = raw.search(/\b(Original map source|Primary reference)\b/i)
  const text = (cut >= 0 ? raw.slice(0, cut) : raw).trim()
  return text.length > 0 ? text : null
}

let cached: Promise<GeologicUnit | null> | null = null

export const fetchGeologicUnit = (
  lat: number,
  lng: number
): Promise<GeologicUnit | null> => {
  if (cached) return cached

  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) })

  cached = fetch(`${API}/geologic_units/map?${params}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Macrostrat request failed (${res.status})`)
      return res.json() as Promise<RawResponse>
    })
    .then((data) => {
      // The point can sit on more than one mapped unit; the first is the
      // surface unit, which is what's actually under the campground.
      const u = data.success?.data?.[0]
      if (!u) return null
      return {
        name: u.name || u.strat_name || 'Unnamed unit',
        stratName: u.strat_name ?? null,
        age: u.best_int_name || u.t_int_name || u.b_int_name || null,
        ageTopMa: num(u.t_int_age),
        ageBottomMa: num(u.b_int_age),
        lithology: u.lith ?? null,
        description: u.descrip ?? null,
        comments: cleanComments(u.comments),
        color: u.color ?? null,
      }
    })

  cached.catch(() => {
    cached = null
  })
  return cached
}
