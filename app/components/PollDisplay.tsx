"use client"
import { useState } from "react"
import { TripDetails, TripOptionHeader, PollViewSwitcher } from "@components"
import YearComparisonModal from "./YearComparisonModal"
import type { PollResultsData } from "@types"
import type { tripOptionsStaticDetails as TripOptionsType } from "@pollConfig"

interface PollDisplayProps {
  view: "form" | "results"
  pollResults: PollResultsData | null
  tripOptions: typeof TripOptionsType
  onFormSubmitSuccess: () => void
  onResetToForm: () => void
  error: string | null
  isFetching?: boolean
}

const PollDisplay = ({
  view,
  pollResults,
  tripOptions,
  onFormSubmitSuccess,
  onResetToForm,
  error,
  isFetching = false,
}: PollDisplayProps) => {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  return (
    <>
      <div className='w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg opacity-75'>
        <div className='p-4 sm:p-8'>
          {/* Compare to Last Year Button */}
          <div className='flex flex-row justify-between items-start mb-4'>
            <div>
              <h2 className='line-through font-bold text-gray-600'>
                Pre-RSVP Results (Closed)
              </h2>
              <p className='text-sm font-mono text-green-700 mt-1'>
                ✅ August 21st-24th has been selected!
              </p>
            </div>

            <div className='flex justify-end mb-4'>
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className='px-3 py-2 font-mono text-xs text-gray-textdark  border border-gray-300  rounded-md hover:bg-gray-100 :bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-1'
              >
                Compare to Past Trips
              </button>
            </div>
          </div>
          <p className='font-mono max-w-lg mb-8 text-gray-600'>
            The pre-RSVP voting period has ended. Based on the results below,
            August 21st-24th was selected as the trip dates.
          </p>

          <div className='grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[150px_1fr_1fr] items-center mb-1'>
            <div>&nbsp;</div>
            <TripOptionHeader option={tripOptions.option1} />
            <TripOptionHeader option={tripOptions.option2} />
          </div>

          <TripDetails
            option1={tripOptions.option1}
            option2={tripOptions.option2}
          />

          <div className='min-h-[300px]'>
            {/* Always show results for closed poll, no loading state */}
            <PollViewSwitcher
              view='results'
              pollResults={pollResults}
              tripOptions={tripOptions}
              onFormSubmitSuccess={() => {}} // Disabled
              onResetToForm={() => {}} // Disabled
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Year Comparison Modal */}
      <YearComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        currentYear={currentYear}
        currentYearData={tripOptions}
      />
    </>
  )
}

export default PollDisplay
