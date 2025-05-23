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
      <div className='w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg dark:bg-cardbg-dm'>
        <div className='p-4 sm:p-8'>
          {/* Compare to Last Year Button */}
          <div className='flex justify-end mb-4'>
            <button
              onClick={() => setIsComparisonModalOpen(true)}
              className='px-3 py-2 font-mono text-xs text-gray-textdark dark:text-gray-textlight border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-1'
            >
              Compare to Past Trips
            </button>
          </div>

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
