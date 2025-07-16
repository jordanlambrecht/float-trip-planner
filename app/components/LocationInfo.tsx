"use client"

import Link from "next/link"

const LocationInfo = () => {
  const campgroundUrl = "https://sharpsoutfitters.com/camping"
  const address = "90048 Sparks River Road, Sparks, Nebraska 69220"
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`

  return (
    <section className='w-full max-w-4xl flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='w-full bg-teal-light/50 border-2 border-teal rounded-lg p-6'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>
            📍 Where We're Staying
          </h2>
          <h3 className='text-xl font-mono text-teal-dark mb-2'>
            Sharp's Campground
          </h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Location Details */}
          <div className='space-y-4'>
            <div>
              <h4 className='font-semibold text-gray-800 mb-2'>Address:</h4>
              <p className='font-mono text-sm text-gray-600'>{address}</p>
            </div>

            <div>
              <h4 className='font-semibold text-gray-800 mb-2'>About:</h4>
              <p className='text-sm text-gray-600'>
                Our base camp for the Niobrara float trip. Full camping
                facilities with easy access to the river.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col space-y-3'>
            <Link
              href={campgroundUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center px-4 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-dark/50 transition-colors font-mono text-sm'
            >
              <span className='mr-2'>🔗</span>
              Visit Campground Website
            </Link>

            <Link
              href={mapUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center px-4 py-3 bg-blue-dark text-white rounded-lg hover:bg-blue-dark/50 transition-colors font-mono text-sm'
            >
              <span className='mr-2'>🗺️</span>
              Map It
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LocationInfo
