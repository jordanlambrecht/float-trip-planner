"use client"

import { ActualRsvpEntry } from "@types"

interface TagSummaryProps {
  rsvps: ActualRsvpEntry[]
}

const TagSummary = ({ rsvps }: TagSummaryProps) => {
  // Filter RSVPs to only include those who are coming (yes or maybe)
  const attendingRsvps = rsvps.filter(
    (rsvp) => rsvp.rsvp_status === "yes" || rsvp.rsvp_status === "maybe"
  )

  // Create a map of items to people bringing them
  const itemsMap = new Map<string, string[]>()
  const rolesMap = new Map<string, string[]>()

  attendingRsvps.forEach((rsvp) => {
    // Process items being brought
    if (rsvp.items_bringing && rsvp.items_bringing.length > 0) {
      rsvp.items_bringing.forEach((item) => {
        if (!itemsMap.has(item)) {
          itemsMap.set(item, [])
        }
        itemsMap.get(item)!.push(rsvp.name)
      })
    }

    // Process volunteer roles
    if (rsvp.volunteer_roles && rsvp.volunteer_roles.length > 0) {
      rsvp.volunteer_roles.forEach((role) => {
        if (!rolesMap.has(role)) {
          rolesMap.set(role, [])
        }
        rolesMap.get(role)!.push(rsvp.name)
      })
    }
  })

  // Sort items and roles alphabetically
  const sortedItems = Array.from(itemsMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )
  const sortedRoles = Array.from(rolesMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  // Count people going to Merrit Reservoir
  const merritCount = attendingRsvps.filter(
    (rsvp) => rsvp.merrit_reservoir
  ).length

  if (attendingRsvps.length === 0) {
    return (
      <div className='w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        <div className='p-4 sm:p-8'>
          <h3 className='font-bold text-xl mb-4'>Trip Summary</h3>
          <p className='font-mono text-gray-textdark'>
            No RSVPs yet. Be the first to sign up!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
      <div className='p-4 sm:p-8'>
        <h3 className='font-bold text-xl mb-4'>Trip Summary</h3>

        {/* Merrit Reservoir Count */}
        <div className='mb-6'>
          <h4 className='font-semibold text-lg mb-2 text-pink-dark'>
            Merrit Reservoir (Day Before)
          </h4>
          <p className='font-mono text-gray-textdark'>
            {merritCount} {merritCount === 1 ? "person is" : "people are"}{" "}
            planning to come to Merrit Reservoir the day before.
          </p>
        </div>

        {/* Volunteer Roles */}
        {sortedRoles.length > 0 && (
          <div className='mb-6'>
            <h4 className='font-semibold text-lg mb-3 text-pink-dark'>
              Volunteer Roles
            </h4>
            <div className='space-y-2'>
              {sortedRoles.map(([role, people]) => (
                <div key={role} className='flex flex-wrap items-start gap-2'>
                  <span className='font-mono text-sm bg-yellow text-yellow-text px-2 py-1 rounded-md min-w-fit'>
                    {role}
                  </span>
                  <span className='font-mono text-sm text-gray-textdark'>
                    {people.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items Being Brought */}
        {sortedItems.length > 0 && (
          <div>
            <h4 className='font-semibold text-lg mb-3 text-pink-dark'>
              Items Being Brought
            </h4>
            <div className='space-y-2'>
              {sortedItems.map(([item, people]) => (
                <div key={item} className='flex flex-wrap items-start gap-2'>
                  <span className='font-mono text-sm bg-teal-light text-teal-text px-2 py-1 rounded-md min-w-fit'>
                    {item}
                  </span>
                  <span className='font-mono text-sm text-gray-textdark'>
                    {people.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedItems.length === 0 && sortedRoles.length === 0 && (
          <div className='text-center'>
            <p className='font-mono text-gray-textdark'>
              No items or volunteer roles have been added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TagSummary
