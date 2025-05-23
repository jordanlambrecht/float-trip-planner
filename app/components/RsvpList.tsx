import type { RsvpEntry, RSVPStatus } from "@types"
import clsx from "clsx"

interface RsvpListProps {
  rsvps?: RsvpEntry[]
}

const getRsvpEmoji = (status: RSVPStatus | null): string => {
  switch (status) {
    case "yes":
      return "✅"
    case "maybe":
      return "🤔"
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
    case "maybe":
      return "border-yellow-500"
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
const groupRsvpsByYear = (rsvps: RsvpEntry[]): Record<number, RsvpEntry[]> => {
  return rsvps.reduce((groups, rsvp) => {
    const year = rsvp.year
    if (!groups[year]) {
      groups[year] = []
    }
    groups[year].push(rsvp)
    return groups
  }, {} as Record<number, RsvpEntry[]>)
}

// Helper function to filter RSVPs based on year
const filterRsvpsForYear = (rsvps: RsvpEntry[], year: number): RsvpEntry[] => {
  const currentYear = new Date().getFullYear()

  if (year < currentYear) {
    // Past years: only show attendees (yes)
    return rsvps.filter((rsvp) => rsvp.rsvp === "yes")
  } else {
    // Current year and future: show all RSVPs
    return rsvps
  }
}

const RsvpList = ({ rsvps }: RsvpListProps) => {
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
      <div className='max-w-4xl mx-auto flex flex-col gap-y-24'>
        {years.map((year) => {
          // Filter RSVPs based on whether it's a past year or current/future year
          const filteredRsvps = filterRsvpsForYear(rsvpsByYear[year], year)

          // Don't render the year section if no RSVPs pass the filter
          if (filteredRsvps.length === 0) {
            return null
          }

          return (
            <div key={year} className='mb-8'>
              {/* Year Header */}
              <h2 className='text-2xl font-bold mb-4'>
                {year} Roll Call {year === currentYear ? " (So Far)" : ""}
              </h2>

              {/* Your original grid layout */}
              <div className='w-full'>
                <ul className='grid grid-cols-2 w-full sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6'>
                  {filteredRsvps.map((rsvp, index) => (
                    <li
                      key={`${year}-${index}`}
                      className={clsx(
                        "flex items-center justify-between p-3 border-b",
                        getRsvpColor(rsvp.rsvp)
                      )}
                    >
                      <p className='font-mono text-base font-medium text-gray-textdark dark:text-gray-textlight truncate text-wrap pr-2'>
                        {year < currentYear
                          ? formatNameWithInitials(rsvp.name)
                          : rsvp.name}
                      </p>
                      <span className='text-lg flex-shrink-0'>
                        {getRsvpEmoji(rsvp.rsvp)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default RsvpList
