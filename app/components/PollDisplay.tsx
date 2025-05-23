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
  isFetching: boolean
}

const PollDisplay = ({
  view,
  pollResults,
  tripOptions,
  onFormSubmitSuccess,
  onResetToForm,
  error,
  isFetching,
}: PollDisplayProps) => {
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  return (
    <>
      <div className='py-4 my-16 text-center'>
        <h1 className='text-4xl font-bold'>Niobrara 2025</h1>
        <span className='font-mono text-lg'>Hooray!</span>
      </div>
      <div className='w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg '>
        <div className='p-4 sm:p-8'>
          {/* Compare to Last Year Button */}
          <div className='flex flex-row justify-between items-start mb-4'>
            <h2>Pre-RSVP</h2>

            <div className='flex justify-end mb-4'>
              <button
                onClick={() => setIsComparisonModalOpen(true)}
                className='px-3 py-2 font-mono text-xs text-gray-textdark  border border-gray-300  rounded-md hover:bg-gray-100 :bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-1'
              >
                Compare to Past Trips
              </button>
            </div>
          </div>
          <p className='font-mono max-w-lg mb-8'>
            {" "}
            Just trying to get a general feel of when people are interested in
            going. No need for hard answers yet.
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
            {isFetching && view === "results" && (
              <div className='p-4 font-mono text-center'>
                Refreshing results...
              </div>
            )}
            <PollViewSwitcher
              view={view}
              pollResults={pollResults}
              tripOptions={tripOptions}
              onFormSubmitSuccess={onFormSubmitSuccess}
              onResetToForm={onResetToForm}
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
