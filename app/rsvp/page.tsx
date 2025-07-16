import type { ActualRsvpEntry } from "@types"
import { getActualRsvsAction } from "@actions"
import ActualRsvpForm from "../components/ActualRsvpForm"
import ActualRsvpList from "../components/ActualRsvpList"
import TagSummary from "../components/TagSummary"
import PageHeader from "../components/PageHeader"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "RSVP, AUG 21th - 24th",
  description: "Float on, brudduh.",
}

const RsvpPage = async () => {
  // Fetch initial data server-side
  const rsvpData = await getActualRsvsAction()

  // Handle error case
  if ("error" in rsvpData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-4 text-center'>
        <p className='font-mono text-lg text-red-600'>
          Error loading RSVP data:
        </p>
        <p className='font-mono text-red-500'>{rsvpData.error}</p>
      </div>
    )
  }

  const actualRsvps = rsvpData

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
        <ActualRsvpForm rsvps={actualRsvps} />
      </section>

      {/* Tag Summary Section */}
      {/* <TagSummary rsvps={actualRsvps} /> */}

      {/* RSVP List */}
      {/* <ActualRsvpList rsvps={actualRsvps} /> */}
    </div>
  )
}

export default RsvpPage
