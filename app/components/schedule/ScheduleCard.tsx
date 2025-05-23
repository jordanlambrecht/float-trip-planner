import React from "react"
import clsx from "clsx"
import type { ScheduleItem } from "./types"

interface ScheduleCardProps {
  item: ScheduleItem
}

const ScheduleCard = ({ item }: ScheduleCardProps) => {
  const { dayAbbr, dayLabel, activity, bgColor, textColor, borderColor } = item

  // Split the day abbreviation into individual letters for stacking
  const letters = dayAbbr.split("")

  return (
    <div
      className={clsx(
        `bg-cardbg flex flex-col w-[125px] rounded-xl shadow overflow-hidden border ${borderColor}`,
        { "border-dashed": dayLabel === "bonus day" }
      )}
    >
      {/* Colored section with day label and day abbreviation */}
      <div
        className={clsx(
          ` flex flex-col items-center py-4 border-b ${borderColor}`,
          bgColor,
          { "border-dashed": dayLabel === "bonus day" }
        )}
      >
        {/* Day label at the top */}
        <div className='leading-none line-height-none text-center font-mono font-bold mb-2'>
          <h3 className='font-mono text-base font-bold capitalize text-text'>
            {dayLabel.includes("day") ? (
              <>
                <span className='block mb-0'>{dayLabel.split(" ")[0]}</span>
                <span className='block font-bold'>
                  {dayLabel.split(" ")[1]}
                </span>
              </>
            ) : (
              dayLabel
            )}
          </h3>
        </div>

        {/* Stacked letters */}
        <div className='flex flex-col justify-between items-center rotate-180'>
          {letters.map((letter, index) => (
            <span
              key={index}
              className={`line-height-none my-0 py-0 rotate-90 text-5xl font-bold ${textColor}`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* White content area with activity */}
      <div className='bg-white overflow-hidden flex-grow px-6 py-12'>
        <div className='flex justify-center items-end h-full'>
          {/* Activity */}
          <span
            className='font-mono text-2xl text-text '
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            {activity}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ScheduleCard
