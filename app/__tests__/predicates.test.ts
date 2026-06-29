import { describe, it, expect } from 'vitest'
import { isAttendingStatus, isLikelyComing } from '../types'

// These two predicates drive the whole planning model: who gets the full RSVP
// flow, whose gear/roles/cost count, and who lands in which roll-call column.
// The maybe_unlikely split is the subtle part - lock both truth tables so a
// future "simplification" can't silently shift who counts.
describe('RSVP status predicates', () => {
  it('isAttendingStatus is true for anyone but a hard no / no-answer', () => {
    expect(isAttendingStatus('yes')).toBe(true)
    expect(isAttendingStatus('maybe_probably')).toBe(true)
    expect(isAttendingStatus('maybe_unlikely')).toBe(true)
    expect(isAttendingStatus('no')).toBe(false)
    expect(isAttendingStatus(null)).toBe(false)
    expect(isAttendingStatus(undefined)).toBe(false)
  })

  it('isLikelyComing counts only firm yeses and probable maybes', () => {
    expect(isLikelyComing('yes')).toBe(true)
    expect(isLikelyComing('maybe_probably')).toBe(true)
    expect(isLikelyComing('maybe_unlikely')).toBe(false) // the key distinction
    expect(isLikelyComing('no')).toBe(false)
    expect(isLikelyComing(null)).toBe(false)
  })
})
