'use client'

import { useEffect, useState } from 'react'
import { TRIP_COORDS } from '@tripConfig'
import { fetchGeologicUnit, type GeologicUnit } from '../lib/macrostrat'
import SectionCard from './ui/SectionCard'
import { H2, H3 } from './ui/Typography'

const ageLabel = (unit: GeologicUnit): string | null => {
  const span =
    unit.ageTopMa !== null && unit.ageBottomMa !== null
      ? `${unit.ageTopMa}–${unit.ageBottomMa} Ma`
      : null
  if (unit.age && span) return `${unit.age} · ${span}`
  return unit.age ?? span
}

const GeologySection = () => {
  const [unit, setUnit] = useState<GeologicUnit | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    fetchGeologicUnit(TRIP_COORDS.lat, TRIP_COORDS.lon)
      .then((u) => {
        setUnit(u)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <SectionCard>
      <H2>🪨 Geology</H2>

      {/* Live formation card */}
      {status === 'loading' && (
        <p className='font-mono text-sm text-gray-textlight'>
          Reading the bedrock…
        </p>
      )}

      {status === 'ready' && unit && (
        <div className='rounded-lg border border-background-dm p-5 mb-8'>
          <div className='flex items-start gap-3'>
            {unit.color && (
              <span
                className='mt-1 h-6 w-6 shrink-0 rounded border border-black/20'
                style={{ backgroundColor: unit.color }}
                title='Map color for this unit'
              />
            )}
            <div>
              <H3>{unit.name}</H3>
              {ageLabel(unit) && (
                <p className='font-mono text-sm text-pink-dark mt-1'>
                  {ageLabel(unit)}
                </p>
              )}
            </div>
          </div>

          <ul className='font-mono text-sm space-y-2 mt-4'>
            {unit.lithology && (
              <li>
                <span className='text-gray-textlight'>Rock type:</span>{' '}
                {unit.lithology}
              </li>
            )}
            {unit.description && (
              <li>
                <span className='text-gray-textlight'>Description:</span>{' '}
                {unit.description}
              </li>
            )}
            {unit.comments && (
              <li className='text-gray-textdark'>
                <span className='text-gray-textlight'>Field note:</span>{' '}
                <span className='italic'>&ldquo;{unit.comments}&rdquo;</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {(status === 'error' || (status === 'ready' && !unit)) && (
        <p className='font-mono text-sm text-gray-textlight mb-8'>
          Couldn&apos;t read the live geology just now. The curated rundown
          below still applies.
        </p>
      )}

      {/* Curated narrative */}
      <div className='space-y-5'>
        <div>
          <H3 className='mb-4'>History</H3>
          <p className='font-mono text-sm text-gray-textdark leading-relaxed max-w-2xl'>
            Camp sits on the <strong><a className='text-blue-500' href='https://en.wikipedia.org/wiki/Ogallala_Group' target='_blank' rel='noopener noreferrer'>Ogallala Group</a></strong>, which is lots of Miocene sand and
            gravel washed east off the Rockies, whose Valentine Formation holds
            the <strong><a className='text-blue-500' href='https://en.wikipedia.org/wiki/Sandhills_aquifer' target='_blank' rel='noopener noreferrer'>Sandhills aquifer</a></strong>. Just beneath it is the reddish{' '}
            <strong><a className='text-blue-500' href='https://en.wikipedia.org/wiki/Rosebud_Formation' target='_blank' rel='noopener noreferrer'>Rosebud Formation</a></strong>; where the aquifer meets that
            impermeable layer, the water spills out as the spring-fed waterfalls
            the Niobrara is famous for (Smith Falls included). Fun twist: the
            Cretaceous chalk formally called the{' '}
            <strong>&ldquo;Niobrara Formation&rdquo;</strong> is named after
            this very river, yet it isn&apos;t exposed here at all; the oldest
            rock you can spot is the dark Cretaceous <strong><a className='text-blue-500' href='https://en.wikipedia.org/wiki/Pierre_Shale' target='_blank' rel='noopener noreferrer'>Pierre Shale</a></strong>,
            and only as bluffs downstream in the eastern half of the river, not
            in the banks at camp.
          </p>
        </div>

        <div>
          <H3 className='mb-4'>Rock Hounding</H3>
          <ul className='font-mono text-sm text-gray-textdark space-y-1 list-disc list-inside max-w-2xl'>
            <li>
              <strong>Prairie agate &amp; blue agate</strong>: Nebraska&apos;s
              state rock and state gem; local gravels are cemented by
              yellowish-green opal and chalcedony (that&apos;s the &ldquo;field
              note&rdquo; above, straight from the map data).
            </li>
            <li>
              <strong>Petrified wood, jasper, and chert</strong> in the river
              gravels.
            </li>
            <li>
              <strong>Fossils:</strong> the Ogallala is rich in Miocene mammal
              bone. For the marquee experience,{' '}
              <strong>Ashfall Fossil Beds</strong> (rhinos buried in volcanic
              ash) is a worthwhile day trip a couple hours to the southeast.
            </li>
          </ul>
        </div>
      </div>

      <div className='mt-6 flex flex-wrap gap-3'>
        <a
          href={`https://macrostrat.org/map/loc/${TRIP_COORDS.lon}/${TRIP_COORDS.lat}`}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center justify-center px-4 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-dark/70 transition-colors font-mono text-sm'
        >
          🔗 Explore the geologic map (Macrostrat)
        </a>
        <a
          href='https://history.nebraska.gov/visit/ashfall-fossil-beds-state-historical-park/'
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center justify-center px-4 py-2 bg-blue-dark text-white rounded-lg hover:bg-blue-dark/70 transition-colors font-mono text-sm'
        >
          🔗 Ashfall Fossil Beds
        </a>
      </div>
    </SectionCard>
  )
}

export default GeologySection
