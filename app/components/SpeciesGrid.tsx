'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { Species } from '../lib/inaturalist'
import { inatTaxonUrl } from '../lib/inaturalist'
import { H3 } from './ui/Typography'

// Shared photo grid for the Wildlife section. Each tile links to the species'
// iNaturalist page. Photos are Creative Commons. the observer attribution
// rides in the image title, credited collectively in the section footer.
//
// Collapsed, it shows exactly three rows at every breakpoint (2/3/4 columns =>
// 6/9/12 cards) and hides the rest behind a Show more / Show less toggle. The
// row count is enforced with responsive `hidden` classes keyed on card index,
// so there's no height measuring and no layout shift.
interface SpeciesGridProps {
  species: Species[]
  activeLabel: string
  activeKey: string
}

// Which cards stay visible while collapsed, given 3 rows and 2/3/4 columns.
const collapsedVisibility = (index: number): string => {
  if (index < 6) return '' // first 3 rows even at the narrowest (2 cols)
  if (index < 9) return 'hidden sm:block' // 3rd row appears once there are 3 cols
  if (index < 12) return 'hidden md:block' // 3rd row appears once there are 4 cols
  return 'hidden' // past three rows at every breakpoint
}

const SpeciesGrid = ({ species, activeLabel, activeKey }: SpeciesGridProps) => {
  const [expanded, setExpanded] = useState(false)

  // Collapsed shows 6 / 9 / 12 cards at base / sm / md. How many are hidden
  // depends on the breakpoint, which CSS knows but JS can't at render time, so
  // the toggle's own visibility is responsive too. It appears only where the
  // visible rows don't already fit the whole list; otherwise a wide screen
  // would show a "Show all" button with nothing left to reveal.
  const total = species.length
  const toggleClass =
    total <= 9
      ? 'flex sm:hidden' // only the 2-column layout overflows
      : total <= 12
        ? 'flex md:hidden' // 2- and 3-column layouts overflow
        : 'flex' // even the 4-column layout overflows

  return (
    <div>
      <H3 className='text-gray-textdark mb-4'>{activeLabel} Most Seen in August:</H3>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
        {species.map((s, i) => (
          <a
            key={s.taxonId}
            href={inatTaxonUrl(s.taxonId)}
            target='_blank'
            rel='noopener noreferrer'
            className={clsx(
              'group flex flex-col overflow-hidden rounded-lg border border-background-dm bg-cardbg transition-transform hover:-translate-y-0.5 hover:shadow-lg',
              !expanded && collapsedVisibility(i)
            )}
          >
            <div className='relative aspect-square w-full overflow-hidden bg-gray-pagebg'>
              {s.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.photoUrl}
                  alt={s.commonName}
                  title={s.photoAttribution ?? undefined}
                  loading='lazy'
                  className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-3xl opacity-40'>
                  🔍
                </div>
              )}
              <span className='absolute bottom-1 right-1 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white'>
                {s.count.toLocaleString()} seen
              </span>
            </div>
            <div className='flex flex-col p-2'>
              <span className='font-mono text-xs font-bold text-gray-textdark leading-tight'>
                {s.commonName}
              </span>
              <span className='font-mono text-[10px] italic text-gray-textlight leading-tight'>
                {s.scientificName}
              </span>
            </div>
          </a>
        ))}
      </div>

      {total > 6 && (
        <div className={clsx('mt-4 justify-center', toggleClass)}>
          <button
            type='button'
            onClick={() => setExpanded((v) => !v)}
            className='px-4 py-2 rounded-full border border-gray-textlight/40 font-mono text-xs text-gray-textlight hover:border-pink-dark hover:text-pink-dark transition-colors'
          >
            {expanded ? 'Show less ▲' : `Show all ${total} ▼`}
          </button>
        </div>
      )}
    </div>
  )
}

export default SpeciesGrid
