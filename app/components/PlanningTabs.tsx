'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { ActualRsvpEntry } from '@types'
import RolesBoard from './RolesBoard'
import InventoryBoard from './InventoryBoard'

interface PlanningTabsProps {
  rsvps?: ActualRsvpEntry[]
  onClaimed?: () => void
}

type Tab = 'counselors' | 'gear'

const TABS: { id: Tab; label: string }[] = [
  { id: 'counselors', label: 'Camp Counselors' },
  { id: 'gear', label: 'Gear' },
]

// Camp Counselors (roles) and Gear Situation (inventory) share one card with a
// tab switcher instead of being two stacked sections.
const PlanningTabs = ({ rsvps = [], onClaimed }: PlanningTabsProps) => {
  const [tab, setTab] = useState<Tab>('counselors')

  return (
    <section className='w-full h-auto flex flex-col items-center justify-center p-4 sm:p-6'>
      <div className='p-6 flex-col grow w-full max-w-4xl rounded-lg shadow-2xl border border-background-dm bg-cardbg'>
        <div className='flex items-center gap-2 mb-6 bg-gray-100 rounded-lg p-1 w-fit'>
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type='button'
              onClick={() => setTab(id)}
              className={clsx(
                'px-4 py-1.5 rounded-md text-sm font-mono font-medium transition-colors',
                tab === id
                  ? 'bg-pink-dark text-white'
                  : 'text-gray-600 hover:text-gray-800'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'counselors' ? (
          <RolesBoard embedded rsvps={rsvps} onClaimed={onClaimed} />
        ) : (
          <InventoryBoard embedded rsvps={rsvps} onClaimed={onClaimed} />
        )}
      </div>
    </section>
  )
}

export default PlanningTabs
