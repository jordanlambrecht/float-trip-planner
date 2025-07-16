"use client"

import type { ActualRsvpEntry, RSVPStatus } from "@types"
import clsx from "clsx"

interface ActualRsvpListProps {
  rsvps: ActualRsvpEntry[]
}

const getRsvpEmoji = (status: RSVPStatus): string => {
  switch (status) {
    case "yes":
      return "✅"
    case "no":
      return "❌"
    default:
      return "❔"
  }
}

const getRsvpColor = (status: RSVPStatus): string => {
  switch (status) {
    case "yes":
      return "border-green-500 bg-green-50"
    case "no":
      return "border-red-500 bg-red-50"
    default:
      return "border-gray-500 bg-gray-50"
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

const ActualRsvpList = ({ rsvps }: ActualRsvpListProps) => {
  if (!rsvps || rsvps.length === 0) {
    return (
      <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-2xl font-bold mb-4'>2025 RSVPs</h2>
          <p className='font-mono text-gray-textlight'>
            No RSVPs submitted yet. Be the first!
          </p>
        </div>
      </section>
    )
  }

  // Separate RSVPs by status
  const attendingRsvps = rsvps.filter((rsvp) => rsvp.rsvp_status === "yes")
  const notAttendingRsvps = rsvps.filter((rsvp) => rsvp.rsvp_status === "no")

  const renderRsvpSection = (
    title: string,
    rsvps: ActualRsvpEntry[],
    status: RSVPStatus
  ) => {
    if (rsvps.length === 0) return null

    return (
      <div className='mb-8'>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          {getRsvpEmoji(status)} {title} ({rsvps.length})
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
          {rsvps.map((rsvp) => (
            <div
              key={rsvp.id}
              className={clsx(
                "p-4 rounded-lg border-2 transition-all duration-200",
                getRsvpColor(rsvp.rsvp_status)
              )}
            >
              <div className='flex items-start justify-between mb-2'>
                <h4 className='font-mono font-medium text-gray-textdark'>
                  {formatNameWithInitials(rsvp.name)}
                </h4>
                <span className='text-lg'>
                  {getRsvpEmoji(rsvp.rsvp_status)}
                </span>
              </div>

              {rsvp.items_bringing && (
                <div className='mb-2'>
                  <p className='text-xs font-medium text-gray-600 mb-1'>
                    Bringing:
                  </p>
                  <p className='font-mono text-sm text-gray-textdark'>
                    {rsvp.items_bringing}
                  </p>
                </div>
              )}

              {rsvp.message && (
                <div className='mb-2'>
                  <p className='text-xs font-medium text-gray-600 mb-1'>
                    Message:
                  </p>
                  <p className='font-mono text-sm text-gray-textdark italic'>
                    "{rsvp.message}"
                  </p>
                </div>
              )}

              {rsvp.created_at && (
                <p className='text-xs text-gray-textlight mt-2'>
                  {new Date(rsvp.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
      <div className='max-w-4xl mx-auto'>
        <h2 className='text-2xl font-bold mb-6'>
          2025 Trip RSVPs - August 21st-24th
        </h2>

        {renderRsvpSection("Attending", attendingRsvps, "yes")}
        {renderRsvpSection("Not Attending", notAttendingRsvps, "no")}
      </div>
    </section>
  )
}

export default ActualRsvpList
