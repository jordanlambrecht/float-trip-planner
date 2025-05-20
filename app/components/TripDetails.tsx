// app/components/TripDetails.tsx

import type { DetailRowProps, TripOptionDetails } from "@types"

function renderValue(val: string | string[]) {
  if (Array.isArray(val)) {
    return val.map((item, i) => (
      <span key={i} className='block'>
        {item}
      </span>
    ))
  }
  return val
}

const DetailRow = ({ label, value1, value2 }: DetailRowProps) => (
  <div className='grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[150px_1fr_1fr] items-baseline border-b border-gray py-2.5 last:border-b-0'>
    <span className='pr-3 font-mono text-xs text-right uppercase sm:text-sm text-text/55 dark:text-text-dm/75'>
      {label}:
    </span>
    <span className='px-3 font-mono text-xs sm:text-sm text-text dark:text-text-dm'>
      {renderValue(value1)}
    </span>
    <span className='px-3 font-mono text-xs sm:text-sm text-text dark:text-text-dm'>
      {renderValue(value2)}
    </span>
  </div>
)

interface TripDetailsProps {
  option1: TripOptionDetails
  option2: TripOptionDetails
}

const TripDetails = ({ option1, option2 }: TripDetailsProps) => {
  return (
    <div className='mb-6 border-t sm:mb-8 border-gray'>
      <DetailRow
        label='Avg Temp'
        value1={option1.eveningTemps}
        value2={option2.eveningTemps}
      />
      <DetailRow
        label='Moon'
        value1={option1.moonPhase}
        value2={option2.moonPhase}
      />
      <DetailRow
        label='Sky'
        value1={option1.darkSkyQuality}
        value2={option2.darkSkyQuality}
      />
      <DetailRow
        label='Space Stuff'
        value1={option1.meteorActivity}
        value2={option2.meteorActivity}
      />
    </div>
  )
}

export default TripDetails
