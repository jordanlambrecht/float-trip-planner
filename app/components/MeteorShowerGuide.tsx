'use client'
import { useState } from 'react'
import clsx from 'clsx'
import Collapse from './ui/Collapse'
import { H2 } from './ui/Typography'

interface MeteorShower {
  name: string
  peakDates: string
  radiant: string
  zhr: string // Zenithal Hourly Rate
  velocity: string
  parentBody: string
  discoveryYear: string
  story: string
  viewingTips: string[]
  bestViewingTime: string
  radiantPosition: string // Position relative to Valentine, NE
}

const METEOR_SHOWERS: MeteorShower[] = [
  {
    name: 'Perseids',
    peakDates: 'July 17 - August 24 (Peak: August 12-13)',
    radiant: 'Perseus constellation',
    zhr: '50-100 meteors per hour at peak; reduced post-peak rates during trip nights (Aug 20-23)',
    velocity: '59 km/s (fast, bright meteors)',
    parentBody: 'Comet 109P/Swift-Tuttle',
    discoveryYear: 'First recorded by Chinese astronomers in 36 AD',
    story:
      "The Perseids are perhaps the most famous meteor shower, originating from debris left by Comet Swift-Tuttle, which orbits the sun every 133 years. The comet last passed close to Earth in 1992 and won't return until 2126. As Earth passes through this debris trail each summer, particles burn up in our atmosphere at tremendous speeds, creating the brilliant 'shooting stars' we see. The shower gets its name from the Perseus constellation, where the meteors appear to radiate from. Ancient Chinese astronomers first recorded this shower nearly 2,000 years ago, calling it 'tears of the weaver girl.'",
    viewingTips: [
      'Wait for moonset (between 12:21 AM and 3:02 AM over the trip nights)',
      'Look northeast - Perseus rises higher throughout the night',
      'Best viewing is typically 2-4 AM when Perseus is highest',
      'Meteors can appear anywhere in the sky, not just near Perseus',
    ],
    bestViewingTime: '2:00 AM - 4:00 AM local time',
    radiantPosition:
      'Perseus constellation rises in the northeast around 10 PM from Valentine, NE, reaching optimal height (60-70° above horizon) around 3 AM',
  },
]

const MeteorShowerCard = ({
  shower,
  isExpanded,
  onToggle,
}: {
  shower: MeteorShower
  isExpanded: boolean
  onToggle: () => void
}) => {
  return (
    <div className='border border-background-dm  rounded-lg  bg-white  overflow-hidden shadow'>
      <button
        onClick={onToggle}
        className='w-full p-4 text-left hover:bg-gray-pagebg :bg-gray-textdark/50 transition-colors focus:outline-none '
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold font-sans text-gray-textdark '>
              {shower.name}
            </h3>
            <p className='text-sm font-mono text-gray-textlight  mt-1'>
              {shower.peakDates}
            </p>
            <p className='text-sm font-mono text-pink-dark  mt-1'>
              {shower.zhr}
            </p>
          </div>
          <div
            className={clsx(
              'transform transition-transform duration-200',
              isExpanded ? 'rotate-180' : 'rotate-0'
            )}
          >
            <svg
              className='w-5 h-5 text-gray-textlight'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </div>
      </button>

      <Collapse open={isExpanded}>
        <div className='px-4 pb-4 space-y-4 border-t border-gray '>
          <div className='pt-4'>
            <h4 className='font-semibold font-ibm-plex-mono text-sm text-gray-textdark  mb-2'>
              Origin & History
            </h4>
            <p className='font-mono text-sm font-base text-gray-textdark  leading-relaxed'>
              {shower.story}
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <h4 className='font-semibold font-ibm-plex-mono text-sm text-gray-textdark  mb-2'>
                Technical Details
              </h4>
              <ul className='space-y-1 text-sm font-mono'>
                <li>
                  <span className='text-gray-textlight'>Radiant:</span>{' '}
                  {shower.radiant}
                </li>
                <li>
                  <span className='text-gray-textlight'>Velocity:</span>{' '}
                  {shower.velocity}
                </li>
                <li>
                  <span className='text-gray-textlight'>Parent Body:</span>{' '}
                  {shower.parentBody}
                </li>
                <li>
                  <span className='text-gray-textlight'>Discovery:</span>{' '}
                  {shower.discoveryYear}
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold font-ibm-plex-mono text-sm text-gray-textdark  mb-2'>
                Viewing from Valentine, NE
              </h4>
              <p className='text-sm font-mono text-pink-dark  mb-2'>
                Best Time: {shower.bestViewingTime}
              </p>
              <p className='font-mono text-xs text-gray-textlight  mb-2'>
                {shower.radiantPosition}
              </p>
              <ul className='space-y-1 text-xs font-mono'>
                {shower.viewingTips.map((tip, index) => (
                  <li key={index} className='text-gray-textdark '>
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  )
}

const MeteorShowerGuide = () => {
  const [expandedShower, setExpandedShower] = useState<string | null>(null)

  const toggleShower = (showerName: string) => {
    setExpandedShower(expandedShower === showerName ? null : showerName)
  }

  return (
    <section className='py-12 sm:py-16 px-4 md:px-8 w-full'>
      <div className='max-w-4xl mx-auto '>
        <div className='text-left mb-8'>
          <H2>Meteor Shower Guide</H2>
          <p className='text-gray-textlight max-w-lg  font-mono text-sm'>
            Viewing information for Valentine, Nebraska
            <br /> (42°52′25″N 100°33′1″W)
          </p>
        </div>

        <div className='space-y-4'>
          {METEOR_SHOWERS.map((shower) => (
            <MeteorShowerCard
              key={shower.name}
              shower={shower}
              isExpanded={expandedShower === shower.name}
              onToggle={() => toggleShower(shower.name)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default MeteorShowerGuide
