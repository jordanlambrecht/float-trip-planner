// app/components/TripOptionHeader.tsx

import type { TripOptionDetails } from "@types"

interface TripOptionHeaderProps {
  option: TripOptionDetails
}

const TripOptionHeader = ({ option }: TripOptionHeaderProps) => {
  const [month, dates, year] = option.title.split(" ")
  return (
    <div className='px-2 py-3 text-center'>
      <p className='font-sans text-xs tracking-wider uppercase text-text dark:text-text-dm/75'>
        {option.subTitle}
      </p>
      <div className='mt-1'>
        <h2 className='text-center text-3xl font-bold leading-none sm:text-4xl text-text dark:text-text-dm mb-0 pb-0'>
          {month}
        </h2>
        <h3 className='font-sans text-2xl font-medium leading-none sm:text-3xl text-text dark:text-text-dm'>
          {dates}
        </h3>
        <h3 className='font-sans text-xl leading-none sm:text-2xl text-text dark:text-text-dm'>
          {year}
        </h3>
      </div>
    </div>
  )
}

export default TripOptionHeader
