// app/components/TripOptionHeader.tsx

import type { TripOptionDetails } from "@types"

interface TripOptionHeaderProps {
  option: TripOptionDetails
}

const TripOptionHeader = ({ option }: TripOptionHeaderProps) => {
  const [month, dates, year] = option.title.split(" ")
  return (
    <div className='px-2 py-3 text-center'>
      <p className='font-sans text-xs tracking-wider uppercase text-text '>
        {option.subTitle}
      </p>
      <div className='mt-1'>
        <h2 className='text-center text-3xl font-black leading-none sm:text-4xl text-text  mb-0 pb-0'>
          {month}
        </h2>
        <h3 className='mt-1 font-sans text-lg font-normal leading-none sm:text-3xl text-text '>
          {dates}
        </h3>
        <h3 className='font-sans text-lg leading-none sm:text-2xl text-text '>
          {year}
        </h3>
      </div>
    </div>
  )
}

export default TripOptionHeader
