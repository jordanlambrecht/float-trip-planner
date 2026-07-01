'use client'

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { INAT_PLACE_ID, TRIP_MONTH } from '@tripConfig'
import {
  fetchSpeciesCounts,
  fetchMonthlyActivity,
  inatPlaceUrl,
  type Species,
} from '../lib/inaturalist'
import SectionCard from './ui/SectionCard'
import SeasonalityBars from './ui/SeasonalityBars'
import SpeciesGrid from './SpeciesGrid'
import { H2 } from './ui/Typography'

// Each tab is one iNaturalist iconic-taxon group. `taxa` is passed straight to
// the API's iconic_taxa param (comma-separated for herps).
interface Tab {
  key: string
  label: string
  emoji: string
  taxa: string
}

const TABS: Tab[] = [
  { key: 'mammals', label: 'Mammals', emoji: '🦌', taxa: 'Mammalia' },
  { key: 'birds', label: 'Birds', emoji: '🦅', taxa: 'Aves' },
  { key: 'herps', label: 'Reptiles & Amphibians', emoji: '🐢', taxa: 'Reptilia,Amphibia' },
  { key: 'fish', label: 'Fish', emoji: '🐟', taxa: 'Actinopterygii' },
  { key: 'insects', label: 'Bugz', emoji: '🦋', taxa: 'Insecta' },
  { key: 'plants', label: 'Plants', emoji: '🌾', taxa: 'Plantae' },
  { key: 'fungi', label: 'Fun Guys', emoji: '🍄', taxa: 'Fungi' },
]

const WildlifeSection = () => {
  const [activeKey, setActiveKey] = useState<string>('mammals')
  const [species, setSpecies] = useState<Species[] | null>(null)
  const [monthly, setMonthly] = useState<number[] | null>(null)
  const [error, setError] = useState(false)

  const active = TABS.find((t) => t.key === activeKey) ?? TABS[0]

  // Reset the group's data synchronously with the tab change so the previous
  // group's grid/bars can't paint for a frame under the new tab's label (the
  // effect below reruns and refetches, but that happens after paint).
  const selectTab = (key: string) => {
    if (key === activeKey) return
    setActiveKey(key)
    setSpecies(null)
    setMonthly(null)
    setError(false)
  }

  useEffect(() => {
    let cancelled = false
    setSpecies(null)
    setMonthly(null)
    setError(false)

    fetchSpeciesCounts({
      placeId: INAT_PLACE_ID,
      month: TRIP_MONTH,
      iconicTaxa: active.taxa,
      perPage: 24,
    })
      .then((r) => {
        if (!cancelled) setSpecies(r)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    fetchMonthlyActivity(INAT_PLACE_ID, active.taxa)
      .then((r) => {
        if (!cancelled) setMonthly(r)
      })
      .catch(() => {
        if (!cancelled) setMonthly(null)
      })

    return () => {
      cancelled = true
    }
  }, [active.taxa])

  return (
    <SectionCard>
      <H2>Wildlife</H2>
      <p className='font-mono text-sm text-gray-textlight mb-2 max-w-2xl'>
        The Niobrara valley is a rare biological crossroads. There are six ecosystems
        (eastern woodland, western pine, northern boreal, and mixed-grass /
        tallgrass / Sandhills prairie) overlap here, so the wildlife list is
        unusually deep for the Great Plains.
      </p>
      <p className='font-mono text-xs text-gray-textlight mb-5 max-w-2xl'>
        Primary residents: American bison, elk, and prairie dogs at Fort
        Niobrara NWR, plus river otters and beavers along the water. Below is
        what the community logs here in August, by group.
      </p>

      {/* Group tabs */}
      <div className='flex flex-wrap gap-2 mb-5'>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type='button'
            onClick={() => selectTab(tab.key)}
            className={clsx(
              'px-3 py-1.5 rounded-full font-mono text-xs transition-all',
              tab.key === activeKey
                ? 'bg-pink-dark text-white'
                : 'border border-gray-textlight/40 text-gray-textlight hover:border-pink-dark hover:text-pink-dark'
            )}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>


      {monthly && (
        <div className='mb-6 max-w-md'>
          <p className='font-mono text-xs text-gray-textlight mb-2'>
            When {active.label.toLowerCase()} are most logged (w/ August highlighted obviously):
          </p>
          <SeasonalityBars monthly={monthly} highlightMonth={TRIP_MONTH} />
        </div>
      )}

      {error && (
        <p className='font-mono text-sm text-red-600'>
          Couldn&apos;t reach iNaturalist right now. Try the full list below.
        </p>
      )}

      {!error && !species && (
        <p className='font-mono text-sm text-gray-textlight'>
          Loading {active.label.toLowerCase()}…
        </p>
      )}

      {species && species.length > 0 && (
        <SpeciesGrid activeLabel={active.label} activeKey={active.key} species={species} />
      )}

      {species && species.length === 0 && (
        <p className='font-mono text-sm text-gray-textlight'>
          No August sightings logged in this group yet.
        </p>
      )}

      <p className='font-mono text-xs text-gray-textlight mt-4'>
        Counts are from community sightings on iNaturalist.
      </p>

      <div className='mt-5'>
        <a
          href={inatPlaceUrl(INAT_PLACE_ID)}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center justify-center px-4 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-dark/70 transition-colors font-mono text-sm'
        >
          🔗 Explore everything on iNaturalist
        </a>
      </div>
    </SectionCard>
  )
}

export default WildlifeSection
