'use client'

import Link from 'next/link'
import { H2 } from './ui/Typography'

const LOCATIONS = [
  {
    name: "Sharp's Campground",
    nights: 'Friday - Sunday',
    address: '90048 Sparks River Road, Sparks, Nebraska 69220',
    about:
      'Our base camp for the Niobrara float trip. Full camping facilities with easy access to the river.',
    websiteUrl: 'https://sharpsoutfitters.com/camping',
    websiteLabel: 'Visit Campground Website',
    accentClass: 'text-teal-dark',
  },
  {
    name: 'Merritt Reservoir',
    nights: 'Thursday bonus night (optional)',
    address: 'Merritt Reservoir SRA, Merritt Dam, Valentine, Nebraska 69201',
    about:
      "Thursday's optional stargazing camp, about 26 miles southwest of Valentine. DarkSky-certified with some of the darkest skies on the planet, plus a beach for swimming. A Nebraska park entry permit is required (covered in the cost breakdown).",
    websiteUrl: 'https://outdoornebraska.gov/location/merritt-reservoir/',
    websiteLabel: 'Visit Merritt SRA Website',
    accentClass: 'text-pink-dark',
  },
]

const LocationInfo = () => {
  return (
    <section className='w-full flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-4xl bg-teal-light/50 border-2 border-teal rounded-lg p-6 shadow-2xl'>
        <div className='text-center mb-6'>
          <H2 className='text-2xl font-bold text-gray-textdark mb-2'>
            📍 Where We're Staying
          </H2>
        </div>

        <div className='flex flex-col gap-y-8'>
          {LOCATIONS.map((location, index) => {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location.address
            )}`

            return (
              <div
                key={location.name}
                className={
                  index > 0 ? 'pt-8 border-t-2 border-teal/50' : undefined
                }
              >
                <div className='text-center mb-4'>
                  <h3
                    className={`text-xl font-mono mb-1 ${location.accentClass}`}
                  >
                    {location.name}
                  </h3>
                  <p className='font-mono text-sm text-gray-textlight'>
                    {location.nights}
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Location Details */}
                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-semibold text-gray-textdark mb-2'>
                        Address:
                      </h4>
                      <p className='font-mono text-sm text-gray-textlight'>
                        {location.address}
                      </p>
                    </div>

                    <div>
                      <h4 className='font-semibold text-gray-textdark mb-2'>
                        About:
                      </h4>
                      <p className='text-sm text-gray-textlight'>{location.about}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex flex-col space-y-3'>
                    <Link
                      href={location.websiteUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center justify-center px-4 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-dark/50 transition-colors font-mono text-sm'
                    >
                      <span className='mr-2'>🔗</span>
                      {location.websiteLabel}
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
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default LocationInfo
