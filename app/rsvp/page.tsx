import type { ActualRsvpEntry } from '@types'
import { getActualRsvsAction } from '@actions'
import ActualRsvpForm from '../components/ActualRsvpForm'
import ActualRsvpList from '../components/ActualRsvpList'
import TagSummary from '../components/TagSummary'
import PageHeader from '../components/PageHeader'
import Schedule from '../components/Schedule'
import { Metadata } from 'next'
import Link from 'next/link'
import { TRIP_DATES_SHORT, TRIP_DATES_FULL } from '@tripConfig'

// Render with live RSVP data at request time; never statically prerender this
// page at build (which would require DATABASE_URL at build and serve a stale
// snapshot of who's coming).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `RSVP, ${TRIP_DATES_SHORT}`,
  description: 'Float on, brudduh.',
}

const RsvpPage = async () => {
  // Fetch initial data server-side
  const rsvpData = await getActualRsvsAction()

  // Handle error case
  if ('error' in rsvpData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4 text-center'>
        <p className='font-mono text-lg text-red-dark'>
          Error loading RSVP data:
        </p>
        <p className='font-mono text-red-dark'>{rsvpData.error}</p>
      </div>
    )
  }

  const actualRsvps = rsvpData

  return (
    <div className='px-2 w-full max-w-full flex flex-col justify-start items-center mx-auto gap-y-12 overflow-x-hidden'>
      <PageHeader />

      {/* RSVP Header Section */}
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <div className='w-full bg-linear-to-r from-teal-light to-blue-light border-2 border-teal rounded-lg p-6'>
          <div className='text-center mb-4'>
            <h1 className='text-3xl font-bold text-gray-textdark mb-2'>
              RSVP for Niobrara Trip
            </h1>
            <p className='text-xl font-mono text-pink-dark mb-2'>
              📅 {TRIP_DATES_FULL} 📅
            </p>
          </div>
        </div>
      </section>

      {/* RSVP Form Section */}
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <ActualRsvpForm rsvps={actualRsvps} />
      </section>

      <Schedule />

      {/* Learn About Trip Button */}
      <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
        <Link
          href='/'
          className='inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-blue-dark rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-dark focus:ring-offset-2'
        >
          🏞️ Trip Details & Such
        </Link>
      </section>

      {/* Tag Summary Section */}
      {/* <TagSummary rsvps={actualRsvps} /> */}

      {/* RSVP List */}
      {/* <ActualRsvpList rsvps={actualRsvps} /> */}
    </div>
  )
}

export default RsvpPage
