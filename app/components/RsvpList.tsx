'use client'

import type { ActualRsvpEntry, RSVPStatus } from '@types'
import { isAttendingStatus } from '@types'
import clsx from 'clsx'
import { useState } from 'react'

interface RsvpListProps {
  rsvps?: ActualRsvpEntry[]
}

type RsvpView = 'coming' | 'maybe' | 'declined'

const isMaybe = (status: RSVPStatus | null): boolean =>
  status === 'maybe_probably' || status === 'maybe_unlikely'

const getRsvpEmoji = (status: RSVPStatus | null): string => {
  switch (status) {
    case 'yes':
      return '✅'
    case 'maybe_probably':
      return '🤞'
    case 'maybe_unlikely':
      return '😬'
    case 'no':
      return '❌'
    default:
      return '❔'
  }
}

const getRsvpColor = (status: RSVPStatus | null): string => {
  switch (status) {
    case 'yes':
      return 'border-green-500'
    case 'maybe_probably':
      return 'border-blue-500'
    case 'maybe_unlikely':
      return 'border-purple-500'
    case 'no':
      return 'border-red-500'
    default:
      return 'border-gray-500'
  }
}

const getMaybeLabel = (status: RSVPStatus | null): string | null => {
  switch (status) {
    case 'maybe_probably':
      return 'Maybe But Probably'
    case 'maybe_unlikely':
      return 'Maybe But Unlikely'
    default:
      return null
  }
}

// Helper function to initialize last names (first letter only)
const formatNameWithInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) {
    return name // No last name to initialize
  }

  const firstName = parts[0]
  const lastNameInitial = parts[parts.length - 1][0].toUpperCase()

  return `${firstName} ${lastNameInitial}.`
}

// Helper function to group RSVPs by year
const groupRsvpsByYear = (
  rsvps: ActualRsvpEntry[]
): Record<number, ActualRsvpEntry[]> => {
  return rsvps.reduce(
    (groups, rsvp) => {
      const year = rsvp.year
      if (!groups[year]) {
        groups[year] = []
      }
      groups[year].push(rsvp)
      return groups
    },
    {} as Record<number, ActualRsvpEntry[]>
  )
}

