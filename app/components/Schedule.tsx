import React from "react"
import ScheduleCard from "./schedule/ScheduleCard"
import { ScheduleItem } from "./schedule/types"

const scheduleData: ScheduleItem[] = [
  {
    id: "thr",
    dayAbbr: "THR",
    dayLabel: "bonus day",
    activity: "merritt reservoir",
    bgColor: "bg-pink-300",
    textColor: "text-pink-700",
    borderColor: "border-pink-400",
  },
  {
    id: "fri",
    dayAbbr: "FRI",
    dayLabel: "day 01",
    activity: "mosey in + camp",
    bgColor: "bg-blue-300",
    textColor: "text-blue-700",
    borderColor: "border-blue-400",
  },
  {
    id: "sat",
    dayAbbr: "SAT",
    dayLabel: "day 03",
    activity: "float + hang",
    bgColor: "bg-green-300",
    textColor: "text-green-700",
    borderColor: "border-green-400",
  },
  {
    id: "sun",
    dayAbbr: "SUN",
    dayLabel: "day 04",
    activity: "brekky + mosey out",
    bgColor: "bg-purple-300",
    textColor: "text-purple-700",
    borderColor: "border-purple-400",
  },
]

const Schedule = () => {
  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg '>
        <h2>Schedule</h2>

        <div className='flex h-full items-stretch justify-center lg:justify-center gap-2 md:gap-6'>
          {scheduleData.map((item) => (
            <ScheduleCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Schedule
