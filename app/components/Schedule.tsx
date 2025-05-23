import React from "react"

const scheduleData = [
  {
    id: "thr",
    dayAbbr: "THR",
    dayLabel: "bonus day",
    activity: "merritt reservoir",
    bgColor: "bg-pink-300",
    abbrTextColor: "text-pink-700",
    labelColor: "text-pink-600",
    borderColor: "border-pink-400",
    activityTextColor: "text-gray-800",
  },
  {
    id: "fri",
    dayAbbr: "FRI",
    dayLabel: "day 01",
    activity: "mosey in + camp",
    bgColor: "bg-blue-300",
    abbrTextColor: "text-blue-700",
    labelColor: "text-blue-600",
    borderColor: "border-blue-400",
    activityTextColor: "text-gray-800",
  },
  {
    id: "sat",
    dayAbbr: "SAT",
    dayLabel: "day 03", // Image says day 03, OCR says day 03
    activity: "float", // MODIFIED: Removed spaces
    bgColor: "bg-green-300",
    abbrTextColor: "text-green-700",
    labelColor: "text-green-600",
    borderColor: "border-green-400",
    activityTextColor: "text-gray-800",
  },
  {
    id: "sun",
    dayAbbr: "SUN",
    dayLabel: "day 04",
    activity: "brekky + mosey out",
    bgColor: "bg-purple-300",
    abbrTextColor: "text-purple-700",
    labelColor: "text-purple-600",
    borderColor: "border-purple-400",
    activityTextColor: "text-gray-800",
  },
]

interface ScheduleItem {
  id: string
  dayAbbr: string
  dayLabel: string
  activity: string
  bgColor: string
  abbrTextColor: string
  labelColor: string
  borderColor: string
  activityTextColor: string
}

interface ScheduleCardProps {
  item: ScheduleItem
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const {
    dayAbbr,
    dayLabel,
    activity,
    bgColor,
    abbrTextColor,
    labelColor,
    borderColor,
    activityTextColor,
  } = item

  // Helper to render activity
  const renderActivityText = () => {
    // Simplified: always render activity as a block
    return <span className='block'>{activity}</span>
  }

  return (
    <div
      className={`flex flex-col rounded-xl shadow-lg overflow-hidden w-36 sm:w-40 md:w-44 h-[26rem] sm:h-[28rem] md:h-[30rem]`}
    >
      {/* Top Colored Section */}
      <div className={`flex items-center justify-center p-1 ${bgColor} h-1/3`}>
        <span
          // Use Kumbh Sans for the day abbreviation
          className={`font-kumbh-sans font-bold text-5xl sm:text-6xl ${abbrTextColor} [writing-mode:vertical-rl] transform rotate-180 text-center leading-none`}
        >
          {dayAbbr}
        </span>
      </div>

      {/* Bottom White Section */}
      <div
        // This div centers the rotated content block
        className={`flex items-center justify-center flex-grow p-3 bg-white border-l-2 border-r-2 border-b-2 ${borderColor} rounded-b-xl`}
      >
        {/* This div handles the rotation and vertical writing mode for its children */}
        <div
          className={`flex flex-col items-center justify-center h-full ${activityTextColor} [writing-mode:vertical-rl] transform rotate-180 leading-snug`}
        >
          {/* Day Label - appears "above" (to the right of) activity due to DOM order in vertical-rl */}
          <span
            className={`font-ibm-plex-mono text-xs ${labelColor} block mb-3 sm:mb-4 whitespace-nowrap`}
          >
            {dayLabel}
          </span>
          {/* Activity Text */}
          <div className={`font-ibm-plex-mono text-lg sm:text-xl text-center`}>
            {renderActivityText()}
          </div>
        </div>
      </div>
    </div>
  )
}

const Schedule = () => {
  return (
    // Section for the entire schedule block
    <section className='py-12 sm:py-16 px-4 md:px-8'>
      {" "}
      {/* Adjust padding as needed */}
      {/* Optional: Constrain width on larger screens */}
      <div className='max-w-6xl mx-auto'>
        <h2 className='font-kumbh-sans text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-10 sm:mb-12 text-left'>
          Schedule
        </h2>
        <div className='flex flex-row flex-wrap justify-center sm:justify-start items-stretch gap-4 md:gap-6 lg:gap-8'>
          {scheduleData.map((item) => (
            <ScheduleCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Schedule
