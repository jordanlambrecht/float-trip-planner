import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the DB layer so importing actions never opens the prod pool, and so
// every query is observable/controllable. Mock next/cache so revalidatePath
// is a no-op outside a Next request scope.
vi.mock('../lib/database', () => ({ query: vi.fn(), db: {} }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { query } from '../lib/database'
import {
  submitActualRsvpAction,
  getActualRsvsAction,
  claimItemAction,
  claimRoleAction,
  getPredefinedItemsAction,
} from '../actions'

const mockQuery = vi.mocked(query)

// Params passed to the first query whose SQL contains `substr`.
const paramsFor = (substr: string): any[] | undefined =>
  mockQuery.mock.calls.find((c) => String(c[0]).includes(substr))?.[1]

const inserted = (table: string): boolean =>
  mockQuery.mock.calls.some((c) =>
    String(c[0]).includes(`INSERT INTO ${table}`)
  )

beforeEach(() => {
  mockQuery.mockReset()
  mockQuery.mockResolvedValue({ rows: [] } as any)
  // Actions log on the error/branch paths we deliberately exercise.
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('submitActualRsvpAction', () => {
  it('refuses invalid input without writing to the DB', async () => {
    expect(
      (await submitActualRsvpAction({ name: '  ', rsvp_status: 'yes' })).success
    ).toBe(false)
    expect(
      (await submitActualRsvpAction({ name: 'Jordy', rsvp_status: null }))
        .success
    ).toBe(false)
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('accepts a maybe before the July 25 cutoff and tags it year 2026', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-15T12:00:00-05:00'))

    const result = await submitActualRsvpAction({
      name: 'Jordy',
      rsvp_status: 'maybe_probably',
    })

    expect(result.success).toBe(true)
    const params = paramsFor('INSERT INTO actual_rsvps')
    expect(params?.[2]).toBe('maybe_probably') // rsvp_status
    expect(params?.[12]).toBe(2026) // year, set explicitly (not a DB default)
  })

  it('rejects a maybe after the cutoff and never inserts', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-08-01T12:00:00-05:00'))

    const result = await submitActualRsvpAction({
      name: 'Jordy',
      rsvp_status: 'maybe_unlikely',
    })

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Maybe RSVPs closed/i)
    expect(inserted('actual_rsvps')).toBe(false)
  })

  it('still accepts a firm yes after the cutoff (cutoff blocks only maybes)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-08-01T12:00:00-05:00'))

    const result = await submitActualRsvpAction({
      name: 'Jordy',
      rsvp_status: 'yes',
    })

    expect(result.success).toBe(true)
    expect(inserted('actual_rsvps')).toBe(true)
  })

  it('registers every bringing/extra/needed item in the items table', async () => {
    await submitActualRsvpAction({
      name: 'Jordy',
      rsvp_status: 'yes',
      items_bringing: ['Tent'],
      extra_items: ['Cooler'],
      needed_items: ['Firewood'],
    })

    const itemInserts = mockQuery.mock.calls
      .filter((c) => String(c[0]).includes('INSERT INTO items'))
      .map((c) => c[1]?.[0])
    expect(itemInserts).toEqual(
      expect.arrayContaining(['Tent', 'Cooler', 'Firewood'])
    )
  })
})

describe('getActualRsvsAction', () => {
  it('scopes the live list to the current trip year (2026)', async () => {
    await getActualRsvsAction()
    expect(paramsFor('FROM actual_rsvps')).toEqual([2026])
  })

  it('parses JSON-string columns into arrays', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          name: 'Jordy',
          rsvp_status: 'yes',
          items_bringing: '["Tent","Cooler"]',
          volunteer_roles: '["Be Float DJ"]',
          needed_items: '["Firewood"]',
          year: 2026,
        },
      ],
    } as any)

    const rows = (await getActualRsvsAction()) as any[]
    expect(rows[0].items_bringing).toEqual(['Tent', 'Cooler'])
    expect(rows[0].volunteer_roles).toEqual(['Be Float DJ'])
    expect(rows[0].needed_items).toEqual(['Firewood'])
  })

  it('passes through already-parsed jsonb array columns', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          name: 'Heath',
          rsvp_status: 'yes',
          items_bringing: ['Grill'],
          year: 2026,
        },
      ],
    } as any)

    const rows = (await getActualRsvsAction()) as any[]
    expect(rows[0].items_bringing).toEqual(['Grill'])
  })

  it('survives malformed JSON without throwing (falls back to [])', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 3,
          name: 'Broken',
          rsvp_status: 'yes',
          items_bringing: '{not valid json',
          year: 2026,
        },
      ],
    } as any)

    const rows = (await getActualRsvsAction()) as any[]
    expect(rows[0].items_bringing).toEqual([])
  })

  it('returns an error object when the query throws (the UI branches on this)', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection refused'))
    expect(await getActualRsvsAction()).toHaveProperty('error')
  })
})

describe('claimItemAction', () => {
  it('refuses when no matching attending RSVP exists, scoped to this year', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any)
    const result = await claimItemAction('Cooler', 'Nobody')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Couldn't find/i)
    expect(mockQuery.mock.calls[0][1]).toEqual([2026, 'Nobody'])
  })

  it("appends the item to the claimer's existing list", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 5, name: 'Jordy', items_bringing: '["Tent"]' }],
    } as any)

    const result = await claimItemAction('Cooler', 'jordy') // case-insensitive name match
    expect(result.success).toBe(true)
    expect(JSON.parse(paramsFor('UPDATE actual_rsvps')![0])).toEqual([
      'Tent',
      'Cooler',
    ])
  })

  it('does not duplicate an item the claimer already has (case-insensitive)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 7, name: 'Jordy', items_bringing: '["tent"]' }],
    } as any)

    await claimItemAction('Tent', 'Jordy')
    expect(JSON.parse(paramsFor('UPDATE actual_rsvps')![0])).toEqual(['tent'])
  })
})

describe('claimRoleAction', () => {
  it("appends the role to the claimer's existing roles", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 9, name: 'Heath', volunteer_roles: '["Play Bartender"]' }],
    } as any)

    const result = await claimRoleAction('Grocery Shopper', 'Heath')
    expect(result.success).toBe(true)
    expect(JSON.parse(paramsFor('UPDATE actual_rsvps')![0])).toEqual([
      'Play Bartender',
      'Grocery Shopper',
    ])
  })
})

describe('getPredefinedItemsAction', () => {
  it('returns the items table contents, sorted, with no hardcoded defaults', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ name: 'Tent' }, { name: 'Glow Sticks' }, { name: 'Beer' }],
    } as any)

    const result = (await getPredefinedItemsAction()) as string[]

    expect(result).toEqual(['Beer', 'Glow Sticks', 'Tent'])
  })

  it('pulls the whole items table with no year filter', async () => {
    await getPredefinedItemsAction()
    const itemsCall = mockQuery.mock.calls.find((c) =>
      String(c[0]).includes('FROM items')
    )
    expect(itemsCall?.[0]).not.toMatch(/EXTRACT\(YEAR/i)
    expect(itemsCall?.[1]).toBeUndefined()
  })
})
