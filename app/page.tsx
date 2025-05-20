// app/page.tsx
"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { TripDetails, TripOptionHeader, PollViewSwitcher } from "@components"
import type { PollResultsData } from "@types"
import { tripOptionsStaticDetails } from "@pollConfig"
import { getPollResultsAction } from "@actions"

const Page = () => {
  const [pollResults, setPollResults] = useState<PollResultsData | null>(null)
  const [isFetching, startFetchingTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"form" | "results">("form")

  const fetchPollData = useCallback(
    async (showResultsViewAfterFetch = false) => {
      startFetchingTransition(async () => {
        setError(null)
        const data = await getPollResultsAction()

        if ("error" in data) {
          setError(data.error)
          console.error("Error fetching poll data:", data.error)
          setPollResults(null) // Clear previous results on error
        } else {
          setPollResults(data)
          const totalVotes =
            (data.option1
              ? Object.values(data.option1.votes).reduce((s, c) => s + c, 0)
              : 0) +
            (data.option2
              ? Object.values(data.option2.votes).reduce((s, c) => s + c, 0)
              : 0)

          if (showResultsViewAfterFetch) {
            setView("results")
          } else if (totalVotes > 0 && view !== "form") {
            setView("results")
          } else if (totalVotes === 0) {
            setView("form")
          }
        }
      })
    },
    [view]
  )

  useEffect(() => {
    fetchPollData(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFormSubmissionSuccess = () => {
    fetchPollData(true)
  }

  const handleResetToForm = () => {
    setView("form")
  }

  if (isFetching && !pollResults && !error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='font-mono text-lg'>Loading Poll...</p>
      </div>
    )
  }

  if (error && !pollResults) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4 text-center'>
        <p className='font-mono text-lg text-red-600'>
          Error loading poll data:
        </p>
        <p className='font-mono text-red-500'>{error}</p>
        <button
          onClick={() => fetchPollData(false)}
          disabled={isFetching}
          className='px-4 py-2 mt-4 font-mono text-sm text-white rounded bg-pink-dark hover:bg-opacity-90 disabled:opacity-50'
        >
          {isFetching ? "Retrying..." : "Try Again"}
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 selection:bg-pink-dark selection:text-white'>
      <div className='w-full max-w-4xl rounded-lg shadow-2xl bg-cardbg dark:bg-cardbg-dm'>
        <div className='p-4 sm:p-8'>
          <div className='grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[150px_1fr_1fr] items-center mb-1'>
            <div>&nbsp;</div>
            <TripOptionHeader option={tripOptionsStaticDetails.option1} />
            <TripOptionHeader option={tripOptionsStaticDetails.option2} />
          </div>

          <TripDetails
            option1={tripOptionsStaticDetails.option1}
            option2={tripOptionsStaticDetails.option2}
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
              tripOptions={tripOptionsStaticDetails}
              onFormSubmitSuccess={handleFormSubmissionSuccess}
              onResetToForm={handleResetToForm}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
