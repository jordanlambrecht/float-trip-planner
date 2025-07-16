// app/page.tsx
"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import PollDisplay from "./components/PollDisplay"
import type { PollResultsData, ActualRsvpEntry } from "@types"
import { tripOptionsStaticDetails } from "@pollConfig"
import { getPollResultsAction, getActualRsvsAction } from "@actions"
import Schedule from "./components/Schedule"
import RsvpList from "./components/RsvpList"
import {
  MeteorShowerGuide,
  CollapsibleSection,
  LocationInfo,
  CostCalculator,
  HistoricalRollCall,
  FAQ,
} from "./components"
import CoolResources from "./components/CoolResources"
import Itinerary from "./components/Itinerary"
import MessageWall from "./components/MessageWall"
import PageHeader from "./components/PageHeader"
import Link from "next/link"
const Page = () => {
  const [pollResults, setPollResults] = useState<PollResultsData | null>(null)
  const [rsvps, setRsvps] = useState<ActualRsvpEntry[] | undefined>(undefined)
  const [isRsvpLoading, startRsvpTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"form" | "results">("results") // Always show results now

  const fetchData = useCallback(async () => {
    // Fetch poll results without loading state (static data)
    try {
      const pollData = await getPollResultsAction()
      if ("error" in pollData) {
        console.error("Error fetching poll data:", pollData.error)
        setPollResults(null)
      } else {
        setPollResults(pollData)
      }
    } catch (error) {
      console.error("Error fetching poll data:", error)
      setPollResults(null)
    }

    // Fetch RSVP data with loading state
    startRsvpTransition(async () => {
      setError(null)
      try {
        const actualRsvpsData = await getActualRsvsAction()
        if ("error" in actualRsvpsData) {
          setError(actualRsvpsData.error)
          console.error("Error fetching RSVP data:", actualRsvpsData.error)
          setRsvps(undefined)
        } else {
          setRsvps(actualRsvpsData)
        }
      } catch (error) {
        setError("Failed to load RSVP data")
        console.error("Error fetching RSVP data:", error)
        setRsvps(undefined)
      }

      // Always show results view since poll is closed
      setView("results")
    })
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleFormSubmissionSuccess = () => {
    // Disabled - poll is closed
  }

  const handleResetToForm = () => {
    // Disabled - poll is closed
  }

  // Only show loading for RSVP data
  if (isRsvpLoading && rsvps === undefined) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='font-mono text-lg'>Loading RSVP data...</p>
      </div>
    )
  }

  // Error state for RSVP fetch
  if (error && rsvps === undefined) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4 text-center'>
        <p className='font-mono text-lg text-red-600'>
          Error loading RSVP data:
        </p>
        <p className='font-mono text-red-500'>{error}</p>
        <button
          onClick={() => fetchData()}
          disabled={isRsvpLoading}
          className='px-4 py-2 mt-4 font-mono text-sm text-white rounded bg-pink-dark hover:bg-opacity-90 disabled:opacity-50'
        >
          {isRsvpLoading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    )
  }

  return (
    <div className='px-2 w-full max-w-full flex flex-col justify-start items-center mx-auto gap-y-12 overflow-x-hidden'>
      <PageHeader />

      {/* Closed Pre-RSVP Section - Collapsed */}
      <section className='w-full max-w-4xl px-4 sm:px-6'>
        <CollapsibleSection
          title='Pre-RSVP Results (Closed)'
          subtitle='✅ August 21st-24th was selected based on voting results'
          defaultCollapsed={true}
          className='border border-gray-textlight/50 rounded-lg'
        >
          <div className='flex flex-col items-center justify-center p-4 sm:p-6'>
            <PollDisplay
              view={view}
              pollResults={pollResults}
              tripOptions={tripOptionsStaticDetails}
              onFormSubmitSuccess={handleFormSubmissionSuccess}
              onResetToForm={handleResetToForm}
              error={null} // Poll errors not critical since it's historical data
            />
          </div>
        </CollapsibleSection>
      </section>

      {/* RSVP Call-to-Action Section */}
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <div className='w-full bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-6 text-center'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>Wanna RSVP?</h2>
          <p className='text-lg font-mono text-pink-dark mb-4'>
            📅 AUGUST 21st-24th, 2025 📅
          </p>
          <p className='text-gray-600 font-mono mb-6'>
            The official dates have been selected. Click below to submit your
            RSVP.
          </p>
          <Link
            href='/rsvp'
            className='inline-block font-mono uppercase text-lg tracking-wider py-3 px-8 bg-pink-dark text-white rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-dark focus:ring-offset-2 transition-colors'
          >
            Go to RSVP Page
          </Link>
        </div>
      </section>

      <RsvpList rsvps={rsvps} />
      <HistoricalRollCall />
      <LocationInfo />
      <CostCalculator rsvps={rsvps} />
      <MessageWall />
      <Schedule />
      <Itinerary />
      <FAQ />
      <MeteorShowerGuide />
      <CoolResources />
    </div>
  )
}

export default Page
