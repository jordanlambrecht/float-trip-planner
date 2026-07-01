import React from 'react'
import ScheduleCard from './schedule/ScheduleCard'
import { ScheduleItem } from './schedule/types'
import { TRIP_DAYS } from '@tripConfig'
import { H2 } from './ui/Typography'

const scheduleData: ScheduleItem[] = [
  {
    id: 'thr',
    dayAbbr: 'THR',
    dayLabel: 'bonus day',
    activity: 'merritt reservoir',
    bgColor: 'bg-pink-medium',
    textColor: 'text-pink-text',
    borderColor: 'border-pink-dark',
    date: TRIP_DAYS.bonus,
  },
  {
    id: 'fri',
    dayAbbr: 'FRI',
    dayLabel: 'day 01',
    activity: 'mosey in + camp',
    bgColor: 'bg-blue-medium',
    textColor: 'text-blue-text',
    borderColor: 'border-blue-dark',
    date: TRIP_DAYS.day1,
  },
  {
    id: 'sat',
    dayAbbr: 'SAT',
    dayLabel: 'day 02',
    activity: 'float + hang',
    bgColor: 'bg-green-medium',
    textColor: 'text-green-text',
    borderColor: 'border-green-medium',
    date: TRIP_DAYS.day2,
  },
  {
    id: 'sun',
    dayAbbr: 'SUN',
    dayLabel: 'day 03',
    activity: 'brekky + mosey out',
    bgColor: 'bg-purple-medium',
    textColor: 'text-purple-text',
    borderColor: 'border-purple-dark',
    date: TRIP_DAYS.day3,
  },
]

const Schedule = () => {
  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg '>
        <H2>Schedule</H2>

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