const RsvpList = ({ rsvps }: RsvpListProps) => {
  const [view, setView] = useState<RsvpView>('coming')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (!rsvps || rsvps.length === 0) {
    return (
      <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-2xl font-bold mb-4'>
            {new Date().getFullYear()} RSVPs (So Far)
          </h2>
          <p className='font-mono text-gray-textlight'>
            Nobody has RSVP&apos;d yet.
          </p>
        </div>
      </section>
    )
  }

  const currentYear = new Date().getFullYear()

  // Group RSVPs by year
  const rsvpsByYear = groupRsvpsByYear(rsvps)

  // Get years in descending order
  const years = Object.keys(rsvpsByYear)
    .map(Number)
    .sort((a, b) => b - a) // Descending order

  return (
    <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
      <div className='max-w-4xl mx-auto flex flex-col gap-y-12'>
        {years.map((year) => {
          const yearRsvps = rsvpsByYear[year]

          // Filter based on toggle - for current year, show coming/maybe/declined
          let filteredRsvps: ActualRsvpEntry[]
          if (year === currentYear) {
            filteredRsvps =
              view === 'declined'
                ? yearRsvps.filter((rsvp) => rsvp.rsvp_status === 'no')
                : view === 'maybe'
                  ? yearRsvps.filter((rsvp) => isMaybe(rsvp.rsvp_status))
                  : yearRsvps.filter((rsvp) => rsvp.rsvp_status === 'yes')
          } else {
            // Past years: only show attendees
            filteredRsvps = yearRsvps.filter(
              (rsvp) => rsvp.rsvp_status === 'yes'
            )
          }

          // Past years only ever show attendees, so hide an empty one. For the
          // current year always render the section (and its toggle) whenever any
          // RSVPs exist, so people can reach the Maybe/Declined tabs even when
          // nobody has locked in a firm "yes" yet.
          if (filteredRsvps.length === 0 && year !== currentYear) {
            return null
          }

          return (
            <div key={year} className='mb-8'>
              <div className='flex flex-col md:flex-row items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold'>
                  {year === currentYear
                    ? `${year} RSVPs (So Far)`
                    : `${year} Roll Call`}
                </h2>

                {/* Toggle for current year only */}
                {year === currentYear && (
                  <div className='flex items-center space-x-2 bg-gray-100 rounded-lg p-1'>
                    <button
                      onClick={() => setView('coming')}
                      className={clsx(
                        'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                        view === 'coming'
                          ? 'bg-green-500 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      )}
                    >
                      Coming (
                      {yearRsvps.filter((r) => r.rsvp_status === 'yes').length})
                    </button>
                    <button
                      onClick={() => setView('maybe')}
                      className={clsx(
                        'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                        view === 'maybe'
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      )}
                    >
                      Maybe (
                      {yearRsvps.filter((r) => isMaybe(r.rsvp_status)).length})
                    </button>
                    <button
                      onClick={() => setView('declined')}
                      className={clsx(
                        'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                        view === 'declined'
                          ? 'bg-red-500 text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      )}
                    >
                      Declined (
                      {yearRsvps.filter((r) => r.rsvp_status === 'no').length})
                    </button>
                  </div>
                )}
              </div>

              <div className='w-full'>
                {filteredRsvps.length === 0 && (
                  <p className='font-mono text-gray-textlight'>
                    {view === 'maybe'
                      ? 'No maybes yet.'
                      : view === 'declined'
                        ? "Nobody's declined yet."
                        : "Nobody's locked in a firm yes yet — check the Maybe tab."}
                  </p>
                )}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {filteredRsvps.map((rsvp, index) => {
                    const cardId = String(rsvp.id ?? `${year}-${index}`)
                    const hasDetails = Boolean(
                      rsvp.volunteer_roles?.length ||
                      rsvp.items_bringing?.length ||
                      rsvp.extra_items?.length ||
                      rsvp.needed_items?.length
                    )
                    const isExpanded = expandedIds.has(cardId)

                    return (
                      <div
                        key={cardId}
                        className={clsx(
                          'p-4 border-2 rounded-lg',
                          getRsvpColor(rsvp.rsvp_status),
                          'bg-transparent shadow-sm'
                        )}
                      >
                        {/* Name and RSVP Status */}
                        <div className='flex items-center justify-between mb-3'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-mono text-lg font-bold text-gray-800'>
                              {year < currentYear
                                ? formatNameWithInitials(rsvp.name)
                                : rsvp.name}
                            </h3>
                            {year === currentYear &&
                              rsvp.rsvp_status === 'yes' &&
                              rsvp.merrit_reservoir && (
                                <span className='px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded-full border border-blue-300'>
                                  🏞️ Merrit
                                </span>
                              )}
                            {/* Maybe tier badge */}
                            {year === currentYear &&
                              getMaybeLabel(rsvp.rsvp_status) && (
                                <span className='px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded-full border border-gray-300'>
                                  {getMaybeLabel(rsvp.rsvp_status)}
                                </span>
                              )}
                          </div>
                          <span className='text-xl'>
                            {getRsvpEmoji(rsvp.rsvp_status)}
                          </span>
                        </div>

                        {/* Details live behind the chevron - keeps cards clean */}
                        {year === currentYear &&
                          isAttendingStatus(rsvp.rsvp_status) &&
                          isExpanded && (
                            <div className='space-y-2 text-sm'>
                              {/* Volunteer Roles */}
                              {rsvp.volunteer_roles &&
                                rsvp.volunteer_roles.length > 0 && (
                                  <div>
                                    <span className='font-semibold text-pink-dark'>
                                      Is Down To:
                                    </span>
                                    <ul className='font-mono ml-4 mt-1'>
                                      {rsvp.volunteer_roles.map((role, idx) => (
                                        <li
                                          key={idx}
                                          className='flex items-center'
                                        >
                                          <span className='mr-2'>
                                            {role
                                              .toLowerCase()
                                              .includes('cook') ||
                                            role.toLowerCase().includes('meal')
                                              ? '🍳'
                                              : role
                                                    .toLowerCase()
                                                    .includes('drive') ||
                                                  role
                                                    .toLowerCase()
                                                    .includes('transport')
                                                ? '🚗'
                                                : role
                                                      .toLowerCase()
                                                      .includes('clean') ||
                                                    role
                                                      .toLowerCase()
                                                      .includes('tidy')
                                                  ? '🧹'
                                                  : role
                                                        .toLowerCase()
                                                        .includes('setup') ||
                                                      role
                                                        .toLowerCase()
                                                        .includes('organize')
                                                    ? '🏗️'
                                                    : role
                                                          .toLowerCase()
                                                          .includes('music') ||
                                                        role
                                                          .toLowerCase()
                                                          .includes('dj')
                                                      ? '🎵'
                                                      : role
                                                            .toLowerCase()
                                                            .includes(
                                                              'photo'
                                                            ) ||
                                                          role
                                                            .toLowerCase()
                                                            .includes('camera')
                                                        ? '📸'
                                                        : role
                                                              .toLowerCase()
                                                              .includes(
                                                                'fire'
                                                              ) ||
                                                            role
                                                              .toLowerCase()
                                                              .includes('wood')
                                                          ? '🔥'
                                                          : role
                                                                .toLowerCase()
                                                                .includes(
                                                                  'water'
                                                                ) ||
                                                              role
                                                                .toLowerCase()
                                                                .includes(
                                                                  'drink'
                                                                )
                                                            ? '💧'
                                                            : role
                                                                  .toLowerCase()
                                                                  .includes(
                                                                    'bartend'
                                                                  )
                                                              ? '🍸'
                                                              : role
                                                                    .toLowerCase()
                                                                    .includes(
                                                                      'snack'
                                                                    ) &&
                                                                  role
                                                                    .toLowerCase()
                                                                    .includes(
                                                                      'queen'
                                                                    )
                                                                ? '👑'
                                                                : '🙌'}
                                          </span>
                                          {role}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {/* Items Bringing */}
                              {rsvp.items_bringing &&
                                rsvp.items_bringing.length > 0 && (
                                  <div>
                                    <span className='font-semibold text-teal-dark'>
                                      Is Bringing:{' '}
                                    </span>
                                    <span className='font-mono'>
                                      {rsvp.items_bringing.join(', ')}
                                    </span>
                                  </div>
                                )}

                              {/* Extra Items */}
                              {rsvp.extra_items &&
                                rsvp.extra_items.length > 0 && (
                                  <div>
                                    <span className='font-semibold text-blue-600'>
                                      Has Extra:{' '}
                                    </span>
                                    <span className='font-mono'>
                                      {rsvp.extra_items.join(', ')}
                                    </span>
                                  </div>
                                )}

                              {/* Needed Items */}
                              {rsvp.needed_items &&
                                rsvp.needed_items.length > 0 && (
                                  <div>
                                    <span className='font-semibold text-orange-600'>
                                      Needs if anyone has extra:{' '}
                                    </span>
                                    <span className='font-mono'>
                                      {rsvp.needed_items.join(', ')}
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}

                        {year === currentYear &&
                          isAttendingStatus(rsvp.rsvp_status) &&
                          hasDetails && (
                            <button
                              type='button'
                              onClick={() => toggleExpanded(cardId)}
                              aria-label={
                                isExpanded ? 'Hide details' : 'Show details'
                              }
                              className='w-full flex items-center justify-center gap-1 mt-2 text-gray-500 hover:text-pink-dark transition-colors'
                            >
                              <span className='font-mono text-xs uppercase tracking-wider'>
                                {isExpanded ? 'Less' : 'Details'}
                              </span>
                              <svg
                                className={clsx(
                                  'w-5 h-5 transition-transform duration-200',
                                  isExpanded ? 'rotate-180' : 'rotate-0'
                                )}
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M19 9l-7 7-7-7'
                                />
                              </svg>
                            </button>
                          )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default RsvpList
