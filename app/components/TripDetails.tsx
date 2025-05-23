// app/components/TripDetails.tsx

import type { DetailRowProps, TripOptionDetails } from "@types"

function renderValue(val: string | string[]) {
  if (Array.isArray(val)) {
    return val.map((item, i) => (
      <ul key={i} className='block'>
        <li>— {item}</li>
      </ul>
    ))
  }
  return val
}

// Mobile and Desktop optimized version of DetailRow
const DetailRow = ({ label, value1, value2 }: DetailRowProps) => (
  <div>
    {/* Mobile layout: Stacked with label at top */}
    <div className='block sm:hidden border-b border-background-dm py-4 last:border-b-0'>
      <div className='mb-2 font-mono text-sm uppercase font-medium text-center'>
        {label}
      </div>

      <div className='md:hidden grid grid-cols-2 gap-2'>
        <div className='p-2 text-center'>
          <div className='text-xs uppercase mb-1 font-mono text-text/70'>
            Option A
          </div>
          <div className='font-mono text-sm'>{renderValue(value1)}</div>
        </div>

        <div className='p-2 text-center'>
          <div className='text-xs uppercase mb-1 font-mono text-text/70'>
            Option B
          </div>
          <div className='font-mono text-sm'>{renderValue(value2)}</div>
        </div>
      </div>
    </div>

    {/* Desktop layout: Three column grid row */}
    <div className='hidden sm:grid sm:grid-cols-[150px_1fr_1fr] border-b border-background-dm py-1 last:border-b-0'>
      <div className='font-mono text-sm uppercase py-2 px-3 text-left'>
        {label}
      </div>
      <div className='p-2 font-mono text-sm text-center'>
        {renderValue(value1)}
      </div>
      <div className='p-2 font-mono text-sm text-center'>
        {renderValue(value2)}
      </div>
    </div>
  </div>
)

interface TripDetailsProps {
  option1: TripOptionDetails
  option2: TripOptionDetails
}

// Responsive approach with different layouts for mobile and desktop
const TripDetails = ({ option1, option2 }: TripDetailsProps) => {
  return (
    <div className='mb-6 border-t sm:mb-8 border-background-dm'>
      {/* Column headers - only visible on desktop */}
      <div className='hidden sm:grid sm:grid-cols-[150px_1fr_1fr] py-3'>
        <div></div>
        <div className='text-center font-mono text-base font-bold'>
          Option A
        </div>
        <div className='text-center font-mono text-base font-bold'>
          Option B
        </div>
      </div>

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
