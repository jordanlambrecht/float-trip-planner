"use client"
import { useState } from "react"
import clsx from "clsx"

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
    name: "Perseids",
    peakDates: "July 17 - August 24 (Peak: August 12-13)",
    radiant: "Perseus constellation",
    zhr: "50-100 meteors per hour at peak",
    velocity: "59 km/s (fast, bright meteors)",
    parentBody: "Comet 109P/Swift-Tuttle",
    discoveryYear: "First recorded by Chinese astronomers in 36 AD",
    story:
      "The Perseids are perhaps the most famous meteor shower, originating from debris left by Comet Swift-Tuttle, which orbits the sun every 133 years. The comet last passed close to Earth in 1992 and won't return until 2126. As Earth passes through this debris trail each summer, particles burn up in our atmosphere at tremendous speeds, creating the brilliant 'shooting stars' we see. The shower gets its name from the Perseus constellation, where the meteors appear to radiate from. Ancient Chinese astronomers first recorded this shower nearly 2,000 years ago, calling it 'tears of the weaver girl.'",
    viewingTips: [
      "Look northeast after 10 PM",
      "Perseus rises higher throughout the night",
      "Best viewing is typically 2-4 AM when Perseus is highest",
      "Meteors can appear anywhere in the sky, not just near Perseus",
    ],
    bestViewingTime: "2:00 AM - 4:00 AM local time",
    radiantPosition:
      "Perseus constellation rises in the northeast around 10 PM from Valentine, NE, reaching optimal height (60-70° above horizon) around 3 AM",
  },
  {
    name: "Alpha Capricornids",
    peakDates: "July 3 - August 15 (Peak: July 30)",
    radiant: "Capricornus constellation",
    zhr: "5-10 meteors per hour (low rate but notable fireballs)",
    velocity: "23 km/s (slow, producing bright fireballs)",
    parentBody: "Comet 169P/NEAT",
    discoveryYear: "First identified as distinct shower in 1995",
    story:
      "The Alpha Capricornids may have a low hourly rate, but they're famous for producing spectacular fireballs - extremely bright meteors that can outshine Venus and sometimes fragment dramatically across the sky. This shower originates from Comet 169P/NEAT, discovered in 2002. What makes this shower special isn't quantity but quality: the meteors move relatively slowly through our atmosphere, giving them more time to heat up and create stunning, long-lasting streaks. These fireballs can sometimes be bright enough to cast shadows and leave persistent trains visible for several seconds.",
    viewingTips: [
      "Look south-southwest after 10 PM",
      "Capricornus is visible but low in southern sky",
      "Watch for slow-moving, bright fireballs",
      "Quality over quantity - fewer meteors but more spectacular",
    ],
    bestViewingTime: "11:00 PM - 2:00 AM local time",
    radiantPosition:
      "Capricornus is low in the southern sky from Valentine, NE, reaching maximum height of only 25-30° above the southern horizon around midnight",
  },
  {
    name: "Delta Aquarids",
    peakDates: "July 12 - August 23 (Peak: July 28-29)",
    radiant: "Aquarius constellation",
    zhr: "15-20 meteors per hour",
    velocity: "41 km/s (medium speed)",
    parentBody: "Possibly Comet 96P/Machholz",
    discoveryYear: "First recorded observations in the 1870s",
    story:
      "The Delta Aquarids are actually two separate meteor streams - the Southern and Northern Delta Aquarids - that appear to come from the same region of sky. The Southern Delta Aquarids are more prominent and likely originate from Comet 96P/Machholz, though this connection isn't definitively proven. These meteors are best observed from southern latitudes, making them a challenge to view from Nebraska. The shower produces medium-speed meteors that often appear yellow or orange in color. Historically, this shower was often overlooked because it peaks during the height of summer when the more famous Perseids are also active.",
    viewingTips: [
      "Look south after 10 PM",
      "Aquarius is relatively low from northern latitudes",
      "Best viewed in pre-dawn hours (2-4 AM)",
      "Meteors may appear yellowish-orange in color",
    ],
    bestViewingTime: "2:00 AM - 4:00 AM local time",
    radiantPosition:
      "Aquarius rises in the southeast around 10 PM from Valentine, NE, reaching maximum height of about 35-40° above the southern horizon before dawn",
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
    <div className='border border-background-dm dark:border-gray-600 rounded-lg  bg-white dark:bg-cardbg-dm overflow-hidden shadow'>
      <button
        onClick={onToggle}
        className='w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none '
      >
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold font-sans text-gray-textdark dark:text-gray-textlight'>
              {shower.name}
            </h3>
            <p className='text-sm font-mono text-gray-textlight dark:text-gray-textdark/70 mt-1'>
              {shower.peakDates}
            </p>
            <p className='text-sm font-mono text-pink-dark dark:text-pink-light mt-1'>
              {shower.zhr}
            </p>
          </div>
          <div
            className={clsx(
              "transform transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0"
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

      {isExpanded && (
        <div className='px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-600'>
          <div className='pt-4'>
            <h4 className='font-semibold font-ibm-plex-mono text-sm text-gray-textdark dark:text-gray-textlight mb-2'>
              Origin & History
            </h4>
            <p className='font-mono text-sm font-base text-gray-textdark dark:text-gray-textlight/90 leading-relaxed'>
              {shower.story}
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-4'>
            <div>
              <h4 className='font-semibold font-ibm-plex-mono text-sm text-gray-textdark dark:text-gray-textlight mb-2'>
                Technical Details
              </h4>
              <ul className='space-y-1 text-sm font-mono'>
                <li>
                  <span className='text-gray-textlight'>Radiant:</span>{" "}
                  {shower.radiant}
                </li>
                <li>
                  <span className='text-gray-textlight'>Velocity:</span>{" "}
                  {shower.velocity}
                </li>
                <li>
                  <span className='text-gray-textlight'>Parent Body:</span>{" "}
                  {shower.parentBody}
                </li>
                <li>
                  <span className='text-gray-textlight'>Discovery:</span>{" "}
                  {shower.discoveryYear}
                </li>
              </ul>
            </div>

            <div>
              <h4 className='font-semibold font-ibm-plex-mono text-sm text-gray-textdark dark:text-gray-textlight mb-2'>
                Viewing from Valentine, NE
              </h4>
              <p className='text-sm font-mono text-pink-dark dark:text-pink-light mb-2'>
                Best Time: {shower.bestViewingTime}
              </p>
              <p className='font-mono text-xs text-gray-textlight dark:text-gray-textdark/70 mb-2'>
                {shower.radiantPosition}
              </p>
              <ul className='space-y-1 text-xs font-mono'>
                {shower.viewingTips.map((tip, index) => (
                  <li
                    key={index}
                    className='text-gray-textdark dark:text-gray-textlight/90'
                  >
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
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
          <h2>Meteor Shower Guide</h2>
          <p className='text-gray-textlight max-w-lg dark:text-gray-textdark/70 font-mono text-sm'>
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
