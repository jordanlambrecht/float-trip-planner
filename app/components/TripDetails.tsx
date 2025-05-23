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
  <div className='grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[150px_1fr_1fr] items-baseline border-b border-background-dm py-2.5 last:border-b-0 text-center'>
    <span className='pr-3 font-mono text-xs text-right uppercase sm:text-sm text-text/55 '>
      {label}:
    </span>
    <span className='px-3 font-mono text-xs sm:text-sm text-text '>
      {renderValue(value1)}
    </span>
    <span className='px-3 font-mono text-xs sm:text-sm text-text '>
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
    <div className='mb-6 border-t sm:mb-8 border-background-dm'>
      <DetailRow
        label='Avg Daytime Temp'
        value1={option1.daytimeTemps}
        value2={option2.daytimeTemps}
      />
      <DetailRow
        label='Avg Nighttime Temp'
        value1={option1.eveningTemps}
        value2={option2.eveningTemps}
      />
      <DetailRow
        label='Moon'
        value1={option1.moonPhase}
        value2={option2.moonPhase}
      />
      <DetailRow
        label='Clear Sky Chance'
        value1={option1.clearSkyChance}
        value2={option2.clearSkyChance}
      />
      <DetailRow
        label='Rain Chance'
        value1={option1.rainChance}
        value2={option2.rainChance}
      />
      <DetailRow label='Wind' value1={option1.wind} value2={option2.wind} />
      <DetailRow
        label='Humidity'
        value1={option1.humidity}
        value2={option2.humidity}
      />
      <DetailRow
        label='Space Stuff'
        value1={option1.meteorActivity}
        value2={option2.meteorActivity}
      />
      <DetailRow
        label='Vibe Boosters'
        value1={option1.advantages}
        value2={option2.advantages}
      />
      <DetailRow
        label='Vibe Wreckers'
        value1={option1.disadvantages}
        value2={option2.disadvantages}
      />
    </div>
  )
}

export default TripDetails
