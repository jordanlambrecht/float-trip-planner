import { describe, it, expect } from 'vitest'
import {
  splitName,
  countPriorTrips,
  toPriorAttendees,
  formatNameWithInitials,
} from '../lib/attendance'

describe('splitName', () => {
  it('lowercases and strips punctuation from the first name', () => {
    expect(splitName('A.J. B.')).toEqual({ first: 'aj', initial: 'b' })
  })

  it('takes the surname initial from the second token, not the last', () => {
    // "Seth Van Dalsem" -> v (from "Van"), matching the abbreviated "Seth V."
    expect(splitName('Seth Van Dalsem')).toEqual({ first: 'seth', initial: 'v' })
    expect(splitName('Seth V.')).toEqual({ first: 'seth', initial: 'v' })
  })

  it('yields an empty initial when there is no surname', () => {
    expect(splitName('Jordy')).toEqual({ first: 'jordy', initial: '' })
  })

  it('handles empty / whitespace-only input', () => {
    expect(splitName('')).toEqual({ first: '', initial: '' })
    expect(splitName('   ')).toEqual({ first: '', initial: '' })
  })
})

describe('countPriorTrips', () => {
  // Mirrors the real (canonicalised) historical_roll_call roster.
  const history = toPriorAttendees([
    { name: 'Jordy L.', year: 2024 },
    { name: 'Jordy L.', year: 2025 },
    { name: 'Seth V.', year: 2024 },
    { name: 'Seth Van Dalsem', year: 2025 },
    { name: 'David A.', year: 2024 },
    { name: 'David McDavidson', year: 2025 },
    { name: 'Sam W.', year: 2024 },
    { name: 'Jordan M.', year: 2024 },
  ])

  it('counts distinct prior years for a returning attendee', () => {
    expect(countPriorTrips('Jordy L', history)).toBe(2)
  })

  it('links an abbreviated surname to a spelled-out one', () => {
    expect(countPriorTrips('Seth Van Dalsem', history)).toBe(2)
    expect(countPriorTrips('Seth V.', history)).toBe(2)
  })

  it('keeps two people who share a first name apart by surname initial', () => {
    expect(countPriorTrips('David A.', history)).toBe(1) // not David McDavidson
    expect(countPriorTrips('David McDavidson', history)).toBe(1)
  })

  it('does not merge different first names (Jordan vs Jordy)', () => {
    expect(countPriorTrips('Jordan M.', history)).toBe(1) // not Jordy's rows
  })

  it('returns 0 for a first-timer', () => {
    expect(countPriorTrips('Brand New', history)).toBe(0)
  })

  it('matches leniently when the RSVP omits a surname', () => {
    expect(countPriorTrips('Jordy', history)).toBe(2)
  })

  it('over-counts a bare colliding first name (known limitation)', () => {
    // "David" alone matches both David A. and David McDavidson - unavoidable
    // without a surname. Documented so the behaviour is intentional.
    expect(countPriorTrips('David', history)).toBe(2)
  })

  it('never counts the same year twice', () => {
    const dupes = toPriorAttendees([
      { name: 'Sam W.', year: 2024 },
      { name: 'Sam W.', year: 2024 },
    ])
    expect(countPriorTrips('Sam W.', dupes)).toBe(1)
  })

  it('returns 0 for an empty name even against a populated history', () => {
    expect(countPriorTrips('', history)).toBe(0)
  })
})

describe('formatNameWithInitials', () => {
  it('abbreviates the surname from the SECOND token, not the last', () => {
    // "Van Dalsem" -> V (consistent with the rank matcher), not D from "Dalsem"
    expect(formatNameWithInitials('Seth Van Dalsem')).toBe('Seth V.')
  })

  it('is idempotent on an already-abbreviated name', () => {
    expect(formatNameWithInitials('Seth V.')).toBe('Seth V.')
  })

  it('abbreviates a normal First Last name', () => {
    expect(formatNameWithInitials('David McDavidson')).toBe('David M.')
    expect(formatNameWithInitials('Jordy L.')).toBe('Jordy L.')
  })

  it('returns a single-word name unchanged', () => {
    expect(formatNameWithInitials('Marshall')).toBe('Marshall')
  })
})
