// app/page.tsx
"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import PollDisplay from "./components/PollDisplay"
import type { PollResultsData, RsvpEntry } from "@types" // Import RsvpEntry
import { tripOptionsStaticDetails } from "@pollConfig"
import { getPollResultsAction } from "@actions"
import Schedule from "./components/Schedule"
import RsvpList from "./components/RsvpList" // Import RsvpList
import { MeteorShowerGuide } from "./components"
import Link from "next/link"
import CoolResources from "./components/CoolResources"
import Itinerary from "./components/Itinerary"
const Page = () => {
  const [pollResults, setPollResults] = useState<PollResultsData | null>(null)
  // Separate state for rsvps to make passing to RsvpList cleaner
  const [rsvps, setRsvps] = useState<RsvpEntry[] | undefined>(undefined)
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
          setPollResults(null)
          setRsvps(undefined) // Clear rsvps on error
        } else {
          setPollResults(data)
          setRsvps(data.rsvps) // Set the rsvps state

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
    [view] // Removed pollResults from dependencies as it's set within this callback
  )

  useEffect(() => {
    fetchPollData(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // fetchPollData is memoized with useCallback

  const handleFormSubmissionSuccess = () => {
    fetchPollData(true) // This will refetch all data including RSVPs
  }

  const handleResetToForm = () => {
    setView("form")
  }

  // Loading state for initial fetch
  if (isFetching && !pollResults && !error && rsvps === undefined) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='font-mono text-lg'>Loading Poll...</p>
      </div>
    )
  }

  // Error state for initial fetch
  if (error && !pollResults && rsvps === undefined) {
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
    <div className='px-2 w-full flex flex-col justify-start items-center mx-auto gap-y-12'>
      <section className='flex flex-col items-center justify-center min-h-screen p-4 sm:p-6'>
        <PollDisplay
          view={view}
          pollResults={pollResults}
          tripOptions={tripOptionsStaticDetails}
          onFormSubmitSuccess={handleFormSubmissionSuccess}
          onResetToForm={handleResetToForm}
          error={error}
          isFetching={isFetching && !pollResults}
        />
      </section>
      <RsvpList rsvps={rsvps} />
      <Schedule />
      <Itinerary />
      <MeteorShowerGuide />
      <CoolResources />
    </div>
  )
}

export default Page
