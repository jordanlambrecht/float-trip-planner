// Cross-year identity matching for the attendance-rank stars (see RsvpList).
// historical_roll_call stores names inconsistently across seasons - initials
// one year ("Jordy L."), full names or nicknames another ("Jordy", "Samantha
// Wampler"). We reduce each name to a first name + surname initial and match
// leniently; the archive names are also canonicalised in the DB so the same
// person lines up across years.

export interface PriorAttendee {
  first: string
  initial: string
  year: number
}

// A name -> { first name, surname initial }, both lowercased and stripped of
// punctuation so "A.J." === "aj". The initial comes from the SECOND token (the
// start of the surname), not the last: "Seth Van Dalsem" -> "v" matches
// "Seth V." (the last token would give "d" from "Dalsem").
export const splitName = (name: string): { first: string; initial: string } => {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return {
    first: clean(parts[0] ?? ''),
    initial: clean(parts[1] ?? '').charAt(0),
  }
}

// Display form "First X." where X is the surname initial, taken from the SECOND
// token so "Seth Van Dalsem" -> "Seth V." (consistent with splitName / the rank
// matcher - the last token would give "D" from "Dalsem"). One-word names are
// returned unchanged; original casing is preserved for display.
export const formatNameWithInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return name
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`
}

// Same-person heuristic: first names must agree; when BOTH carry a surname
// initial those must agree too (keeps "David A." and "David M." apart) - but a
// missing initial on either side still matches, linking "Jordy" to "Jordy L.".
const isSamePerson = (
  a: { first: string; initial: string },
  b: { first: string; initial: string }
): boolean =>
  a.first === b.first && (!a.initial || !b.initial || a.initial === b.initial)

// Roll-call rows -> normalised identities ready for countPriorTrips.
export const toPriorAttendees = (
  rows: Array<{ name: string; year: number }>
): PriorAttendee[] => rows.map(({ name, year }) => ({ ...splitName(name), year }))

// Distinct prior years the named person attended. A bare first name (no
// surname) is a known limitation: it can match more than one same-first-name
// person, so it over-counts rather than under-counts.
export const countPriorTrips = (
  name: string,
  history: PriorAttendee[]
): number => {
  const me = splitName(name)
  if (!me.first) return 0
  const years = new Set<number>()
  for (const h of history) {
    if (isSamePerson(me, h)) years.add(h.year)
  }
  return years.size
}
