"use client"

import type { ActualRsvpEntry, RSVPStatus } from "@types"
import clsx from "clsx"
import { useState } from "react"

interface RsvpListProps {
  rsvps?: ActualRsvpEntry[]
}

const getRsvpEmoji = (status: RSVPStatus | null): string => {
  switch (status) {
    case "yes":
      return "✅"
    case "no":
      return "❌"
    default:
      return "❔"
  }
}

const getRsvpColor = (status: RSVPStatus | null): string => {
  switch (status) {
    case "yes":
      return "border-green-500"
    case "no":
      return "border-red-500"
    default:
      return "border-gray-500"
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
  return rsvps.reduce((groups, rsvp) => {
    const year = rsvp.year
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(rsvp)
    return groups
  }, {} as Record<number, ActualRsvpEntry[]>)
}

const RsvpList = ({ rsvps }: RsvpListProps) => {
  const [showDeclined, setShowDeclined] = useState(false)

  if (!rsvps || rsvps.length === 0) {
    return ""
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

          // Filter based on toggle - for current year, show coming vs declined
          let filteredRsvps: ActualRsvpEntry[]
          if (year === currentYear) {
            filteredRsvps = showDeclined
              ? yearRsvps.filter((rsvp) => rsvp.rsvp_status === "no")
              : yearRsvps.filter((rsvp) => rsvp.rsvp_status === "yes")
          } else {
            // Past years: only show attendees
            filteredRsvps = yearRsvps.filter(
              (rsvp) => rsvp.rsvp_status === "yes"
            )
          }

          // Don't render the year section if no RSVPs pass the filter
          if (filteredRsvps.length === 0) {
            return null
          }

          return (
            <div key={year} className='mb-8'>
              <div className='flex flex-col md:flex-row items-center justify-between mb-4'>
                <h2 className='text-2xl font-bold'>
                  {year} Roll Call {year === currentYear ? " (So Far)" : ""}
                </h2>

                {/* Toggle for current year only */}
                {year === currentYear && (
                  <div className='flex items-center space-x-2 bg-gray-100 rounded-lg p-1'>
                    <button
                      onClick={() => setShowDeclined(false)}
                      className={clsx(
                        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                        !showDeclined
                          ? "bg-green-500 text-white"
                          : "text-gray-600 hover:text-gray-800"
                      )}
                    >
                      Coming (
                      {yearRsvps.filter((r) => r.rsvp_status === "yes").length})
                    </button>
                    <button
                      onClick={() => setShowDeclined(true)}
                      className={clsx(
                        "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                        showDeclined
                          ? "bg-red-500 text-white"
                          : "text-gray-600 hover:text-gray-800"
                      )}
                    >
                      Declined (
                      {yearRsvps.filter((r) => r.rsvp_status === "no").length})
                    </button>
                  </div>
                )}
              </div>

              <div className='w-full'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {filteredRsvps.map((rsvp, index) => (
                    <div
                      key={`${year}-${index}`}
                      className={clsx(
                        "p-4 border-2 rounded-lg",
                        getRsvpColor(rsvp.rsvp_status),
                        "bg-transparent shadow-sm"
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
                          {/* Merrit Badge */}
                          {year === currentYear &&
                            rsvp.rsvp_status === "yes" &&
                            rsvp.merrit_reservoir && (
                              <span className='px-2 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded-full border border-blue-300'>
                                🏞️ Merrit
                              </span>
                            )}
                        </div>
                        <span className='text-xl'>
                          {getRsvpEmoji(rsvp.rsvp_status)}
                        </span>
                      </div>

                      {/* Only show details for current year and "yes" responses */}
                      {year === currentYear && rsvp.rsvp_status === "yes" && (
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
                                    <li key={idx} className='flex items-center'>
                                      <span className='mr-2'>
                                        {role.toLowerCase().includes("cook") ||
                                        role.toLowerCase().includes("meal")
                                          ? "🍳"
                                          : role
                                              .toLowerCase()
                                              .includes("drive") ||
                                            role
                                              .toLowerCase()
                                              .includes("transport")
                                          ? "🚗"
                                          : role
                                              .toLowerCase()
                                              .includes("clean") ||
                                            role.toLowerCase().includes("tidy")
                                          ? "🧹"
                                          : role
                                              .toLowerCase()
                                              .includes("setup") ||
                                            role
                                              .toLowerCase()
                                              .includes("organize")
                                          ? "🏗️"
                                          : role
                                              .toLowerCase()
                                              .includes("music") ||
                                            role.toLowerCase().includes("dj")
                                          ? "🎵"
                                          : role
                                              .toLowerCase()
                                              .includes("photo") ||
                                            role
                                              .toLowerCase()
                                              .includes("camera")
                                          ? "📸"
                                          : role
                                              .toLowerCase()
                                              .includes("fire") ||
                                            role.toLowerCase().includes("wood")
                                          ? "🔥"
                                          : role
                                              .toLowerCase()
                                              .includes("water") ||
                                            role.toLowerCase().includes("drink")
                                          ? "💧"
                                          : role
                                              .toLowerCase()
                                              .includes("bartend")
                                          ? "🍸"
                                          : role
                                              .toLowerCase()
                                              .includes("snack") &&
                                            role.toLowerCase().includes("queen")
                                          ? "👑"
                                          : "🙌"}
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
                                  Is Bringing:{" "}
                                </span>
                                <span className='font-mono'>
                                  {rsvp.items_bringing.join(", ")}
                                </span>
                              </div>
                            )}

                          {/* Extra Items */}
                          {rsvp.extra_items && rsvp.extra_items.length > 0 && (
                            <div>
                              <span className='font-semibold text-blue-600'>
                                Has Extra:{" "}
                              </span>
                              <span className='font-mono'>
                                {rsvp.extra_items.join(", ")}
                              </span>
                            </div>
                          )}

                          {/* Needed Items */}
                          {rsvp.needed_items &&
                            rsvp.needed_items.length > 0 && (
                              <div>
                                <span className='font-semibold text-orange-600'>
                                  Needs if anyone has extra:{" "}
                                </span>
                                <span className='font-mono'>
                                  {rsvp.needed_items.join(", ")}
                                </span>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
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
