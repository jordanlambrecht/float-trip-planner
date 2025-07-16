"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import type { ActualRsvpEntry } from "@types"
import { getActualRsvsAction } from "@actions"
import ActualRsvpForm from "../components/ActualRsvpForm"
import ActualRsvpList from "../components/ActualRsvpList"
import TagSummary from "../components/TagSummary"
import PageHeader from "../components/PageHeader"

const RsvpPage = () => {
  const [actualRsvps, setActualRsvps] = useState<ActualRsvpEntry[]>([])
  const [isLoading, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const fetchActualRsvps = useCallback(async () => {
    startTransition(async () => {
      setError(null)
      try {
        const data = await getActualRsvsAction()
        if ("error" in data) {
          setError(data.error)
          console.error("Error fetching actual RSVPs:", data.error)
        } else {
          setActualRsvps(data)
        }
      } catch (error) {
        setError("Failed to load RSVP data")
        console.error("Error fetching actual RSVPs:", error)
      }
    })
  }, [])

  useEffect(() => {
    fetchActualRsvps()
  }, [fetchActualRsvps])

  const handleActualRsvpSubmitSuccess = () => {
    fetchActualRsvps()
  }

  // Loading state
  if (isLoading && actualRsvps.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='font-mono text-lg'>Loading RSVP form...</p>
      </div>
    )
  }

  // Error state
  if (error && actualRsvps.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4 text-center'>
        <p className='font-mono text-lg text-red-600'>
          Error loading RSVP data:
        </p>
        <p className='font-mono text-red-500'>{error}</p>
        <button
          onClick={fetchActualRsvps}
          disabled={isLoading}
          className='px-4 py-2 mt-4 font-mono text-sm text-white rounded bg-pink-dark hover:bg-opacity-90 disabled:opacity-50'
        >
          {isLoading ? "Retrying..." : "Try Again"}
        </button>
      </div>
    )
  }

  return (
    <div className='px-2 w-full max-w-full flex flex-col justify-start items-center mx-auto gap-y-12 overflow-x-hidden'>
      <PageHeader />

      {/* RSVP Header Section */}
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <div className='w-full bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-6'>
          <div className='text-center mb-4'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              RSVP for Niobrara Trip
            </h1>
            <p className='text-xl font-mono text-pink-dark mb-2'>
              📅 AUGUST 21st-24th, 2025 📅
            </p>
          </div>
        </div>
      </section>

      {/* RSVP Form Section */}
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <ActualRsvpForm
          onFormSubmitSuccess={handleActualRsvpSubmitSuccess}
          rsvps={actualRsvps}
        />
      </section>

      {/* Tag Summary Section */}
      {/* <TagSummary rsvps={actualRsvps} /> */}

      {/* RSVP List */}
      {/* <ActualRsvpList rsvps={actualRsvps} /> */}
    </div>
  )
}

export default RsvpPage
